# Laporan Lengkap Program Jastip Kampus

## 1. Ringkasan Eksekutif

Jastip Kampus adalah platform titip-beli antar mahasiswa berbasis microservices. Sistem ini menangani alur registrasi, login, pembuatan toko dan produk, pembukaan sesi jastip, pemesanan titipan, pembayaran escrow, tracking status, dan konfirmasi selesai.

Tujuan utama program:

1. Menjaga konsistensi data saat request paralel.
2. Mencegah oversell pada sesi dengan kapasitas terbatas.
3. Menyediakan alur bisnis yang aman, jelas, dan mudah diuji.

## 2. Identitas Proyek

- Nama sistem: Jastip Kampus
- Repository: `LAB_KELOMPOK3_JASTIP_KAMPUS`
- Arsitektur: Microservices
- Kontrak API: OpenAPI 3.0.3
- Runtime: Docker Compose

## 3. Ruang Lingkup

Fitur utama:

1. Login dan registrasi JWT.
2. Manajemen toko dan produk.
3. Pembuatan sesi jastip.
4. Pembuatan titipan dan negosiasi biaya jasa.
5. Pembayaran escrow simulasi.
6. Tracking status sampai transaksi selesai.
7. Pengujian unit, smoke test, lint OpenAPI, dan baseline performa.

## 4. Arsitektur Sistem

Komponen utama:

1. `nginx` sebagai API gateway.
2. `catalog-service`
3. `order-service`
4. `payment-service`
5. `tracking-service`
6. `PostgreSQL`
7. `Redis`

Pendekatan database-per-service dipakai agar tiap layanan memiliki batas data yang jelas dan tidak saling mengganggu.

## 5. Alur Bisnis

1. Pengguna registrasi dan login.
2. Pengguna memilih mode Penitip atau Penjastip.
3. Penjastip membuat toko dan produk.
4. Penjastip membuka sesi jastip.
5. Penitip memilih sesi lalu membuat titipan.
6. Penitip melakukan pembayaran.
7. Penjastip memperbarui status tracking.
8. Penitip konfirmasi barang diterima.
9. Dana escrow dilepas ke Penjastip.

## 6. Endpoint Kritis

- Auth: `POST /v1/register`, `POST /v1/login`
- Catalog: `POST /v1/stores`, `POST /v1/products`, `GET /v1/items`
- Session: `GET /v1/sessions`, `POST /v1/sessions`
- Titipan: `POST /v1/titipan`
- Pembayaran: `POST /v1/payments`
- Tracking: `POST /v1/tracking`, `GET /v1/tracking/{titipanId}`

## 7. Strategi Pengujian

Pengujian dilakukan pada beberapa level:

1. Unit test per service.
2. Smoke test end-to-end.
3. Contract lint OpenAPI.
4. Error testing pada UI, network, dan DevTools.

## 8. Hasil Error Testing

### 8.1 Gagal koneksi tunnel / API

#### 1) ERR_NGROK_3200
![ERR_NGROK_3200](docs/gambarErrorTesting/01_ngrok_offline_err_ngrok_3200.png)

**Masalah:** endpoint tunnel offline, sehingga aplikasi publik tidak bisa diakses.  
**Solusi:** restart tunnel/ngrok, cek status domain publik, lalu pastikan URL publik mengarah ke service yang aktif.

#### 2) Tidak dapat terhubung ke API
![Tidak dapat terhubung ke API](docs/gambarErrorTesting/02_tidak_terhubung_ke_api.png)

**Masalah:** frontend gagal menghubungi backend.  
**Solusi:** cek `BASE_URL`, pastikan backend hidup, dan pastikan device/client berada di jaringan yang sama atau URL publik sudah benar.

#### 3) HTTP 503 Server Error
![HTTP 503](docs/gambarErrorTesting/03_http_503_server_error.png)

**Masalah:** service belum siap melayani request.  
**Solusi:** periksa healthcheck, restart service yang bermasalah, dan pastikan dependency seperti DB/Redis sudah ready.

#### 4) Layar gagal memuat hitam
![Layar gagal memuat hitam](docs/gambarErrorTesting/04_layar_gagal_memuat_hitam.png)

**Masalah:** UI fallback tampil karena data gagal dimuat.  
**Solusi:** tambahkan handling error dan loading state yang lebih jelas, lalu tampilkan pesan retry.

#### 5) Login form gagal memuat
![Login form gagal memuat](docs/gambarErrorTesting/05_login_form_gagal_memuat.png)

**Masalah:** form login tampil tetapi request tidak berhasil.  
**Solusi:** validasi URL API, token, dan koneksi jaringan; tambahkan pesan error yang lebih spesifik.

### 8.2 Error validasi dan fallback form

#### 6) Login form validasi error 01
![Validasi error 01](docs/gambarErrorTesting/06_login_form_validasi_error_01.png)

**Masalah:** submit gagal karena backend tidak menerima data.  
**Solusi:** pastikan field wajib terisi dan payload sesuai schema endpoint.

#### 7) Login form validasi error 02
![Validasi error 02](docs/gambarErrorTesting/07_login_form_validasi_error_02.png)

