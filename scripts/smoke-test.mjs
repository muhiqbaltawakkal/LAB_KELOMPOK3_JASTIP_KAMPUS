import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://localhost:8080";
const stamp = Date.now();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function call(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const idempotent = method === "GET" || method === "HEAD" || Boolean(headers["Idempotency-Key"] || headers["idempotency-key"]);
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(`${base}${path}`, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (idempotent && [429, 502, 503].includes(response.status) && attempt < 20) {
      await delay(300 + (attempt * 150));
      continue;
    }
    return { response, body };
  }
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
  body: JSON.stringify({ storeId: storeResult.body.id, productIds: [product.id], kapasitas: 1, biayaJasaPerUnit: 5000, batasWaktu: new Date(Date.now() + 3600000).toISOString() }),
});
assert.equal(sessionResponse.status, 201);
const submit = (key) => call("/v1/titipan", {
  method: "POST", headers: { Authorization: `Bearer ${buyer}`, "Idempotency-Key": key },
  body: JSON.stringify({ sesiId: session.id, barangId: product.id, qty: 1, mode: "langsung" }),
});
const first = await submit(`smoke-${stamp}`); assert.equal(first.response.status, 201);
assert.equal((await submit(`smoke-${stamp}`)).response.status, 200);
assert.equal((await submit(`smoke-over-${stamp}`)).response.status, 409);
const payment = await call("/v1/payments", {
  method: "POST", headers: { Authorization: `Bearer ${buyer}`, "Idempotency-Key": `pay-${stamp}` },
  body: JSON.stringify({ titipanId: first.body.id, amount: first.body.total, method: "simulasi" }),
});
assert.equal(payment.response.status, 201, JSON.stringify(payment.body)); assert.equal(payment.body.status, "tertahan");
async function waitFor(read,predicate,label){for(let i=0;i<15;i++){const value=await read();if(predicate(value))return value;await delay(500)}throw new Error(`timeout menunggu ${label}`)}
async function finishFlow(orderId){
  await waitFor(async()=>(await call(`/v1/tracking/${orderId}`,{headers:{Authorization:`Bearer ${buyer}`}})).body,x=>x.events?.at(-1)?.status==="dititip","tracking dititip");
  for(const status of ["dibelanjakan","diantar"]){const x=await call("/v1/tracking",{method:"POST",headers:{Authorization:`Bearer ${owner}`},body:JSON.stringify({titipanId:orderId,status})});assert.equal(x.response.status,201,JSON.stringify(x.body))}
  const received=await call(`/v1/tracking/${orderId}/confirm-received`,{method:"POST",headers:{Authorization:`Bearer ${buyer}`}});assert.equal(received.response.status,201,JSON.stringify(received.body));
  return waitFor(async()=>(await call(`/v1/payments/${orderId}`,{headers:{Authorization:`Bearer ${buyer}`}})).body,x=>x.status==="dilepas","escrow dilepas");
}
await finishFlow(first.body.id);

const secondSession=(await call("/v1/sessions",{method:"POST",headers:{Authorization:`Bearer ${owner}`},body:JSON.stringify({storeId:storeResult.body.id,productIds:[product.id],kapasitas:2,biayaJasaPerUnit:5000,batasWaktu:new Date(Date.now()+3600000).toISOString()})})).body;
const offered=await call("/v1/titipan",{method:"POST",headers:{Authorization:`Bearer ${buyer}`,"Idempotency-Key":`offer-${stamp}`},body:JSON.stringify({sesiId:secondSession.id,barangId:product.id,qty:1,mode:"tawar",tawaranJasaPerUnit:3000})});assert.equal(offered.response.status,201,JSON.stringify(offered.body));
let decision=await call(`/v1/offers/${offered.body.offer.id}`,{method:"PATCH",headers:{Authorization:`Bearer ${owner}`},body:JSON.stringify({decision:"rejected"})});assert.equal(decision.response.status,200,JSON.stringify(decision.body));
const revised=await call(`/v1/titipan/${offered.body.id}/offers`,{method:"POST",headers:{Authorization:`Bearer ${buyer}`},body:JSON.stringify({tawaranJasaPerUnit:4000})});assert.equal(revised.response.status,201,JSON.stringify(revised.body));
decision=await call(`/v1/offers/${revised.body.id}`,{method:"PATCH",headers:{Authorization:`Bearer ${owner}`},body:JSON.stringify({decision:"accepted"})});assert.equal(decision.response.status,200,JSON.stringify(decision.body));
const negotiated=(await call("/v1/titipan/me",{headers:{Authorization:`Bearer ${buyer}`}})).body.titipan.find(x=>x.id===offered.body.id);
const secondPayment=await call("/v1/payments",{method:"POST",headers:{Authorization:`Bearer ${buyer}`,"Idempotency-Key":`pay-offer-${stamp}`},body:JSON.stringify({titipanId:negotiated.id,amount:negotiated.total,method:"simulasi"})});assert.equal(secondPayment.response.status,201,JSON.stringify(secondPayment.body));
await finishFlow(negotiated.id);
console.log(JSON.stringify({ok:true,direct:{sessionId:session.id,titipanId:first.body.id},negotiation:{sessionId:secondSession.id,titipanId:negotiated.id},escrow:"dilepas"},null,2));
