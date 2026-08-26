import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import net from "node:net";

const codespaceName = process.env.CODESPACE_NAME;

if (!codespaceName) {
  console.error("CODESPACE_NAME tidak ditemukan. Jalankan perintah ini dari GitHub Codespaces.");
  process.exit(1);
}

const apiUrl = `https://${codespaceName}-8080.app.github.dev`;
console.log(`Expo Go akan memakai API: ${apiUrl}`);

const cwd = new URL("..", import.meta.url);
const command = process.platform === "win32" ? "npx.cmd" : "npx";

function stopExistingExpo() {
  if (process.platform === "win32") return;
  // Stop only Expo dev servers spawned from this workspace to avoid port conflicts.
  spawnSync("pkill", ["-f", "/workspaces/LAB_KELOMPOK3_JASTIP_KAMPUS/mobile/node_modules/.bin/expo start"], { stdio: "ignore" });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host: "0.0.0.0" }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function pickPort(start = 8081, max = 8100) {
  for (let port = start; port <= max; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`Tidak menemukan port kosong pada rentang ${start}-${max}`);
}

function runExpo(args) {
  return new Promise((resolve) => {
    const child = spawn(command, ["expo", "start", ...args], {
      cwd,
      env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("exit", (code, signal) => resolve({ code: code ?? 1, signal, output }));
  });
}

stopExistingExpo();
const port = await pickPort();
console.log(`Menggunakan port Expo: ${port}`);

const tunnelErrorPattern = /failed to start tunnel|remote gone away|ngrok/i;
let first = null;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  if (attempt > 1) console.error(`\nRetry tunnel percobaan ${attempt}/3...`);
  first = await runExpo(["--tunnel", "--clear", "--port", String(port)]);
  if (first.signal) process.kill(process.pid, first.signal);
  const tunnelFailed = first.code !== 0 && tunnelErrorPattern.test(first.output);
  if (!tunnelFailed) {
    process.exit(first.code);
  }
}

console.error("\nTunnel ngrok gagal. Fallback ke mode LAN...");
console.error("Jika pakai HP fisik, pastikan HP dan laptop berada di jaringan Wi-Fi yang sama.\n");

const fallback = await runExpo(["--lan", "--clear", "--port", String(port)]);
if (fallback.signal) process.kill(process.pid, fallback.signal);
process.exit(fallback.code);
