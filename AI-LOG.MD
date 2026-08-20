# 🤖 AI-LOG — Jastip Kampus

> Catatan riwayat penggunaan AI oleh seluruh anggota tim selama pengembangan sistem Jastip Kampus.

---

## 📋 Informasi Proyek

| Field | Detail |
| --- | --- |
| **Proyek** | Jastip Kampus |
| **Arsitektur** | Microservices |
| **Periode** | 17 – 20 Agustus 2026 |
| **Tools AI** | GitHub Copilot, ChatGPT, Gemini, OpenCode |

---

## 👥 Anggota Tim

| Inisial | Nama | Peran |
| :---: | --- | --- |
| **RA** | Rizki Amalia Rasyid Ridha | 🗄️ Data & Persistence Engineer |
| **SA** | Syarifa Azizah. M | 🚢 Infrastructure & DevOps |
| **MT** | Muh. Iqbal Tawakkal | 🏗️ Arsitek Sistem |
| **N** | Nurdian | ⚙️ Backend / API Engineer |
| **DN** | Devi Nirwana | 📊 QA, Load-Test & Dokumentasi |

---

## 📌 Panduan Pengisian Log

> **Siapa yang mengisi?** Setiap anggota wajib mencatat sendiri setiap kali menggunakan AI untuk tugasnya.

| Field | Keterangan |
| --- | --- |
| **ID** | Nomor urut log (LOG-001, LOG-002, dst.) |
| **Tanggal** | Tanggal penggunaan AI |
| **Anggota** | Inisial + nama + peran |
| **Sesi** | Pertemuan ke berapa / tahap apa |
| **Tools AI** | GitHub Copilot / ChatGPT / Gemini / dll. |
| **Prompt** | Instruksi atau pertanyaan yang diberikan ke AI |
| **Output** | Ringkasan hasil yang diberikan AI |
| **Digunakan** | ✅ Ya / ⚠️ Sebagian / ❌ Tidak |
| **Catatan** | Refleksi, modifikasi, atau alasan tidak dipakai |

---

## 📁 Daftar Log

---

### LOG-001

| Field | Detail |
| --- | --- |
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
- Identifikasi sumber daya rebutan: kapasitas titipan pada `order-service`
- Rekomendasi bounded context per layanan

**Digunakan:** ✅ Ya

**Catatan:**
> Diagram arsitektur digunakan sebagai acuan desain sistem. Divisualisasikan secara manual menjadi `docs/Flowchart.jpeg` dan `docs/ARSITEKTUR.md`. Hasil AI membantu mempercepat proses identifikasi relasi antar layanan.

---

### LOG-002

| Field | Detail |
| --- | --- |
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

Struktur folder:
```
jastip-kampus/
├── services/
│   ├── catalog-service/
│   ├── order-service/
│   ├── payment-service/
│   └── tracking-service/
├── docs/
├── openapi.yaml
└── README.md
```

Kode `catalog-service/index.js`:
- Server Express di port `3001`
- Data in-memory: Item A (Rp 15.000) dan Item B (Rp 25.000)
- Handler untuk `/health`, `/items`, `/items/:id`
- Kerangka `openapi.yaml` versi 3.0.3

**Digunakan:** ✅ Ya

**Catatan:**
> Struktur folder dan kode catalog-service dipakai langsung. Ditambahkan field `sisa` pada data item untuk mendukung logika kapasitas. Kerangka `openapi.yaml` dilengkapi manual sesuai skema `Item` yang disepakati tim. Perubahan di-commit ke branch `setup-awal`.

---

### LOG-003

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-19 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Pertemuan 1 — Persiapan Dataset |
| **Tools AI** | ChatGPT, GitHub Copilot |

**Prompt:**

```
Buatkan contoh dataset untuk sistem Jastip Kampus dalam format
Excel (.xlsx). Dataset harus mencakup: data penjastip, data toko,
data barang beserta harga acuan, dan data titipan contoh.
```

**Output AI (Ringkasan):**

- Struktur tabel untuk setiap entitas: Penjastip, Toko, Barang, Titipan
- Contoh data dummy yang realistis sesuai konteks jastip mahasiswa
- Format kolom yang siap dijadikan skema database pada tahap berikutnya

