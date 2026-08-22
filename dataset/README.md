# Dataset — Jastip Kampus

Sumber resmi seed demo adalah `JastipKampus_Dataset.xlsx` dan 34 foto pada `JastipKampus_Gambar_Produk`. Manifest runtime hasil normalisasi berada pada `demo-seed.js`. File JSON lama dipertahankan sebagai arsip dan tidak dipakai karena berbeda dari workbook; lihat `docs/DATASET-AUDIT.md`.

**Dibuat oleh:** Rizki Amalia Rasyid (105841121223) — Data & Persistence Engineer

| File | Service | Isi |
|------|---------|-----|
| `catalog-seed.json` | catalog-service | Toko (20), Barang (49), Satuan (6) |
| `order-seed.json` | order-service | Sesi Jastip (10), Titipan (20) |
| `payment-seed.json` | payment-service | Transaksi (10), Saldo Tertahan (2), Riwayat Pelepasan (8) |
| `tracking-seed.json` | tracking-service | Riwayat Status Titipan (41 event) |

## Relasi Antar Data

```
toko (catalog) ──< barang (catalog)
sesi_jastip (order) ──< titipan (order) ──< riwayat_status (tracking)
titipan (order) ──< transaksi (payment) ──< riwayat_pelepasan (payment)
```

## Status Titipan

| Status | Keterangan |
|--------|-----------|
| `diproses` | Titipan diterima, sedang dibelikan |
| `menunggu_pembayaran` | Menunggu konfirmasi pembayaran |
| `selesai` | Barang sudah diterima pemesan |

## Status Transaksi

| Status | Keterangan |
|--------|-----------|
| `tertahan` | Dana sedang ditahan (escrow) |
| `dilepas` | Dana dilepas ke pembuka jastip |


## Relasi Antar Data

```
toko (catalog) ──< barang (catalog)
sesi_jastip (order) ──< titipan (order) ──< riwayat_status (tracking)
titipan (order) ──< transaksi (payment) ──< riwayat_pelepasan (payment)
```

## Status Titipan

| Status | Keterangan |
|--------|-----------|
| `diproses` | Titipan diterima, sedang dibelikan |
| `menunggu_pembayaran` | Menunggu konfirmasi pembayaran |
| `selesai` | Barang sudah diterima pemesan |

## Status Transaksi

| Status | Keterangan |
|--------|-----------|
| `tertahan` | Dana sedang ditahan (escrow) |
| `dilepas` | Dana dilepas ke pembuka jastip |
