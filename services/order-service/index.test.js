const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("./index.js");

let server, base;
before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

test("menolak order tanpa token (401)", async () => {
  const r = await fetch(`${base}/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: 1, qty: 1 }),
  });
  assert.strictEqual(r.status, 401);
});

test("login menghasilkan token", async () => {
  const r = await fetch(`${base}/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: "test" }),
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
