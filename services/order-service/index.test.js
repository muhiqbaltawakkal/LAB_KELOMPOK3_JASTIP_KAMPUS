const { test, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
process.env.JWT_SECRET = "test-jwt-secret-minimal-32-karakter";
process.env.SERVICE_TOKEN = "test-service-token-minimal-32-karakter";

let server, catalogServer, base, mockOwnerId = "";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "jastip-order-"));
before(async () => {
  catalogServer = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    const product = { id: 1, owner_id: mockOwnerId, toko_id: 1, toko_nama: "Toko Test", nama: "Produk Test", harga: 42000, aktif: 1 };
    if (req.url?.startsWith("/v1/items?")) return res.end(JSON.stringify({ items: [product] }));
    if (req.url?.startsWith("/v1/items/")) return res.end(JSON.stringify(product));
    res.statusCode = 404; res.end(JSON.stringify({ error: "not found" }));
  });
  await new Promise((r) => catalogServer.listen(0, r));
  process.env.CATALOG_URL = `http://localhost:${catalogServer.address().port}`;
  process.env.DB_PATH = path.join(temp, "order.db");
  const app = require("./index.js");
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://localhost:${server.address().port}`;
});
after(() => { server.close(); catalogServer.close(); });

async function token(user, role) {
  const email = `${user}@test.local`;
  await fetch(`${base}/v1/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: user, email, password: "rahasia123", role }),
  });
  const r = await fetch(`${base}/v1/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "rahasia123" }),
  });
  return (await r.json()).token;
}

test("menolak order tanpa token (401)", async () => {
  const r = await fetch(`${base}/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: 1, qty: 1 }),
  });
  assert.strictEqual(r.status, 401);
});

test("login menghasilkan token", async () => {
  const email = `login-${Date.now()}@test.local`;
  await fetch(`${base}/v1/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: "Test", email, password: "rahasia123", role: "penitip" }),
  });
  const r = await fetch(`${base}/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "rahasia123" }),
  });
  assert.strictEqual(r.status, 200);
  const json = await r.json();
  assert.ok(json.token, "harus ada field token");
});

test("health membalas ok", async () => {
  const r = await fetch(`${base}/health`);
  assert.strictEqual(r.status, 200);
  const json = await r.json();
  assert.strictEqual(json.status, "ok");
});

test("registrasi publik tidak dapat membuat admin dan endpoint admin terlindungi", async () => {
  const email = `fake-admin-${Date.now()}@test.local`;
  await fetch(`${base}/v1/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: "Fake", email, password: "rahasia123", role: "admin" }) });
  const login = await fetch(`${base}/v1/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "rahasia123" }) });
  assert.equal((await login.json()).user.role, "penitip");
  assert.equal((await fetch(`${base}/v1/admin/users`)).status, 401);
});

test("admin dapat CRUD akun dan tidak dapat menonaktifkan dirinya", async () => {
  const db = new DatabaseSync(process.env.DB_PATH); const salt = "testsalt"; const password = "password-admin-aman";
  const hash = `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
  const result = db.prepare("INSERT INTO users (nama,email,password_hash,role,aktif) VALUES (?,?,?,'admin',1)").run("Admin Test", `admin-${Date.now()}@test.local`, hash);
  const adminId = Number(result.lastInsertRowid); const adminToken = jwt.sign({ sub: String(adminId), role: "admin", nama: "Admin Test" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const create = await fetch(`${base}/v1/admin/users`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ nama: "Owner Admin", email: `managed-${Date.now()}@test.local`, password: "password123", role: "penjastip" }) });
  assert.equal(create.status, 201); const managed = (await create.json()).user;
  assert.equal((await fetch(`${base}/v1/admin/users/${managed.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${adminToken}` } })).status, 204);
  assert.equal((await fetch(`${base}/v1/admin/users/${adminId}`, { method: "DELETE", headers: { Authorization: `Bearer ${adminToken}` } })).status, 409);
  const audit = await fetch(`${base}/v1/admin/audit`, { headers: { Authorization: `Bearer ${adminToken}` } });
  assert.ok((await audit.json()).audit.length >= 2);
  db.close();
});

test("kapasitas sesi tidak dapat terlampaui dan request bersifat idempoten", async () => {
  const ownerToken = await token(`owner-${Date.now()}`, "penjastip");
  mockOwnerId = String(jwt.decode(ownerToken).sub);
  const userToken = await token(`buyer-${Date.now()}`, "penitip");
  const create = await fetch(`${base}/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ storeId: 1, productIds: [1], kapasitas: 1, batasWaktu: new Date(Date.now() + 3600000).toISOString() }),
  });
  assert.strictEqual(create.status, 201);
  const session = await create.json();
  const key = `test-${Date.now()}`;
  const submit = (idempotencyKey) => fetch(`${base}/v1/titipan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", Authorization: `Bearer ${userToken}`, "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ sesiId: session.id, barangId: 1, qty: 1 }),
  });
  assert.strictEqual((await submit(key)).status, 201);
  assert.strictEqual((await submit(key)).status, 200);
  assert.strictEqual((await submit(`${key}-other`)).status, 409);
});
