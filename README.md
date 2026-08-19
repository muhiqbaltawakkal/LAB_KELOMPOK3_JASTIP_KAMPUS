# 🛍️ Jastip Kampus

## Sistem Titip-Beli Antar Mahasiswa

Jastip Kampus adalah sistem layanan titip-beli antar mahasiswa yang memungkinkan mahasiswa membuka layanan jastip, memilih barang yang ingin dititipkan, melakukan pembayaran, serta melacak proses titipan sampai barang diterima.

Sistem ini dirancang menggunakan pendekatan **Microservices Architecture** dengan beberapa layanan yang memiliki tanggung jawab dan data masing-masing.

---

## 🎯 Tujuan Sistem

Sistem Jastip Kampus bertujuan untuk:

* Memudahkan mahasiswa membuka layanan jastip.
* Memudahkan mahasiswa lain mencari dan memilih layanan jastip.
* Menampilkan informasi toko, barang, harga acuan, dan satuan.
* Memungkinkan penitip mengajukan tawaran harga atau jasa titip.
* Mengelola pembayaran penitip.
* Melacak status titipan dari awal sampai barang diterima.
* Menjaga kapasitas jastip agar tidak melebihi batas yang ditentukan penjastip.

---

## ⚠️ Sumber Daya Rebutan

### Kapasitas bawaan penjastip — tidak boleh melebihi batas

Sumber daya utama yang harus dijaga konsistensinya adalah **kapasitas titipan yang dimiliki oleh penjastip**.

Contoh:

```text
Kapasitas jastip = 10 titipan
```

Ketika banyak mahasiswa melakukan titip-beli secara bersamaan, jumlah titipan yang berhasil diterima tidak boleh melebihi kapasitas tersebut.

```text
Kapasitas = 10
Titipan berhasil = maksimal 10
Titipan ke-11 = ditolak
```

### Prinsip Konsistensi

> **Sistem kami menjaga agar kapasitas bawaan penjastip tetap konsisten dan tidak melebihi batas walaupun ribuan mahasiswa melakukan titip-beli secara bersamaan.**

Aturan kapasitas ini terutama ditangani oleh **order-service**.

---

# 🏗️ Arsitektur Microservices

Sistem terdiri dari empat layanan utama:

| Layanan            | Tanggung Jawab                                       | Data yang Dimiliki                                  |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `order-service`    | Mengelola sesi jastip, buka/tutup titipan, kapasitas | Sesi jastip, daftar titipan, batas waktu, kapasitas |
| `catalog-service`  | Mengelola toko, barang, harga acuan, dan satuan      | Toko, barang, harga acuan, satuan                   |
| `payment-service`  | Mengelola pembayaran dan pelepasan dana              | Transaksi, saldo tertahan, riwayat pelepasan dana   |
| `tracking-service` | Mengelola status perjalanan titipan                  | Riwayat status titipan dan waktu                    |

### Prinsip Microservices

Setiap service memiliki data dan tanggung jawab sendiri.

Service lain tidak diperbolehkan mengakses database service secara langsung. Komunikasi antar-service dilakukan melalui **API atau event**.

---

# 🔄 Alur Sistem

Alur utama sistem Jastip Kampus:

```text
Pengguna
   │
   ▼
Daftar Akun
   │
   ▼
Isi Data Akun
   │
   ▼
Akun Berhasil Dibuat
   │
   ▼
Login
   │
   ▼
Masuk Beranda
   │
   ▼
Pilih Peran
   │
   ├──────────────────────┐
   │                      │
   ▼                      ▼
Penjastip              Penitip
   │                      │
   ▼                      ▼
Buka Sesi Jastip      Lihat Daftar Jastip
   │                      │
   ▼                      ▼
Simpan Toko,          Lihat Katalog
Batas Waktu,          Toko & Barang
Kapasitas                  │
   │                        ▼
   ▼                    Pilih Jastip
Jastip Tampil               │
di Aplikasi                 ▼
                         Isi Detail
                         Titipan
                            │
                            ▼
                     Cek Sesi & Kapasitas
                            │
                            ▼
                     Ambil Harga Acuan
                            │
                            ▼
                     Ingin Tawar Harga?
                         /       \
                       Ya         Tidak
                       │            │
                       ▼            │
                  Proses Tawar      │
                       │            │
                       ▼            │
                  Persetujuan       │
                       │            │
                       └──────┬─────┘
                              ▼
                    Tetapkan Total Titipan
                              │
                              ▼
                         Penitip Bayar
                              │
                              ▼
                     Saldo Pembayaran
                         Ditahan
                              │
                              ▼
                    Konfirmasi Titipan
                              │
                              ▼
                       Status: Dititip
                              │
                              ▼
                    Penjastip Beli Barang
                              │
                              ▼
                    Status: Dibelanjakan
                              │
                              ▼
                    Penjastip Antar Barang
                              │
                              ▼
                       Status: Diantar
                              │
                              ▼
                    Penitip Konfirmasi
                        Barang Diterima
                              │
                              ▼
                       Status: Diterima
                              │
                              ▼
                    Dana Dilepaskan
                    ke Penjastip
                              │
                              ▼
                       TRANSAKSI SELESAI
```
## 📊 Flowchart Sistem

