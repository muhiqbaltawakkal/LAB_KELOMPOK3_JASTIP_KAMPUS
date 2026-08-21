// api/endpoints.js — semua panggilan ke API Jastip Kampus
import { api } from "./client";

// Auth
export function login(user = "mhs") {
  return api.post("/v1/login", { user });
}

// Katalog — daftar sesi/barang jastip
export function getDaftarBarang(page = 1) {
  return api.get(`/v1/catalog?page=${page}`);
}

export function getDetailBarang(itemId) {
  return api.get(`/v1/items/${itemId}`);
}

// Order — buat titipan (sumber daya rebutan)
export function buatTitipan({ itemId, qty, token }) {
  return api.post(
    "/v1/orders",
    { itemId, qty },
    { Authorization: `Bearer ${token}` }
  );
}

// Payment
export function bayarOrder({ orderId, jumlah }) {
  return api.post("/v1/payments", { orderId, jumlah });
}

// Tracking
export function getTracking(orderId) {
  return api.get(`/v1/tracking/${orderId}`);
}
