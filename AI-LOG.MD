# 🤖 AI-LOG — Jastip Kampus

> Catatan riwayat penggunaan AI oleh seluruh anggota tim selama pengembangan sistem Jastip Kampus.

---

## 📋 Informasi Proyek

| Field | Detail |
|---|---|
| **Proyek** | Jastip Kampus |
| **Arsitektur** | Microservices |
| **Periode** | 17 – 20 Agustus 2026 |
| **Tools AI** | GitHub Copilot, ChatGPT, Gemini, OpenCode |

---

## 👥 Anggota Tim

| Inisial | Nama | Peran |
|:---:|---|---|
| **RA** | Rizki Amalia Rasyid Ridha | 🗄️ Data & Persistence Engineer |
| **SA** | Syarifa Azizah. M | 🚢 Infrastructure & DevOps |
| **MT** | Muh. Iqbal Tawakkal | 🏗️ Arsitek Sistem |
| **N** | Nurdian | ⚙️ Backend / API Engineer |
| **DN** | Devi Nirwana | 📊 QA, Load-Test & Dokumentasi |

---

## 📌 Panduan Pengisian Log

> **Siapa yang mengisi?** Setiap anggota wajib mencatat sendiri setiap kali menggunakan AI untuk tugasnya.

| Field | Keterangan |
|---|---|
| **ID** | Nomor urut log (LOG-001, LOG-002, dst.) |
| **Tanggal** | Tanggal penggunaan AI |
| **Anggota** | Inisial + nama + peran |
| **Sesi** | Pertemuan ke berapa / tahap apa |
| **Tools AI** | GitHub Copilot / ChatGPT / Gemini / dll. |
| **Prompt** | Instruksi atau pertanyaan yang diberikan ke AI |
| **Output** | Ringkasan hasil yang diberikan AI |
| **Digunakan** | Ya / Sebagian / Tidak |
| **Catatan** | Refleksi, modifikasi, atau alasan tidak dipakai |

---

## 📁 Daftar Log

---

### LOG-001

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-17 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 1 — Desain Arsitektur Sistem |
| **Tools AI** | OpenCode, Gemini |

**Prompt:**

```
Buatkan diagram alur arsitektur microservices untuk sistem
Jastip Kampus dengan layanan: order-service, catalog-service,
payment-service, dan tracking-service. Tunjukkan hubungan
antar layanan dan alur data utamanya.
```

**Output AI (Ringkasan):**

- Diagram alur sistem dari sisi penjastip dan penitip
- Relasi antar layanan: catalog → order → payment → tracking
- Identifikasi sumber daya rebutan: kapasitas titipan pada order-service
- Rekomendasi bounded context per layanan

**Digunakan:** ✅ Ya

**Catatan:**
> Diagram arsitektur digunakan sebagai acuan desain sistem. Divisualisasikan secara manual menjadi docs/Flowchart.jpeg dan docs/ARSITEKTUR.md. Hasil AI membantu mempercepat identifikasi relasi antar layanan.

---

### LOG-002

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-19 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 1 — Setup Repository & catalog-service |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan struktur folder microservices untuk sistem Jastip Kampus
dengan layanan: order-service, catalog-service, payment-service,
tracking-service. Lalu buatkan Express.js untuk catalog-service
dengan endpoint GET /health, GET /items, GET /items/:id.
Data masih in-memory. Port 3001.
```

**Output AI (Ringkasan):**

- Struktur folder lengkap dengan services/, docs/, openapi.yaml
- Kode catalog-service/index.js dengan Express di port 3001
- Data in-memory: Item A dan Item B
- Handler untuk /health, /items, /items/:id
- Kerangka openapi.yaml versi 3.0.3

**Digunakan:** ✅ Ya

**Catatan:**
> Struktur folder dan kode catalog-service dipakai langsung. Ditambahkan field sisa pada data item. Kerangka openapi.yaml dilengkapi manual. Perubahan di-commit ke branch setup-awal.

---

### LOG-003

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-19 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Pertemuan 1 — Persiapan Dataset |
| **Tools AI** | ChatGPT, GitHub Copilot |

**Prompt:**

```
Buatkan contoh dataset untuk sistem Jastip Kampus dalam format
Excel (.xlsx). Dataset mencakup: data penjastip, data toko,
data barang beserta harga acuan, dan data titipan contoh.
```

**Output AI (Ringkasan):**

- Struktur tabel untuk entitas: Penjastip, Toko, Barang, Titipan
- Contoh data dummy yang realistis sesuai konteks jastip mahasiswa
- Format kolom yang siap dijadikan skema database

**Digunakan:** ✅ Ya

**Catatan:**
> Dataset Excel digunakan sebagai acuan awal untuk merancang skema database. Beberapa kolom disesuaikan, terutama penambahan kolom kapasitas dan status_sesi pada entitas penjastip.

---

### LOG-004

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-20 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 2 — Dokumentasi Arsitektur |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan dokumen ARSITEKTUR.md yang menjelaskan desain arsitektur
microservices Jastip Kampus. Sertakan gambaran umum sistem,
deskripsi tiap layanan, prinsip microservices, dan relasi antar layanan.
```

