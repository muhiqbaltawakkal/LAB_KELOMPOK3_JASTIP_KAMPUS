import Constants from "expo-constants";

const codespacesGateway = typeof window !== "undefined" && window.location?.hostname?.endsWith(".app.github.dev")
  ? `${window.location.protocol}//${window.location.hostname.replace(/-\d+\.app\.github\.dev$/, "-8080.app.github.dev")}`
  : null;
const configured = codespacesGateway || process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
export const API_URL = configured || "http://localhost:8080";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(path, { token, headers, retries = 3, ...options } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      });
    } catch {
      throw new Error(`Tidak dapat terhubung ke API (${API_URL})`);
    }
    if (response.status === 429 && attempt < retries) {
      const seconds = Number(response.headers.get("Retry-After"));
      await wait(Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 1000 * 2 ** attempt);
      continue;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }
}

export const api = {
  register: (data) => request("/v1/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email, password) => request("/v1/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: (token) => request("/v1/me", { token }),
  sessions: (page = 1) => request(`/v1/sessions?page=${page}&limit=20`),
  session: (id) => request(`/v1/sessions/${id}`),
  mySessions: (token) => request("/v1/sessions/me", { token }),
  items: () => request("/v1/items"),
  stores: () => request("/v1/toko"),
  createSession: (data, token) => request("/v1/sessions", { method: "POST", token, body: JSON.stringify({ biayaJasaPerUnit: 5000, ...data }) }),
  myStores: (token) => request("/v1/stores/me", { token }),
  createStore: (data, token) => request("/v1/stores", { method: "POST", token, body: JSON.stringify(data) }),
  myProducts: (token) => request("/v1/products/me", { token }),
  createProduct: async (data, token) => {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "foto") form.append(key, String(value));
    });
    if (data.foto) form.append("foto", data.foto.file || { uri: data.foto.uri, name: data.foto.fileName || `produk.${data.foto.mimeType?.split("/")[1] || "jpg"}`, type: data.foto.mimeType || "image/jpeg" });
    const response = await fetch(`${API_URL}/v1/products`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(payload.error || `HTTP ${response.status}`), { status: response.status });
    return payload;
  },
  disableProduct: (id, token) => request(`/v1/products/${id}`, { method: "DELETE", token }),
  createTitipan: (data, token, key) => request("/v1/titipan", {
    method: "POST", token, headers: { "Idempotency-Key": key }, body: JSON.stringify(data),
  }),
  myTitipan: (token) => request("/v1/titipan/me", { token }),
  penjastipTitipan: (token) => request("/v1/penjastip/titipan", { token }),
  reviseOffer: (id, amount, token) => request(`/v1/titipan/${id}/offers`, { method: "POST", token, body: JSON.stringify({ tawaranJasaPerUnit: amount }) }),
  decideOffer: (id, decision, token) => request(`/v1/offers/${id}`, { method: "PATCH", token, body: JSON.stringify({ decision }) }),
  cancelTitipan: (id, token) => request(`/v1/titipan/${id}/cancel`, { method: "POST", token }),
  pay: (data, key, token) => request("/v1/payments", {
    method: "POST", token, headers: { "Idempotency-Key": key }, body: JSON.stringify(data),
  }),
  payment: (id, token) => request(`/v1/payments/${id}`, { token }),
  confirmReceived: (id, token) => request(`/v1/tracking/${id}/confirm-received`, { method: "POST", token }),
  tracking: (id, token) => request(`/v1/tracking/${id}`, { token }),
  advanceTracking: (data, token) => request("/v1/tracking", { method: "POST", token, body: JSON.stringify(data) }),
  adminUsers: (token, q = "") => request(`/v1/admin/users?q=${encodeURIComponent(q)}&limit=100`, { token }),
  adminCreateUser: (data, token) => request("/v1/admin/users", { method: "POST", token, body: JSON.stringify(data) }),
  adminUpdateUser: (id, data, token) => request(`/v1/admin/users/${id}`, { method: "PATCH", token, body: JSON.stringify(data) }),
  adminDeleteUser: (id, token) => request(`/v1/admin/users/${id}`, { method: "DELETE", token }),
  adminStores: (token, q = "") => request(`/v1/admin/stores?q=${encodeURIComponent(q)}&limit=100`, { token }),
  adminCreateStore: (data, token) => request("/v1/admin/stores", { method: "POST", token, body: JSON.stringify(data) }),
  adminUpdateStore: (id, data, token) => request(`/v1/admin/stores/${id}`, { method: "PATCH", token, body: JSON.stringify(data) }),
  adminDeleteStore: (id, token) => request(`/v1/admin/stores/${id}`, { method: "DELETE", token }),
  adminProducts: (token, q = "") => request(`/v1/admin/products?q=${encodeURIComponent(q)}&limit=100`, { token }),
  adminCreateProduct: (data, token) => uploadAdminProduct("/v1/admin/products", "POST", data, token),
  adminUpdateProduct: (id, data, token) => data.foto ? uploadAdminProduct(`/v1/admin/products/${id}`, "PATCH", data, token) : request(`/v1/admin/products/${id}`, { method: "PATCH", token, body: JSON.stringify(data) }),
  adminDeleteProduct: (id, token) => request(`/v1/admin/products/${id}`, { method: "DELETE", token }),
  adminSessions: (token) => request("/v1/admin/sessions?limit=100", { token }),
  adminCloseSession: (id, token) => request(`/v1/admin/sessions/${id}`, { method: "PATCH", token, body: JSON.stringify({ status: "ditutup" }) }),
  adminOrders: (token) => request("/v1/admin/orders?limit=100", { token }),
  adminOrderStatus: (id, status, token) => request(`/v1/admin/orders/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
  adminPayments: (token) => request("/v1/admin/payments?limit=100", { token }),
  adminPaymentStatus: (id, status, token) => request(`/v1/admin/payments/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
  adminTracking: (token) => request("/v1/admin/tracking?limit=100", { token }),
  adminAddTracking: (data, token) => request("/v1/tracking", { method: "POST", token, body: JSON.stringify(data) }),
  adminAudit: (token) => request("/v1/admin/audit?limit=100", { token }),
};

async function uploadAdminProduct(path, method, data, token) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => { if (key !== "foto" && value !== undefined && value !== null) form.append(key, String(value)); });
  if (data.foto) form.append("foto", data.foto.file || { uri: data.foto.uri, name: data.foto.fileName || "produk.jpg", type: data.foto.mimeType || "image/jpeg" });
  const response = await fetch(`${API_URL}${path}`, { method, headers: { Authorization: `Bearer ${token}` }, body: form });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error || `HTTP ${response.status}`), { status: response.status });
  return payload;
}