**Digunakan:** ✅ Ya

**Catatan:**
> Dataset Excel digunakan sebagai acuan awal untuk merancang skema database. Beberapa kolom disesuaikan dengan kebutuhan sistem, terutama penambahan kolom `kapasitas` dan `status_sesi` pada entitas penjastip.

---

### LOG-004

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 2 — Dokumentasi Arsitektur |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan dokumen ARSITEKTUR.md yang menjelaskan desain arsitektur
microservices Jastip Kampus. Sertakan: gambaran umum sistem,
deskripsi tiap layanan, prinsip microservices yang diterapkan,
dan diagram relasi antar layanan.
```

**Output AI (Ringkasan):**

- Dokumen `docs/ARSITEKTUR.md` dengan struktur lengkap:
  - Gambaran umum arsitektur
  - Deskripsi dan tanggung jawab tiap service
  - Prinsip data ownership dan komunikasi antar-service
  - Tabel relasi layanan

**Digunakan:** ✅ Ya

**Catatan:**
> Dokumen dipakai sebagai referensi teknis tim. Disesuaikan dengan Flowchart yang sudah dibuat sebelumnya agar konsisten. Disimpan di `docs/ARSITEKTUR.md` dan dimasukkan ke dalam repository.

---

### LOG-005

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | RA — Rizki Amalia Rasyid Ridha (🗄️ Data & Persistence Engineer) |
| **Sesi** | Pertemuan 2 — Dataset SQL & Migrasi Database |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan script SQL untuk membuat skema database sistem Jastip Kampus.
Tabel yang diperlukan: penjastip, toko, barang, sesi_jastip,
titipan, pembayaran, dan tracking. Sertakan relasi antar tabel
dan contoh data awal (seed).
```

**Output AI (Ringkasan):**

- Script `CREATE TABLE` untuk setiap entitas beserta tipe data dan constraint
- Relasi foreign key antar tabel
- File migration awal dan script seed data contoh
- Index pada kolom yang sering diquery (`id_penjastip`, `status_titipan`)

**Digunakan:** ✅ Ya

**Catatan:**
> Script SQL dijadikan dasar migration database. Beberapa tipe data disesuaikan (misalnya `DECIMAL` untuk harga dan `ENUM` untuk status). Script seed dipakai untuk pengujian awal sebelum integrasi dengan service.

---

