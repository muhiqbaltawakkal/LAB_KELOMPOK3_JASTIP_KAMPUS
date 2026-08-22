import { spawn } from "node:child_process";

const codespaceName = process.env.CODESPACE_NAME;

if (!codespaceName) {
  console.error("CODESPACE_NAME tidak ditemukan. Jalankan perintah ini dari GitHub Codespaces.");
  process.exit(1);
}

const apiUrl = `https://${codespaceName}-8080.app.github.dev`;
console.log(`Expo Go akan memakai API: ${apiUrl}`);

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["expo", "start", "--tunnel", "--clear"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
