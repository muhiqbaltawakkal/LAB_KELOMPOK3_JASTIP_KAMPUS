# Database — Skema & Migrasi

Folder ini berisi semua artefak **Data & Persistence Engineer** untuk sistem Jastip Kampus.

## Struktur

```
database/
├── migrations/
│ ├── 001_catalog_schema.sql ← tabel: satuan, toko, barang
│ ├── 002_order_schema.sql ← tabel: sesi_jastip, titipan
│ ├── 003_payment_schema.sql ← tabel: transaksi, saldo_tertahan, riwayat_pelepasan
│ └── 004_tracking_schema.sql ← tabel: riwayat_status
└── seed.js ← insert dataset/*.json ke semua DB
```

## Prinsip Desain

| Prinsip | Implementasi |
|---------|-------------|
| **Database per service** | Setiap service punya DB sendiri (catalog_db, order_db, dst.) |
| **Tidak ada foreign key lintas service** | Referensi antar service hanya via ID (string), bukan FK |
| **Snapshot harga** | `titipan.nama_barang` & `harga_satuan` disimpan saat order dibuat |
| **Enum untuk status** | Status pakai PostgreSQL ENUM agar konsisten |
| **Index strategis** | Index dibuat pada kolom yang sering di-query/filter |

## Cara Menjalankan Migrasi

```bash
# Jalankan migration catalog
psql -d catalog_db -f database/migrations/001_catalog_schema.sql

# Jalankan migration order
psql -d order_db -f database/migrations/002_order_schema.sql

# Jalankan migration payment
psql -d payment_db -f database/migrations/003_payment_schema.sql

# Jalankan migration tracking
psql -d tracking_db -f database/migrations/004_tracking_schema.sql
```

## Cara Menjalankan Seed

```bash
# Install dependency
npm install pg

# Jalankan seed (pastikan semua DB sudah dibuat)
node database/seed.js
```

### Environment Variables (opsional)

```env
CATALOG_DB_URL=postgresql://postgres:postgres@localhost:5432/catalog_db
ORDER_DB_URL=postgresql://postgres:postgres@localhost:5433/order_db
PAYMENT_DB_URL=postgresql://postgres:postgres@localhost:5434/payment_db
TRACKING_DB_URL=postgresql://postgres:postgres@localhost:5435/tracking_db
```

## Langkah Selanjutnya

- [ ] Setup Redis untuk cache katalog (TTL 60 detik)
- [ ] Implementasi atomic decrement stok saat order masuk
- [ ] Koneksikan masing-masing service ke database-nya
