# ARSITEKTUR-MOBILE.md — Jastip Kampus

Dokumen ini menjelaskan arsitektur aplikasi mobile dan hubungan layar dengan endpoint backend.

## 1. Struktur Utama

1. Layer UI: `mobile/app/index.js`
2. Layer API: `mobile/lib/api.js`
3. Layer offline storage: `mobile/lib/offline.js`
4. Konfigurasi endpoint: `mobile/config.js` dan `mobile/app.config.js`

## 2. Alur Navigasi Inti

1. Auth screen: login/register.
2. Mode chooser: pilih peran Penitip atau Penjastip.
3. Dashboard Penitip: sesi, detail, tawar/bayar, tracking, riwayat.
4. Dashboard Penjastip: toko, produk, sesi, tawaran, titipan aktif.
5. Dashboard Admin: master data, transaksi, tracking, audit.

## 3. Integrasi Endpoint

1. Auth: `/v1/register`, `/v1/login`, `/v1/me`
2. Catalog: `/v1/items`, `/v1/toko`, `/v1/stores`, `/v1/products`
3. Order: `/v1/sessions`, `/v1/titipan`, `/v1/offers`
4. Payment: `/v1/payments`
5. Tracking: `/v1/tracking`

## 4. Ketahanan Client

1. Retry otomatis untuk respons 429 menggunakan backoff.
2. Outbox untuk aksi tulis ketika offline.
3. Flush outbox otomatis saat koneksi pulih.
4. Cache lokal untuk pengalaman pengguna saat jaringan tidak stabil.

## 5. Catatan Konsistensi

1. URL API harus dapat dijangkau perangkat mobile, bukan localhost perangkat.
2. Aksi tulis memakai idempotency key untuk mencegah duplikasi saat retry.
3. Kontrak endpoint mengacu pada `openapi.yaml` versi 2.0.0.
