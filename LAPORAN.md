# LAPORAN — Jastip Kampus (Kelompok 3)

## 1. Ringkasan Produk

Jastip Kampus adalah sistem titip-beli antar mahasiswa dengan fokus utama menjaga konsistensi kapasitas sesi penjastip saat trafik tinggi. Alur utama sistem adalah membuka sesi, membuat titipan, pembayaran escrow, tracking status, dan konfirmasi selesai.

## 2. Lapisan Microservices — Apa yang Dirancang

Empat layanan utama:

1. order-service: sesi jastip, titipan, negosiasi, kapasitas, auth user.
2. catalog-service: toko, produk, harga acuan, foto produk.
3. payment-service: pembayaran escrow tertahan hingga syarat pelepasan terpenuhi.
4. tracking-service: event status dititip sampai diterima.

Artefak inti:

1. Kontrak API: openapi.yaml
2. Arsitektur: docs/ARSITEKTUR.md
3. Endpoint kritis: docs/ENDPOINTS.md
4. Uji skenario E2E: docs/LAPORAN-UJI.md

## 3. Lapisan Scalable — Apa yang Diukur

Pengukuran dilakukan dengan autocannon pada gateway lokal.

Tabel ringkas hasil baseline dan pengukuran ulang:

| Tahap | p50 | p97.5 | p99 | Throughput | Error/Non-2xx | Catatan |
|---|---:|---:|---:|---:|---:|---|
| Baseline GET /v1/items (c=50,d=15s) | 54 ms | 134 ms | 154 ms | 797 req/s | 0 | Endpoint baca stabil |
| Re-run GET /v1/items (c=50,d=15s) | 63 ms | 137 ms | 178 ms | 708 req/s | 0 | Stabil tanpa error |
| Baseline GET /v1/sessions (c=50,d=15s) | 10 ms | 29 ms | 42 ms | 6,050 req/s | tinggi | Non-2xx didominasi 429 (rate limit), bukan error transport |
| Re-run GET /v1/sessions (c=50,d=15s) | 10 ms | 28 ms | 34 ms | 5,825 req/s | tinggi | Pola tetap: throttle protektif aktif pada beban tinggi |

Catatan:

1. Script endpoint panas tersedia di loadtest/kapasitas.js.
2. Di environment ini, k6 belum terpasang, sehingga validasi angka dilakukan dengan autocannon.
3. Kolom Error autocannon tetap 0; perhatian utama ada pada HTTP Non-2xx (terutama 429) saat load tinggi.

## 4. Lapisan Mobile — Wajah untuk Pengguna

Implementasi mobile memakai Expo dengan fokus alur nyata pengguna dan stabilitas jaringan:

1. Login/register, pemilihan mode user.
2. Flow penitip dan penjastip terpisah.
3. Retry otomatis saat 429 dengan exponential backoff.
4. Penyimpanan auth/cache/outbox lokal via AsyncStorage.
5. Sinkronisasi outbox otomatis saat koneksi pulih.

Artefak mobile:

1. mobile/app/index.js
2. mobile/lib/api.js
3. mobile/lib/offline.js
4. docs/DATA-MOBILE.md

## 5. Apa yang Dipelajari

1. Konsistensi kapasitas harus dipusatkan pada service pemilik resource.
2. Idempotency key wajib untuk endpoint tulis saat retry.
3. Rate limiting melindungi sistem, tetapi harus diperhitungkan saat benchmark.
4. Integrasi mobile paling sering gagal karena URL API lintas device, bukan karena logic backend.

## 6. Pembagian Peran & Kontribusi

Rujukan resmi pembagian peran ada di PERAN.md.

| Peran | Kontribusi Utama |
|---|---|
| 🏗️ Arsitek Sistem | Menjaga konsistensi arsitektur, kontrak API, dan keputusan lintas service |
| ⚙️ Backend/API Engineer | Implementasi endpoint inti, auth, transisi status, negosiasi |
| 🚢 Infrastructure & DevOps | Docker compose, gateway nginx, healthcheck, runbook deploy |
| 🗄️ Data & Persistence Engineer | Skema data, seed, validasi konsistensi data, strategi offline data mobile |
| 📊 QA, Load-Test & Dokumentasi | Baseline uji, smoke test, dokumentasi teknis dan laporan akhir |

## Lampiran — Status Kepatuhan Modul

| Item Modul | Status | Bukti |
|---|---|---|
| 4 layanan microservice sesuai tema | Sesuai | docker-compose.yml dan services/* |
| Endpoint kritis terdokumentasi | Sesuai | docs/ENDPOINTS.md |
| Kontrak API dibekukan | Sesuai | openapi.yaml version 2.0.0 |
| Baseline berbasis angka | Sesuai | docs/BASELINE.md |
| Load test script tersedia | Sesuai | loadtest/kapasitas.js |
| Runbook deploy tersedia | Ditambahkan | docs/DEPLOY.md |
| Strategi data mobile tersedia | Ditambahkan | docs/DATA-MOBILE.md |

