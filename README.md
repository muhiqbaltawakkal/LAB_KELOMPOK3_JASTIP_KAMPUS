🛍️ Jastip Kampus

Sistem Titip-Beli Antar Mahasiswa berbasis Microservices

Jastip Kampus adalah platform layanan titip-beli antar mahasiswa. Mahasiswa dapat membuka layanan jastip, memilih barang yang ingin dititipkan, melakukan pembayaran, serta melacak status titipan hingga barang diterima.

Sistem dirancang menggunakan pendekatan Microservices Architecture — setiap layanan memiliki tanggung jawab dan data masing-masing.



📋 Daftar Isi

Tujuan Sistem
Arsitektur Microservices
Alur Sistem
Peran dalam Sistem
Proses Tawar
Proses Pembayaran
Tracking Titipan
Endpoint Kritis
Struktur Repository
Menjalankan Catalog Service
Pengujian API
OpenAPI
Aturan Penting Sistem
Teknologi
Status Pengembangan



🎯 Tujuan Sistem

Memudahkan mahasiswa membuka layanan jastip.
Memudahkan mahasiswa lain mencari dan memilih layanan jastip.
Menampilkan informasi toko, barang, harga acuan, dan satuan.
Memungkinkan penitip mengajukan tawaran harga atau jasa titip.
Mengelola pembayaran penitip.
Melacak status titipan dari awal sampai barang diterima.
Menjaga kapasitas jastip agar tidak melebihi batas yang ditentukan penjastip.



🏗️ Arsitektur Microservices

Sistem terdiri dari empat layanan utama:

Layanan
Tanggung Jawab
Data yang Dimiliki
order-service
Mengelola sesi jastip, buka/tutup titipan, kapasitas
Sesi jastip, daftar titipan, batas waktu, kapasitas
catalog-service
Mengelola toko, barang, harga acuan, dan satuan
Toko, barang, harga acuan, satuan
payment-service
Mengelola pembayaran dan pelepasan dana
Transaksi, saldo tertahan, riwayat pelepasan dana
tracking-service
Mengelola status perjalanan titipan
Riwayat status titipan dan waktu

Prinsip: Setiap service memiliki data dan tanggung jawab sendiri. Service lain tidak diperbolehkan mengakses database service secara langsung — komunikasi antar-service dilakukan melalui API atau event.

⚠️ Sumber Daya Rebutan: Kapasitas Penjastip

Sumber daya utama yang harus dijaga konsistensinya adalah kapasitas titipan milik penjastip.

Kapasitas = 10
Titipan berhasil = maksimal 10
Titipan ke-11   = ditolak

Sistem menjaga agar kapasitas penjastip tetap konsisten dan tidak terlampaui walaupun ribuan mahasiswa melakukan titip-beli secara bersamaan.

Aturan kapasitas ini ditangani oleh order-service.



🔄 Alur Sistem

![Flowchart Alur Jastip Kampus](docs/Flowchart.jpeg)



👥 Peran dalam Sistem

1. Penjastip

Mahasiswa yang membuka layanan titip-beli.

Aksi
Keterangan
Buka sesi jastip
Menentukan toko, batas waktu, dan kapasitas
Respons tawaran
Menyetujui atau menolak tawaran penitip
Beli barang
Membeli barang sesuai titipan
Antar barang
Mengantarkan barang kepada penitip

2. Penitip

Mahasiswa yang menggunakan layanan jastip.

Aksi
Keterangan
Pilih jastip
Mencari dan memilih penjastip yang tersedia
Pesan barang
Memilih barang, jumlah, varian, dan catatan
Tawar harga
Mengajukan tawaran harga atau jasa titip
Bayar
Melakukan pembayaran titipan
Konfirmasi terima
Mengonfirmasi barang sudah diterima



💬 Proses Tawar

Jika penitip ingin melakukan tawar harga:

Penitip mengajukan tawaran
│
▼
Order-service menyimpan tawaran
│
▼
Penjastip menyetujui?
     /         \
   Ya           Tidak
   │               │
   ▼               ▼
Lanjut ke       Penitip ubah tawaran
proses jastip   atau batalkan titipan



💳 Proses Pembayaran

Pembayaran ditangani oleh payment-service dengan sistem dana tertahan (escrow).

