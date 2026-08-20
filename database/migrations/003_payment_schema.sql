-- ============================================================
-- Migration 003: payment-service schema + seed data
-- Service  : payment-service (port 3003)
-- Database : payment_db
-- ============================================================

CREATE TYPE metode_bayar     AS ENUM ('transfer_bank', 'dompet_digital', 'tunai');
CREATE TYPE status_transaksi AS ENUM ('tertahan', 'dilepas', 'dikembalikan');

CREATE TABLE IF NOT EXISTS transaksi (
  id            VARCHAR(20)      PRIMARY KEY,
  titipan_id    VARCHAR(20)      NOT NULL UNIQUE,
  sesi_id       VARCHAR(20)      NOT NULL,
  pemesan       VARCHAR(100)     NOT NULL,
  jumlah_bayar  INT              NOT NULL CHECK (jumlah_bayar >= 0),
  metode        metode_bayar     NOT NULL,
  status        status_transaksi NOT NULL DEFAULT 'tertahan',
  waktu_bayar   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  waktu_dilepas TIMESTAMPTZ,
  catatan       TEXT             DEFAULT ''
);

CREATE TABLE IF NOT EXISTS saldo_tertahan (
  id            VARCHAR(20)  PRIMARY KEY,
  transaksi_id  VARCHAR(20)  NOT NULL UNIQUE REFERENCES transaksi(id),
  pemesan       VARCHAR(100) NOT NULL,
  jumlah        INT          NOT NULL CHECK (jumlah >= 0),
  status        VARCHAR(20)  NOT NULL DEFAULT 'tertahan'
);

