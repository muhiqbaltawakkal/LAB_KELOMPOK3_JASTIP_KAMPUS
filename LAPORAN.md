# LAPORAN LENGKAP PROGRAM

## Jastip Kampus - Kelompok 3

## 1. Ringkasan Eksekutif

Jastip Kampus adalah platform titip-beli antar mahasiswa berbasis microservices. Program ini dirancang untuk menangani alur bisnis end-to-end mulai dari registrasi pengguna, pembukaan sesi jastip, pemesanan titipan, negosiasi biaya jasa, pembayaran escrow, tracking pengantaran, hingga konfirmasi barang diterima.

Fokus teknis utama sistem:

1. Menjaga konsistensi kapasitas sesi agar tidak terjadi oversell saat trafik paralel.
2. Menjamin idempotency untuk operasi tulis kritis.
3. Menyediakan pemisahan tanggung jawab yang jelas melalui database-per-service.
4. Menyediakan aplikasi klien mobile/web berbasis Expo Router untuk penggunaan nyata.

## 2. Identitas Proyek

- Nama sistem: Jastip Kampus
- Arsitektur: Microservices
- Repository: LAB_KELOMPOK3_JASTIP_KAMPUS
- Kontrak API: OpenAPI 3.0.3
- Versi API: 2.0.0
- Runtime utama: Docker Compose (Gateway + 4 service + PostgreSQL + Redis)

Dokumen rujukan utama:

1. README.md
2. docs/ARSITEKTUR.md
3. docs/ENDPOINTS.md
4. docs/POSTGRESQL-OVERHAUL.md
5. docs/TESTING.md
6. docs/LAPORAN-UJI.md
7. docs/BASELINE.md
8. docs/DEPLOY.md

## 3. Latar Belakang dan Tujuan

Layanan titip-beli di lingkungan kampus membutuhkan sistem yang dapat:

1. Mengelola banyak transaksi kecil dengan cepat.
2. Menjaga kepercayaan antar pengguna melalui escrow dan tracking transparan.
3. Menghindari benturan pemesanan pada kapasitas terbatas milik penjastip.

Tujuan program:

1. Menyediakan alur jastip yang jelas untuk dua mode pengguna reguler: Penitip dan Penjastip.
2. Menjaga konsistensi transaksi saat akses paralel tinggi.
3. Menyediakan artefak engineering yang siap diuji, didemokan, dan dipelihara.

## 4. Ruang Lingkup Sistem

Ruang lingkup yang tercakup:

1. Manajemen akun reguler dan login JWT.
2. Manajemen toko dan produk beserta unggah foto produk.
3. Pembuatan sesi jastip dengan batas waktu dan kapasitas.
4. Pembuatan titipan dengan dukungan negosiasi biaya jasa.
5. Pembayaran escrow simulasi.
6. Tracking status titipan sampai transaksi selesai.
7. Pengujian unit, smoke test end-to-end, lint kontrak OpenAPI, dan baseline load.

Di luar ruang lingkup saat ini:

1. Integrasi payment gateway eksternal produksi.
2. Push notification produksi.
3. Multi-region deployment.

## 5. Arsitektur Solusi

### 5.1 Komponen Utama

Sistem terdiri dari komponen berikut:

1. nginx sebagai API gateway pada port 8080.
2. catalog-service pada port internal 3001.
3. order-service pada port internal 3002 (3 replika: order-service-1, 2, 3).
4. payment-service pada port internal 3003.
5. tracking-service pada port internal 3004.
6. PostgreSQL sebagai data store utama.
7. Redis untuk cache, event, dan sinkronisasi lintas service.

### 5.2 Database-per-Service

Runtime terbaru menggunakan satu cluster PostgreSQL dengan empat database terpisah dan kredensial terisolasi:

1. catalog_db
2. order_db
3. payment_db
4. tracking_db

Pendekatan ini menjaga batas konteks layanan dan mengurangi coupling antar service.

### 5.3 Alur Interaksi Layanan

1. Pengguna berinteraksi melalui gateway.
2. order-service memimpin domain sesi dan titipan.
3. catalog-service menyuplai referensi toko/produk.
4. payment-service menahan dan melepas dana escrow.
5. tracking-service menjaga urutan status logistik.
6. Event lintas service dikelola melalui pola transactional outbox + deduplikasi event.

## 6. Alur Bisnis End-to-End

Alur bisnis reguler:

