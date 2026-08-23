# TEMPLATE BUKTI PR DAN REVIEW

Gunakan template ini untuk setiap PR utama agar bukti kontribusi, review, dan kualitas teknis terdokumentasi rapi.

## 1) Identitas PR

- Judul PR:
- URL PR:
- Branch sumber:
- Branch target:
- Tanggal dibuat:
- Status PR (Open/Merged/Closed):

## 2) Ringkasan Perubahan

- Masalah yang diselesaikan:
- Ruang lingkup perubahan:
- File utama yang diubah:
- Risiko perubahan (rendah/sedang/tinggi):

## 3) Pemetaan ke Modul/Capstone

- Kebutuhan modul yang dipenuhi:
- Endpoint/fitur yang terdampak:
- Dampak ke arsitektur (jika ada):
- Dampak ke data/migrasi (jika ada):

## 4) Bukti Teknis Wajib

### 4.1 Bukti Build dan Runtime

- Command yang dijalankan:
- Hasil command:
- Screenshot/log lampiran:

### 4.2 Bukti Test

- Unit test yang relevan:
- Integration/smoke test yang relevan:
- Hasil (pass/fail):
- Lampiran output:

### 4.3 Bukti API Contract

- Status lint OpenAPI:
- Ringkasan warning/error (jika ada):
- Lampiran output lint:

### 4.4 Bukti Performa/Load (Jika Relevan)

- Skenario uji:
- Metrik utama (p95, error rate):
- Kesimpulan terhadap target:
- Lampiran output:

## 5) Bukti Review

- Reviewer 1 (nama/akun):
- Reviewer 2 (nama/akun):
- Tanggal review:
- Keputusan review (Approve/Comment/Request changes):
- Tautan thread komentar penting:
- Ringkasan revisi berdasarkan komentar reviewer:

## 6) Jejak Commit

| No | Hash Commit | Penulis | Deskripsi Singkat | Tautan |
|----|-------------|---------|-------------------|--------|
| 1  |             |         |                   |        |
| 2  |             |         |                   |        |
| 3  |             |         |                   |        |

## 7) Pemetaan Kontribusi Peran

| Peran (PERAN.md) | Nama | Kontribusi di PR | Bukti |
|------------------|------|------------------|-------|
| API/Backend      |      |                  |       |
| Data/DB          |      |                  |       |
| Mobile/Frontend  |      |                  |       |
| QA/DevOps        |      |                  |       |

## 8) Dampak ke Dokumentasi

- Dokumen yang diperbarui:
- Ringkasan pembaruan dokumen:
- Tautan dokumen:

## 9) Checklist Final Sebelum Merge

- [ ] Semua test relevan pass.
- [ ] Tidak ada error blocking.
- [ ] OpenAPI lint valid.
- [ ] Bukti screenshot/log terlampir.
- [ ] Komentar reviewer kritikal sudah ditindaklanjuti.
- [ ] Sudah sinkron dengan checklist capstone final.

## 10) Persetujuan Akhir

- Lead tim:
- Tanggal:
- Catatan akhir:

## 11) Bukti QA, Load-Test, dan Dokumentasi (Wajib Modul)

Isi bagian ini saat PR final akan diajukan.

### 11.1 Ringkasan Pengujian

- Health gateway:
- Smoke test E2E:
- Unit test per service:
- OpenAPI lint:
- Load test baseline/re-run:

### 11.2 Dokumen yang Harus Terisi

- [ ] `docs/LAPORAN-UJI.md` terisi hasil run aktual.
- [ ] `docs/TESTING.md` sinkron dengan command terbaru.
- [ ] `docs/BASELINE.md` memuat angka yang dipakai dalam laporan.
- [ ] `README.md` memuat runbook startup yang dipakai tim.
- [ ] `AI-LOG.MD` memuat jejak penggunaan AI terbaru lintas peran.

### 11.3 Bukti Peran dan Sign-off

| Peran | Verifikasi | Nama | Tanggal | Status |
|---|---|---|---|---|
| ⚙️ Backend/API Engineer | Endpoint inti + E2E valid |  |  |  |
| 🚢 Infrastructure & DevOps | Compose/gateway/health stabil |  |  |  |
| 🗄️ Data & Persistence Engineer | Migrasi/seed/konsistensi data valid |  |  |  |
| 📊 QA, Load-Test & Dokumentasi | Test/load/laporan/bukti lengkap |  |  |  |

---

## Contoh Isian Aktual (Pra-PR, 2026-08-23)

Bagian ini adalah bukti teknis terbaru sebelum PR final dibuat.

## 1) Identitas PR

- Judul PR: Finalisasi kepatuhan modul dan sinkronisasi artefak
- URL PR: Belum dibuat (status saat ini pra-PR)
- Branch sumber: main
- Branch target: main
- Tanggal dibuat: -
- Status PR (Open/Merged/Closed): Draft internal (belum publish)

## 2) Ringkasan Perubahan

- Masalah yang diselesaikan:
	- Sinkronisasi status tracking migrasi agar konsisten dengan runtime.
	- Penyelarasan checklist capstone dengan command/endpoint aktual.
	- Pembersihan warning OpenAPI hingga valid tanpa warning.
- Ruang lingkup perubahan:
	- Dokumentasi capstone, template bukti, laporan, baseline, testing, dan kontrak API.
	- Perbaikan migrasi tracking di database.
