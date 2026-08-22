# LAPORAN-UJI.md — Hasil Uji Sistem Jastip Kampus

**Kelompok:** Kelompok 3
**Tema:** Jastip Kampus
**Pelapor:** Rizki Amalia Rasyid (105841121223) — Data & Persistence Engineer

---

## Alur Ujung-ke-Ujung

Alur bisnis yang diuji (2 role):
> registrasi/login → penjastip buka sesi → penitip buat titipan → opsional tawar → bayar escrow → tracking sampai diterima → transaksi selesai

### Langkah Uji

```bash
BASE=http://localhost:8080

# 1) Registrasi akun penjastip
EMAIL_PENJASTIP="penjastip.$(date +%s)@example.com"
curl -s -X POST $BASE/v1/register \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Penjastip Uji","email":"'"$EMAIL_PENJASTIP"'","password":"Password123!","noHp":"081111111111","kampus":"Unismuh"}'

# 2) Login penjastip
TOKEN_PENJASTIP=$(curl -s -X POST $BASE/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"'"$EMAIL_PENJASTIP"'","password":"Password123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

# 3) Buat toko penjastip
TOKO_JSON=$(curl -s -X POST $BASE/v1/stores \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Toko Uji E2E","alamat":"Kampus A","kategori":"Makanan"}')
TOKO_ID=$(echo "$TOKO_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).id")

# 4) Buat produk penjastip
PRODUK_JSON=$(curl -s -X POST $BASE/v1/products \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -F "tokoId=$TOKO_ID" \
  -F "nama=Produk Uji E2E" \
  -F "kategori=Minuman" \
  -F "harga=18000" \
  -F "stok=50" \
  -F "satuan=pcs")
PRODUK_ID=$(echo "$PRODUK_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).id")

# 5) Buka sesi jastip
BATAS=$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%SZ")
SESI_JSON=$(curl -s -X POST $BASE/v1/sessions \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -H 'Content-Type: application/json' \
  -d '{"storeId":'"$TOKO_ID"',"productIds":['"$PRODUK_ID"'],"batasWaktu":"'"$BATAS"'","kapasitas":5,"biayaJasaPerUnit":5000}')
SESI_ID=$(echo "$SESI_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).id")

# 6) Registrasi dan login akun penitip
EMAIL_PENITIP="penitip.$(date +%s)@example.com"
curl -s -X POST $BASE/v1/register \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Penitip Uji","email":"'"$EMAIL_PENITIP"'","password":"Password123!","noHp":"082222222222","kampus":"Unismuh"}'

TOKEN_PENITIP=$(curl -s -X POST $BASE/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"'"$EMAIL_PENITIP"'","password":"Password123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

# 7) Penitip lihat sesi aktif
curl -s "$BASE/v1/sessions?page=1&limit=20"

# 8) Penitip buat titipan
IDEMPOTENCY="titipan-e2e-$(date +%s)"
TITIPAN_JSON=$(curl -s -X POST $BASE/v1/titipan \
  -H "Authorization: Bearer $TOKEN_PENITIP" \
  -H "Idempotency-Key: $IDEMPOTENCY" \
  -H 'Content-Type: application/json' \
  -d '{"sesiId":'"$SESI_ID"',"barangId":'"$PRODUK_ID"',"qty":1,"varian":"normal","catatan":"uji e2e","mode":"langsung"}')
TITIPAN_ID=$(echo "$TITIPAN_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).id")

# 9) Penitip bayar escrow
PAY_KEY="pay-e2e-$(date +%s)"
curl -s -X POST $BASE/v1/payments \
  -H "Authorization: Bearer $TOKEN_PENITIP" \
  -H "Idempotency-Key: $PAY_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"titipanId":'"$TITIPAN_ID"',"amount":23000,"method":"simulasi"}'

# 10) Penjastip dorong tracking sampai diantar
curl -s -X POST $BASE/v1/tracking \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -H 'Content-Type: application/json' \
  -d '{"titipanId":'"$TITIPAN_ID"',"status":"dibelanjakan"}'

curl -s -X POST $BASE/v1/tracking \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -H 'Content-Type: application/json' \
  -d '{"titipanId":'"$TITIPAN_ID"',"status":"diantar"}'

# 11) Penitip konfirmasi diterima
curl -s -X POST $BASE/v1/tracking/$TITIPAN_ID/confirm-received \
  -H "Authorization: Bearer $TOKEN_PENITIP"

# 12) Verifikasi riwayat tracking
curl -s $BASE/v1/tracking/$TITIPAN_ID
```

