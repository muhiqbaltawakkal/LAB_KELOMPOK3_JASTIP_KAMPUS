# Testing Jastip Kampus

## Reset dan start lokal

Jalankan dari root repository:

```powershell
./scripts/reset-databases.ps1
./scripts/start-local.ps1
```

Reset menghapus akun, toko, produk, sesi, titipan, pembayaran, tracking, dan seluruh foto upload. Setelah start, `GET http://localhost:8080/v1/items` dan `/v1/sessions` harus berisi array kosong.

## Unit dan bundle test

```powershell
cd services/catalog-service; npm test; cd ../..
cd services/order-service; npm test; cd ../..
cd mobile; npx expo export --platform web --output-dir dist-test; cd ..
```

Ekspektasi: catalog 2/2 lulus, order 4/4 lulus, dan Expo menampilkan `Web Bundled`.

## Smoke test end-to-end

```powershell
node scripts/smoke-test.mjs
```

Script mendaftarkan penjastip/penitip, membuat toko, mengunggah foto produk, membuka sesi, membuktikan kapasitas dan idempotency, lalu membuat escrow pembayaran. Setelah pengujian, jalankan reset kembali bila membutuhkan kondisi kosong.

## Uji Expo Go

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
