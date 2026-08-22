# 🛍️ Jastip Kampus

> Runtime terbaru memakai PostgreSQL/Redis, tiga replika Order Service, akun reguler dua mode, negosiasi biaya jasa, escrow simulasi, dan Expo Router. Petunjuk konfigurasi serta batas hasil uji aktual ada di [docs/POSTGRESQL-OVERHAUL.md](docs/POSTGRESQL-OVERHAUL.md). Dokumentasi lama yang masih menyebut SQLite dipertahankan sebagai arsip historis dan bukan acuan runtime.

<div align="center">

**Sistem Titip-Beli Antarr Mahasiswa berbasis Microservices**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-6BA539?style=flat-square&logo=openapiinitiative&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)

</div>

---

Jastip Kampus adalah platform layanan **titip-beli antar mahasiswa**. Mahasiswa dapat membuka layanan jastip, memilih barang, melakukan pembayaran, dan melacak status titipan hingga barang diterima.

Sistem dirancang menggunakan pendekatan **Microservices Architecture** — setiap layanan berdiri sendiri dengan data dan tanggung jawabnya masing-masing.

---

## 📋 Daftar Isi

| No | Topik |
| :---: | --- |
| 1 | [Tujuan Sistem](#1-tujuan-sistem) |
| 2 | [Arsitektur Microservices](#2-arsitektur-microservices) |
| 3 | [Alur Sistem](#3-alur-sistem) |
| 4 | [Peran dalam Sistem](#4-peran-dalam-sistem) |
| 5 | [Proses Tawar](#5-proses-tawar) |
| 6 | [Proses Pembayaran](#6-proses-pembayaran) |
| 7 | [Tracking Titipan](#7-tracking-titipan) |
| 8 | [Endpoint Kritis](#8-endpoint-kritis) |
| 9 | [Struktur Repository](#9-struktur-repository) |
| 10 | [Menjalankan Catalog Service](#10-menjalankan-catalog-service) |
| 11 | [Pengujian API](#11-pengujian-api) |
| 12 | [OpenAPI](#12-openapi) |
| 13 | [Aturan Penting Sistem](#13-aturan-penting-sistem) |
| 14 | [Teknologi](#14-teknologi) |
| 15 | [Status Pengembangan](#15-status-pengembangan) |

---

## 1. Tujuan Sistem

Sistem Jastip Kampus dirancang untuk:

- 🏪 Memudahkan mahasiswa **membuka layanan jastip** dengan menentukan toko, batas waktu, dan kapasitas.
- 🔍 Memudahkan mahasiswa lain **mencari dan memilih** layanan jastip yang tersedia.
- 📦 Menampilkan informasi **toko, barang, harga acuan**, dan satuan.
- 💬 Memungkinkan penitip **mengajukan tawaran** harga atau jasa titip.
- 💳 Mengelola **pembayaran** penitip secara aman dengan sistem dana tertahan.
- 📡 **Melacak status titipan** dari awal hingga barang diterima.
- 🔒 Menjaga **kapasitas jastip** agar tidak melebihi batas yang ditentukan penjastip.

---

## 2. Arsitektur Microservices

Sistem terdiri dari **empat layanan utama** yang berdiri sendiri:

| Layanan | Tanggung Jawab | Data yang Dimiliki |
| --- | --- | --- |
| `order-service` | Sesi jastip, buka/tutup titipan, kapasitas | Sesi jastip, daftar titipan, batas waktu, kapasitas |
| `catalog-service` | Toko, barang, harga acuan, satuan | Toko, barang, harga acuan, satuan |
| `payment-service` | Pembayaran dan pelepasan dana | Transaksi, saldo tertahan, riwayat pelepasan |
| `tracking-service` | Status perjalanan titipan | Riwayat status titipan dan waktu |

> 📌 **Prinsip:** Setiap service memiliki database sendiri. Service lain **tidak boleh** mengakses database service secara langsung — komunikasi dilakukan melalui **API atau event**.

### ⚠️ Sumber Daya Rebutan: Kapasitas Penjastip

Sumber daya kritis yang harus dijaga adalah **kapasitas titipan milik penjastip**.

```
Kapasitas = 10  →  Titipan berhasil : maksimal 10
                   Titipan ke-11    : ❌ DITOLAK
```

> 🔒 **Sistem menjamin kapasitas tidak terlampaui meskipun ribuan mahasiswa melakukan titip-beli secara bersamaan.**
> Aturan ini ditangani oleh **`order-service`**.

---

## 3. Alur Sistem

Flowchart berikut menggambarkan alur lengkap sistem — mulai dari registrasi, pemilihan peran, proses titipan, pembayaran, hingga transaksi selesai.

![Flowchart Alur Jastip Kampus](docs/Flowchart.jpeg)

---

## 4. Peran dalam Sistem

### 👤 Penjastip

> Mahasiswa yang **membuka dan mengelola** layanan titip-beli.

| # | Aksi | Keterangan |
| :---: | --- | --- |
| 1 | Buka sesi jastip | Menentukan toko, batas waktu, dan kapasitas titipan |
| 2 | Kelola tawaran | Menyetujui atau menolak tawaran harga dari penitip |
| 3 | Beli barang | Membeli barang sesuai titipan yang masuk |
| 4 | Antar barang | Mengantarkan barang kepada penitip |

---

### 👤 Penitip

> Mahasiswa yang **menggunakan** layanan titip-beli.

| # | Aksi | Keterangan |
| :---: | --- | --- |
| 1 | Cari jastip | Melihat daftar jastip yang sedang aktif |
| 2 | Pilih barang | Memilih barang, jumlah, varian, dan catatan |
| 3 | Tawar harga | Mengajukan tawaran harga atau jasa titip (opsional) |
| 4 | Bayar | Melakukan pembayaran titipan |
| 5 | Konfirmasi terima | Mengonfirmasi barang sudah diterima |

---

## 5. Proses Tawar

Penitip dapat mengajukan tawaran sebelum melakukan pembayaran.

```
Penitip mengajukan tawaran
          │
          ▼
  Order-service menyimpan tawaran
          │
          ▼
  Penjastip meninjau tawaran
        /       \
      Ya         Tidak
      │             │
      ▼             ▼
  Lanjut ke     Penitip ubah tawaran
  pembayaran    atau batalkan titipan
```

---

## 6. Proses Pembayaran

Pembayaran dikelola oleh `payment-service` menggunakan sistem **dana tertahan (escrow)** — dana baru dilepaskan setelah transaksi selesai.

```
[1] Penitip bayar
         │
         ▼
[2] payment-service → Dana ditahan (escrow)
         │
         ▼
[3] order-service konfirmasi titipan
         │
         · · · proses titipan berlangsung · · ·
         │
         ▼
[4] Penitip konfirmasi barang diterima
         │
         ▼
[5] payment-service → Dana dilepaskan ke penjastip ✅
```

> ⚠️ Dana **tidak langsung** diterima penjastip. Dana ditahan hingga penitip mengonfirmasi penerimaan barang.

---

## 7. Tracking Titipan

Status titipan dicatat secara berurutan oleh `tracking-service`.

```
[ DITITIP ] ──► [ DIBELANJAKAN ] ──► [ DIANTAR ] ──► [ DITERIMA ]
```

| Status | Pemicu | Keterangan |
| --- | --- | --- |
| `DITITIP` | Konfirmasi titipan | Titipan telah dikonfirmasi dan pembayaran ditahan |
| `DIBELANJAKAN` | Penjastip beli barang | Penjastip telah membeli barang titipan |
| `DIANTAR` | Penjastip antar barang | Barang sedang dalam perjalanan ke penitip |
| `DITERIMA` | Penitip konfirmasi | Penitip mengonfirmasi barang telah diterima |

---

## 8. Endpoint Kritis

### Daftar Endpoint Utama

| Method | Endpoint | Service | Fungsi |
| :---: | --- | --- | --- |
| `GET` | `/catalog` | `catalog-service` | Mengambil daftar toko, barang, dan harga acuan |
| `POST` | `/titipan` | `order-service` | Membuat titipan baru |
| `POST` | `/payments` | `payment-service` | Membuat transaksi pembayaran |

### ⚡ Endpoint Paling Kritis

```
POST /titipan
```

Endpoint ini berkaitan langsung dengan **kapasitas penjastip**. Sistem wajib memastikan:

| Kondisi | Status |
| --- | :---: |
| `jumlah titipan ≤ kapasitas` | ✅ Diterima |
| `jumlah titipan > kapasitas` | ❌ Ditolak |

---

## 9. Struktur Repository

```
jastip-kampus/
│
├── 📄 .gitignore
├── 📄 README.md
├── 📄 openapi.yaml
│
├── 📁 docs/
│   ├── ARSITEKTUR.md
│   ├── ENDPOINTS.md
│   └── Flowchart.jpeg
│
└── 📁 services/
    └── catalog-service/
        ├── index.js
        ├── package.json
        └── package-lock.json
```

> `node_modules/` tidak disimpan di Git — sudah terdaftar di `.gitignore`.

---

## 10. Menjalankan Catalog Service

### Prasyarat

- Node.js versi 16 ke atas
- npm

### Langkah Menjalankan

**Step 1 — Masuk ke folder service:**

```bash
cd services/catalog-service
```

**Step 2 — Install dependency:**

```bash
npm install
```

**Step 3 — Jalankan service:**

```bash
node index.js
```

**Output jika berhasil:**

```
catalog-service berjalan di :3001
```

---

## 11. Pengujian API

### 🟢 Health Check

```bash
curl http://localhost:3001/health
```

```json
{
  "status": "ok",
  "service": "catalog-service"
}
```

---

### 📦 Mengambil Semua Item

```bash
curl http://localhost:3001/items
```

---

### 🔍 Mengambil Item Berdasarkan ID

```bash
curl http://localhost:3001/items/1
```

---

## 12. OpenAPI

Kontrak API sistem tersimpan di:

```
openapi.yaml
```

Gunakan **Swagger Editor** untuk membaca dokumentasi API secara interaktif:

🔗 [**https://editor.swagger.io/**](https://editor.swagger.io/)

> Import file `openapi.yaml` ke Swagger Editor untuk melihat semua endpoint, parameter, dan response schema.

---

## 13. Aturan Penting Sistem

Sistem wajib menegakkan aturan berikut setiap saat:

| # | Aturan | Kondisi yang Harus Terpenuhi |
| :---: | --- | --- |
| 1 | Kapasitas tidak boleh terlampaui | `jumlah titipan ≤ kapasitas` |
| 2 | Titipan hanya saat sesi aktif | `sesi = OPEN` |
| 3 | Kapasitas harus tersedia | `kapasitas tersisa > 0` |
| 4 | Dana ditahan hingga transaksi selesai | Dana dilepas setelah penitip konfirmasi terima |
| 5 | Status tracking harus berurutan | `DITITIP → DIBELANJAKAN → DIANTAR → DITERIMA` |

---

## 14. Teknologi

| Kategori | Teknologi | Keterangan |
| --- | --- | --- |
| Runtime | **Node.js** | Lingkungan eksekusi JavaScript |
| Framework | **Express.js** | Framework REST API |
| API Contract | **OpenAPI 3.0.3** | Kontrak dan dokumentasi API |
| Version Control | **Git + GitHub** | Manajemen kode sumber |
| Editor | **Visual Studio Code** | IDE pengembangan |

> 🔜 Database dan komponen scalability akan ditambahkan pada tahap berikutnya.

---

## 15. Status Pengembangan

### ✅ Pertemuan 1 — Setup Awal

| Komponen | Status |
| --- | :---: |
| Repository & branch `setup-awal` | ✅ |
| Struktur folder `services/` | ✅ |
| `catalog-service` dengan Express.js | ✅ |
| Endpoint `/items`, `/items/:id`, `/health` | ✅ |
| Model DDD & Bounded Context | ✅ |
| Identifikasi endpoint kritis | ✅ |
| `openapi.yaml` | ✅ |
| Dokumentasi arsitektur | ✅ |

---

### 🔲 Roadmap Tahap Berikutnya

| Komponen | Status |
| --- | :---: |
| Database (PostgreSQL / MySQL) | 🔲 |
| `order-service` | 🔲 |
| `payment-service` | 🔲 |
| `tracking-service` | 🔲 |
| Komunikasi antar-service (event / API) | 🔲 |
| Pengamanan kapasitas (concurrency handling) | 🔲 |
| Load testing | 🔲 |
| Scalability testing | 🔲 |

---

## 👨‍💻 Tentang Proyek

Project ini dikembangkan sebagai proyek pembelajaran arsitektur **Microservices** dengan studi kasus nyata **Jastip Kampus**.

**Fokus utama:** menjaga **konsistensi kapasitas titipan penjastip** ketika terjadi banyak permintaan secara bersamaan — menguji ketahanan sistem terhadap kondisi *high concurrency*.
# Admin dashboard

Akun admin tidak dapat dibuat dari registrasi publik. Jalankan order-service sekali agar migrasi diterapkan, lalu dari root project gunakan PowerShell:

```powershell
$env:ADMIN_NAME="Administrator"
$env:ADMIN_EMAIL="admin@jastip.local"
$env:ADMIN_PASSWORD="ganti-dengan-password-kuat"
npm run bootstrap:admin
```

Jika service memakai lokasi database khusus, set juga `DB_PATH` ke file `order.db` yang sama. Pada Docker, jalankan bootstrap di container order-service dengan ketiga environment variable tersebut. Setelah login dari Expo/web, role admin otomatis membuka dashboard responsif.
