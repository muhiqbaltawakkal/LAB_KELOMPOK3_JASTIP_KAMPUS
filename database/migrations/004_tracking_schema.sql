-- ============================================================
-- Migration 004: tracking-service schema + seed data
-- Service  : tracking-service (port 3004)
-- Database : tracking_db
-- ============================================================

CREATE TYPE status_perjalanan AS ENUM (
  'dititip', 'dibelanjakan', 'diantar', 'diterima', 'gagal'
);

CREATE TABLE IF NOT EXISTS riwayat_status (
  id          VARCHAR(20)       PRIMARY KEY,
  titipan_id  VARCHAR(20)       NOT NULL,
  status      status_perjalanan NOT NULL,
  waktu       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  keterangan  TEXT              DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_tracking_titipan_waktu ON riwayat_status(titipan_id, waktu DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_status        ON riwayat_status(status);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO riwayat_status (id, titipan_id, status, waktu, keterangan) VALUES
  ('TRK-001','TIT-001','dititip',      '2026-08-20T15:00:00+08:00','Titipan diterima – Jastip Chatime Losari'),
  ('TRK-002','TIT-001','dibelanjakan', '2026-08-20T16:10:00+08:00','Brown Sugar Boba selesai dibuat di Chatime Losari'),
  ('TRK-003','TIT-001','diantar',      '2026-08-20T16:20:00+08:00','Dalam perjalanan menuju kampus UNHAS'),
  ('TRK-004','TIT-002','dititip',      '2026-08-20T15:05:00+08:00','Titipan diterima'),
  ('TRK-005','TIT-002','dibelanjakan', '2026-08-20T16:12:00+08:00','Matcha Latte selesai dibuat'),
  ('TRK-006','TIT-003','dititip',      '2026-08-20T15:10:00+08:00','Titipan diterima'),
  ('TRK-007','TIT-004','dititip',      '2026-08-20T09:00:00+08:00','Titipan diterima – Jastip Gramedia Karebosi'),
  ('TRK-008','TIT-005','dititip',      '2026-08-20T09:05:00+08:00','Titipan diterima'),
  ('TRK-009','TIT-006','dititip',      '2026-08-19T18:00:00+08:00','Titipan diterima – Jastip Mie Titi Jl. Irian'),
  ('TRK-010','TIT-006','dibelanjakan', '2026-08-19T19:15:00+08:00','Mie Titi 2 porsi sudah dipesan'),
  ('TRK-011','TIT-006','diantar',      '2026-08-19T19:30:00+08:00','Dalam perjalanan menuju Tamalanrea'),
  ('TRK-012','TIT-006','diterima',     '2026-08-19T19:50:00+08:00','Barang diterima pemesan'),
  ('TRK-013','TIT-007','dititip',      '2026-08-19T18:05:00+08:00','Titipan diterima'),
  ('TRK-014','TIT-007','dibelanjakan', '2026-08-19T19:15:00+08:00','Mie Titi Udang sudah dipesan'),
  ('TRK-015','TIT-007','diterima',     '2026-08-19T19:52:00+08:00','Barang diterima pemesan'),
  ('TRK-016','TIT-008','dititip',      '2026-08-18T14:30:00+08:00','Titipan diterima – Jastip Pisang Ijo Bu Budi'),
  ('TRK-017','TIT-008','dibelanjakan', '2026-08-18T15:20:00+08:00','Pisang Ijo 3 porsi dibeli di Bu Budi Losari'),
  ('TRK-018','TIT-008','diterima',     '2026-08-18T15:45:00+08:00','Barang diterima pemesan di Perintis KM.10'),
  ('TRK-019','TIT-009','dititip',      '2026-08-18T14:35:00+08:00','Titipan diterima'),
  ('TRK-020','TIT-009','dibelanjakan', '2026-08-18T15:20:00+08:00','Pisang Ijo Durian 2 porsi dibeli'),
  ('TRK-021','TIT-009','diterima',     '2026-08-18T15:50:00+08:00','Barang diterima pemesan'),
  ('TRK-022','TIT-010','dititip',      '2026-08-20T10:30:00+08:00','Titipan diterima – Jastip Coto Nusantara'),
  ('TRK-023','TIT-011','dititip',      '2026-08-20T10:35:00+08:00','Titipan diterima'),
  ('TRK-024','TIT-012','dititip',      '2026-08-20T14:00:00+08:00','Titipan diterima – Jastip J.CO TSM'),
  ('TRK-025','TIT-013','dititip',      '2026-08-20T14:05:00+08:00','Titipan diterima'),
  ('TRK-026','TIT-014','dititip',      '2026-08-19T19:00:00+08:00','Titipan diterima – Jastip Konro Bakar'),
  ('TRK-027','TIT-014','dibelanjakan', '2026-08-19T19:50:00+08:00','Konro Bakar 2 porsi sudah siap'),
  ('TRK-028','TIT-014','diantar',      '2026-08-19T20:00:00+08:00','Dalam perjalanan ke kos pemesan'),
  ('TRK-029','TIT-014','diterima',     '2026-08-19T20:30:00+08:00','Barang diterima pemesan'),
  ('TRK-030','TIT-015','dititip',      '2026-08-19T19:05:00+08:00','Titipan diterima'),
  ('TRK-031','TIT-015','dibelanjakan', '2026-08-19T19:50:00+08:00','Sup Konro sudah siap'),
  ('TRK-032','TIT-015','diterima',     '2026-08-19T20:35:00+08:00','Barang diterima pemesan'),
  ('TRK-033','TIT-016','dititip',      '2026-08-18T18:00:00+08:00','Titipan diterima – Jastip KFC Panakkukang'),
  ('TRK-034','TIT-016','dibelanjakan', '2026-08-18T19:10:00+08:00','KFC 2 paket sudah dibeli'),
  ('TRK-035','TIT-016','diterima',     '2026-08-18T19:40:00+08:00','Barang diterima pemesan'),
  ('TRK-036','TIT-017','dititip',      '2026-08-17T08:00:00+08:00','Titipan diterima – Jastip Kopi Kanneng'),
  ('TRK-037','TIT-017','dibelanjakan', '2026-08-17T09:00:00+08:00','Kopi Susu Kanneng 2 cup sudah dibuat'),
  ('TRK-038','TIT-017','diterima',     '2026-08-17T09:20:00+08:00','Barang diterima pemesan di kampus'),
  ('TRK-039','TIT-018','dititip',      '2026-08-20T20:00:00+08:00','Titipan diterima – Jastip Alfamart Perintis'),
  ('TRK-040','TIT-019','dititip',      '2026-08-20T20:05:00+08:00','Titipan diterima'),
  ('TRK-041','TIT-020','dititip',      '2026-08-20T20:05:00+08:00','Titipan diterima')
ON CONFLICT (id) DO NOTHING;


CREATE TYPE status_perjalanan AS ENUM (
  'dititip',
  'dibelanjakan',
  'diantar',
  'diterima',
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