Flowchart berikut menggambarkan alur lengkap sistem Jastip Kampus mulai dari pengguna membuka aplikasi, memilih peran sebagai penjastip atau penitip, proses pemilihan barang, tawar-menawar, pembayaran, tracking, hingga transaksi selesai.

![Flowchart Alur Jastip Kampus](docs/Flowchart.jpeg)
---

# 👥 Peran dalam Sistem

## 1. Penjastip

Penjastip adalah mahasiswa yang membuka layanan titip-beli.

Penjastip dapat:

* Membuka sesi jastip.
* Menentukan toko atau lokasi pembelian.
* Menentukan batas waktu.
* Menentukan kapasitas titipan.
* Melihat dan merespons tawaran.
* Membeli barang.
* Mengantarkan barang kepada penitip.

---

## 2. Penitip

Penitip adalah mahasiswa yang menggunakan layanan jastip.

Penitip dapat:

* Melihat daftar jastip.
* Melihat katalog barang.
* Memilih jastip.
* Memilih barang.
* Mengisi jumlah dan varian.
* Memberikan catatan.
* Mengajukan tawaran harga/jasa titip.
* Melakukan pembayaran.
* Mengonfirmasi barang diterima.

---

# 🔀 Proses Tawar

Jika penitip ingin melakukan tawar harga atau jasa titip, sistem masuk ke proses tawar.

```text
Penitip mengajukan tawaran
          │
          ▼
Order-service menyimpan tawaran
          │
          ▼
Penjastip menyetujui tawaran?
       /             \
     Ya               Tidak
     │                  │
     ▼                  ▼
Lanjut ke proses    Penitip mengubah
jastip              tawaran / batal
                       │
                       ▼
                  Lanjut titipan?
                    /       \
                  Ya         Tidak
                  │            │
                  └───►        ▼
                         Titipan dibatalkan
```

Jika tawaran disetujui, proses dilanjutkan ke pembayaran.

Jika tawaran tidak disetujui, penitip dapat mengubah tawaran atau membatalkan titipan.

---

# 💳 Proses Pembayaran

Pembayaran ditangani oleh `payment-service`.

Alur pembayaran:

```text
Penitip bayar
     │
     ▼
payment-service
     │
     ▼
Saldo pembayaran ditahan
     │
     ▼
order-service konfirmasi titipan
```

Dana tidak langsung diberikan kepada penjastip. Dana ditahan terlebih dahulu sampai proses titipan selesai.

Setelah penitip mengonfirmasi barang telah diterima:

```text
Barang diterima
      │
      ▼
payment-service
      │
      ▼
Dana dilepaskan
      │
      ▼
Penjastip menerima dana
```

---

# 📦 Tracking Titipan

Status titipan dicatat oleh `tracking-service`.

Urutan status:

```text
DITITIP
   │
   ▼
DIBELANJAKAN
   │
   ▼
DIANTAR
   │
   ▼
DITERIMA
```

Detail:

1. **Dititip** — titipan telah dikonfirmasi.
2. **Dibelanjakan** — penjastip telah membeli barang.
3. **Diantar** — barang sedang diantarkan kepada penitip.
4. **Diterima** — penitip telah mengonfirmasi barang diterima.

---

# 🔌 Endpoint Kritis

Endpoint yang menjadi perhatian utama sistem:

| Endpoint         | Service           | Fungsi                                         |
| ---------------- | ----------------- | ---------------------------------------------- |
| `GET /catalog`   | `catalog-service` | Mengambil daftar toko, barang, dan harga acuan |
| `POST /titipan`  | `order-service`   | Membuat titipan baru                           |
| `POST /payments` | `payment-service` | Membuat transaksi pembayaran                   |

### Endpoint paling kritis

```text
POST /titipan
```

