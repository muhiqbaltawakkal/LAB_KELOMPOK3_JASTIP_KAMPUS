import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
if(!process.argv.includes("--confirm-reset")){
  console.error("DIBATALKAN: perintah ini menghapus volume PostgreSQL, Redis, dan upload. Tambahkan --confirm-reset.");
  process.exit(2);
}
if(!fs.existsSync(path.join(root,"docker-compose.yml"))||!fs.existsSync(path.join(root,"dataset","JastipKampus_Dataset.xlsx"))) throw new Error("Jalankan dari repository Jastip Kampus yang lengkap.");
const run=(args)=>{const result=spawnSync("docker",["compose",...args],{cwd:root,stdio:"inherit",shell:process.platform==="win32"});if(result.status!==0)process.exit(result.status||1)};

console.log("Reset demo: menghapus hanya volume yang didefinisikan docker-compose project ini...");
run(["down","--volumes","--remove-orphans"]);
run(["up","--build","--wait"]);
for(const [service,mode] of [["order-service-1","order"],["catalog-service","catalog"],["payment-service","payment"],["tracking-service","tracking"]]){
  run(["exec","-T","-w","/app",service,"node","/seed/demo-seed-runner.js",mode]);
}
run(["exec","-T","redis","redis-cli","FLUSHALL"]);
const manifest=createRequire(import.meta.url)(path.join(root,"dataset","demo-seed.js"));
console.log("\nSeed demo selesai. Semua akun reguler memakai password: "+manifest.password);
console.log("PERINGATAN: password ini hanya untuk demo, jangan digunakan di produksi.\n");
for(const account of manifest.accounts) console.log(`${account.label.padEnd(10)} ${account.email.padEnd(38)} ${account.nama}`);
console.log("\nAdmin tidak dibuat otomatis. Gunakan npm run bootstrap:admin setelah mengatur ADMIN_NAME/EMAIL/PASSWORD.");
