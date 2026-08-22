const { DatabaseSync } = require("node:sqlite");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const path = require("node:path");
const scrypt = promisify(crypto.scrypt);

async function main() {
  const nama = String(process.env.ADMIN_NAME || "").trim();
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!nama || !email.includes("@") || password.length < 12) throw new Error("ADMIN_NAME, ADMIN_EMAIL valid, dan ADMIN_PASSWORD minimal 12 karakter wajib diisi");
  const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, "order.db"));
  const columns = db.prepare("PRAGMA table_info(users)").all().map((x) => x.name);
  if (!columns.includes("aktif")) throw new Error("jalankan order-service sekali agar migrasi database diterapkan");
  const existing = db.prepare("SELECT id,role,aktif FROM users WHERE email=?").get(email);
  if (existing) {
    if (existing.role !== "admin") throw new Error("email sudah dipakai oleh akun non-admin");
    db.prepare("UPDATE users SET nama=?,aktif=1 WHERE id=?").run(nama, existing.id);
    console.log(`Admin siap: ${email}`);
    return;
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = `${salt}:${(await scrypt(password, salt, 64)).toString("hex")}`;
  db.prepare("INSERT INTO users (nama,email,password_hash,role,aktif) VALUES (?,?,?,'admin',1)").run(nama, email, hash);
  console.log(`Admin dibuat: ${email}`);
}
main().catch((err) => { console.error(err.message); process.exitCode = 1; });