**Output AI (Ringkasan):**

- Dokumen docs/ARSITEKTUR.md dengan struktur lengkap
- Gambaran umum arsitektur dan deskripsi tiap service
- Prinsip data ownership dan komunikasi antar-service
- Tabel relasi layanan

**Digunakan:** ✅ Ya

**Catatan:**
> Dokumen dipakai sebagai referensi teknis tim. Disesuaikan dengan Flowchart yang sudah dibuat agar konsisten. Disimpan di docs/ARSITEKTUR.md dan dimasukkan ke repository.

---

### LOG-005

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-20 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Pertemuan 2 — Dataset SQL & Migrasi Database |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan script SQL untuk membuat skema database sistem Jastip Kampus.
Tabel: penjastip, toko, barang, sesi_jastip, titipan, pembayaran,
dan tracking. Sertakan relasi antar tabel dan contoh data awal (seed).
```

**Output AI (Ringkasan):**

- Script CREATE TABLE untuk setiap entitas beserta tipe data dan constraint
- Relasi foreign key antar tabel
- File migration awal dan script seed data contoh
- Index pada kolom yang sering diquery

**Digunakan:** ✅ Ya

**Catatan:**
> Script SQL dijadikan dasar migration database. Beberapa tipe data disesuaikan (DECIMAL untuk harga, ENUM untuk status). Script seed dipakai untuk pengujian awal sebelum integrasi dengan service.

---

### LOG-006

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-20 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Pertemuan 2 — README & AI-LOG |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Rapikan README.md untuk proyek Jastip Kampus agar lebih terstruktur
dan profesional. Gunakan gambar docs/Flowchart.jpeg untuk alur sistem.
Buatkan juga template AI-LOG.md untuk mencatat penggunaan AI
seluruh anggota tim 5 orang dengan peran berbeda.
```

**Output AI (Ringkasan):**

- README.md: badge teknologi, daftar isi 15 section, tabel endpoint dan aturan
- AI-LOG.md: tabel anggota tim, format log standar, ringkasan dan statistik

**Digunakan:** ✅ Ya

**Catatan:**
> README dipakai langsung setelah penyesuaian alur sistem (tetap pakai gambar Flowchart.jpeg). AI-LOG diisi mundur berdasarkan aktivitas nyata tanggal 17, 19, dan 20 Agustus.

---

### LOG-007

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Penyelarasan alur 2 role |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Ringkas alur bisnis Jastip Kampus menjadi 2 role saja: Penitip dan Penjastip,
lalu petakan ke endpoint gateway yang sudah ada.
```

**Output AI (Ringkasan):**

- Urutan alur: register/login -> buka sesi -> titipan -> bayar -> tracking -> selesai.
- Daftar endpoint utama per langkah.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai untuk sinkronisasi dokumen endpoint dan arsitektur agar konsisten dengan kebutuhan modul.

---

### LOG-008

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Finalisasi kontrak OpenAPI |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Review kontrak openapi.yaml dan sarankan perbaikan versi final artefak.
```

**Output AI (Ringkasan):**

- Rekomendasi upgrade versi kontrak dan penambahan catatan pembekuan.
- Saran menambahkan parameter paginasi dan dokumentasi respons 429.

**Digunakan:** ⚠️ Sebagian

**Catatan:**
> Dipakai hanya bagian versi/paginasi/rate-limit. Saran menambah seluruh operationId ditunda agar tidak mengubah kontrak terlalu besar menjelang serah.

---

### LOG-009

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Audit dataset katalog |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Bandingkan manifest produk dengan folder gambar, tandai file yang hilang,
placeholder, atau field inti yang kosong.
```

**Output AI (Ringkasan):**

- Daftar mismatch nama file foto.
- Temuan field produk yang belum konsisten.

**Digunakan:** ✅ Ya

**Catatan:**
> Hasil audit dipakai untuk sinkronisasi ulang data katalog dan validasi foto.

---

### LOG-010

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Sinkronisasi demo seed |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Sesuaikan productsRaw pada demo-seed.js agar konsisten dengan data final katalog,
namun tetap menjaga relasi sesi, order, payment, dan tracking.
```

**Output AI (Ringkasan):**

- Patch productsRaw dengan nama, kategori, harga, satuan, stok, dan foto.
- Saran alias file .jpg untuk kompatibilitas.

**Digunakan:** ✅ Ya

**Catatan:**
> Digunakan penuh, lalu diverifikasi kembali dengan manifest test dan smoke test.

