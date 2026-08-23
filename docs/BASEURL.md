# BASEURL.md — Artefak Base URL

Dokumen ini adalah rujukan URL akses API untuk web dan mobile, termasuk batas pemakaian dasar.

## 1. Base URL Lokal

1. Gateway lokal: http://localhost:8080
2. Health check: http://localhost:8080/health

## 2. Base URL Codespaces

1. Format: https://NAMA-CODESPACE-8080.app.github.dev
2. Contoh aktif saat ini: https://animated-telegram-5ggvp755657q2v7v5-8080.app.github.dev

Catatan:

1. Port 8080 harus berstatus Public untuk akses dari Expo Go di HP.
2. Jangan gunakan localhost di perangkat HP.

## 3. Aturan Batas Laju

1. Batas default client: 60 request per menit per client.
2. Saat kena batas, server dapat mengembalikan 429 dengan header Retry-After.

## 4. Aturan Pagination

1. Default limit: 20 item per halaman.
2. Maksimum limit endpoint list utama: 50 item per halaman.
3. Gunakan parameter query page dan limit.

## 5. Verifikasi Cepat

1. curl -s http://localhost:8080/health
2. curl -s "http://localhost:8080/v1/sessions?page=1&limit=20"
