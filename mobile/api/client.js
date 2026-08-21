// api/client.js — HTTP client dengan retry otomatis saat kena 429
import { BASE_URL } from "../config";

function tidur(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function minta(path, opsi = {}, percobaan = 0) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opsi.headers || {}) },
    ...opsi,
  });

  // 429 = kena batas laju — mundur teratur lalu coba lagi (maks 3 kali)
  if (res.status === 429 && percobaan < 3) {
    const saran = Number(res.headers.get("Retry-After"));
    const jeda = Number.isFinite(saran) && saran > 0
      ? saran * 1000
      : 1000 * 2 ** percobaan; // 1s, 2s, 4s
    await tidur(jeda);
    return minta(path, opsi, percobaan + 1);
  }

  if (!res.ok) {
    const teks = await res.text().catch(() => "");
    const err = new Error(teks || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path, headers = {}) => minta(path, { headers }),
  post: (path, body, headers = {}) =>
    minta(path, { method: "POST", body: JSON.stringify(body), headers }),
};
