# Endpoint Kritis — Jastip Kampus

## Sumber Daya Rebutan

Kapasitas bawaan penjastip tidak boleh melebihi batas.

## Endpoint Kritis

### 1. GET /catalog

Digunakan untuk mengambil daftar toko, barang, dan harga acuan.

Layanan:
catalog-service

### 2. POST /titipan

Digunakan untuk membuat titipan baru.

Layanan:
order-service

Endpoint ini merupakan endpoint paling kritis karena penambahan titipan berhubungan langsung dengan kapasitas terbatas penjastip.

Sistem harus memastikan jumlah titipan tidak pernah melebihi kapasitas yang tersedia.

### 3. POST /payments

Digunakan untuk membuat transaksi pembayaran penitip.

Layanan:
payment-service

## Prioritas Beban

Endpoint yang paling berkaitan dengan sumber daya rebutan adalah:

POST /titipan

Endpoint tersebut harus menjaga konsistensi kapasitas ketika banyak mahasiswa melakukan permintaan secara bersamaan.