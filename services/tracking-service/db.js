const { Pool, types } = require("pg");
types.setTypeParser(20, Number);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ready = pool.query(`
  CREATE TABLE IF NOT EXISTS tracking_events (
    id BIGSERIAL PRIMARY KEY,
    titipan_id BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('dititip','dibelanjakan','diantar','diterima')),
    note TEXT,
    actor_id BIGINT,
    event_id UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(titipan_id,status)
  );
  CREATE INDEX IF NOT EXISTS idx_tracking_titipan ON tracking_events(titipan_id,created_at);
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