### LOG-006

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Pertemuan 2 — README & AI-LOG |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Rapikan README.md untuk proyek Jastip Kampus agar lebih terstruktur
dan profesional. Gunakan gambar docs/Flowchart.jpeg untuk alur sistem.
Sesuaikan dengan arsitektur microservices dan 5 anggota tim dengan
peran berbeda. Buatkan juga template AI-LOG.md untuk mencatat
penggunaan AI seluruh anggota tim.
```

**Output AI (Ringkasan):**

README.md:
- Badge teknologi di header (Node.js, Express, OpenAPI, GitHub)
- Daftar isi tabel bernomor 15 section
- Section bernomor urut dengan emoji
- Tabel endpoint, aturan sistem, teknologi, dan status pengembangan
- Gambar flowchart dari `docs/Flowchart.jpeg`

AI-LOG.md:
- Tabel anggota tim 5 orang dengan peran masing-masing
- Format standar tiap entri log (Anggota, Prompt, Output, Digunakan, Catatan)
- Ringkasan per anggota dan statistik keseluruhan
- Bagian refleksi tim

**Digunakan:** ✅ Ya

**Catatan:**
> README dipakai langsung setelah penyesuaian alur sistem (tetap pakai gambar, bukan ASCII). AI-LOG diisi mundur berdasarkan aktivitas nyata tanggal 17, 19, dan 20 Agustus. Raw Markdown disalin menggunakan PowerShell ke clipboard agar format tabel tetap terjaga saat dipaste ke GitHub.

---

## 📊 Ringkasan per Anggota

| Anggota | Peran | Total Log | ✅ Penuh | ⚠️ Sebagian | ❌ Tidak |
| :---: | --- | :---: | :---: | :---: | :---: |
| MT | 🏗️ Arsitek Sistem | 3 | 3 | 0 | 0 |
| RA | 🗄️ Data & Persistence Engineer | 2 | 2 | 0 | 0 |
| SA | 🚢 Infrastructure & DevOps | 0 | — | — | — |
| N | ⚙️ Backend / API Engineer | 0 | — | — | — |
| DN | 📊 QA, Load-Test & Dokumentasi | 1 | 1 | 0 | 0 |

---

## 📅 Rekap per Tanggal

| Tanggal | Anggota | Kegiatan | Tools AI |
| --- | :---: | --- | --- |
| 17 Agustus 2026 | MT | Desain diagram alur arsitektur sistem | OpenCode, Gemini |
| 19 Agustus 2026 | MT | Setup repo, catalog-service, DDD, openapi.yaml | GitHub Copilot |
| 19 Agustus 2026 | RA | Pembuatan dataset Excel | ChatGPT, GitHub Copilot |
| 20 Agustus 2026 | MT | Penulisan docs/ARSITEKTUR.md | GitHub Copilot |
| 20 Agustus 2026 | RA | Dataset SQL & migrasi database | GitHub Copilot |
| 20 Agustus 2026 | DN | Pembuatan README.md & AI-LOG.md | GitHub Copilot |

---

## 📈 Statistik Keseluruhan

| Metrik | Nilai |
| --- | --- |
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
- Logika **concurrency dan kapasitas** pada `order-service` harus divalidasi manual, tidak bisa sepenuhnya diserahkan ke AI.
- Diagram dan flowchart tetap dibuat secara manual — output visual dari AI belum cukup akurat untuk digunakan langsung.

---

> 📝 *Log ini wajib diperbarui oleh masing-masing anggota setiap kali menggunakan AI dalam sesi pengembangan.*

---

## 📁 Daftar Log

---

### LOG-001

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 1 — Setup Awal & Desain Arsitektur |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan struktur folder microservices untuk sistem jastip kampus
dengan layanan: order-service, catalog-service, payment-service,
tracking-service. Setiap service harus memiliki data sendiri.
```

**Output AI (Ringkasan):**

```
jastip-kampus/
├── services/
│   ├── catalog-service/
│   ├── order-service/
│   ├── payment-service/
│   └── tracking-service/
├── docs/
├── openapi.yaml
└── README.md
```

**Digunakan:** ✅ Ya

**Catatan:**
> Struktur dipakai sebagai dasar repository. Ditambahkan folder `docs/` untuk menyimpan ARSITEKTUR.md, ENDPOINTS.md, dan Flowchart.

---

### LOG-002

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | N — Nurdian (⚙️ Backend / API Engineer) |
| **Sesi** | Pertemuan 1 — Implementasi catalog-service |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan Express.js catalog-service dengan endpoint:
- GET /health
- GET /items
- GET /items/:id
Data masih in-memory menggunakan array JavaScript.
Port: 3001.
```

**Output AI (Ringkasan):**

AI menghasilkan `index.js` dengan:
- Server Express di port `3001`
- Data dummy array: Item A (Rp 15.000) dan Item B (Rp 25.000)
- Handler lengkap untuk 3 endpoint
- Response JSON konsisten

**Digunakan:** ✅ Ya

**Catatan:**
> Ditambahkan field `sisa` pada data item untuk mendukung logika kapasitas. Format response sedikit disesuaikan.

---

### LOG-003

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | MT — Muh. Iqbal Tawakkal (🏗️ Arsitek Sistem) |
| **Sesi** | Pertemuan 1 — Kontrak API (OpenAPI) |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Buatkan openapi.yaml versi 3.0.3 untuk catalog-service
dengan endpoint /health, /items, dan /items/{id}.
Sertakan schema Item dengan field: id, nama, harga, sisa.
```

**Output AI (Ringkasan):**

AI menghasilkan `openapi.yaml` lengkap:
- Info, version `3.0.3`, server `localhost:3001`
- Schema `Item`: id (integer), nama (string), harga (number), sisa (integer)
- Response schema untuk setiap endpoint
- Error response 404 untuk `/items/{id}`

