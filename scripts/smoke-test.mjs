import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://localhost:8080";
const stamp = Date.now();
async function call(path, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const ownerEmail = `owner-${stamp}@test.local`;
const buyerEmail = `buyer-${stamp}@test.local`;
for (const [email, role] of [[ownerEmail, "penjastip"], [buyerEmail, "penitip"]]) {
  const { response } = await call("/v1/register", { method: "POST", body: JSON.stringify({ nama: role, email, password: "rahasia123", role }) });
  assert.equal(response.status, 201);
}
async function login(email) {
  const { response, body } = await call("/v1/login", { method: "POST", body: JSON.stringify({ email, password: "rahasia123" }) });
  assert.equal(response.status, 200); return body.token;
}
const owner = await login(ownerEmail); const buyer = await login(buyerEmail);
const storeResult = await call("/v1/stores", {
  method: "POST", headers: { Authorization: `Bearer ${owner}` },
  body: JSON.stringify({ nama: "Toko Smoke", alamat: "Kampus", kategori: "Test" }),
});
assert.equal(storeResult.response.status, 201);
const form = new FormData();
form.append("tokoId", String(storeResult.body.id)); form.append("nama", "Produk Smoke"); form.append("kategori", "Test");
form.append("harga", "42000"); form.append("stok", "10"); form.append("satuan", "pcs");
form.append("foto", new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" }), "smoke.png");
const productResponse = await fetch(`${base}/v1/products`, { method: "POST", headers: { Authorization: `Bearer ${owner}` }, body: form });
const product = await productResponse.json(); assert.equal(productResponse.status, 201);
const { response: sessionResponse, body: session } = await call("/v1/sessions", {
  method: "POST", headers: { Authorization: `Bearer ${owner}` },
  body: JSON.stringify({ storeId: storeResult.body.id, productIds: [product.id], kapasitas: 1, batasWaktu: new Date(Date.now() + 3600000).toISOString() }),
});
assert.equal(sessionResponse.status, 201);
const submit = (key) => call("/v1/titipan", {
  method: "POST", headers: { Authorization: `Bearer ${buyer}`, "Idempotency-Key": key },
  body: JSON.stringify({ sesiId: session.id, barangId: product.id, qty: 1, biayaJasa: 5000 }),
});
const first = await submit(`smoke-${stamp}`); assert.equal(first.response.status, 201);
assert.equal((await submit(`smoke-${stamp}`)).response.status, 200);
assert.equal((await submit(`smoke-over-${stamp}`)).response.status, 409);
const payment = await call("/v1/payments", {
  method: "POST", headers: { Authorization: `Bearer ${buyer}`, "Idempotency-Key": `pay-${stamp}` },
  body: JSON.stringify({ titipanId: first.body.id, jumlah: first.body.total, metode: "QRIS" }),
});
assert.equal(payment.response.status, 201, JSON.stringify(payment.body)); assert.equal(payment.body.status, "tertahan");
console.log(JSON.stringify({ ok: true, sessionId: session.id, titipanId: first.body.id, payment: payment.body }, null, 2));