1. Pengguna registrasi lalu login.
2. Pengguna memilih mode Penitip atau Penjastip.
3. Penjastip membuat toko dan produk.
4. Penjastip membuka sesi jastip (deadline, kapasitas, daftar produk).
5. Penitip memilih sesi aktif lalu membuat titipan.
6. Opsional: penitip mengajukan tawaran biaya jasa, penjastip menerima/menolak.
7. Penitip membayar; dana ditahan oleh payment-service.
8. Penjastip mengubah tracking: dititip -> dibelanjakan -> diantar.
9. Penitip konfirmasi diterima.
10. Payment-service melepas escrow ke penjastip.
11. Transaksi selesai.

## 7. Endpoint Kritis

Endpoint kunci per alur:

1. Auth: POST /v1/register, POST /v1/login
2. Catalog: POST /v1/stores, POST /v1/products, GET /v1/items
3. Session: GET /v1/sessions, POST /v1/sessions
4. Titipan: POST /v1/titipan
5. Negosiasi: POST /v1/titipan/{id}/offers, PATCH /v1/offers/{id}
6. Pembayaran: POST /v1/payments
7. Tracking: POST /v1/tracking, GET /v1/tracking/{titipanId}, POST /v1/tracking/{titipanId}/confirm-received

Endpoint paling kritis secara konsistensi adalah POST /v1/titipan karena menangani reservasi kapasitas saat request paralel.

## 8. Konsistensi, Keamanan, dan Keandalan

### 8.1 Mekanisme Konsistensi

1. Reservasi kapasitas menggunakan conditional update atomik di PostgreSQL.
2. Pembatalan/expiry memakai penanda release agar kapasitas kembali tepat sekali.
3. Idempotency-Key diwajibkan pada endpoint tulis kritis (titipan dan pembayaran).
4. Tracking dibatasi pada urutan status valid: dititip -> dibelanjakan -> diantar -> diterima.

### 8.2 Mekanisme Keamanan

1. Otentikasi berbasis JWT.
2. Service-to-service token menggunakan SERVICE_TOKEN.
3. Secret wajib minimal 32 karakter (JWT_SECRET dan SERVICE_TOKEN).
4. Gateway menerapkan proteksi throttling/rate limit saat beban tinggi.

### 8.3 Mekanisme Keandalan

1. Tiga replika order-service dibelakang gateway.
2. Healthcheck aktif pada seluruh service.
3. Service start bergantung pada readiness Postgres/Redis.
4. Fallback operasional dan troubleshooting terdokumentasi.

## 9. Data, Seed, dan Migrasi

Komponen data utama:

1. SQL migrasi pada folder database/migrations.
2. Dataset seed pada folder dataset.
3. Runner seed/reset pada scripts dan database.

Reset dan seed demo terstandar:

```bash
npm run demo:reset-and-seed -- --confirm-reset
```

Perintah ini mengembalikan kondisi data ke state demo konsisten untuk seluruh tim.

## 10. Aplikasi Mobile/Web

Implementasi klien menggunakan Expo Router.

Kemampuan utama:

1. Login dan role mode switching.
2. Alur Penitip dan Penjastip terpisah.
3. Integrasi endpoint backend melalui gateway.
4. Penyimpanan lokal AsyncStorage untuk sesi dan data pendukung.
5. Dukungan mode Codespaces melalui script start khusus.

Catatan penting:

1. URL API pada perangkat fisik tidak boleh localhost.
2. Pada Codespaces, port 8080 harus public agar Expo Go bisa mengakses API.

## 11. Build, Deploy, dan Operasional

### 11.1 Build dan Start Backend

```bash
docker compose up -d --build
docker compose ps
```

### 11.2 Verifikasi Health

```bash
curl -s http://localhost:8080/health
```

### 11.3 Menjalankan Mobile

```bash
cd mobile
npm run start:codespaces
```

### 11.4 Build Mobile

Konfigurasi build release mobile memakai EAS pada mobile/eas.json dengan profil preview dan production.

## 12. Strategi Pengujian

Strategi pengujian meliputi empat level:

1. Unit test per service.
2. Smoke test end-to-end.
3. Contract lint OpenAPI.
4. Baseline/load test endpoint baca.

Perintah uji utama:

```bash
docker compose exec -T catalog-service npm test
docker compose exec -T order-service-1 npm test
docker compose exec -T payment-service npm test
docker compose exec -T tracking-service npm test
node scripts/smoke-test.mjs
npx @redocly/cli lint openapi.yaml
```

## 13. Hasil Pengujian Aktual

Ringkasan hasil yang terdokumentasi:

1. Health gateway: lulus.
2. Smoke test end-to-end: lulus (ok true).
3. Unit test seluruh service: lulus (fail 0).
4. OpenAPI lint: valid tanpa warning/error.

### 13.1 Baseline Kinerja (Autocannon)

