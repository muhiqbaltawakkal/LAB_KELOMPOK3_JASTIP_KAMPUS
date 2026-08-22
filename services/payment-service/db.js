const { Pool, types } = require("pg");
types.setTypeParser(20, Number);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ready = pool.query(`
  CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    titipan_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'tertahan' CHECK (status IN ('tertahan','dilepas','dikembalikan','dibatalkan')),
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS processed_events (event_id UUID PRIMARY KEY, processed_at TIMESTAMPTZ NOT NULL DEFAULT now());
  CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY,
    topic TEXT NOT NULL,
    payload JSONB NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);
module.exports = { pool, ready };
