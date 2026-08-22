const { Pool, types } = require("pg");
types.setTypeParser(20, Number);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ready = pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    no_hp TEXT,
    kampus TEXT,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'user' CHECK (account_type IN ('user','admin')),
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    store_id BIGINT NOT NULL,
    store_name TEXT NOT NULL,
    batas_waktu TIMESTAMPTZ NOT NULL,
    kapasitas_maksimal INTEGER NOT NULL CHECK (kapasitas_maksimal > 0),
    kapasitas_terpakai INTEGER NOT NULL DEFAULT 0 CHECK (kapasitas_terpakai >= 0),
    biaya_jasa_per_unit INTEGER NOT NULL CHECK (biaya_jasa_per_unit >= 0),
    status TEXT NOT NULL DEFAULT 'buka' CHECK (status IN ('buka','ditutup','dibatalkan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions(owner_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(status,batas_waktu);
  CREATE TABLE IF NOT EXISTS session_products (
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    PRIMARY KEY(session_id,product_id)
  );
  CREATE TABLE IF NOT EXISTS titipan (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES sessions(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    product_id BIGINT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    product_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    variant TEXT,
    note TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('langsung','tawar')),
    base_service_fee INTEGER NOT NULL CHECK (base_service_fee >= 0),
    agreed_service_fee INTEGER CHECK (agreed_service_fee >= 0),
    total INTEGER,
    status TEXT NOT NULL,
    reservation_expires_at TIMESTAMPTZ NOT NULL,
    capacity_released_at TIMESTAMPTZ,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_titipan_customer ON titipan(customer_id);
  CREATE INDEX IF NOT EXISTS idx_titipan_session ON titipan(session_id);
  CREATE INDEX IF NOT EXISTS idx_titipan_expiry ON titipan(status,reservation_expires_at);
  CREATE TABLE IF NOT EXISTS offers (
    id BIGSERIAL PRIMARY KEY,
    titipan_id BIGINT NOT NULL REFERENCES titipan(id) ON DELETE CASCADE,
    proposer_id BIGINT NOT NULL REFERENCES users(id),
    amount_per_unit INTEGER NOT NULL CHECK (amount_per_unit >= 0),
    round INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','superseded','expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_offer_one_pending ON offers(titipan_id) WHERE status='pending';
  CREATE TABLE IF NOT EXISTS admin_audit (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY,
    topic TEXT NOT NULL,
    payload JSONB NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);
module.exports = { pool, ready };
