# LAPORAN — Jastip Kampus (Kelompok 3)

## 1. Ringkasan Produk

Jastip Kampus adalah sistem titip-beli antar mahasiswa dengan empat layanan utama: order, catalog, payment, dan tracking. Alur inti dimulai dari pembukaan sesi oleh penjastip, penitip membuat titipan sebelum deadline, pembayaran escrow, pembelanjaan, pengantaran, lalu konfirmasi diterima. Tantangan terbesar sistem adalah menjaga kapasitas sesi agar tetap konsisten saat banyak request masuk bersamaan.

## 2. Lapisan Microservices — Apa yang Dirancang

1. order-service: mengelola sesi, titipan, tawaran, dan kontrol kapasitas.
2. catalog-service: mengelola toko, produk, harga acuan, dan foto.
3. payment-service: menahan dana escrow dan melepas setelah konfirmasi diterima.
4. tracking-service: mencatat status dititip, dibelanjakan, diantar, diterima.

Artefak utama:
- Kontrak API: openapi.yaml
- Arsitektur: docs/ARSITEKTUR.md
- Daftar endpoint: docs/ENDPOINTS.md
- Uji E2E: docs/LAPORAN-UJI.md

## 3. Lapisan Scalable — Apa yang Diukur

Baseline awal diukur menggunakan autocannon (docs/BASELINE.md):

| Tahap | p99 | Throughput | Error/Non-2xx | Catatan |
|---|---:|---:|---:|---|
| Baseline GET /v1/items (c=50,d=15s) | 154 ms | 797 req/s | 0 | Endpoint baca relatif stabil |
| Baseline GET /v1/sessions (c=50,d=15s) | 42 ms | 6,050 req/s | tinggi | Perlu investigasi error rate saat beban |

Hasil ini digunakan sebagai titik awal sebelum tuning lanjutan di gateway/layer service.

## 4. Lapisan Mobile — Wajah untuk Pengguna

Aplikasi mobile dibangun dengan Expo/React Native dan terhubung ke API gateway. Implementasi mencakup:

1. Alur role penitip dan penjastip.
2. Retry otomatis saat 429 dengan backoff bertahap.
3. Deteksi jaringan online/offline.
4. Outbox offline untuk menahan titipan saat tidak ada koneksi.
5. Sinkronisasi otomatis saat koneksi kembali normal.

Artefak mobile:
- mobile/app/index.js
- mobile/lib/api.js
- mobile/lib/offline.js
- mobile/eas.json

## 5. Apa yang Dipelajari

1. Konsistensi sumber daya rebutan harus diproteksi di sisi service pemilik resource.
2. Idempotency key sangat penting untuk endpoint tulis agar aman dari retry.
3. Dokumentasi endpoint dan kontrak API perlu berjalan seiring implementasi agar integrasi mobile stabil.
4. Pengukuran performa wajib dilakukan berbasis angka, bukan asumsi.

## 6. Pembagian Peran & Kontribusi

Rujukan peran ada di PERAN.md.

| Peran | Kontribusi Utama |
|---|---|
| 🏗️ Arsitek Sistem | Penyelarasan arsitektur, kontrak API, dan alur 2 role |
| ⚙️ Backend/API Engineer | Implementasi endpoint inti order, transaksi, dan admin |
| 🚢 Infrastructure & DevOps | Orkestrasi docker compose, gateway, dan environment runtime |
| 🗄️ Data & Persistence Engineer | Dataset, seed pipeline, konsistensi data, dan validasi manifest |
| 📊 QA, Load-Test & Dokumentasi | Smoke test, baseline load test, dan dokumentasi laporan |

---

Status akhir: sistem siap demo alur end-to-end dan siap serah artefak openapi v2, dengan catatan optimasi scalable lanjutan difokuskan pada endpoint sesi saat beban tinggi.
