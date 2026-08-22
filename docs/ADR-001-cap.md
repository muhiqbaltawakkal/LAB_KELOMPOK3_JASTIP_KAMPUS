# ADR-001 — Keputusan CAP untuk Jastip Kampus

Status: Accepted  
Tanggal: 2026-08-22

## Konteks

Sistem Jastip Kampus memiliki sumber daya rebutan: kapasitas sesi jastip. Saat trafik tinggi, sistem harus tetap menjaga agar total titipan tidak melebihi kapasitas.

## Keputusan

1. Operasi CP (Consistency over Availability):
   - POST /v1/titipan
   - PATCH /v1/offers/{id}
   - POST /v1/payments

2. Operasi AP (Availability over strict consistency):
   - GET /v1/sessions
   - GET /v1/items
   - GET /v1/toko

## Alasan

- Endpoint tulis yang menyentuh kapasitas/uang diprioritaskan konsisten untuk mencegah over-capacity dan transisi status yang salah.
- Endpoint baca tetap tersedia agar aplikasi mobile tetap responsif, termasuk saat degradasi parsial.

## Konsekuensi

- Pada gangguan dependency, endpoint CP dapat menolak request (409/429/503) daripada memalsukan sukses.
- Untuk endpoint AP, sistem boleh mengembalikan data cache/stale di sisi klien selama tidak mengubah sumber daya rebutan.

## Bukti Implementasi

- Proteksi kapasitas atomik di order-service untuk POST /v1/titipan.
- Retry + backoff untuk 429 pada mobile client.
- Alur escrow hanya dilepas setelah status diterima pada tracking.
