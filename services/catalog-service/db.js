const { Pool, types } = require("pg");
types.setTypeParser(20, Number);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ready = pool.query(`
  CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    nama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    kategori TEXT NOT NULL,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(id,owner_id)
  );
  CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
  CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL,
    harga INTEGER NOT NULL CHECK (harga >= 0),
    stok INTEGER NOT NULL CHECK (stok >= 0),
    satuan TEXT NOT NULL,
    foto_path TEXT,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY(store_id,owner_id) REFERENCES stores(id,owner_id)
  );
  CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
  CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id);
`);

module.exports = { pool, ready };