**Digunakan:** ✅ Ya

**Catatan:**
> Divalidasi di Swagger Editor — tidak ada error. Langsung digunakan sebagai kontrak API resmi tim.

---

### LOG-004

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | SA — Syarifa Azizah. M (🚢 Infrastructure & DevOps) |
| **Sesi** | Pertemuan 1 — Setup Environment & Infrastruktur |
| **Tools AI** | ChatGPT |

**Prompt:**

```
Buatkan konfigurasi dasar untuk menjalankan Node.js microservices
secara lokal. Apa yang perlu disiapkan untuk catalog-service
agar bisa berjalan di port 3001?
```

**Output AI (Ringkasan):**

- Checklist prasyarat: Node.js v16+, npm
- Langkah instalasi dependency dengan `npm install`
- Cara menjalankan dengan `node index.js`
- Saran penambahan `.env` untuk konfigurasi port

**Digunakan:** ⚠️ Sebagian

**Catatan:**
> Langkah dasar dipakai. Konfigurasi `.env` belum diterapkan di tahap ini, akan diimplementasikan saat database ditambahkan.

---

### LOG-005

| Field | Detail |
| --- | --- |
| **Tanggal** | 2026-08-20 |
| **Anggota** | DN — Devi Nirwana (📊 QA, Load-Test & Dokumentasi) |
| **Sesi** | Pertemuan 1 — Pembuatan README & AI-LOG |
| **Tools AI** | GitHub Copilot |

**Prompt:**

```
Rapikan README.md untuk proyek Jastip Kampus agar lebih
terstruktur dan profesional. Sesuaikan dengan program microservices.
Gunakan gambar docs/Flowchart.jpeg untuk alur sistem.
```

**Output AI (Ringkasan):**

- Badge teknologi di header
- Daftar isi tabel bernomor (15 section)
- Setiap section bernomor urut + emoji
- Tabel status pengembangan ✅/🔲
- Tabel endpoint kritis dengan kolom Method terpisah
- Aturan sistem dalam format tabel

**Digunakan:** ✅ Ya

**Catatan:**
> Alur sistem tetap menggunakan gambar `docs/Flowchart.jpeg` milik tim, bukan ASCII diagram dari AI. Seluruh konten lain dipakai langsung.

---

## 📊 Ringkasan per Anggota

| Anggota | Peran | Jumlah Log | Dipakai Penuh | Sebagian | Tidak Dipakai |
| :---: | --- | :---: | :---: | :---: | :---: |
| MT | 🏗️ Arsitek Sistem | 2 | 2 | 0 | 0 |
| N | ⚙️ Backend / API Engineer | 1 | 1 | 0 | 0 |
| SA | 🚢 Infrastructure & DevOps | 1 | 0 | 1 | 0 |
| RA | 🗄️ Data & Persistence Engineer | 0 | — | — | — |
| DN | 📊 QA, Load-Test & Dokumentasi | 1 | 1 | 0 | 0 |

---

## 📈 Statistik Keseluruhan

| Metrik | Nilai |
| --- | --- |
| Total log | 5 |
| Output dipakai penuh | 4 |
| Output dipakai sebagian | 1 |
| Output tidak dipakai | 0 |
| Tingkat penerimaan | 90% |

---

## 🔍 Refleksi Tim

### ✅ Yang Berjalan Baik
- AI membantu **boilerplate code** Express.js dan struktur folder dengan cepat.
- OpenAPI schema dari AI langsung valid, menghemat waktu penulisan manual.
- README dari AI sudah mengikuti standar dokumentasi open source.

### ⚠️ Yang Perlu Diperhatikan
- Output AI untuk **logika concurrency dan kapasitas** harus divalidasi manual sebelum dipakai.
- Diagram dan flowchart perlu dibuat sendiri — AI tidak selalu menghasilkan visualisasi yang akurat.
- Setiap anggota wajib **mencatat sendiri** setiap penggunaan AI agar log tetap lengkap dan jujur.

---

> 📝 *Log ini wajib diperbarui oleh masing-masing anggota setiap kali menggunakan AI dalam sesi pengembangan.*