---

### LOG-011

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Perbaikan seed order |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Ubah seed agar reset demo tidak menghapus akun manual, dan tetap aman untuk relasi data demo.
```

**Output AI (Ringkasan):**

- Ganti truncate users menjadi upsert by email.
- Tambah mapping id akun manifest ke id aktual DB.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai dan diuji lewat reset-and-seed + smoke test.

---

### LOG-012

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Startup stack docker |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Berikan urutan command aman untuk menyalakan semua service docker compose,
cek health, dan troubleshooting cepat jika ada container unhealthy.
```

**Output AI (Ringkasan):**

- Runbook compose up/down/ps/logs.
- Daftar endpoint health check per service.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai saat menyalakan stack dan verifikasi kesehatan layanan.

---

### LOG-013

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Konfigurasi Codespaces API URL |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Susun strategi fallback URL API untuk Expo web dan Expo Go di Codespaces
agar tidak terkunci ke localhost.
```

**Output AI (Ringkasan):**

- Prioritas EXPO_PUBLIC_API_URL.
- Fallback ke host Codespaces dan host Metro.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai pada konfigurasi mobile agar login bisa berjalan di web dan HP.

---

### LOG-014

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Serah artefak URL |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Diagnosa kenapa URL serah artefak openapi gagal dibuka.
```

**Output AI (Ringkasan):**

- Temuan placeholder owner/repo menyebabkan 404.
- URL final harus menunjuk owner/repo asli.

**Digunakan:** ✅ Ya

**Catatan:**
> Digunakan untuk koreksi link submit artefak.

---

### LOG-015

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Load baseline cepat |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Jalankan baseline performa endpoint baca dengan autocannon,
lalu catat p50/p99/throughput untuk dokumen baseline.
```

**Output AI (Ringkasan):**

- Hasil benchmark /v1/sessions dan /v1/items.
- Format tabel baseline siap tempel dokumen.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai untuk menyusun docs/BASELINE.md.

---

### LOG-016

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Eksperimen Nginx tuning |
| **Tools AI** | ChatGPT |

**Prompt:**

```text
Sarankan tuning agresif worker_processes dan keepalive untuk Nginx gateway lab.
```

**Output AI (Ringkasan):**

- Rekomendasi tuning cukup agresif untuk produksi.

**Digunakan:** ❌ Tidak

**Catatan:**
> Ditolak karena berisiko mengubah perilaku gateway menjelang deadline dan belum diuji regresi.

---

### LOG-017

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Bug SQL tawaran diterima |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Telusuri error 500 saat accept offer dan perbaiki query total agar aman tipe data PostgreSQL.
```

**Output AI (Ringkasan):**

- Identifikasi penyebab operator ambiguity unknown + unknown.
- Perbaikan cast eksplisit pada query update total.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai di order-service dan tervalidasi lewat smoke test.

---

### LOG-018

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Hardening smoke test |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Tambahkan retry untuk status transient (429/502/503) pada smoke test idempoten.
```

**Output AI (Ringkasan):**

- Retry bertahap untuk transient status.
- Penyesuaian agar test lebih stabil di bawah rate limit.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai penuh, hasil akhir smoke test lulus.

---

### LOG-019

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Bug parsing ids katalog |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Perbaiki parsing query ids pada /v1/items agar ids kosong tidak berubah menjadi [0].
```

**Output AI (Ringkasan):**

- Filter string kosong sebelum cast Number.
- Mencegah cache key salah saat ids kosong.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai dan memulihkan hasil katalog yang sebelumnya kosong.

---

### LOG-020

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Perbaikan alur tracking event |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Review transisi tracking dititip->dibelanjakan->diantar->diterima agar tidak lompat status.
```

**Output AI (Ringkasan):**

- Validasi urutan expected status.
- Catatan locking pada konfirmasi diterima.

**Digunakan:** ⚠️ Sebagian

**Catatan:**
> Hanya validasi urutan yang dipakai; saran refactor besar ditunda agar tidak menambah risiko.

---

### LOG-021

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Opsi migrasi ORM |
| **Tools AI** | ChatGPT |

**Prompt:**

```text
Usulkan migrasi cepat dari query SQL manual ke ORM untuk semua service.
```

**Output AI (Ringkasan):**

- Rencana migrasi menyeluruh ke ORM.

**Digunakan:** ❌ Tidak

**Catatan:**
> Ditolak karena scope terlalu besar, berisiko regresi, dan tidak realistis untuk fase final serah.

---

### LOG-022

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-21 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Uji E2E alur 2 role |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Susun skrip uji end-to-end 2 role untuk Jastip Kampus dari register hingga tracking selesai.
```

**Output AI (Ringkasan):**

