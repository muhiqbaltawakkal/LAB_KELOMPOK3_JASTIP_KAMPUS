// config.js — satu-satunya tempat menyimpan alamat API
// Prioritas:
// 1) EXPO_PUBLIC_API_URL (disarankan untuk Codespaces / Expo Go)
// 2) Deteksi otomatis hostname web yang sedang dibuka
// 3) localhost untuk pengembangan lokal
function detectWebBaseUrl() {
	if (typeof window === "undefined" || !window.location?.hostname) return null;
	const { protocol, hostname } = window.location;
	if (hostname.endsWith(".app.github.dev")) {
		return `${protocol}//${hostname.replace(/-\d+\.app\.github\.dev$/, "-8080.app.github.dev")}`;
	}
	if (hostname.endsWith(".exp.direct")) {
		return `${protocol}//${hostname.replace(/-\d+\.exp\.direct$/, "-8080.exp.direct")}`;
	}
	if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:8080";
	return `${protocol}//${hostname}:8080`;
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || detectWebBaseUrl() || "http://localhost:8080";

// Aturan dari lapisan Scalable
export const PAGE_SIZE = 20;         // maks 20 item per halaman
export const RATE_LIMIT = 60;        // maks 60 permintaan/menit/klien