| Endpoint | p50 | p97.5 | p99 | Throughput rata-rata | Error transport | Catatan |
|---|---:|---:|---:|---:|---:|---|
| GET /v1/items (baseline) | 54 ms | 134 ms | 154 ms | 797 req/s | 0 | Stabil |
| GET /v1/items (re-run) | 63 ms | 137 ms | 178 ms | 708 req/s | 0 | Stabil |
| GET /v1/sessions (baseline) | 10 ms | 29 ms | 42 ms | 6050 req/s | 0 | Non-2xx tinggi akibat throttle 429 |
| GET /v1/sessions (re-run) | 10 ms | 28 ms | 34 ms | 5825 req/s | 0 | Pola throttle tetap |

Interpretasi:

1. Tidak ditemukan error transport pada baseline.
2. Non-2xx tinggi pada endpoint sesi merupakan dampak rate limiting protektif, bukan crash service.
3. Endpoint katalog item stabil pada rentang latensi baseline.

### 13.2 Uji Oversell

Skenario request paralel pada kapasitas terbatas menunjukkan jumlah titipan sukses tidak melebihi kapasitas sesi. Permintaan berlebih ditolak terkontrol melalui status bisnis (409) atau throttle (429).

## 14. Risiko, Kendala, dan Mitigasi

Kendala yang tercatat saat verifikasi:

1. Gateway sempat mengembalikan 502 setelah reset/recreate container.

Mitigasi:

1. Pastikan seluruh service healthy.
2. Restart gateway nginx.
3. Ulang health check dan smoke test.

Kendala umum mobile:

1. Expo Go gagal konek jika API URL masih localhost atau port belum public.

Mitigasi:

1. Gunakan launcher codespaces.
2. Pastikan port 8080 public.
3. Scan ulang QR terbaru.

## 15. Pembagian Peran Tim

Pembagian peran mengikuti dokumen PERAN.md:

1. Arsitek Sistem: Muh. Iqbal Tawakkal
2. Backend/API Engineer: Nurdian
3. Infrastructure & DevOps: Syarifa Azizah. M
4. Data & Persistence Engineer: Rizki Amalia Rasyid Ridha
5. QA, Load-Test & Dokumentasi: Devi Nirwana

Kontribusi per peran:

1. Arsitektur dan kontrak API.
2. Implementasi endpoint inti lintas service.
3. Operasional Docker Compose, gateway, healthcheck.
4. Migrasi, seed, dan konsistensi data.
5. Strategi uji, baseline, dan dokumentasi akhir.

## 16. Kepatuhan Artefak Modul

| Kebutuhan | Status | Bukti |
|---|---|---|
| 4 microservice domain utama tersedia | Sesuai | services/* |
| Gateway terintegrasi | Sesuai | nginx/nginx.conf, docker-compose.yml |
| Kontrak API dibekukan | Sesuai | openapi.yaml (v2.0.0) |
| Uji end-to-end tersedia | Sesuai | scripts/smoke-test.mjs, docs/LAPORAN-UJI.md |
| Baseline performa tercatat | Sesuai | docs/BASELINE.md |
| Panduan deploy tersedia | Sesuai | docs/DEPLOY.md |
| Panduan testing tersedia | Sesuai | docs/TESTING.md |

## 17. Kesimpulan

Program Jastip Kampus telah memenuhi tujuan inti sebagai sistem titip-beli kampus berbasis microservices dengan fokus pada konsistensi kapasitas, kejelasan alur transaksi, dan keterujian teknis. Kombinasi desain database-per-service, idempotency, escrow simulasi, dan tracking berurutan menghasilkan alur bisnis yang dapat diuji secara reproducible pada lingkungan Docker.

Secara implementasi, sistem sudah memiliki:

1. Arsitektur yang terstruktur dan terdokumentasi.
2. Alur pengguna yang utuh dari registrasi hingga transaksi selesai.
3. Bukti pengujian fungsional, kontrak API, dan baseline performa.
4. Runbook operasional untuk startup, reset, dan troubleshooting.

Dengan demikian, artefak program siap digunakan sebagai deliverable capstone sekaligus fondasi untuk pengembangan tahap berikutnya.

## 18. Lampiran Referensi

1. README.md
2. openapi.yaml
3. docs/ARSITEKTUR.md
4. docs/ENDPOINTS.md
5. docs/POSTGRESQL-OVERHAUL.md
6. docs/TESTING.md
7. docs/LAPORAN-UJI.md
8. docs/BASELINE.md
9. docs/DEPLOY.md
10. docs/PANDUAN-MULAI-SAMPAI-BERHASIL.md

