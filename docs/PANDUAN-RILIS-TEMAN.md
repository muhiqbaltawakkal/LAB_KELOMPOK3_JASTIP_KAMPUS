# Panduan Rilis melalui Laptop Teman

File bundle membawa commit source, bukan database, upload, akun admin, atau secret lokal.

## 1. Clone dan impor bundle

Instal Git dan Node.js LTS 22, lalu jalankan PowerShell:

```powershell
git clone https://github.com/muhiqbaltawakkal/LAB_KELOMPOK3_JASTIP_KAMPUS.git
cd LAB_KELOMPOK3_JASTIP_KAMPUS
git status
git fetch "..\jastip-admin-release.bundle" "release/admin-dashboard:release/admin-dashboard"
git switch release/admin-dashboard
git log --oneline --decorate -5
```

## 2. Instal dan uji

```powershell
npm install
npm --prefix services/catalog-service install
npm --prefix services/order-service install
npm --prefix services/payment-service install
npm --prefix services/tracking-service install
npm --prefix mobile install
npm test
npm run test:web
```

Semua test harus lulus sebelum push.

## 3. Jalankan lokal

`start-local.ps1` membuat secret acak yang sama untuk seluruh service selama proses lokal tersebut berjalan:

```powershell
.\scripts\start-local.ps1
node scripts/smoke-test.mjs
```

Buat admin pada database lokal teman:

```powershell
$env:ADMIN_NAME="Administrator"
$env:ADMIN_EMAIL="admin@jastip.local"
$env:ADMIN_PASSWORD="GANTI_PASSWORD_MINIMAL_12_KARAKTER"
npm run bootstrap:admin
```

Jalankan aplikasi:

```powershell
cd mobile
npx expo start --tunnel
```

Login sebagai admin dan periksa menu Ringkasan, Pengguna, Toko, Produk, Sesi, Transaksi, Tracking, serta Audit.

## 4. Push dan Pull Request

Pastikan tidak ada `.env`, database, upload, atau password dalam status Git:

```powershell
git status --short
git grep -n "ADMIN_PASSWORD=" -- ':!*.example' ':!docs/PANDUAN-RILIS-TEMAN.md'
git push -u origin release/admin-dashboard
```

Buka Pull Request dari `release/admin-dashboard` menuju `main`. Merge hanya setelah GitHub Actions lulus dan perubahan selesai direview.

## Docker

Salin `.env.example` menjadi `.env`, ganti kedua secret dengan nilai acak berbeda minimal 32 karakter, lalu jalankan `docker compose up --build`. Jangan commit `.env`.

## 5. Gate Rilis Per Peran (Wajib)

Sebelum PR dibuka, semua peran wajib menandai bagian masing-masing:

### ⚙️ Backend/API Engineer

- [ ] Endpoint kritis tervalidasi: `POST /v1/titipan`, `POST /v1/payments`, `POST /v1/tracking/{id}/confirm-received`.
- [ ] Smoke test E2E lulus: `node scripts/smoke-test.mjs`.
- [ ] Tidak ada perubahan endpoint yang menyimpang dari `openapi.yaml`.

### 🚢 Infrastructure & DevOps

- [ ] `docker compose up -d --build` berhasil.
- [ ] Semua container `healthy` pada `docker compose ps`.
- [ ] Gateway merespons sehat pada `GET /health`.
- [ ] Jika sempat 502 setelah reset, lakukan `docker compose restart nginx` lalu verifikasi ulang.

### 🗄️ Data & Persistence Engineer

- [ ] Migrasi sinkron dengan runtime (termasuk status tracking).
- [ ] Seed valid, tidak ada JSON rusak/duplikat.
- [ ] Konsistensi stok/kapasitas tervalidasi oleh skenario uji.

### 📊 QA, Load-Test & Dokumentasi

- [ ] Unit test per service lulus:
	- `docker compose exec -T catalog-service npm test`
	- `docker compose exec -T order-service-1 npm test`
	- `docker compose exec -T payment-service npm test`
	- `docker compose exec -T tracking-service npm test`
- [ ] Lint OpenAPI lulus: `npx @redocly/cli lint openapi.yaml`.
- [ ] Laporan uji, testing guide, dan template bukti PR terbarui.

## 6. Lampiran Bukti yang Harus Dibawa Saat Submit

1. Output terminal health, smoke test, unit test, dan lint OpenAPI.
2. Screenshot login web dan Expo Go.
3. Tautan PR + hasil review.
4. Dokumen final yang sudah diisi:
	 - `docs/LAPORAN-UJI.md`
	 - `docs/TESTING.md`
	 - `docs/TEMPLATE-BUKTI-PR-REVIEW.md`

## 7. Kriteria Siap Merge

1. Tidak ada error blocking.
2. Semua gate per peran tercentang.
3. Bukti review sudah ada minimal satu approval reviewer.