Penitip bayar
│
▼
payment-service → Saldo ditahan
│
▼
order-service konfirmasi titipan
│
  ··· proses titipan berjalan ···
│
▼
Barang diterima penitip
│
▼
payment-service → Dana dilepaskan ke penjastip

Dana tidak langsung diberikan kepada penjastip. Dana ditahan sampai penitip mengonfirmasi barang telah diterima.



📦 Tracking Titipan

Status titipan dicatat oleh tracking-service.

DITITIP  →  DIBELANJAKAN  →  DIANTAR  →  DITERIMA

Status
Keterangan
DITITIP
Titipan telah dikonfirmasi
DIBELANJAKAN
Penjastip telah membeli barang
DIANTAR
Barang sedang diantarkan kepada penitip
DITERIMA
Penitip telah mengonfirmasi barang diterima



🔌 Endpoint Kritis

Endpoint
Service
Fungsi
GET /catalog
catalog-service
Mengambil daftar toko, barang, dan harga acuan
POST /titipan
order-service
Membuat titipan baru
POST /payments
payment-service
Membuat transaksi pembayaran

⚡ Endpoint Paling Kritis: POST /titipan

Endpoint ini berkaitan langsung dengan kapasitas penjastip (sumber daya rebutan).

Sistem wajib memastikan:

jumlah titipan ≤ kapasitas  ✅
jumlah titipan > kapasitas  ❌ DITOLAK



📁 Struktur Repository

jastip-kampus/
├── .gitignore
├── README.md
├── openapi.yaml
├── docs/
│   ├── ARSITEKTUR.md
│   ├── ENDPOINTS.md
│   └── Flowchart.jpeg
└── services/
    └── catalog-service/
        ├── index.js
        ├── package.json
        └── package-lock.json

node_modules/ tidak disimpan di Git (sudah dimasukkan ke .gitignore).



🚀 Menjalankan Catalog Service

1. Masuk ke folder service:

cd services/catalog-service

2. Install dependency:

npm install

3. Jalankan service:

node index.js

Output jika berhasil:

catalog-service berjalan di :3001



🧪 Pengujian API

Health Check

curl http://localhost:3001/health

{
  "status": "ok",
  "service": "catalog-service"
}

Mengambil Semua Item

curl http://localhost:3001/items

Mengambil Item Berdasarkan ID

curl http://localhost:3001/items/1



📄 OpenAPI

Kontrak API tersimpan di file:

openapi.yaml

Untuk memeriksa dokumentasi API secara visual, gunakan Swagger Editor:

🔗 https://editor.swagger.io/



📏 Aturan Penting Sistem

#
Aturan
Kondisi
1
Kapasitas tidak boleh terlampaui
jumlah titipan ≤ kapasitas
2
Titipan hanya saat sesi terbuka
sesi = OPEN
3
Kapasitas harus tersedia
kapasitas tersisa > 0
4
Pembayaran ditahan sampai selesai
Dana dilepas setelah konfirmasi terima
5
Status tracking harus berurutan
DITITIP → DIBELANJAKAN → DIANTAR → DITERIMA



🛠️ Teknologi

Kategori
Teknologi
Runtime
Node.js
Framework
Express.js
API Style
REST API
API Contract
OpenAPI 3.0.3
Version Control
Git + GitHub
Editor
Visual Studio Code

Database dan komponen scalability akan dikembangkan pada tahap berikutnya.



📈 Status Pengembangan

✅ Pertemuan 1 — Setup Awal

Repository dibuat
Branch setup-awal
Struktur folder services/
catalog-service dengan Express.js
Endpoint /items, /items/:id, /health
Model DDD & Bounded Context
Identifikasi endpoint kritis
openapi.yaml
Dokumentasi arsitektur

🔲 Tahap Berikutnya

Database (PostgreSQL / MySQL)
order-service
payment-service
tracking-service
Komunikasi antar-service (event / API)
Pengamanan kapasitas (concurrency handling)
Load testing
Scalability testing



👨‍💻 Pengembangan

Project ini dikembangkan sebagai proyek pembelajaran arsitektur Microservices dengan studi kasus Jastip Kampus.

Fokus utama sistem adalah menjaga konsistensi kapasitas titipan penjastip ketika terjadi banyak permintaan secara bersamaan.
