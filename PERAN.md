# PERAN.md — Kelompok 3 — Tema: Jastip Kampus

| Peran | Nama | NIM | Diklaim pada |
|---|---|---|---|
| 🏗️ Arsitek Sistem | Muh. Iqbal Tawakkal | - | 2026-08-22 |
| ⚙️ Backend/API Engineer | Nurdian | - | 2026-08-22 |
| 🚢 Infrastructure & DevOps | Syarifa Azizah. M | - | 2026-08-22 |
| 🗄️ Data & Persistence Engineer | Rizki Amalia Rasyid Ridha | 105841121223 | 2026-08-22 |
| 📊 QA, Load-Test & Dokumentasi | Devi Nirwana | - | 2026-08-22 |

## Fokus Utama Peran

| Peran | Fokus |
|---|---|
| 🏗️ Arsitek Sistem | Merancang arsitektur, diagram, ADR, menjaga konsistensi desain |
| ⚙️ Backend/API Engineer | Mengimplementasikan endpoint/layanan inti dan logika bisnis |
| 🚢 Infrastructure & DevOps | Docker, compose, gateway, menjalankan sistem |
| 🗄️ Data & Persistence Engineer | Skema data, cache/Redis, konsistensi stok, migrasi |
| 📊 QA, Load-Test & Dokumentasi | Pengujian, load test, AI-LOG, README, laporan akhir |

## Deliverable Wajib Per Peran

| Peran | Deliverable Minimal |
|---|---|
| 🏗️ Arsitek Sistem | Pembaruan ADR bila ada perubahan arsitektur, validasi konsistensi antar service |
| ⚙️ Backend/API Engineer | Endpoint sesuai kontrak, validasi input, error handling, unit test service |
| 🚢 Infrastructure & DevOps | Compose sehat, port/API bisa diakses, env dan startup script stabil |
| 🗄️ Data & Persistence Engineer | Migrasi aman, seed valid, skema dan index sinkron dengan kebutuhan query |
| 📊 QA, Load-Test & Dokumentasi | Smoke test lulus, skenario regresi, pembaruan README/dokumen uji |

## Sinkronisasi Folder dengan Peran

| Folder/File | Penanggung Jawab Utama | Fokus Sinkronisasi |
|---|---|---|
| `docs/ADR-*`, `docs/ARSITEKTUR*.md`, `openapi.yaml` | 🏗️ Arsitek Sistem | Konsistensi kontrak API, arsitektur, dan keputusan desain |
| `services/*/index.js`, `services/*/db.js` | ⚙️ Backend/API Engineer | Endpoint, validasi input, state bisnis penitip-penjastip |
| `docker-compose.yml`, `nginx/nginx.conf`, `scripts/setup-codespaces.mjs` | 🚢 Infrastructure & DevOps | Kesehatan compose, gateway, port visibility, startup stabil |
| `database/migrations/*`, `dataset/demo-seed.js`, `database/demo-seed-runner.js` | 🗄️ Data & Persistence Engineer | Struktur data, seed, konsistensi ID produk/toko/sesi, gambar |
| `scripts/smoke-test.mjs`, `docs/TESTING.md`, `docs/LAPORAN-UJI.md`, `AI-LOG.MD` | 📊 QA, Load-Test & Dokumentasi | Regresi alur penuh, bukti uji, update dokumentasi |
| `mobile/app/index.js`, `mobile/lib/api.js`, `mobile/scripts/*` | Kolaborasi Backend + DevOps + QA | Koneksi API, tombol/menu, sinkron data sesi/riwayat/foto |

## Perintah Standar Sinkronisasi Tim

Gunakan satu perintah berikut dari root agar stack, dataset, dan alur fitur tersinkron:

```bash
npm run sync:all -- --confirm-reset
```

Output dinyatakan siap jika:

1. Semua service `docker compose ps` berstatus healthy.
2. Seed demo selesai (akun, toko, produk, sesi, pembayaran, tracking terisi).
3. `scripts/smoke-test.mjs` lulus (`"ok": true`).
4. (Codespaces) `doctor:codespaces` lulus.

## Alur Sinkronisasi Antar Peran

1. Arsitek Sistem menetapkan kontrak perubahan dan dampak lintas service.
2. Backend/API Engineer implementasi endpoint berdasarkan kontrak dan menyerahkan daftar perubahan API.
3. Data & Persistence Engineer menyesuaikan migrasi/seed sesuai perubahan endpoint dan memastikan kompatibilitas data.
4. Infrastructure & DevOps memastikan compose, gateway, serta variabel environment mendukung perubahan terbaru.
5. QA, Load-Test & Dokumentasi menjalankan smoke test dan regresi, lalu mengembalikan temuan ke peran terkait.
6. Semua peran melakukan verifikasi akhir bersama sebelum merge atau demo.

## Checklist Sinkron Sebelum Menjalankan Sistem

1. Data seed valid JSON dan dapat di-load tanpa error.
2. Semua container docker compose berstatus healthy.
3. API gateway merespons endpoint health dan endpoint inti.
4. Login web dan Expo Go berhasil terhadap URL API yang sama.
5. Smoke test end-to-end lulus.
6. Dokumen README, TESTING, dan AI-LOG diperbarui sesuai perubahan terakhir.

## Catatan

- Dokumen ini disiapkan untuk menyamakan pembagian peran dengan dashboard kelompok.
- Jika ada perbedaan penulisan nama/NIM di dashboard resmi, jadikan dashboard sebagai sumber utama lalu sesuaikan tabel ini.
