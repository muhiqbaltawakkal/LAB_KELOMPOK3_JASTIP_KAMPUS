# DATA.md — Strategi Data & Persistence

**Peran:** Data & Persistence Engineer
**Nama:** Rizki Amalia Rasyid (105841121223)
**Tema:** Jastip Kampus

---

## Struktur Database Per Layanan

Setiap layanan memiliki database SQLite tersendiri (prinsip database-per-service):

| Layanan | File DB | Tabel Utama |
|---------|---------|-------------|
| catalog-service | `catalog.db` | `toko`, `barang` |
| order-service | `order.db` | `sesi_jastip`, `titipan` |
| payment-service | `payment.db` | `transaksi`, `saldo_tertahan` |
| tracking-service | `tracking.db` | `tracking_events` |

---

## Skema Tabel catalog-service

```sql
CREATE TABLE toko (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  kategori TEXT,
  aktif INTEGER DEFAULT 1
);

CREATE TABLE barang (
  id INTEGER PRIMARY KEY,
  toko_id INTEGER NOT NULL,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0,
  satuan TEXT DEFAULT 'pcs',
  FOREIGN KEY (toko_id) REFERENCES toko(id)
);
```

### Indeks

```sql
CREATE INDEX idx_barang_toko ON barang(toko_id);
CREATE INDEX idx_barang_stok ON barang(stok);
```

**Alasan indeks:**
- `idx_barang_toko` — kueri `WHERE toko_id = ?` sering dipanggil saat menampilkan barang per toko
- `idx_barang_stok` — kueri `WHERE stok > 0` dipanggil tiap GET /v1/items; tanpa indeks ini Seq Scan pada tabel besar

---

## Strategi Cache (cache-aside)

### Endpoint yang di-cache

| Endpoint | Cache Key | TTL | Invalidasi |
|----------|-----------|-----|-----------|
| `GET /v1/items` | `items:all` | 60-74 detik | Saat ada `POST /v1/items/:id/ambil` berhasil |
| `GET /v1/items/:id` | `item:{id}` | 60-74 detik | Saat stok barang itu dikurangi |

### Alur cache-aside

```
1. Request masuk ke GET /v1/items/:id
2. Cek Redis: redis.get("item:{id}")
3a. Cache HIT  → kembalikan data + { from: "cache" }
3b. Cache MISS → ambil dari SQLite
                 → simpan ke Redis dengan TTL
                 → kembalikan data + { from: "db" }
```

### Anti-stampede (TTL Jitter)

TTL tidak seragam untuk mencegah banyak key kedaluwarsa serentak:

```js
const ttl = 60 + Math.floor(Math.random() * 15); // 60-74 detik
```

### Yang TIDAK boleh di-cache

Sumber daya rebutan (stok barang saat transaksi `POST /v1/items/:id/ambil`) tidak pernah dibaca dari cache — selalu langsung ke SQLite dengan UPDATE atomik.

---

## Pengurangan Stok Atomik

Pola yang dipakai untuk mencegah oversell:

```sql
UPDATE barang SET stok = stok - 1 WHERE id = ? AND stok > 0
```

- Jika `changes === 0` → stok habis → kembalikan **409 Conflict**
- Jika `changes === 1` → berhasil → invalidasi cache → publish Redis event

SQLite menjamin operasi ini atomik karena menggunakan WAL (Write-Ahead Logging) dan kunci per file.

---

## Event Redis

| Event | Channel | Kapan dikirim | Payload |
|-------|---------|---------------|---------|
| `stok.berkurang` | `stok.berkurang` | Setelah `POST /v1/items/:id/ambil` berhasil | `{ barangId, nama, stokSisa, ts }` |

---

## Seed Data

Data awal dimuat dari `dataset/catalog-seed.json` saat service pertama kali jalan (tabel kosong):

- **20 toko** real di Makassar (Chatime Losari, Mie Titi, Gramedia Karebosi, dll.)
- **49 barang** dengan harga nyata
- Menggunakan `INSERT OR IGNORE` — idempotent, aman dijalankan berulang

---

## Fallback

Jika Redis tidak tersedia, service tetap berjalan normal tanpa cache — hanya tanpa percepatan read. Ini dicatat di log:

```json
{ "level": "warn", "msg": "redis tidak tersedia, lanjut tanpa cache" }
```