- File utama yang diubah:
	- `database/migrations/004_tracking_schema.sql`
	- `docs/CHECKLIST-CAPSTONE-FINAL.md`
	- `docs/TEMPLATE-BUKTI-PR-REVIEW.md`
	- `openapi.yaml`
- Risiko perubahan (rendah/sedang/tinggi): rendah-sedang (dokumen tinggi, data migration terkontrol)

## 3) Pemetaan ke Modul/Capstone

- Kebutuhan modul yang dipenuhi:
	- 4 microservices berjalan via gateway.
	- Endpoint kritis dan alur E2E tervalidasi.
	- Kontrak OpenAPI tervalidasi.
- Endpoint/fitur yang terdampak:
	- `/health`, `/v1/titipan`, `/v1/payments`, `/v1/tracking/*`.
- Dampak ke arsitektur (jika ada): tidak mengubah arsitektur inti; hanya harmonisasi artefak.
- Dampak ke data/migrasi (jika ada): penyeragaman enum/status tracking pada migrasi.

## 4) Bukti Teknis Wajib

### 4.1 Bukti Build dan Runtime

- Command yang dijalankan:
	- `docker compose up -d --build`
	- `docker compose restart nginx`
	- `curl -sS http://localhost:8080/health`
	- `node scripts/smoke-test.mjs`
- Hasil command:
	- Seluruh service startup normal.
	- Health endpoint mengembalikan status sehat.
	- Smoke test menghasilkan `ok: true`, jalur langsung dan negosiasi sukses, escrow `dilepas`.
- Screenshot/log lampiran:
	- Lampirkan potongan terminal hasil command di atas.

### 4.2 Bukti Test

- Unit test yang relevan:
	- `docker compose exec -T catalog-service npm test`
	- `docker compose exec -T order-service-1 npm test`
	- `docker compose exec -T payment-service npm test`
	- `docker compose exec -T tracking-service npm test`
- Integration/smoke test yang relevan:
	- `node scripts/smoke-test.mjs`
- Hasil (pass/fail): pass
- Lampiran output:
	- Semua service test menunjukkan `pass 1 fail 0`.

### 4.3 Bukti API Contract

- Status lint OpenAPI: pass
- Ringkasan warning/error (jika ada): tidak ada
- Lampiran output lint:
	- `openapi.yaml: validated` dan `Woohoo! Your API description is valid.`

### 4.4 Bukti Performa/Load (Jika Relevan)

- Skenario uji:
	- Baseline dan re-run autocannon pada endpoint baca.
- Metrik utama (p95, error rate): rujuk `docs/BASELINE.md`.
- Kesimpulan terhadap target:
	- Endpoint katalog stabil, endpoint sesi diproteksi throttle saat beban tinggi.
- Lampiran output:
	- Lampirkan output autocannon yang dipakai untuk `docs/BASELINE.md`.

## 5) Bukti Review

- Reviewer 1 (nama/akun): -
- Reviewer 2 (nama/akun): -
- Tanggal review: -
- Keputusan review (Approve/Comment/Request changes): -
- Tautan thread komentar penting: -
- Ringkasan revisi berdasarkan komentar reviewer:
	- Akan diisi setelah PR dipublish dan direview.

## 6) Jejak Commit

| No | Hash Commit | Penulis | Deskripsi Singkat | Tautan |
|----|-------------|---------|-------------------|--------|
| 1  | (isi setelah commit) | Tim | Sinkronisasi status tracking migrasi | (isi) |
| 2  | (isi setelah commit) | Tim | Perapihan checklist capstone final | (isi) |
| 3  | (isi setelah commit) | Tim | Finalisasi kualitas OpenAPI dan laporan | (isi) |

## 7) Pemetaan Kontribusi Peran

| Peran (PERAN.md) | Nama | Kontribusi di PR | Bukti |
|------------------|------|------------------|-------|
| API/Backend      | Nurdian | Verifikasi alur endpoint inti, smoke test | Output `scripts/smoke-test.mjs` |
| Data/DB          | Rizki Amalia Rasyid Ridha | Harmonisasi status migrasi tracking | `database/migrations/004_tracking_schema.sql` |
| Mobile/Frontend  | Muh. Iqbal Tawakkal | Stabilitas integrasi API mobile & dokumentasi base URL | `mobile/lib/api.js`, `docs/BASEURL.md` |
| QA/DevOps        | Devi Nirwana / Syarifa Azizah. M | Build compose, healthcheck, test service, lint OpenAPI | `docker-compose.yml`, output test/lint |

## 8) Dampak ke Dokumentasi

- Dokumen yang diperbarui:
	- `docs/CHECKLIST-CAPSTONE-FINAL.md`
	- `docs/TEMPLATE-BUKTI-PR-REVIEW.md`
	- `docs/BASELINE.md`
	- `docs/TESTING.md`
	- `LAPORAN.md`
- Ringkasan pembaruan dokumen:
	- Penyelarasan command, acceptance criteria, dan bukti run aktual.
- Tautan dokumen:
	- isi sesuai link repo saat PR dibuka.

## 9) Checklist Final Sebelum Merge

- [x] Semua test relevan pass.
- [x] Tidak ada error blocking.
- [x] OpenAPI lint valid.
- [ ] Bukti screenshot/log terlampir.
- [ ] Komentar reviewer kritikal sudah ditindaklanjuti.
- [x] Sudah sinkron dengan checklist capstone final.

## 10) Persetujuan Akhir

- Lead tim: (isi)
- Tanggal: 2026-08-23
- Catatan akhir: Siap publish PR final setelah lampiran screenshot dan proses review selesai.
