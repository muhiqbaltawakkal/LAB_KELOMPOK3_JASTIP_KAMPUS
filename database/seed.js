/**
 * seed.js — Baca dataset/*.json dan insert ke masing-masing PostgreSQL database
 *
 * Jalankan: node database/seed.js
 *
 * Env vars yang dibutuhkan (atau pakai default di bawah):
 *   CATALOG_DB_URL, ORDER_DB_URL, PAYMENT_DB_URL, TRACKING_DB_URL
 */

const { Client } = require("pg");
const path = require("path");

const catalog  = require(path.join(__dirname, "../dataset/catalog-seed.json"));
const order    = require(path.join(__dirname, "../dataset/order-seed.json"));
const payment  = require(path.join(__dirname, "../dataset/payment-seed.json"));
const tracking = require(path.join(__dirname, "../dataset/tracking-seed.json"));

const DB = {
  catalog:  process.env.CATALOG_DB_URL  || "postgresql://postgres:postgres@localhost:5432/catalog_db",
  order:    process.env.ORDER_DB_URL    || "postgresql://postgres:postgres@localhost:5433/order_db",
  payment:  process.env.PAYMENT_DB_URL  || "postgresql://postgres:postgres@localhost:5434/payment_db",
  tracking: process.env.TRACKING_DB_URL || "postgresql://postgres:postgres@localhost:5435/tracking_db",
};

async function connect(url) {
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
}

// ── CATALOG ────────────────────────────────────────────────
async function seedCatalog() {
  const db = await connect(DB.catalog);
  console.log("🗄️  Seeding catalog_db...");
  try {
    await db.query("BEGIN");

    for (const s of catalog.satuan) {
      await db.query(
        `INSERT INTO satuan (id, kode, nama, keterangan)
         VALUES ($1,$2,$3,$4) ON CONFLICT (kode) DO NOTHING`,
        [s.id, s.kode, s.nama, s.keterangan]
      );
    }

    for (const t of catalog.toko) {
      await db.query(
        `INSERT INTO toko (id, nama, pemilik, lokasi, kategori, aktif)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [t.id, t.nama, t.pemilik, t.lokasi, t.kategori, t.aktif]
      );
    }

    for (const b of catalog.barang) {
      await db.query(
        `INSERT INTO barang (id, toko_id, nama, kategori, satuan, harga_acuan, stok)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [b.id, b.toko_id, b.nama, b.kategori, b.satuan, b.harga_acuan, b.stok]
      );
    }

    await db.query("COMMIT");
    console.log(`   ✅ ${catalog.toko.length} toko, ${catalog.barang.length} barang, ${catalog.satuan.length} satuan`);
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
}

// ── ORDER ──────────────────────────────────────────────────
async function seedOrder() {
  const db = await connect(DB.order);
  console.log("🗄️  Seeding order_db...");
  try {
    await db.query("BEGIN");

    for (const s of order.sesi_jastip) {
      await db.query(
        `INSERT INTO sesi_jastip (id, judul, pembuka, status, batas_waktu, kapasitas_maksimal, deskripsi)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.judul, s.pembuka, s.status, s.batas_waktu, s.kapasitas_maksimal, s.deskripsi]
      );
    }

    for (const t of order.titipan) {
      await db.query(
        `INSERT INTO titipan (id, sesi_id, pemesan, barang_id, nama_barang, jumlah, harga_satuan, total, catatan, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
        [t.id, t.sesi_id, t.pemesan, t.barang_id, t.nama_barang, t.jumlah, t.harga_satuan, t.total, t.catatan, t.status]
      );
    }

    await db.query("COMMIT");
    console.log(`   ✅ ${order.sesi_jastip.length} sesi jastip, ${order.titipan.length} titipan`);
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
}

// ── PAYMENT ────────────────────────────────────────────────
async function seedPayment() {
  const db = await connect(DB.payment);
  console.log("🗄️  Seeding payment_db...");
  try {
    await db.query("BEGIN");

    for (const t of payment.transaksi) {
      await db.query(
        `INSERT INTO transaksi (id, titipan_id, sesi_id, pemesan, jumlah_bayar, metode, status, waktu_bayar, waktu_dilepas, catatan)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
        [t.id, t.titipan_id, t.sesi_id, t.pemesan, t.jumlah_bayar, t.metode, t.status,
         t.waktu_bayar, t.waktu_dilepas || null, t.catatan]
      );
    }

    for (const s of payment.saldo_tertahan) {
      await db.query(
        `INSERT INTO saldo_tertahan (id, transaksi_id, pemesan, jumlah, status)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.transaksi_id, s.pemesan, s.jumlah, s.status]
      );
    }

    for (const r of payment.riwayat_pelepasan) {
      await db.query(
        `INSERT INTO riwayat_pelepasan (id, transaksi_id, dilepas_ke, jumlah, waktu)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.transaksi_id, r.dilepas_ke, r.jumlah, r.waktu]
      );
    }

    await db.query("COMMIT");
    console.log(`   ✅ ${payment.transaksi.length} transaksi, ${payment.saldo_tertahan.length} saldo tertahan, ${payment.riwayat_pelepasan.length} pelepasan`);
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
}

// ── TRACKING ───────────────────────────────────────────────
async function seedTracking() {
  const db = await connect(DB.tracking);
  console.log("🗄️  Seeding tracking_db...");
  try {
    await db.query("BEGIN");

    for (const r of tracking.riwayat_status) {
      await db.query(
        `INSERT INTO riwayat_status (id, titipan_id, status, waktu, keterangan)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.titipan_id, r.status, r.waktu, r.keterangan]
      );
    }

    await db.query("COMMIT");
    console.log(`   ✅ ${tracking.riwayat_status.length} riwayat status`);
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
}

// ── MAIN ───────────────────────────────────────────────────
(async () => {
  try {
    await seedCatalog();
    await seedOrder();
    await seedPayment();
    await seedTracking();
    console.log("\n🎉 Semua database berhasil di-seed!");
  } catch (err) {
    console.error("❌ Seed gagal:", err.message);
    process.exit(1);
  }
})();
