-- ============================================================
-- Migration 002: order-service schema
-- Service  : order-service (port 3002)
-- Database : order_db
-- ============================================================

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
