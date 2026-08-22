const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const { createRequire } = require("node:module");

const serviceRequire = createRequire(path.join(process.cwd(), "package.json"));
const { Client } = serviceRequire("pg");
const manifest = require(process.env.DEMO_MANIFEST || "/seed-data/demo-seed.js");
const mode = process.argv[2];
const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.createHash("sha256").update(`jastip-demo:${password}`).digest("hex").slice(0, 32);
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}
async function withDb(work) {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try { await db.query("BEGIN"); await work(db); await db.query("COMMIT"); }
  catch (error) { await db.query("ROLLBACK"); throw error; }
  finally { await db.end(); }
}
const productById = new Map(manifest.products.map((x) => [x.id, x]));
const storeById = new Map(manifest.stores.map((x) => [x.id, x]));
const orderById = new Map(manifest.orders.map((x) => [x.id, x]));

async function seedOrder() {
  const passwordHash = await hashPassword(manifest.password);
  await withDb(async (db) => {
    await db.query("TRUNCATE admin_audit,outbox_events,offers,titipan,session_products,sessions,users RESTART IDENTITY CASCADE");
    for (const a of manifest.accounts) await db.query(
      "INSERT INTO users(id,nama,email,no_hp,kampus,password_hash,account_type,aktif) VALUES($1,$2,$3,$4,$5,$6,'user',true)",
      [a.id,a.nama,a.email,a.noHp,a.kampus,passwordHash]);
    for (const s of manifest.sessions) {
      const deadline = s.status === "buka" ? new Date(Date.now() + (24 + s.id) * 3600000) : new Date(Date.now() - s.id * 86400000);
      const used = manifest.orders.filter((x) => x.sessionId === s.id && x.status !== "dibatalkan").reduce((n,x)=>n+x.qty,0);
      await db.query("INSERT INTO sessions(id,owner_id,store_id,store_name,batas_waktu,kapasitas_maksimal,kapasitas_terpakai,biaya_jasa_per_unit,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [s.id,s.ownerId,s.storeId,storeById.get(s.storeId).nama,deadline,s.capacity,used,s.fee,s.status]);
      for (const productId of s.productIds) await db.query("INSERT INTO session_products(session_id,product_id) VALUES($1,$2)",[s.id,productId]);
    }
    for (const o of manifest.orders) {
      const p=productById.get(o.productId); const session=manifest.sessions.find((x)=>x.id===o.sessionId);
      const agreed = o.status === "dibatalkan" ? null : o.fee; const total = agreed == null ? null : (p.harga + agreed) * o.qty;
      const expires = session.status === "buka" ? new Date(Date.now()+24*3600000) : new Date(Date.now()-3600000);
      await db.query(`INSERT INTO titipan(id,session_id,customer_id,product_id,qty,product_name,unit_price,note,mode,base_service_fee,agreed_service_fee,total,status,reservation_expires_at,capacity_released_at,idempotency_key,created_at,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now()-interval '1 day',now()-interval '1 day')`,
        [o.id,o.sessionId,o.customerId,o.productId,o.qty,p.nama,p.harga,o.note,o.mode,session.fee,agreed,total,o.status,expires,o.status==="dibatalkan"?new Date():null,`demo-order-${o.id}`]);
      if (o.offer) await db.query("INSERT INTO offers(titipan_id,proposer_id,amount_per_unit,round,status,responded_at) VALUES($1,$2,$3,1,$4,now()-interval '1 day')",
        [o.id,o.customerId,o.fee,o.offer]);
    }
    await db.query("SELECT setval(pg_get_serial_sequence('users','id'),(SELECT max(id) FROM users),true)");
    await db.query("SELECT setval(pg_get_serial_sequence('sessions','id'),(SELECT max(id) FROM sessions),true)");
    await db.query("SELECT setval(pg_get_serial_sequence('titipan','id'),(SELECT max(id) FROM titipan),true)");
    await db.query("SELECT setval(pg_get_serial_sequence('offers','id'),COALESCE((SELECT max(id) FROM offers),1),true)");
  });
}

async function seedCatalog() {
  const sourceDir = process.env.DEMO_IMAGE_DIR || "/seed-images";
  const uploadDir = process.env.UPLOAD_DIR || "/data/uploads";
  fs.mkdirSync(uploadDir,{recursive:true});
  for(const file of fs.readdirSync(uploadDir)) fs.rmSync(path.join(uploadDir,file),{recursive:true,force:true});
  const allowed = new Set([".jpg",".jpeg",".png",".webp"]);
  for (const p of manifest.products) {
    const source=path.join(sourceDir,p.photo); const stat=fs.statSync(source); const ext=path.extname(source).toLowerCase();
    if(!allowed.has(ext)||stat.size===0||stat.size>5*1024*1024) throw new Error(`foto tidak valid: ${p.photo}`);
    fs.copyFileSync(source,path.join(uploadDir,p.photo));
  }
  await withDb(async(db)=>{
    await db.query("TRUNCATE products,stores RESTART IDENTITY CASCADE");
    for(const s of manifest.stores) await db.query("INSERT INTO stores(id,owner_id,nama,alamat,kategori,aktif) VALUES($1,$2,$3,$4,$5,true)",[s.id,s.ownerId,s.nama,s.alamat,s.kategori]);
    for(const p of manifest.products) await db.query("INSERT INTO products(id,store_id,owner_id,nama,kategori,harga,stok,satuan,foto_path,aktif) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,true)",[p.id,p.storeId,p.ownerId,p.nama,p.kategori,p.harga,p.stok,p.satuan,p.photo]);
    await db.query("SELECT setval(pg_get_serial_sequence('stores','id'),(SELECT max(id) FROM stores),true)");
    await db.query("SELECT setval(pg_get_serial_sequence('products','id'),(SELECT max(id) FROM products),true)");
  });
}

async function seedPayment(){
  await withDb(async(db)=>{await db.query("TRUNCATE processed_events,outbox_events,transactions RESTART IDENTITY CASCADE");for(const p of manifest.payments){const o=orderById.get(p.titipanId),product=productById.get(o.productId),amount=(product.harga+o.fee)*o.qty;await db.query("INSERT INTO transactions(id,titipan_id,customer_id,amount,method,status,idempotency_key,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,now()-interval '1 day',now()-interval '1 day')",[p.id,p.titipanId,p.customerId,amount,p.method,p.status,`demo-payment-${p.id}`])}await db.query("SELECT setval(pg_get_serial_sequence('transactions','id'),(SELECT max(id) FROM transactions),true)")});
}
async function seedTracking(){
  await withDb(async(db)=>{await db.query("TRUNCATE processed_events,outbox_events,tracking_events RESTART IDENTITY CASCADE");for(const t of manifest.tracking){await db.query("INSERT INTO tracking_events(id,titipan_id,status,note,actor_id,event_id,created_at) VALUES($1,$2,$3,$4,NULL,$5,now()-interval '1 day'+($1*interval '1 minute'))",[t.id,t.titipanId,t.status,t.note,crypto.randomUUID()])}await db.query("SELECT setval(pg_get_serial_sequence('tracking_events','id'),(SELECT max(id) FROM tracking_events),true)")});
}
async function validate(){
  const expected={order:{users:9,sessions:5,titipan:7},catalog:{stores:20,products:34},payment:{transactions:6},tracking:{tracking_events:15}}[mode];
  await withDb(async(db)=>{for(const [table,count] of Object.entries(expected)){const actual=(await db.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n;if(actual!==count)throw new Error(`${table}: ${actual}, seharusnya ${count}`)}});
}

const runners={order:seedOrder,catalog:seedCatalog,payment:seedPayment,tracking:seedTracking};
if(!runners[mode]) throw new Error("mode seed harus order/catalog/payment/tracking");
runners[mode]().then(validate).then(()=>console.log(JSON.stringify({ok:true,mode}))).catch((error)=>{console.error(error);process.exit(1)});
