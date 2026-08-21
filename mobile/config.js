// config.js — satu-satunya tempat menyimpan alamat API
// Ganti BASE_URL dengan IP laptop saat menjalankan di HP (jangan pakai localhost)
// Contoh: export const BASE_URL = "http://192.168.1.10:8080";
export const BASE_URL = "https://super-doodle-x55rqgpqjrqq267vj-8080.app.github.dev"; // Codespaces port 8080

// Aturan dari lapisan Scalable
export const PAGE_SIZE = 20;         // maks 20 item per halaman
export const RATE_LIMIT = 60;        // maks 60 permintaan/menit/klien
