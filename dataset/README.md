# Dataset — Jastip Kampus

Folder ini berisi seed data (data awal) untuk seluruh microservice.  
Data ini digunakan langsung dari memori pada **Lapisan 1** dan akan dipindahkan ke database pada **Lapisan 2**.

| File | Service | Isi |
|------|---------|-----|
| `catalog-seed.json` | catalog-service | Toko (4), Barang (12), Satuan (5) |
| `order-seed.json` | order-service | Sesi Jastip (4), Titipan (8) |
| `payment-seed.json` | payment-service | Transaksi (5), Saldo Tertahan (2), Riwayat Pelepasan (3) |
| `tracking-seed.json` | tracking-service | Riwayat Status Titipan (18 event) |

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
