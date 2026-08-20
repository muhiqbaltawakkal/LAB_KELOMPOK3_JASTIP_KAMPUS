-- ============================================================
-- Migration 004: tracking-service schema
-- Service  : tracking-service (port 3004)
-- Database : tracking_db
-- ============================================================

CREATE TYPE status_perjalanan AS ENUM (
  'diterima',
  'dibelikan',
  'dalam_perjalanan',
  'selesai',
  'gagal'
);

CREATE TABLE IF NOT EXISTS riwayat_status (
  id          VARCHAR(20)       PRIMARY KEY,             -- contoh: TRK-001
  titipan_id  VARCHAR(20)       NOT NULL,                -- referensi ke order-service
  status      status_perjalanan NOT NULL,
  waktu       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  keterangan  TEXT              DEFAULT ''
);

-- Index utama: semua event tracking untuk satu titipan, urut waktu
CREATE INDEX IF NOT EXISTS idx_tracking_titipan_waktu
  ON riwayat_status(titipan_id, waktu DESC);

-- Index untuk query status terbaru
CREATE INDEX IF NOT EXISTS idx_tracking_status ON riwayat_status(status);