Endpoint ini berkaitan langsung dengan sumber daya rebutan, yaitu **kapasitas penjastip**.

Ketika banyak mahasiswa mengirim permintaan secara bersamaan, sistem harus memastikan:

```text
jumlah titipan ≤ kapasitas
```

dan tidak boleh terjadi:

```text
jumlah titipan > kapasitas
```

---

# 📁 Struktur Repository

```text
jastip-kampus/
│
├── .gitignore
│
├── README.md
│
├── openapi.yaml
│
├── docs/
│   ├── ARSITEKTUR.md
│   └── ENDPOINTS.md
│
└── services/
    │
    └── catalog-service/
        ├── index.js
        ├── package.json
        ├── package-lock.json
        └── node_modules/
```

> `node_modules/` tidak disimpan di Git karena sudah dimasukkan ke `.gitignore`.

---

# 🧩 Catalog Service

`catalog-service` merupakan layanan penyedia data katalog.

Pada tahap awal, data masih disimpan di memori menggunakan array JavaScript.

Data sementara:

```javascript
const items = [
    {
        id: 1,
        nama: "Item A",
        harga: 15000,
        sisa: 500
    },
    {
        id: 2,
        nama: "Item B",
        harga: 25000,
        sisa: 500
    }
];
```

Pada tahap berikutnya, data akan dipindahkan ke database.

---

# 🚀 Menjalankan Catalog Service

Masuk ke folder:

```bash
cd services/catalog-service
```

Install dependency:

```bash
npm install
```

Jalankan service:

```bash
node index.js
```

Jika berhasil:

```text
catalog-service berjalan di :3001
```

---

# 🧪 Pengujian API

## Health Check

```bash
curl.exe http://localhost:3001/health
```

Response:

```json
{
  "status": "ok",
  "service": "catalog-service"
}
```

---

## Mengambil Semua Item

```bash
curl.exe http://localhost:3001/items
```

---

## Mengambil Item Berdasarkan ID

```bash
curl.exe http://localhost:3001/items/1
```

---

# 📄 OpenAPI

Kontrak API disimpan pada:

```text
openapi.yaml
```

OpenAPI digunakan sebagai kontrak antara layanan backend dan aplikasi yang akan menggunakan API.

Dokumentasi API dapat diperiksa menggunakan Swagger Editor:

https://editor.swagger.io/

---

# 🔒 Aturan Penting Sistem

Sistem harus menjaga beberapa aturan utama:

### 1. Kapasitas tidak boleh terlampaui

```text
jumlah titipan ≤ kapasitas
```

### 2. Titipan hanya dapat dilakukan ketika sesi masih terbuka

```text
sesi = OPEN
```

### 3. Kapasitas harus tersedia

```text
kapasitas tersisa > 0
```

### 4. Pembayaran ditahan sampai transaksi selesai

Dana tidak langsung dilepaskan kepada penjastip.

### 5. Status tracking harus mengikuti urutan proses

```text
DITITIP
→ DIBELANJAKAN
→ DIANTAR
→ DITERIMA
```

---

# 🛠️ Teknologi

Teknologi yang digunakan pada tahap awal:

* **Node.js**
* **Express.js**
* **REST API**
* **OpenAPI 3.0.3**
* **Git**
* **GitHub**
* **Visual Studio Code**

Database dan komponen scalability akan dikembangkan pada tahap berikutnya.

---

# 📌 Status Pengembangan

### Pertemuan 1

* [x] Repository dibuat
* [x] Branch `setup-awal`
* [x] Struktur folder `services`
* [x] `catalog-service`
* [x] Express.js
* [x] Endpoint `/items`
* [x] Endpoint `/items/:id`
* [x] Endpoint `/health`
* [x] Model DDD
* [x] Bounded Context
* [x] Endpoint kritis
* [x] `openapi.yaml`
* [x] Dokumentasi arsitektur

### Tahap Berikutnya

* [ ] Database
* [ ] `order-service`
* [ ] `payment-service`
* [ ] `tracking-service`
* [ ] Komunikasi antar-service
* [ ] Pengamanan kapasitas
* [ ] Concurrency handling
* [ ] Load testing
* [ ] Scalability testing

---

# 👨‍💻 Pengembangan

Project ini dikembangkan sebagai proyek pembelajaran arsitektur **Microservices** dengan studi kasus **Jastip Kampus**.

Fokus utama sistem adalah menjaga konsistensi **kapasitas titipan penjastip** ketika terjadi banyak permintaan secara bersamaan.
