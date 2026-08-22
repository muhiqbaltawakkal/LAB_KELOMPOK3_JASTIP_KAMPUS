# Jastip Kampus Mobile

Aplikasi React Native (Expo) untuk Jastip Kampus.

## Prasyarat

- Node.js >= 18
- Expo Go di HP (Play Store / App Store)
- Backend sudah berjalan (`docker compose up -d` di root repo)

## Cara Menjalankan

```bash
cd mobile
npm install
npx expo start
```

Pindai QR code dengan aplikasi Expo Go di HP.

## Konfigurasi URL API

Secara default aplikasi akan otomatis mencoba URL API dari:

- `EXPO_PUBLIC_API_URL` (jika di-set)
- `extra.apiUrl` dari Expo config
- host web/Codespaces
- host Metro Expo (IP laptop saat dibuka dari Expo Go)

Jika ingin set manual, jalankan:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080 npx expo start
```

Untuk GitHub Codespaces gunakan launcher berikut (otomatis set URL API):

```bash
npm run start:codespaces
```

Contoh URL API valid:

```js
http://192.168.x.x:8080
```

Jangan pakai `localhost` — dari HP, localhost berarti HP itu sendiri.

Cari IP laptop:
- Windows: `ipconfig` → IPv4 Address
- macOS: `ipconfig getifaddr en0`
- Linux: `hostname -I`

Kalau HP dan laptop beda jaringan:
```bash
npx expo start --tunnel
```

## Struktur

```
mobile/
├── App.js                  # Layar utama: daftar barang jastip
├── lib/api.js              # Resolver URL API + semua endpoint
├── babel.config.js
├── api/
│   ├── client.js           # HTTP client dengan retry 429 otomatis
│   └── endpoints.js        # Semua fungsi panggilan API
└── screens/
    ├── TransaksiScreen.js  # Buat titipan (handling 401/409/429/503/jaringan)
    └── SuksesScreen.js     # Konfirmasi berhasil
```

## Alur Aplikasi

```
Daftar Barang → pilih barang → Transaksi (pesan) → Sukses
```

## Penanganan Galat

| Kode | Pesan |
|------|-------|
| 401 | Sesi habis, restart aplikasi |
| 409 | Stok habis, pilih barang lain |
| 429 | Server sibuk, retry otomatis (1s, 2s, 4s) |
| 503 | Layanan tidak tersedia, coba lagi |
| Network | Jaringan bermasalah, periksa koneksi |
