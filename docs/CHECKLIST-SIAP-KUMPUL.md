# Checklist Siap Kumpul - Jastip Kampus

## 1) Artefak Wajib
- [x] Kontrak API v1 tersedia di [openapi.yaml](../openapi.yaml)
- [x] Dokumentasi arsitektur tersedia di [docs/ARSITEKTUR.md](ARSITEKTUR.md)
- [x] Daftar endpoint tersedia di [docs/ENDPOINTS.md](ENDPOINTS.md)
- [x] Laporan uji tersedia di [docs/LAPORAN-UJI.md](LAPORAN-UJI.md)

## 2) Kesesuaian Studi Kasus
- [x] Order service mengelola sesi, titipan, tawaran, dan kapasitas: [services/order-service/index.js](../services/order-service/index.js)
- [x] Catalog service mengelola toko dan produk: [services/catalog-service/index.js](../services/catalog-service/index.js)
- [x] Payment service menahan dan melepas escrow: [services/payment-service/index.js](../services/payment-service/index.js)
- [x] Tracking service melacak status dititip -> dibelanjakan -> diantar -> diterima: [services/tracking-service/index.js](../services/tracking-service/index.js)

## 3) Bukti Endpoint Inti (OpenAPI)
- [x] Sesi jastip: [openapi.yaml](../openapi.yaml#L139)
- [x] Titipan: [openapi.yaml](../openapi.yaml#L155)
- [x] Payment/escrow: [openapi.yaml](../openapi.yaml#L194)
- [x] Tracking: [openapi.yaml](../openapi.yaml#L206)

## 4) Anti Rebutan Kapasitas Saat Ramai
- [x] Reservasi kapasitas dilakukan atomik di transaksi DB, menolak jika melebihi kapasitas
- [x] Implementasi ada di endpoint titipan pada [services/order-service/index.js](../services/order-service/index.js)

## 5) Status Verifikasi Runtime
- [x] Seed demo dan validasi manifest lulus
- [x] Smoke test end-to-end lulus (direct + negotiation + escrow release)

## 6) Link Serah Artefak
Gunakan URL file ini saat submit:
- https://github.com/muhiqbaltawakkal/LAB_KELOMPOK3_JASTIP_KAMPUS/blob/main/openapi.yaml

## 7) Cek Cepat Sebelum Klik Serah
- [ ] URL bukan placeholder owner/repo
- [ ] URL mengarah ke branch main
- [ ] File yang dibuka benar openapi.yaml
- [ ] Repo dapat diakses evaluator (public/diundang)
- [ ] Tidak ada typo saat paste link di kotak serah artefak
