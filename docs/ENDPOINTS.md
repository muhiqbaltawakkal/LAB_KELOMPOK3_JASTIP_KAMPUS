# Endpoint Alur 2 Role — Jastip Kampus

Dokumen ini mengikuti alur bisnis dua role reguler: `Penitip` dan `Penjastip`.

## Sumber Daya Rebutan

Kapasitas sesi milik penjastip tidak boleh terlampaui pada saat banyak penitip melakukan titipan bersamaan.

## Urutan Endpoint Sesuai Alur

### 1) Registrasi dan Login

1. `POST /v1/register`
	- Fungsi: membuat akun reguler.
	- Service: `order-service`.
2. `POST /v1/login`
	- Fungsi: mendapatkan JWT.
	- Service: `order-service`.

### 2) Penjastip Membuka Sesi

1. `POST /v1/stores`
	- Fungsi: membuat toko milik penjastip.
	- Service: `catalog-service`.
2. `POST /v1/products`
	- Fungsi: menambah produk toko.
	- Service: `catalog-service`.
3. `POST /v1/sessions`
	- Fungsi: membuka sesi jastip (deadline, kapasitas, daftar produk).
	- Service: `order-service`.

### 3) Penitip Memilih dan Membuat Titipan

1. `GET /v1/sessions`
	- Fungsi: melihat sesi jastip aktif.
	- Service: `order-service`.
2. `POST /v1/titipan`
	- Fungsi: membuat titipan dan reservasi kapasitas.
	- Service: `order-service`.
	- Catatan: wajib header `Idempotency-Key`.

### 4) Jalur Tawar (Opsional)

1. `POST /v1/titipan/{id}/offers`
	- Fungsi: penitip mengirim revisi tawaran jasa.
	- Service: `order-service`.
2. `PATCH /v1/offers/{id}`
	- Fungsi: penjastip menerima/menolak tawaran.
	- Service: `order-service`.
3. `POST /v1/titipan/{id}/cancel`
	- Fungsi: batal titipan dan lepas kapasitas tepat sekali.
	- Service: `order-service`.

### 5) Pembayaran Escrow

1. `POST /v1/payments`
	- Fungsi: menahan dana titipan (escrow).
	- Service: `payment-service`.
	- Catatan: wajib header `Idempotency-Key`.

### 6) Tracking Hingga Selesai

1. `GET /v1/tracking/{titipanId}`
	- Fungsi: melihat riwayat status tracking.
	- Service: `tracking-service`.
2. `POST /v1/tracking`
	- Fungsi: catat status berikutnya oleh penjastip/admin (berurutan).
	- Service: `tracking-service`.
3. `POST /v1/tracking/{titipanId}/confirm-received`
	- Fungsi: penitip konfirmasi barang diterima dan memicu pelepasan escrow.
	- Service: `tracking-service` dan `payment-service`.

## Endpoint Paling Kritis

`POST /v1/titipan`

Alasan:
1. Endpoint ini memegang logika reservasi kapasitas sesi.
2. Harus aman terhadap kondisi balapan saat request paralel.
3. Harus idempoten berdasarkan `Idempotency-Key`.

## Aturan Keberhasilan Bisnis

1. Jumlah titipan terpakai tidak boleh melebihi kapasitas maksimal sesi.
2. Titipan yang dibatalkan/expired harus melepas kapasitas tepat sekali.
3. Tracking harus berurutan: `dititip -> dibelanjakan -> diantar -> diterima`.
4. Dana escrow dilepas hanya setelah status `diterima` terkonfirmasi.