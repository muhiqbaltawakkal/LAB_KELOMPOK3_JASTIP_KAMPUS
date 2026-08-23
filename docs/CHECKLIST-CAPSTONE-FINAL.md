# CHECKLIST CAPSTONE FINAL

Tujuan dokumen ini adalah memastikan demo, pengujian, dan bukti ketercapaian modul berjalan konsisten lintas peran.

## A. Persiapan Umum

- [ ] Semua anggota sudah pull branch terbaru (`main`) dan tidak ada conflict lokal.
- [ ] Docker Desktop/Engine aktif.
- [ ] Port publik Codespaces untuk API (`8080`) sudah `public`.
- [ ] Dependensi root terpasang: `npm install` di root.
- [ ] Dependensi mobile terpasang: `cd mobile && npm install`.

## B. Startup Layanan Backend

- [ ] Jalankan stack:

```bash
docker compose up -d --build
docker compose ps
```

- [ ] Seed data demo:

```bash
npm run demo:reset-and-seed -- --confirm-reset
```

- [ ] Verifikasi health gateway:

```bash
curl -sS https://<codespace-host>-8080.app.github.dev/health
```

Kriteria lulus:
- [ ] Respons HTTP 200.
- [ ] Payload berisi indikator sehat (contoh `status: "ok"`).

## C. Verifikasi Alur Fungsional Inti

- [ ] Login akun demo sukses.
- [ ] Katalog dapat diambil.
- [ ] Buat order berhasil.
- [ ] Proses pembayaran (simulasi escrow) berhasil.
- [ ] Tracking status order berubah sesuai alur.

Bukti yang wajib disimpan:
- [ ] Screenshot respons sukses tiap endpoint kunci.
- [ ] Potongan log terminal backend saat transaksi berjalan.

## D. Kriteria NFR Modul

### D1. Integritas Stok dan Oversell

- [ ] Jalankan skenario konkurensi/load sesuai dokumen uji.
- [ ] Pastikan **0 oversell**.

Acceptance:
- [ ] Tidak ada stok minus.
- [ ] Tidak ada order sukses melebihi stok tersedia.

### D2. Performa Gateway

- [ ] Jalankan baseline/load test sesuai [docs/TESTING.md](docs/TESTING.md).
- [ ] Catat metrik p95 dan error rate.

Target minimum:
- [ ] p95 <= 500 ms untuk endpoint utama saat baseline.
- [ ] 5xx rate < 1% pada skenario uji yang disepakati.

## E. OpenAPI dan Kualitas Kontrak

- [ ] Lint OpenAPI bersih:

```bash
npx @redocly/cli lint openapi.yaml
```

Acceptance:
- [ ] `valid`.
- [ ] Tidak ada `error`.
- [ ] Tidak ada `warning` penting tersisa pada branch rilis.

## F. Mobile (Web + Expo Go)

- [ ] URL API mobile mengarah ke host Codespaces aktif.
- [ ] Aplikasi web mobile (`npm run web`) bisa login dan akses katalog.
- [ ] Expo Go di HP bisa login dan akses endpoint API.
- [ ] Uji fallback/offline sederhana (jika jaringan terputus, UI tetap terkontrol).

Bukti:
- [ ] Screenshot web berhasil login.
- [ ] Screenshot Expo Go berhasil login.
- [ ] Screenshot data katalog muncul.

## G. Sinkronisasi Peran

Gunakan pembagian di [PERAN.md](PERAN.md).

- [ ] Peran API/Backend: verifikasi endpoint, error handling, lint OpenAPI.
- [ ] Peran Data/DB: verifikasi migrasi, seed, konsistensi data.
- [ ] Peran Mobile/Frontend: verifikasi konektivitas web + Expo Go.
- [ ] Peran QA/DevOps: verifikasi test, baseline, dan bukti artefak.

## H. Checklist Bukti Penilaian

- [ ] `LAPORAN.md` terbarui.
- [ ] `docs/BASELINE.md` terbarui dengan hasil terbaru.
- [ ] `AI-LOG.MD` memenuhi minimum kontribusi tiap anggota.
- [ ] PR final memiliki review yang terdokumentasi.
- [ ] Semua tautan bukti (screenshot/log/commit) valid.

## I. Sign-off Final

- [ ] Lead tim menyetujui hasil teknis.
- [ ] Semua anggota menyetujui artefak final.
- [ ] Repo siap submit.

Kolom sign-off:

- Nama Ketua: ____________________
- Tanggal: ____________________
- Catatan rilis terakhir: ____________________

## J. Hasil Eksekusi Aktual (2026-08-23)

Ringkasan ini diisi dari eksekusi ulang terbaru pada lingkungan Codespaces.

### J1. Backend dan Data

- [x] `docker compose up -d --build` sukses.
- [x] Semua service utama berstatus sehat setelah startup.
- [x] Gateway merespons `GET /health` dengan payload sehat (`{"status":"ok"...}`).
- [x] Smoke test end-to-end lulus (`node scripts/smoke-test.mjs`) dengan hasil `ok: true`.

### J2. Kualitas Kontrak dan Test

- [x] Lint OpenAPI lulus tanpa warning (`npx @redocly/cli lint openapi.yaml`).
- [x] Test service lulus saat dijalankan di container:
	- `docker compose exec -T catalog-service npm test`
	- `docker compose exec -T order-service-1 npm test`
	- `docker compose exec -T payment-service npm test`
	- `docker compose exec -T tracking-service npm test`

### J3. Catatan Eksekusi

- Validasi API via gateway sempat menghasilkan 502 setelah reset volume/container karena upstream nginx stale.
- Tindakan korektif: `docker compose restart nginx`.
- Setelah restart gateway, health check dan smoke test kembali normal.

### J4. Item Manual yang Tersisa

- [ ] Lampiran screenshot web login dan Expo Go login diisi oleh tim saat sesi demo perangkat.
- [ ] Tanda tangan final ketua dan semua anggota.
