# Arsitektur Jastip Kampus

## Tema

Jastip Kampus — Titip-beli antar mahasiswa: buka order, bayar, lacak.

## Sumber Daya Rebutan

Kapasitas bawaan penjastip — tidak boleh melebihi batas.

## Prinsip Konsistensi

Sistem kami menjaga agar kapasitas bawaan penjastip tetap konsisten dan tidak melebihi batas walaupun ribuan mahasiswa melakukan titip-beli secara bersamaan.

## Bounded Context

### 1. order-service

Tanggung jawab:
- Mengelola sesi jastip.
- Membuka dan menutup titipan.
- Mengelola batas kapasitas.
- Mengelola batas waktu.
- Mengelola daftar titipan.

Data yang dimiliki:
- Sesi jastip.
- Daftar titipan.
- Batas waktu.
- Kapasitas.

### 2. catalog-service

Tanggung jawab:
- Mengelola daftar toko.
- Mengelola barang.
- Menyediakan harga acuan.
- Menyediakan satuan barang.

Data yang dimiliki:
- Toko.
- Barang.
- Harga acuan.
- Satuan.

### 3. payment-service

Tanggung jawab:
- Menampung pembayaran penitip.
- Menyimpan saldo pembayaran yang tertahan.
- Melepaskan dana kepada penjastip.

Data yang dimiliki:
- Transaksi.
- Saldo tertahan.
- Riwayat pelepasan dana.

### 4. tracking-service

Tanggung jawab:
- Mencatat status titipan.
- Menyimpan riwayat perubahan status.
- Mencatat waktu setiap perubahan status.

Data yang dimiliki:
- Riwayat status titipan.
- Waktu perubahan status.

## Context Map

```text
+-------------------+
|  catalog-service  |
| toko, barang,     |
| harga, satuan     |
+---------+---------+
          |
          v
+-------------------+
|   order-service   |
| sesi jastip,      |
| titipan,          |
| kapasitas         |
+---------+---------+
          |
          +------------------+
          |                  |
          v                  v
+-------------------+  +-------------------+
| payment-service   |  | tracking-service  |
| pembayaran,       |  | status titipan    |
| saldo tertahan    |  | dan riwayat       |
+-------------------+  +-------------------+

![Flowchart Alur Jastip Kampus](docs/Flowchart.jpeg)
