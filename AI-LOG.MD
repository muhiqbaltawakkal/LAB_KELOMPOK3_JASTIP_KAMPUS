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

## 📊 Ringkasan per Anggota

| Anggota | Peran | Total Log | ✅ Penuh | ⚠️ Sebagian | ❌ Tidak |
|:---:|---|:---:|:---:|:---:|:---:|
| MT | 🏗️ Arsitek Sistem | 3 | 3 | 0 | 0 |
| RA | 🗄️ Data & Persistence Engineer | 2 | 2 | 0 | 0 |
| SA | 🚢 Infrastructure & DevOps | 0 | — | — | — |
| N | ⚙️ Backend / API Engineer | 0 | — | — | — |
| DN | 📊 QA, Load-Test & Dokumentasi | 1 | 1 | 0 | 0 |

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

---

## 📈 Statistik Keseluruhan

| Metrik | Nilai |
|---|---|
| Total log | 6 |
| Output dipakai penuh | 6 |
| Output dipakai sebagian | 0 |
| Output tidak dipakai | 0 |
| Tingkat penerimaan | 100% |
| Anggota aktif menggunakan AI | 3 dari 5 |

---

## 🔍 Refleksi Tim

### ✅ Yang Berjalan Baik
- AI (OpenCode + Gemini) sangat membantu MT dalam merancang arsitektur sistem sejak awal.
- Boilerplate Express.js dari Copilot menghemat waktu setup catalog-service secara signifikan.
- Dataset dari AI (ChatGPT + Copilot) menjadi fondasi yang solid untuk skema database.
- OpenAPI schema yang dihasilkan langsung valid dan siap dipakai sebagai kontrak API tim.

### ⚠️ Yang Perlu Diperhatikan
- SA dan N belum tercatat menggunakan AI — wajib mencatat pada sesi berikutnya.
- Logika concurrency dan kapasitas pada order-service harus divalidasi manual.
- Diagram dan flowchart tetap dibuat secara manual — output visual dari AI belum cukup akurat.

---

> 📝 *Log ini wajib diperbarui oleh masing-masing anggota setiap kali menggunakan AI dalam sesi pengembangan.*