**Masalah:** error serupa pada kondisi input berbeda.  
**Solusi:** konsistenkan validasi form di frontend sebelum request dikirim.

#### 8) Login form validasi error 03
![Validasi error 03](docs/gambarErrorTesting/08_login_form_validasi_error_03.png)

**Masalah:** request tetap gagal karena data tidak valid atau API tidak bisa dijangkau.  
**Solusi:** tampilkan validasi inline agar user tahu field mana yang salah.

#### 9) Login form validasi error 04
![Validasi error 04](docs/gambarErrorTesting/09_login_form_validasi_error_04.png)

**Masalah:** skenario error lain pada flow autentikasi.  
**Solusi:** buat pesan error berbeda untuk kasus koneksi, auth, dan validasi.

### 8.3 DevTools: 400, 403, payload, dan response

#### 10) DevTools network error 400
![Network error 400](docs/gambarErrorTesting/10_devtools_network_error_400.png)

**Masalah:** `POST /v1/sessions` menghasilkan **400 Bad Request**.  
**Solusi:** cek struktur payload, field wajib, dan format tanggal/angka.

#### 11) DevTools network error 403
![Network error 403](docs/gambarErrorTesting/11_devtools_network_error_403.png)

**Masalah:** `POST /v1/products` ditolak dengan **403 Forbidden**.  
**Solusi:** pastikan token login valid dan role user sesuai untuk akses endpoint.

#### 12) DevTools request detail error
![Request detail error](docs/gambarErrorTesting/12_devtools_request_detail_error.png)

**Masalah:** detail request menunjukkan backend menolak konteks sesi.  
**Solusi:** verifikasi session ID, token, dan status sesi yang aktif.

#### 13) DevTools payload error
![Payload error](docs/gambarErrorTesting/13_devtools_payload_error.png)

**Masalah:** payload tidak sesuai kebutuhan endpoint.  
**Solusi:** sinkronkan frontend dengan kontrak API, khususnya nama field dan tipe datanya.

#### 14) DevTools empty response error
![Empty response error](docs/gambarErrorTesting/14_devtools_empty_response_error.png)

**Masalah:** preflight/request tidak mengembalikan isi response yang berguna.  
**Solusi:** cek CORS, route, dan middleware yang memproses request sebelum backend utama.

#### 15) DevTools headers error
![Headers error](docs/gambarErrorTesting/15_devtools_headers_error.png)

**Masalah:** header request perlu diperiksa saat request gagal.  
**Solusi:** pastikan `Authorization`, `Content-Type`, dan header CORS sesuai.

#### 16) DevTools failed to load response
![Failed to load response](docs/gambarErrorTesting/16_devtools_failed_to_load_response.png)

**Masalah:** DevTools tidak bisa menampilkan isi response karena preflight gagal.  
**Solusi:** fokus pada izin CORS dan endpoint backend yang menangani OPTIONS.

#### 17) DevTools response error
![Response error](docs/gambarErrorTesting/17_devtools_response_error.png)

**Masalah:** response berisi `toko aktif bukan milik owner`. Ini penolakan aturan bisnis.  
**Solusi:** filter data toko berdasarkan owner yang login atau tampilkan pesan yang lebih ramah.

### 8.4 Error login dan dashboard

#### 18) Login error server side 01
![Login error server side 01](docs/gambarErrorTesting/18_login_error_server_side_01.png)

**Masalah:** login gagal karena API tidak terhubung.  
**Solusi:** cek backend auth service dan URL gateway.

#### 19) Login error server side 02
![Login error server side 02](docs/gambarErrorTesting/19_login_error_server_side_02.png)

**Masalah:** register/login gagal walau form terisi.  
**Solusi:** pastikan payload register sesuai schema backend.

#### 20) Login error server side 03
![Login error server side 03](docs/gambarErrorTesting/20_login_error_server_side_03.png)

**Masalah:** error koneksi API pada flow autentikasi lain.  
**Solusi:** tambahkan retry atau indikator status server.

#### 21) Login error validasi
![Login error validasi](docs/gambarErrorTesting/21_login_error_validasi.png)

**Masalah:** input tidak diterima oleh backend.  
**Solusi:** lakukan validasi frontend sebelum submit.

#### 22) Dashboard error data toko
![Dashboard error data toko](docs/gambarErrorTesting/22_dashboard_error_data_toko.png)

**Masalah:** dashboard tidak bisa menampilkan data toko karena request gagal.  
**Solusi:** tampilkan state kosong, error banner, dan tombol retry agar user tetap mendapat informasi.

## 9. Kesimpulan

Program Jastip Kampus sudah memiliki alur bisnis yang lengkap dan cocok untuk skenario microservices.  
Hasil error testing menunjukkan masalah utama berada pada koneksi API, status HTTP, validasi payload, dan aturan bisnis.

Solusi umumnya:

1. Pastikan backend dan tunnel aktif.
2. Selaraskan frontend dengan kontrak API.
3. Tambahkan validasi input lebih awal.
4. Tampilkan pesan error yang jelas.
5. Sediakan retry dan fallback UI.