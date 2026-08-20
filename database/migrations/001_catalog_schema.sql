-- ============================================================
-- Migration 001: catalog-service schema
-- Service  : catalog-service (port 3001)
-- Database : catalog_db
-- ============================================================

CREATE TABLE IF NOT EXISTS satuan (
  id         SERIAL PRIMARY KEY,
  kode       VARCHAR(20)  NOT NULL UNIQUE,
  nama       VARCHAR(50)  NOT NULL,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS toko (
  id        SERIAL PRIMARY KEY,
  nama      VARCHAR(100) NOT NULL,
  pemilik   VARCHAR(100) NOT NULL,
  lokasi    TEXT         NOT NULL,
  kategori  VARCHAR(50)  NOT NULL,
  aktif     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barang (
  id           SERIAL PRIMARY KEY,
  toko_id      INT          NOT NULL REFERENCES toko(id) ON DELETE CASCADE,
  nama         VARCHAR(150) NOT NULL,
  kategori     VARCHAR(50)  NOT NULL,
  satuan       VARCHAR(20)  NOT NULL REFERENCES satuan(kode),
  harga_acuan  INT          NOT NULL CHECK (harga_acuan >= 0),
  stok         INT          NOT NULL DEFAULT 0 CHECK (stok >= 0),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index untuk pencarian barang berdasarkan toko
CREATE INDEX IF NOT EXISTS idx_barang_toko_id ON barang(toko_id);
-- Index untuk filter kategori
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori);
-- Index untuk filter toko aktif
CREATE INDEX IF NOT EXISTS idx_toko_aktif ON toko(aktif);