- Skrip langkah uji register/login, buat sesi, titipan, bayar, tracking, konfirmasi.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai sebagai dasar dokumen docs/LAPORAN-UJI.md.

---

### LOG-023

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Penyusunan checklist siap serah |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Buat checklist submit ringkas berisi artefak wajib, bukti endpoint, dan link serah.
```

**Output AI (Ringkasan):**

- Dokumen checklist siap kumpul dengan referensi file.

**Digunakan:** ✅ Ya

**Catatan:**
> Dipakai sebagai panduan terakhir sebelum submit.

---

### LOG-024

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Revisi laporan gabungan |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```text
Susun laporan gabungan 3 lapisan yang menekankan bukti implementasi dan hasil uji.
```

**Output AI (Ringkasan):**

- Struktur laporan 6 bagian.
- Ringkasan kontribusi per peran.

**Digunakan:** ⚠️ Sebagian

**Catatan:**
> Format dipakai, tetapi angka benchmark tetap diisi dari hasil ukur nyata tim.

---

### LOG-025

| Field | Detail |
|---|---|
| **Tanggal** | 2026-08-22 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Saran screenshot dummy |
| **Tools AI** | Gemini |

**Prompt:**

```text
Berikan contoh screenshot laporan jika data uji belum lengkap.
```

**Output AI (Ringkasan):**

- Saran menggunakan contoh visual dummy agar cepat lengkap.

**Digunakan:** ❌ Tidak

**Catatan:**
> Ditolak karena bertentangan dengan kebijakan tim: bukti harus dari data uji nyata, bukan dummy.

---

## 📊 Ringkasan per Anggota

| Anggota | Peran | Total Log | ✅ Penuh | ⚠️ Sebagian | ❌ Tidak |
|:---:|---|:---:|:---:|:---:|:---:|
| MT | 🏗️ Arsitek Sistem | 5 | 4 | 1 | 0 |
| RA | 🗄️ Data & Persistence Engineer | 5 | 5 | 0 | 0 |
| SA | 🚢 Infrastructure & DevOps | 5 | 4 | 0 | 1 |
| N | ⚙️ Backend / API Engineer | 5 | 3 | 1 | 1 |
| DN | 📊 QA, Load-Test & Dokumentasi | 5 | 3 | 1 | 1 |

---

## 📅 Rekap per Tanggal

| Tanggal | Anggota | Kegiatan | Tools AI |
|---|:---:|---|---|
| 17 Agustus 2026 | MT | Desain diagram alur arsitektur sistem | OpenCode, Gemini |
| 19 Agustus 2026 | MT | Setup repo, catalog-service, DDD, openapi.yaml | GitHub Copilot |
| 19 Agustus 2026 | RA | Pembuatan dataset Excel | ChatGPT, GitHub Copilot |
| 20 Agustus 2026 | MT | Penulisan docs/ARSITEKTUR.md | GitHub Copilot |
| 20 Agustus 2026 | RA | Dataset SQL & migrasi database | GitHub Copilot |
| 20 Agustus 2026 | DN | Pembuatan README.md & AI-LOG.md | GitHub Copilot |
| 21 Agustus 2026 | MT/RA/SA/N | Penyelarasan alur, perbaikan backend, seed data, dan operasi stack | GitHub Copilot |
| 22 Agustus 2026 | Semua anggota | Finalisasi artefak, baseline, laporan, dan submit prep | GitHub Copilot, ChatGPT, Gemini |

---

## 📈 Statistik Keseluruhan

| Metrik | Nilai |
|---|---|
| Total log | 25 |
| Output dipakai penuh | 19 |
| Output dipakai sebagian | 3 |
| Output tidak dipakai | 3 |
| Tingkat penerimaan penuh | 76% |
| Anggota aktif menggunakan AI | 5 dari 5 |

---

## 🔍 Refleksi Tim

### ✅ Yang Berjalan Baik
- AI sangat membantu mempercepat diagnosis bug lintas service, terutama pada alur tawaran, kapasitas, dan seed data.
- Dokumentasi proyek (arsitektur, endpoint, laporan uji, checklist serah) menjadi lebih konsisten antar anggota.
- Integrasi mobile (retry 429, offline outbox, deteksi jaringan) terselesaikan lebih cepat dengan bantuan AI.

### ⚠️ Yang Perlu Diperhatikan
- Saran AI tetap wajib diverifikasi terhadap data uji nyata; beberapa rekomendasi sengaja ditolak karena berisiko atau terlalu luas.
- Perubahan besar mendekati deadline (mis. migrasi ORM total, tuning agresif gateway) ditunda untuk menjaga stabilitas.
- Validasi manual dan test otomatis tetap menjadi keputusan akhir sebelum merge.

---

> 📝 *Log ini wajib diperbarui oleh masing-masing anggota setiap kali menggunakan AI dalam sesi pengembangan.*
