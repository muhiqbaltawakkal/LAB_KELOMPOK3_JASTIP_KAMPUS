const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const http = require("node:http");
process.env.JWT_SECRET = "test-jwt-secret-minimal-32-karakter";
process.env.SERVICE_TOKEN = "test-service-token-minimal-32-karakter";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "jastip-catalog-"));
process.env.DB_PATH = path.join(temp, "catalog.db"); process.env.UPLOAD_DIR = path.join(temp, "uploads");
let app, server, orderServer, base;
const secret = process.env.JWT_SECRET;
const token = (sub) => jwt.sign({ sub, role: "penjastip" }, secret);
before(async () => {
  orderServer = http.createServer((req, res) => { res.setHeader("Content-Type", "application/json"); const id = req.url.split("/")[3]; res.end(JSON.stringify({ user: { id: Number(id), role: req.url.endsWith("/penjastip") ? "penjastip" : req.headers.authorization ? "admin" : "penjastip", aktif: 1 } })); });
  await new Promise((r) => orderServer.listen(0, r)); process.env.ORDER_URL = `http://localhost:${orderServer.address().port}`;
  app = require("./index"); await new Promise((r) => { server = app.listen(0, r); }); base = `http://localhost:${server.address().port}`;
});
after(() => { server.close(); orderServer.close(); });

test("ownership toko dan upload foto produk", async () => {
  const owner = token("owner-a"); const other = token("owner-b");
  const storeRes = await fetch(`${base}/v1/stores`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${owner}` }, body: JSON.stringify({ nama: "Toko A", alamat: "Kampus", kategori: "Makanan" }) });
  assert.equal(storeRes.status, 201); const store = await storeRes.json();
  const form = new FormData();
  Object.entries({ tokoId: store.id, nama: "Produk A", kategori: "Makanan", harga: 10000, stok: 3, satuan: "pcs" }).forEach(([k, v]) => form.append(k, String(v)));
  form.append("foto", new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" }), "foto.png");
  const productRes = await fetch(`${base}/v1/products`, { method: "POST", headers: { Authorization: `Bearer ${owner}` }, body: form });
  assert.equal(productRes.status, 201); const product = await productRes.json(); assert.match(product.foto_url, /\/uploads\//);
  const forbidden = await fetch(`${base}/v1/products/${product.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${other}` }, body: new FormData() });
  assert.equal(forbidden.status, 404);
  const photo = await fetch(product.foto_url); assert.equal(photo.status, 200);
});

test("menolak file bukan gambar", async () => {
  const form = new FormData(); form.append("foto", new Blob(["text"], { type: "text/plain" }), "bad.txt");
  const response = await fetch(`${base}/v1/products`, { method: "POST", headers: { Authorization: `Bearer ${token("owner-a")}` }, body: form });
  assert.equal(response.status, 400);
});
