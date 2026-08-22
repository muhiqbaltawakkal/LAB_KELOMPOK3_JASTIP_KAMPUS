# Audit Dataset dan Seed Demo

Sumber resmi seed adalah `dataset/JastipKampus_Dataset.xlsx`. Hasil normalisasi yang dipakai runtime berada di `dataset/demo-seed.js`; folder `dataset/JastipKampus_Gambar_Produk` menyediakan foto, sedangkan `sources.txt` mencatat asal/karakter representatif gambar.

## Hasil audit

- Workbook: 9 akun, 20 toko, 34 produk, 5 sesi, 7 titipan, 6 pembayaran, dan 15 event tracking.
- Folder gambar: 34 gambar produk. Semua dipertahankan, termasuk gambar representatif dan file yang isi binernya sama.
- `catalog-seed.json`: berisi 49 produk, sehingga ada 15 produk lebih banyak daripada workbook dan tidak mempunyai pasangan foto resmi.
- `order-seed.json`, `payment-seed.json`, dan `tracking-seed.json`: masing-masing memuat beberapa dokumen JSON yang bertumpuk dan bukan satu dokumen JSON valid. File tersebut dipertahankan sebagai arsip, bukan sumber runtime.
- Ketika nilai bertentangan, workbook selalu menang.

## Normalisasi bisnis

- Akun reguler tetap mempunyai mode Penitip dan Penjastip; kolom peran workbook hanya menjadi label akun demo.
- Hanya biaya jasa per unit yang ditawar. Total dihitung `(harga produk + biaya jasa disepakati) × qty`.
- Status tracking dinormalisasi menjadi `dititip → dibelanjakan → diantar → diterima`.
- Pembayaran transaksi yang telah selesai menjadi `dilepas`; transaksi berjalan menjadi `tertahan`.
- Deadline sesi aktif dibuat relatif pada waktu seed agar tetap dapat diuji.

Seed ini hanya untuk demo. Password bersama tidak boleh digunakan di produksi.
