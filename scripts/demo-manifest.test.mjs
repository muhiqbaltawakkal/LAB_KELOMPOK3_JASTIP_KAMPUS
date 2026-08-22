import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest=createRequire(import.meta.url)(path.join(root,"dataset","demo-seed.js"));
test("manifest workbook memiliki jumlah dan relasi yang tepat",()=>{
  assert.deepEqual([manifest.accounts.length,manifest.stores.length,manifest.products.length,manifest.sessions.length,manifest.orders.length,manifest.payments.length,manifest.tracking.length],[9,20,34,5,7,6,15]);
  const ids=(xs)=>new Set(xs.map(x=>x.id)); const users=ids(manifest.accounts),stores=ids(manifest.stores),products=ids(manifest.products),sessions=ids(manifest.sessions),orders=ids(manifest.orders);
  for(const x of manifest.stores)assert.ok(users.has(x.ownerId));
  for(const x of manifest.products){assert.ok(stores.has(x.storeId));assert.ok(users.has(x.ownerId));assert.equal(x.ownerId,manifest.stores.find(s=>s.id===x.storeId).ownerId)}
  for(const x of manifest.sessions){assert.ok(stores.has(x.storeId));assert.ok(users.has(x.ownerId));for(const id of x.productIds)assert.ok(products.has(id))}
  for(const x of manifest.orders){assert.ok(sessions.has(x.sessionId));assert.ok(products.has(x.productId));assert.ok(users.has(x.customerId))}
  for(const x of manifest.payments)assert.ok(orders.has(x.titipanId));
  for(const x of manifest.tracking)assert.ok(orders.has(x.titipanId));
});
test("seluruh 34 foto ada, tidak kosong, format sah, dan <= 5 MB",()=>{
  for(const product of manifest.products){const file=path.join(root,"dataset","JastipKampus_Gambar_Produk",product.photo),size=fs.statSync(file).size;assert.match(path.extname(file).toLowerCase(),/^\.(jpg|jpeg|png|webp)$/);assert.ok(size>0&&size<=5*1024*1024,product.photo)}
});
test("ownership membagi tepat lima toko per akun Penjastip",()=>{
  for(const ownerId of [6,7,8,9])assert.equal(manifest.stores.filter(x=>x.ownerId===ownerId).length,5);
});
test("route sessions/me berada sebelum route parameter",()=>{
  const source=fs.readFileSync(path.join(root,"services","order-service","index.js"),"utf8");assert.ok(source.indexOf('app.get("/v1/sessions/me"')<source.indexOf('app.get("/v1/sessions/:id"'));
});
test("publisher tidak menandai event ketika Redis belum siap",()=>{
  for(const service of ["payment-service","tracking-service"]){const source=fs.readFileSync(path.join(root,"services",service,"index.js"),"utf8");assert.match(source,/if\(!pub\?\.isReady\)return/)}
});