CREATE TABLE IF NOT EXISTS riwayat_pelepasan (
  id            VARCHAR(20)  PRIMARY KEY,
  transaksi_id  VARCHAR(20)  NOT NULL REFERENCES transaksi(id),
  dilepas_ke    VARCHAR(100) NOT NULL,
  jumlah        INT          NOT NULL CHECK (jumlah >= 0),
  waktu         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaksi_sesi_id ON transaksi(sesi_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_pemesan ON transaksi(pemesan);
CREATE INDEX IF NOT EXISTS idx_transaksi_status  ON transaksi(status);
CREATE INDEX IF NOT EXISTS idx_rilis_dilepas_ke  ON riwayat_pelepasan(dilepas_ke);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO transaksi (id, titipan_id, sesi_id, pemesan, jumlah_bayar, metode, status, waktu_bayar, waktu_dilepas, catatan) VALUES
  ('TRX-001','TIT-004','SJ-002','user_nurdian_unhas',  35000, 'transfer_bank',  'tertahan','2026-08-20T09:15:00+08:00', NULL,                        'BCA – Pulpen Faber-Castell 5 pcs'),
  ('TRX-002','TIT-005','SJ-002','user_rizki_unhas',    56000, 'dompet_digital', 'tertahan','2026-08-20T09:30:00+08:00', NULL,                        'GoPay – Stabilo 2 set'),
  ('TRX-003','TIT-006','SJ-003','user_syarifa_unhas',  70000, 'tunai',          'dilepas', '2026-08-19T18:50:00+08:00','2026-08-19T20:00:00+08:00', 'Mie Titi Original 2 porsi'),
  ('TRX-004','TIT-007','SJ-003','user_nurdian_unhas',  45000, 'dompet_digital', 'dilepas', '2026-08-19T18:55:00+08:00','2026-08-19T20:00:00+08:00', 'OVO – Mie Titi Udang'),
  ('TRX-005','TIT-008','SJ-004','user_rizki_unhas',    60000, 'transfer_bank',  'dilepas', '2026-08-18T15:10:00+08:00','2026-08-18T16:00:00+08:00', 'BRI – Pisang Ijo Bu Budi 3 porsi'),
  ('TRX-006','TIT-009','SJ-004','user_andi_unhas',     50000, 'dompet_digital', 'dilepas', '2026-08-18T15:05:00+08:00','2026-08-18T16:00:00+08:00', 'Dana – Pisang Ijo Durian 2 porsi'),
  ('TRX-007','TIT-014','SJ-007','user_budi_unhas',    110000, 'transfer_bank',  'dilepas', '2026-08-19T19:30:00+08:00','2026-08-19T21:00:00+08:00', 'BNI – Konro Bakar 2 porsi'),
  ('TRX-008','TIT-015','SJ-007','user_dewi_unhas',     60000, 'dompet_digital', 'dilepas', '2026-08-19T19:35:00+08:00','2026-08-19T21:00:00+08:00', 'ShopeePay – Sup Konro'),
  ('TRX-009','TIT-016','SJ-008','user_nurdian_unhas', 110000, 'transfer_bank',  'dilepas', '2026-08-18T18:45:00+08:00','2026-08-18T20:00:00+08:00', 'Mandiri – KFC 2 paket'),
  ('TRX-010','TIT-017','SJ-009','user_syarifa_unhas',  50000, 'dompet_digital', 'dilepas', '2026-08-17T08:30:00+08:00','2026-08-17T09:30:00+08:00', 'OVO – Kopi Kanneng 2 cup')
ON CONFLICT (id) DO NOTHING;

INSERT INTO saldo_tertahan (id, transaksi_id, pemesan, jumlah, status) VALUES
  ('SAL-001','TRX-001','user_nurdian_unhas', 35000, 'tertahan'),
  ('SAL-002','TRX-002','user_rizki_unhas',   56000, 'tertahan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO riwayat_pelepasan (id, transaksi_id, dilepas_ke, jumlah, waktu) VALUES
  ('REL-001','TRX-003','user_budi_unhas',    70000, '2026-08-19T20:00:00+08:00'),
  ('REL-002','TRX-004','user_budi_unhas',    45000, '2026-08-19T20:00:00+08:00'),
  ('REL-003','TRX-005','user_dewi_unhas',    60000, '2026-08-18T16:00:00+08:00'),
  ('REL-004','TRX-006','user_dewi_unhas',    50000, '2026-08-18T16:00:00+08:00'),
  ('REL-005','TRX-007','user_syarifa_unhas',110000, '2026-08-19T21:00:00+08:00'),
  ('REL-006','TRX-008','user_syarifa_unhas', 60000, '2026-08-19T21:00:00+08:00'),
  ('REL-007','TRX-009','user_andi_unhas',   110000, '2026-08-18T20:00:00+08:00'),
  ('REL-008','TRX-010','user_siti_unhas',    50000, '2026-08-17T09:30:00+08:00')
ON CONFLICT (id) DO NOTHING;


CREATE TYPE metode_bayar     AS ENUM ('transfer_bank', 'dompet_digital', 'tunai');
CREATE TYPE status_transaksi AS ENUM ('tertahan', 'dilepas', 'dikembalikan');

CREATE TABLE IF NOT EXISTS transaksi (
  id            VARCHAR(20)      PRIMARY KEY,            -- contoh: TRX-001
  titipan_id    VARCHAR(20)      NOT NULL UNIQUE,        -- 1 titipan = 1 transaksi
  sesi_id       VARCHAR(20)      NOT NULL,
  pemesan       VARCHAR(100)     NOT NULL,
  jumlah_bayar  INT              NOT NULL CHECK (jumlah_bayar >= 0),
  metode        metode_bayar     NOT NULL,
  status        status_transaksi NOT NULL DEFAULT 'tertahan',
  waktu_bayar   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  waktu_dilepas TIMESTAMPTZ,
  catatan       TEXT             DEFAULT ''
);

-- Saldo yang sedang ditahan (escrow) per pemesan
CREATE TABLE IF NOT EXISTS saldo_tertahan (
  id            VARCHAR(20) PRIMARY KEY,
  transaksi_id  VARCHAR(20) NOT NULL UNIQUE REFERENCES transaksi(id),
  pemesan       VARCHAR(100) NOT NULL,
  jumlah        INT          NOT NULL CHECK (jumlah >= 0),
  status        VARCHAR(20)  NOT NULL DEFAULT 'tertahan'
);

-- Riwayat setiap pelepasan dana ke pembuka jastip
CREATE TABLE IF NOT EXISTS riwayat_pelepasan (
  id            VARCHAR(20)  PRIMARY KEY,
  transaksi_id  VARCHAR(20)  NOT NULL REFERENCES transaksi(id),
  dilepas_ke    VARCHAR(100) NOT NULL,                   -- user_id pembuka jastip
  jumlah        INT          NOT NULL CHECK (jumlah >= 0),
  waktu         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index untuk query transaksi per sesi
CREATE INDEX IF NOT EXISTS idx_transaksi_sesi_id  ON transaksi(sesi_id);
-- Index untuk query transaksi per pemesan
CREATE INDEX IF NOT EXISTS idx_transaksi_pemesan  ON transaksi(pemesan);
-- Index untuk filter status tertahan
CREATE INDEX IF NOT EXISTS idx_transaksi_status   ON transaksi(status);
-- Index untuk riwayat per penerima
CREATE INDEX IF NOT EXISTS idx_rilis_dilepas_ke   ON riwayat_pelepasan(dilepas_ke);
