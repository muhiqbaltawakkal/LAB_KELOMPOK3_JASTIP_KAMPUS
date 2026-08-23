# Testing Jastip Kampus

Catatan platform:

- Perintah di dokumen ini memakai PowerShell untuk workflow lokal Windows.
- Untuk Linux/Codespaces, gunakan alur pada README (docker compose + demo reset/seed) agar hasil konsisten.

## 1) Persiapan Environment

Nilai minimum untuk local/dev:

1. `JWT_SECRET` minimal 32 karakter.
2. `SERVICE_TOKEN` minimal 32 karakter.
3. Docker aktif.

Contoh nilai dev:

```bash
export JWT_SECRET='0123456789abcdef0123456789abcdef'
export SERVICE_TOKEN='fedcba9876543210fedcba9876543210'
```

## 2) Reset dan start lokal

Jalankan dari root repository:

```powershell
./scripts/reset-databases.ps1
./scripts/start-local.ps1
```

Reset menghapus akun, toko, produk, sesi, titipan, pembayaran, tracking, dan seluruh foto upload. Setelah start, `GET http://localhost:8080/v1/items` dan `/v1/sessions` harus berisi array kosong.

## 3) Unit dan Bundle Test

```bash
docker compose exec -T catalog-service npm test
docker compose exec -T order-service-1 npm test
docker compose exec -T payment-service npm test
docker compose exec -T tracking-service npm test
cd mobile && npx expo export --platform web --output-dir dist-test && cd ..
```

Ekspektasi:
1. Tiap service test menunjukkan `pass` dan `fail 0`.
2. Expo export menampilkan status bundling web berhasil.

## 4) Smoke Test End-to-End

```powershell
node scripts/smoke-test.mjs
```

Script mendaftarkan penjastip/penitip, membuat toko, mengunggah foto produk, membuka sesi, membuktikan kapasitas dan idempotency, lalu membuat escrow pembayaran. Setelah pengujian, jalankan reset kembali bila membutuhkan kondisi kosong.

Keluaran yang diharapkan:
1. JSON mengandung `ok: true`.
2. Blok `direct` dan `negotiation` terisi.
3. `escrow` bernilai `dilepas`.

## 5) Uji Contract API

```bash
npx @redocly/cli lint openapi.yaml
```

Ekspektasi:
1. Spec valid.
2. Tidak ada error blocking.

## 6) Uji Load Dasar

```bash
npx autocannon -c 50 -d 15 http://localhost:8080/v1/items
npx autocannon -c 50 -d 15 "http://localhost:8080/v1/sessions?page=1&limit=20"
```

Evaluasi:
1. Bandingkan metrik ke `docs/BASELINE.md`.
2. Non-2xx pada endpoint sesi dibaca bersama kebijakan throttle/rate-limit.

## 7) Uji Expo Go

```powershell
cd mobile
npx expo start --tunnel --clear
```

1. Daftar sebagai penjastip.
2. Buat toko.
3. Tambah produk memakai galeri dan kamera; foto yang sama harus tampil pada kartu produk.
4. Buka sesi, pilih toko dan minimal satu produk.
5. Pastikan semua toko, produk, dan sesi tampil pada dashboard penjastip.
6. Logout, daftar sebagai penitip, lalu pastikan hanya produk dari sesi aktif yang tampil dengan foto upload asli.
7. Buat titipan dan pastikan pembayaran berstatus `tertahan`.

File yang diterima: JPEG, PNG, dan WEBP maksimal 5 MB. Tanpa foto, UI memakai placeholder `Foto belum tersedia`, bukan gambar internet.

## 8) Pembagian Tugas Pengujian per Peran

1. ⚙️ Backend/API Engineer: verifikasi endpoint inti dan alur status bisnis.
2. 🚢 Infrastructure & DevOps: jaga health container, gateway, port, dan kestabilan startup.
3. 🗄️ Data & Persistence Engineer: validasi migrasi/seed, konsistensi stok/kapasitas, dan status tracking.
4. 📊 QA, Load-Test & Dokumentasi: jalankan test, load test, lint kontrak, serta finalisasi bukti.