---

## Uji Kelebihan Jual (Anti-Oversell)

Kapasitas sesi diatur kecil, lalu ditembak request titipan paralel untuk membuktikan kapasitas tidak jebol.

```bash
BASE=http://localhost:8080

# Gunakan TOKEN_PENITIP, SESI_ID, PRODUK_ID dari langkah uji E2E di atas.
# Misal kapasitas sesi = 5, maka sukses <= 5 dan sisanya 409.

berhasil=0; ditolak=0
for i in $(seq 1 50); do
  key="storm-$i-$(date +%s%N)"
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/v1/titipan \
    -H "Authorization: Bearer $TOKEN_PENITIP" \
    -H "Idempotency-Key: $key" \
    -H 'Content-Type: application/json' \
    -d '{"sesiId":'"$SESI_ID"',"barangId":'"$PRODUK_ID"',"qty":1,"varian":"storm","catatan":"uji kapasitas","mode":"langsung"}')
  if [ "$code" = "201" ]; then berhasil=$((berhasil+1))
  else ditolak=$((ditolak+1)); fi
done
echo "berhasil=$berhasil ditolak=$ditolak"
```

Hasil yang diharapkan:
1. `berhasil` tidak melebihi kapasitas sesi.
2. request berlebih ditolak dengan `409` (penuh/tutup/kedaluwarsa) atau `429` (rate limit).

Mekanisme:
1. `order-service` memakai reservasi kapasitas atomik dan idempotency key.
2. Kapasitas dilepas tepat sekali saat batal/expired.

---

## Skenario Tawar (Opsional)

Jalur ini dipakai jika penitip tidak langsung setuju biaya jasa.

```bash
# 1) Penitip kirim tawaran jasa
OFFER_JSON=$(curl -s -X POST $BASE/v1/titipan/$TITIPAN_ID/offers \
  -H "Authorization: Bearer $TOKEN_PENITIP" \
  -H 'Content-Type: application/json' \
  -d '{"tawaranJasaPerUnit":3000}')
OFFER_ID=$(echo "$OFFER_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).id")

# 2) Penjastip putuskan tawaran
curl -s -X PATCH $BASE/v1/offers/$OFFER_ID \
  -H "Authorization: Bearer $TOKEN_PENJASTIP" \
  -H 'Content-Type: application/json' \
  -d '{"decision":"accepted"}'
```

---

## Endpoint yang Tersedia

| Layanan | Port | Endpoint |
|---------|------|----------|
| catalog-service | 3001 | `POST /v1/stores`, `POST /v1/products`, `GET /v1/items`, `GET /v1/toko`, `GET /health` |
| order-service | 3002 | `POST /v1/register`, `POST /v1/login`, `GET/POST /v1/sessions`, `POST /v1/titipan`, `POST /v1/titipan/{id}/offers`, `PATCH /v1/offers/{id}`, `POST /v1/titipan/{id}/cancel`, `GET /health` |
| payment-service | 3003 | `POST /v1/payments`, `GET /v1/payments/{titipanId}`, `GET /health` |
| tracking-service | 3004 | `GET /v1/tracking/{titipanId}`, `POST /v1/tracking`, `POST /v1/tracking/{titipanId}/confirm-received`, `GET /health` |
| nginx | 8080 | Gateway semua service (`/v1/*`) |

---

## Cara Menjalankan

```bash
docker compose up --build -d
docker compose ps  # semua layanan "running"
```

Hentikan:
```bash
docker compose down
```
