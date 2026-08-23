# DEPLOY.md — Panduan Menjalankan Sistem

Dokumen ini menjadi acuan peran Infrastructure & DevOps untuk menjalankan stack Jastip Kampus secara konsisten.

## 1. Prasyarat

1. Docker dan Docker Compose aktif.
2. File `.env` sudah tersedia di root repository.
3. Nilai `JWT_SECRET` dan `SERVICE_TOKEN` minimal 32 karakter.

## 2. Menyalakan Stack

Jalankan dari root repository:

1. `docker compose up -d --build`
2. `docker compose ps`

Kriteria lulus:

1. Semua container berstatus `Up` dan `healthy`.
2. Gateway aktif pada port `8080`.

## 3. Seed Data Demo

1. `npm run demo:reset-and-seed -- --confirm-reset`

Kriteria lulus:

1. Muncul status `OK` untuk mode `order`, `catalog`, `payment`, dan `tracking`.
2. Akun demo reguler berhasil dibuat.

## 4. Verifikasi API Inti

1. `curl -s http://localhost:8080/health`
2. `curl -s http://localhost:8080/v1/items`
3. `curl -s -X POST http://localhost:8080/v1/login -H 'Content-Type: application/json' -d '{"email":"andi.rizki@unismuh.ac.id","password":"Penjastip2026!"}'`

Kriteria lulus:

1. Endpoint `health` mengembalikan status `ok`.
2. Endpoint item mengembalikan daftar produk.
3. Endpoint login mengembalikan token JWT.

## 5. Menjalankan Expo Go di Codespaces

1. Masuk folder `mobile`.
2. Jalankan `npm run start:codespaces`.
3. Pastikan port `8080` berstatus publik jika diakses lintas perangkat:
   `gh codespace ports visibility 8080:public -c "$CODESPACE_NAME"`

Kriteria lulus:

1. Metro bundler menampilkan QR `exp://...`.
2. Web dan Expo Go dapat login ke API yang sama.

## 6. Troubleshooting Cepat

1. Jika muncul `502` sesaat setelah start, tunggu sampai semua service `healthy`.
2. Jika Expo Go gagal konek API, pastikan URL API bukan `localhost` pada perangkat HP.
3. Jika ada lebih dari satu Metro aktif, matikan proses lama agar HP tidak menempel ke tunnel lama.

## 7. Mematikan Stack

1. `docker compose down`
2. Untuk reset data penuh: `docker compose down -v`
