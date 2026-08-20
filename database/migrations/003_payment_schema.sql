-- ============================================================
-- Migration 003: payment-service schema
-- Service  : payment-service (port 3003)
-- Database : payment_db
-- ============================================================

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
