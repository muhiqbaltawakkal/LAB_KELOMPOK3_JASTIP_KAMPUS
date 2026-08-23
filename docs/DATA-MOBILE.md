# DATA-MOBILE.md — Strategi Data Mobile

Dokumen ini menjelaskan strategi penyimpanan data lokal dan sinkronisasi untuk aplikasi mobile Jastip Kampus.

## 1. Tujuan

1. Aplikasi tetap berguna saat koneksi tidak stabil.
2. Data penting tidak hilang ketika offline.
3. Perubahan tertunda dapat dikirim ulang otomatis ketika online.

## 2. Penyimpanan Lokal

Media penyimpanan:

1. `AsyncStorage`

Kunci utama:

1. `jastip:auth:v1` untuk token dan profil login.
2. `jastip:cache:v1` untuk cache data layar.
3. `jastip:outbox:v1` untuk antrean aksi tulis saat offline.

Implementasi ada di:

1. `mobile/lib/offline.js`

## 3. Pola Offline-First

Pola yang dipakai:

1. Baca: gunakan cache terakhir ketika jaringan tidak tersedia.
2. Tulis: simpan aksi ke outbox bila offline.
3. Re-sync: kirim ulang outbox otomatis saat koneksi kembali online.

## 4. Mekanisme Sinkronisasi Outbox

Alur:

1. Aksi tulis ditambahkan ke antrean outbox.
2. Ketika online, aplikasi memanggil proses flush outbox.
3. Aksi yang sukses dihapus dari antrean.
4. Aksi yang gagal non-HTTP ditahan untuk percobaan berikutnya.

Catatan konsistensi:

1. Endpoint tulis kritis menggunakan `Idempotency-Key` agar retry aman.
2. Retry tidak boleh memproduksi duplikasi data bisnis.

## 5. Batasan dan Risiko

1. Cache bisa basi jika user lama offline.
2. Outbox memerlukan endpoint server yang idempoten.
3. Konflik data harus ditangani oleh validasi status di backend.

## 6. Verifikasi Manual

1. Login saat online, lalu aktifkan mode pesawat.
2. Pastikan riwayat masih tampil dari cache.
3. Buat aksi tulis saat offline, pastikan masuk outbox.
4. Kembalikan koneksi, pastikan outbox berkurang dan data tersinkron.
