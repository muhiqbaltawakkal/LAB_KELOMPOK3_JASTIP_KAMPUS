-- ============================================================
-- Migration 002: order-service schema + seed data
-- Service  : order-service (port 3002)
-- Database : order_db
-- ============================================================

CREATE TYPE status_sesi   AS ENUM ('buka', 'tutup', 'selesai');
CREATE TYPE status_titipan AS ENUM (
  'diproses', 'menunggu_pembayaran', 'dibayar', 'selesai', 'dibatalkan'
);

CREATE TABLE IF NOT EXISTS sesi_jastip (
  id                  VARCHAR(20)  PRIMARY KEY,
  judul               VARCHAR(200) NOT NULL,
  pembuka             VARCHAR(100) NOT NULL,
  status              status_sesi  NOT NULL DEFAULT 'buka',
  batas_waktu         TIMESTAMPTZ  NOT NULL,
  kapasitas_maksimal  INT          NOT NULL DEFAULT 10 CHECK (kapasitas_maksimal > 0),
  deskripsi           TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS titipan (
  id            VARCHAR(20)    PRIMARY KEY,
  sesi_id       VARCHAR(20)    NOT NULL REFERENCES sesi_jastip(id) ON DELETE RESTRICT,
  pemesan       VARCHAR(100)   NOT NULL,
  barang_id     INT            NOT NULL,
  nama_barang   VARCHAR(150)   NOT NULL,
  jumlah        INT            NOT NULL CHECK (jumlah > 0),
  harga_satuan  INT            NOT NULL CHECK (harga_satuan >= 0),
  total         INT            NOT NULL CHECK (total >= 0),
  catatan       TEXT           DEFAULT '',
  status        status_titipan NOT NULL DEFAULT 'diproses',
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_titipan_sesi_id ON titipan(sesi_id);
CREATE INDEX IF NOT EXISTS idx_titipan_pemesan ON titipan(pemesan);
CREATE INDEX IF NOT EXISTS idx_sesi_status     ON sesi_jastip(status);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO sesi_jastip (id, judul, pembuka, status, batas_waktu, kapasitas_maksimal, deskripsi) VALUES
  ('SJ-001', 'Jastip Chatime Losari – Sore',       'user_andi_unhas',    'buka',    '2026-08-20T16:30:00+08:00', 10, 'Berangkat ke Chatime Losari sekitar jam 16.00 WITA. Min order 1 cup.'),
  ('SJ-002', 'Jastip Gramedia Karebosi – Siang',   'user_siti_unhas',    'buka',    '2026-08-20T13:00:00+08:00', 15, 'Ke Gramedia Karebosi Link untuk beli alat tulis dan buku kuliah.'),
  ('SJ-003', 'Jastip Mie Titi – Makan Malam',      'user_budi_unhas',    'tutup',   '2026-08-19T19:00:00+08:00',  8, 'Jastip mie titi Jl. Irian buat makan malam. Bayar di depan.'),
  ('SJ-004', 'Jastip Pisang Ijo Bu Budi – Sore',   'user_dewi_unhas',    'selesai', '2026-08-18T15:30:00+08:00', 12, 'Jastip pisang ijo khas Makassar dari warung Bu Budi di Losari.'),
  ('SJ-005', 'Jastip Coto Nusantara – Makan Siang','user_rizki_unhas',   'buka',    '2026-08-20T11:30:00+08:00', 10, 'Jastip coto makassar Jl. Nusantara. Sekalian ketupat.'),
  ('SJ-006', 'Jastip J.CO TSM – Sore',             'user_nurdian_unhas', 'buka',    '2026-08-20T15:00:00+08:00',  8, 'Ke J.CO Trans Studio Mall. Bisa titip donut dan minuman.'),
  ('SJ-007', 'Jastip Konro Bakar – Malam',         'user_syarifa_unhas', 'tutup',   '2026-08-19T20:00:00+08:00',  6, 'Jastip konro bakar Jl. Gunung Lompobattang. Pesan sekarang.'),
  ('SJ-008', 'Jastip KFC Panakkukang – Malam',     'user_andi_unhas',    'selesai', '2026-08-18T19:30:00+08:00', 10, 'Jastip KFC Mall Panakkukang untuk makan malam.'),
  ('SJ-009', 'Jastip Kopi Kanneng – Pagi',         'user_siti_unhas',    'selesai', '2026-08-17T09:00:00+08:00', 12, 'Jastip kopi pagi dari Kopi Kanneng Hertasning.'),
  ('SJ-010', 'Jastip Alfamart Perintis – Malam',   'user_budi_unhas',    'buka',    '2026-08-20T21:00:00+08:00', 20, 'Ke Alfamart Perintis KM.12 beli keperluan malam.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO titipan (id, sesi_id, pemesan, barang_id, nama_barang, jumlah, harga_satuan, total, catatan, status) VALUES
  ('TIT-001', 'SJ-001', 'user_nurdian_unhas',  1,  'Brown Sugar Boba Milk Tea (L)',       2, 42000,  84000,  'Less sugar',            'diproses'),
  ('TIT-002', 'SJ-001', 'user_rizki_unhas',    2,  'Matcha Latte (M)',                    1, 35000,  35000,  'Normal sugar, less ice', 'diproses'),
  ('TIT-003', 'SJ-001', 'user_syarifa_unhas',  3,  'Classic Milk Tea (L)',                2, 32000,  64000,  'Full sugar',             'diproses'),
  ('TIT-004', 'SJ-002', 'user_nurdian_unhas',  8,  'Pulpen Faber-Castell 0.5mm Hitam',   5,  7000,  35000,  '',                       'menunggu_pembayaran'),
  ('TIT-005', 'SJ-002', 'user_rizki_unhas',    9,  'Stabilo Boss Highlighter Set 4 Warna',2,28000,  56000,  '',                       'menunggu_pembayaran'),
  ('TIT-006', 'SJ-003', 'user_syarifa_unhas',  4,  'Mie Titi Original (Reguler)',         2, 35000,  70000,  'Extra kuah',             'selesai'),
  ('TIT-007', 'SJ-003', 'user_nurdian_unhas',  5,  'Mie Titi Udang',                      1, 45000,  45000,  '',                       'selesai'),
  ('TIT-008', 'SJ-004', 'user_rizki_unhas',    17, 'Pisang Ijo Original (1 Porsi)',       3, 20000,  60000,  'Pisangnya yang matang',  'selesai'),
  ('TIT-009', 'SJ-004', 'user_andi_unhas',     18, 'Pisang Ijo Durian (1 Porsi)',         2, 25000,  50000,  '',                       'selesai'),
  ('TIT-010', 'SJ-005', 'user_dewi_unhas',     19, 'Coto Makassar (1 Mangkuk)',           2, 30000,  60000,  'Extra ketupat',          'diproses'),
  ('TIT-011', 'SJ-005', 'user_siti_unhas',     19, 'Coto Makassar (1 Mangkuk)',           1, 30000,  30000,  '',                       'diproses'),
  ('TIT-012', 'SJ-006', 'user_andi_unhas',     26, 'J.CO Original Glazed (6 pcs)',        1, 75000,  75000,  '',                       'diproses'),
  ('TIT-013', 'SJ-006', 'user_rizki_unhas',    27, 'Ice Blended Avocado (M)',             2, 48000,  96000,  'Less sweet',             'diproses'),
  ('TIT-014', 'SJ-007', 'user_budi_unhas',     22, 'Konro Bakar (1 Porsi)',               2, 55000, 110000,  '',                       'selesai'),
  ('TIT-015', 'SJ-007', 'user_dewi_unhas',     23, 'Sup Konro (1 Mangkuk)',               1, 60000,  60000,  'Pedas',                  'selesai'),
  ('TIT-016', 'SJ-008', 'user_nurdian_unhas',  35, 'KFC Original 2 Pcs + Nasi',          2, 55000, 110000,  '',                       'selesai'),
  ('TIT-017', 'SJ-009', 'user_syarifa_unhas',  45, 'Kopi Susu Kanneng (M)',              2, 25000,  50000,  'Extra gula aren',        'selesai'),
  ('TIT-018', 'SJ-010', 'user_andi_unhas',     14, 'Aqua 600ml',                          6,  4500,  27000,  '',                       'diproses'),
  ('TIT-019', 'SJ-010', 'user_dewi_unhas',     29, 'Roti Tawar Sari Roti',               2, 14000,  28000,  '',                       'diproses'),
  ('TIT-020', 'SJ-010', 'user_rizki_unhas',    47, 'Paracetamol 500mg (10 Tablet)',       2,  8000,  16000,  '',                       'diproses')
ON CONFLICT (id) DO NOTHING;


CREATE TYPE status_sesi   AS ENUM ('buka', 'tutup', 'selesai');
CREATE TYPE status_titipan AS ENUM (
  'diproses',
  'menunggu_pembayaran',
  'dibayar',
  'selesai',
  'dibatalkan'
);

CREATE TABLE IF NOT EXISTS sesi_jastip (
  id                  VARCHAR(20)  PRIMARY KEY,          -- contoh: SJ-001
  judul               VARCHAR(200) NOT NULL,
  pembuka             VARCHAR(100) NOT NULL,             -- user_id pembuka
  status              status_sesi  NOT NULL DEFAULT 'buka',
  batas_waktu         TIMESTAMPTZ  NOT NULL,
  kapasitas_maksimal  INT          NOT NULL DEFAULT 10 CHECK (kapasitas_maksimal > 0),
  deskripsi           TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS titipan (
  id            VARCHAR(20)    PRIMARY KEY,              -- contoh: TIT-001
  sesi_id       VARCHAR(20)    NOT NULL REFERENCES sesi_jastip(id) ON DELETE RESTRICT,
  pemesan       VARCHAR(100)   NOT NULL,                 -- user_id pemesan
  barang_id     INT            NOT NULL,                 -- referensi ke catalog-service
  nama_barang   VARCHAR(150)   NOT NULL,                 -- snapshot nama saat order
  jumlah        INT            NOT NULL CHECK (jumlah > 0),
  harga_satuan  INT            NOT NULL CHECK (harga_satuan >= 0),
  total         INT            NOT NULL CHECK (total >= 0),
  catatan       TEXT           DEFAULT '',
  status        status_titipan NOT NULL DEFAULT 'diproses',
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index untuk query titipan dalam satu sesi
CREATE INDEX IF NOT EXISTS idx_titipan_sesi_id ON titipan(sesi_id);
-- Index untuk query titipan per pemesan
CREATE INDEX IF NOT EXISTS idx_titipan_pemesan ON titipan(pemesan);
-- Index untuk filter sesi yang masih buka
CREATE INDEX IF NOT EXISTS idx_sesi_status ON sesi_jastip(status);
