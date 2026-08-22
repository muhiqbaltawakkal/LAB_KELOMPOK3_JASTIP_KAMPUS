# PostgreSQL overhaul

Runtime baru memakai satu cluster PostgreSQL dengan empat database dan kredensial terpisah: `catalog_db`, `order_db`, `payment_db`, dan `tracking_db`. Tidak ada fallback SQLite. Tiga container Order Service memakai `order_db` yang sama melalui upstream `least_conn` Nginx.

## Menjalankan

Salin `.env.example` menjadi `.env`, ganti semua secret/password, lalu:

```powershell
.\scripts\reset-databases.ps1
.\scripts\start-local.ps1
docker compose ps
node scripts/smoke-test.mjs
```

Admin dibuat dari container agar memakai database Order yang benar:

```powershell
docker compose exec -e ADMIN_NAME="Administrator" -e ADMIN_EMAIL="admin@jastip.local" -e ADMIN_PASSWORD="<minimal-12-karakter>" order-service-1 npm run bootstrap:admin
```

## Model konsistensi

- Kapasitas dicadangkan dengan satu conditional `UPDATE` PostgreSQL berdasarkan `qty`.
- Reservasi berakhir paling lambat 30 menit atau pada deadline sesi.
- Pembatalan/expiry memakai `capacity_released_at` sehingga kapasitas kembali tepat sekali.
- Event lintas service memakai transactional outbox dan UUID; consumer menyimpan event yang sudah diproses.
- Pembayaran adalah escrow simulasi. Event `titipan.diterima` melepaskan dana dan menutup titipan.
- Tracking hanya menerima urutan `dititip → dibelanjakan → diantar → diterima`.

## Load test

Siapkan sesi berkapasitas 200 dan token akun reguler, lalu:

```powershell
k6 run -e TOKEN=<jwt> -e SESSION_ID=<id> -e PRODUCT_ID=<id> loadtest/kapasitas.js
```

Skrip mengirim tepat 2.000 titipan, memisahkan respons bisnis 409/429 dari 5xx, dan menerapkan ambang p95 < 500 ms serta 5xx < 1%. Angka hasil hanya boleh dicatat sebagai hasil aktual setelah dijalankan pada lingkungan Docker; repository tidak mengarang hasil.

## Mobile/web

Entrypoint hanya Expo Router. Registrasi reguler tidak memilih role; setelah login pengguna memilih mode Penitip atau Penjastip. Admin langsung masuk dashboard. `expo-notifications` tidak dipakai sehingga web dan Expo Go dapat dibundle. URL API untuk ponsel harus berupa alamat gateway yang dapat dijangkau perangkat melalui `EXPO_PUBLIC_API_URL`.
