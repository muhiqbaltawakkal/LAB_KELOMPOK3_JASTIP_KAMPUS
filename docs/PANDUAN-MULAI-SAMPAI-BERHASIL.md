# Panduan Jalan Proyek dari Nol Sampai Berhasil

Panduan ini dibuat agar semua anggota tim bisa menjalankan proyek dengan alur yang sama, dari setup awal sampai aplikasi benar-benar bisa dipakai.

## 1. Prasyarat

Minimal yang harus tersedia:

1. Git
2. Docker + Docker Compose
3. Node.js 22+ dan npm
4. Koneksi internet stabil

Cek cepat:

```bash
git --version
docker --version
docker compose version
node -v
npm -v
```

## 2. Clone Repository

```bash
git clone https://github.com/muhiqbaltawakkal/LAB_KELOMPOK3_JASTIP_KAMPUS.git
cd LAB_KELOMPOK3_JASTIP_KAMPUS
```

## 3. Set Secret Environment (Wajib)

Service menolak startup kalau secret terlalu pendek.

Linux/macOS:

```bash
export JWT_SECRET='0123456789abcdef0123456789abcdef'
export SERVICE_TOKEN='fedcba9876543210fedcba9876543210'
```

PowerShell:

```powershell
$env:JWT_SECRET='0123456789abcdef0123456789abcdef'
$env:SERVICE_TOKEN='fedcba9876543210fedcba9876543210'
```

## 4. Jalankan Semua Service Backend

```bash
docker compose up -d --build
docker compose ps
```

Pastikan semua container statusnya healthy sebelum lanjut.

## 5. Reset dan Seed Data Demo

Perintah ini wajib saat awal agar data tim konsisten.

```bash
npm run demo:reset-and-seed -- --confirm-reset
```

Perintah ini akan:

1. Reset volume database dan upload
2. Menyalakan ulang stack
3. Mengisi akun, toko, produk, sesi, titipan, pembayaran, tracking demo

## 6. Verifikasi Backend Berhasil

### 6.1 Cek health gateway

```bash
curl -sS http://localhost:8080/health
```

Target: keluar JSON status sehat.

### 6.2 Jalankan smoke test end-to-end

```bash
node scripts/smoke-test.mjs
```

Target: output JSON dengan ok true dan escrow dilepas.

Jika sempat dapat 502 setelah reset, jalankan:

```bash
docker compose restart nginx
```

Lalu ulang health check dan smoke test.

## 7. Akun Demo untuk Login

Password semua akun reguler:

Penjastip2026!

Akun Penjastip:

1. rizki.amalia@unismuh.ac.id
2. iqbal.tawakkal@unhas.ac.id
3. putri.handa@uin-alauddin.ac.id
4. dika.pratama@polmed.ac.id

Akun Penitip:

1. andi.rizki@unismuh.ac.id
2. siti.rahma@unhas.ac.id
3. m.fauzi@uin-alauddin.ac.id
4. nurul.hidayah@stie-tri.ac.id
5. bagas.suli@polmed.ac.id

## 8. Jalankan Frontend Mobile/Web

Masuk ke folder mobile:

```bash
cd mobile
npm install
```

### 8.1 Untuk Codespaces (disarankan)

```bash
npm run start:codespaces
```

Lalu:

1. Buka web dari URL Expo yang muncul di terminal
2. Untuk HP, scan QR via Expo Go
3. Pastikan port 8080 visibility Public

### 8.2 Untuk lokal biasa

```bash
npm run web
```

Atau:

```bash
npm start
```

## 9. Uji Alur Aplikasi Sampai Selesai

Gunakan alur ini untuk pembuktian saat demo:

1. Login sebagai Penjastip
2. Buat toko
3. Tambah produk (dengan foto)
4. Buka sesi jastip
5. Logout
6. Login sebagai Penitip
7. Lihat sesi aktif
8. Buat titipan
9. Lakukan pembayaran
10. Kembali akun Penjastip, update tracking sampai diantar
11. Kembali akun Penitip, konfirmasi diterima
12. Verifikasi pembayaran berubah jadi dilepas

## 10. Menjalankan Test Per Service (Opsional Tapi Disarankan)

Jalankan dari root:

```bash
docker compose exec -T catalog-service npm test
docker compose exec -T order-service-1 npm test
docker compose exec -T payment-service npm test
docker compose exec -T tracking-service npm test
npx @redocly/cli lint openapi.yaml
```

Target:

1. Semua test pass
2. OpenAPI valid

## 11. Cara Membuat Akun Admin (Jika Dibutuhkan)

Dari root project:

PowerShell:

```powershell
$env:ADMIN_NAME='Administrator'
$env:ADMIN_EMAIL='admin@jastip.local'
$env:ADMIN_PASSWORD='GantiDenganPasswordKuat123!'
npm run bootstrap:admin
```

Linux/macOS:

```bash
ADMIN_NAME='Administrator' ADMIN_EMAIL='admin@jastip.local' ADMIN_PASSWORD='GantiDenganPasswordKuat123!' npm run bootstrap:admin
```

## 12. Troubleshooting Cepat

### A. 502 Bad Gateway

Penyebab umum: nginx belum refresh upstream setelah container recreate.

Solusi:

```bash
docker compose restart nginx
docker compose ps
```

### B. Expo Go tidak bisa konek API

1. Pastikan backend sehat
2. Pastikan port 8080 Public (Codespaces)
3. Tutup paksa Expo Go, buka ulang, scan QR terbaru
4. Jalankan ulang npm run start:codespaces

### C. Gagal startup karena secret

Pastikan JWT_SECRET dan SERVICE_TOKEN minimal 32 karakter.

## 13. Checklist Sukses Akhir

Project dianggap berhasil dijalankan jika semua ini terpenuhi:

1. docker compose ps menunjukkan service healthy
2. curl health endpoint sukses
3. smoke test ok true
4. web bisa login
5. Expo Go bisa login
6. alur transaksi sampai status diterima berjalan
7. escrow berubah menjadi dilepas

## 14. Rujukan Dokumen Tim

1. docs/TESTING.md
2. docs/LAPORAN-UJI.md
3. docs/PANDUAN-RILIS-TEMAN.md
4. docs/CHECKLIST-CAPSTONE-FINAL.md
5. docs/TEMPLATE-BUKTI-PR-REVIEW.md
