# BASELINE.md — Baseline Kinerja Awal

Tanggal pengukuran: 2026-08-22  
Mesin: Codespaces (container Ubuntu)  
Base URL: http://localhost:8080

## Metode

Pengukuran awal dilakukan memakai autocannon pada endpoint baca untuk mendapatkan baseline latency, throughput, dan error rate sebelum optimasi lanjutan.

## Perintah Uji

1) Endpoint sesi aktif

npx autocannon -c 50 -d 15 http://localhost:8080/v1/sessions

2) Endpoint katalog item

npx autocannon -c 50 -d 15 http://localhost:8080/v1/items

## Hasil Baseline

| Endpoint | Beban | p50 | p97.5 | p99 | Throughput rata-rata | Error/Non-2xx |
|---|---|---:|---:|---:|---:|---:|
| GET /v1/sessions | c=50, d=15s | 10 ms | 29 ms | 42 ms | 6,050 req/s | 90,730 non-2xx dari 90,755 req |
| GET /v1/items | c=50, d=15s | 54 ms | 134 ms | 154 ms | 797 req/s | 0 non-2xx (12k req) |

## Interpretasi Awal

1. Endpoint GET /v1/items cukup stabil untuk baseline baca.
2. Endpoint GET /v1/sessions menunjukkan error rate sangat tinggi saat beban 50 koneksi; ini menjadi prioritas investigasi bottleneck di lapisan scalable.
3. Baseline ini menjadi kolom sebelum untuk perbandingan optimasi berikutnya (replikasi layanan, tuning gateway, dan hardening dependency).
