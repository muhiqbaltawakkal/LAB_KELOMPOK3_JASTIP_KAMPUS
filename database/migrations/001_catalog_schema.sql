-- ============================================================
-- Migration 001: catalog-service schema + seed data
-- Service  : catalog-service (port 3001)
-- Database : catalog_db
-- ============================================================

CREATE TABLE IF NOT EXISTS satuan (
  id         SERIAL PRIMARY KEY,
  kode       VARCHAR(20)  NOT NULL UNIQUE,
  nama       VARCHAR(50)  NOT NULL,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS toko (
  id        SERIAL PRIMARY KEY,
  nama      VARCHAR(100) NOT NULL,
  pemilik   VARCHAR(100) NOT NULL,
  lokasi    TEXT         NOT NULL,
  kategori  VARCHAR(50)  NOT NULL,
  aktif     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barang (
  id           SERIAL PRIMARY KEY,
  toko_id      INT          NOT NULL REFERENCES toko(id) ON DELETE CASCADE,
  nama         VARCHAR(150) NOT NULL,
  kategori     VARCHAR(50)  NOT NULL,
  satuan       VARCHAR(20)  NOT NULL REFERENCES satuan(kode),
  harga_acuan  INT          NOT NULL CHECK (harga_acuan >= 0),
  stok         INT          NOT NULL DEFAULT 0 CHECK (stok >= 0),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barang_toko_id ON barang(toko_id);
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori);
CREATE INDEX IF NOT EXISTS idx_toko_aktif ON toko(aktif);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO satuan (kode, nama, keterangan) VALUES
  ('pcs',   'Pieces',   'Satuan per buah'),
  ('set',   'Set',      'Satuan per set/paket'),
  ('lusin', 'Lusin',    'Satuan per 12 buah'),
  ('box',   'Box',      'Satuan per kotak'),
  ('kg',    'Kilogram', 'Satuan berat'),
  ('strip', 'Strip',    'Satuan per strip/lembar obat')
ON CONFLICT (kode) DO NOTHING;

INSERT INTO toko (id, nama, pemilik, lokasi, kategori, aktif) VALUES
  (1,  'Chatime Losari',               'PT Pangan Lestari',               'Pantai Losari, Jl. Penghibur No.1, Makassar',                       'Minuman Kekinian',      true),
  (2,  'Mie Titi Makassar',            'Keluarga Titi',                   'Jl. Irian No.18, Makassar',                                         'Makanan Khas',          true),
  (3,  'Gramedia Karebosi',            'PT Gramedia Asri Media',          'Mall Karebosi Link Lt.2, Jl. Jend. Ahmad Yani, Makassar',            'Buku & Alat Tulis',     true),
  (4,  'Erafone Trans Studio Mall',    'PT Erafone Artha Retailindo',     'Trans Studio Mall Lt.1, Jl. Metro Tanjung Bunga, Makassar',          'Elektronik',            true),
  (5,  'Indomaret Tamalanrea',         'PT Indomarco Prismatama',         'Jl. Perintis Kemerdekaan KM.10, Tamalanrea, Makassar',              'Minimarket',            true),
  (6,  'Pisang Ijo Bu Budi',           'Hj. Budi Rahayu',                'Jl. Penghibur No.48A, Pantai Losari, Makassar',                     'Kuliner Khas',          true),
  (7,  'Coto Makassar Nusantara',      'H. Syamsul Bahri',               'Jl. Nusantara No.32, Makassar',                                     'Makanan Khas',          true),
  (8,  'Konro Bakar Karebosi',         'Keluarga Haris',                 'Jl. Gunung Lompobattang No.41, Makassar',                           'Makanan Khas',          true),
  (9,  'Kopi Torabika Cafe Panakkukang','PT Torabika Eka Semesta',        'Mall Panakkukang Lt.1, Jl. Boulevard, Makassar',                    'Kafe & Kopi',           true),
  (10, 'J.CO Donuts & Coffee TSM',     'PT J.CO Donuts Indonesia',       'Trans Studio Mall Lt.GF, Jl. Metro Tanjung Bunga, Makassar',         'Kafe & Kopi',           true),
  (11, 'Alfamart Perintis',            'PT Sumber Alfaria Trijaya',      'Jl. Perintis Kemerdekaan KM.12, Makassar',                          'Minimarket',            true),
  (12, 'Samsung Experience Store MaRI','PT Samsung Electronics Indonesia','Mall Ratu Indah Lt.1, Jl. Dr. Sam Ratulangi, Makassar',             'Elektronik',            true),
  (13, 'Burger King Karebosi',         'PT Sari Burger Indonesia',       'Mall Karebosi Link Lt.GF, Jl. Jend. Ahmad Yani, Makassar',          'Fast Food',             true),
  (14, 'KFC Panakkukang',              'PT Fast Food Indonesia',         'Mall Panakkukang Lt.GF, Jl. Boulevard, Makassar',                   'Fast Food',             true),
  (15, 'Toko Buku Fajar Bookshop',     'CV Fajar Media',                 'Jl. Urip Sumoharjo No.20, Makassar',                               'Buku & Alat Tulis',     true),
  (16, 'Miniso Panakkukang',           'PT Miniso Lifestyle Trading',    'Mall Panakkukang Lt.2, Jl. Boulevard, Makassar',                    'Lifestyle & Aksesoris', true),
  (17, 'Es Pisang Ijo Anugerah',       'Anugerah Barakah',               'Jl. Abdullah Dg. Sirua No.7, Panakkukang, Makassar',                'Kuliner Khas',          true),
  (18, 'Warung Pallubasa Serigala',    'H. Mappangara',                  'Jl. Serigala No.7, Makassar',                                       'Makanan Khas',          true),
  (19, 'Kopi Kanneng',                 'Muhamad Reza',                   'Jl. Hertasning Baru No.15, Makassar',                              'Kafe & Kopi',           true),
  (20, 'Apotik Kimia Farma Veteran',   'PT Kimia Farma Apotek',          'Jl. Veteran Selatan No.10, Makassar',                              'Apotek & Kesehatan',    true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO barang (id, toko_id, nama, kategori, satuan, harga_acuan, stok) VALUES
  (1,  1,  'Brown Sugar Boba Milk Tea (L)',       'Minuman',    'pcs',   42000,   100),
  (2,  1,  'Matcha Latte (M)',                    'Minuman',    'pcs',   35000,   100),
  (3,  1,  'Classic Milk Tea (L)',                'Minuman',    'pcs',   32000,   100),
  (4,  2,  'Mie Titi Original (Reguler)',         'Makanan',    'pcs',   35000,    50),
  (5,  2,  'Mie Titi Udang',                      'Makanan',    'pcs',   45000,    50),
  (6,  2,  'Es Teh Manis',                        'Minuman',    'pcs',    8000,   100),
  (7,  3,  'Buku Tulis Sinardunia A5 40 Lembar',  'Alat Tulis', 'pcs',    5500,   300),
  (8,  3,  'Pulpen Faber-Castell 0.5mm Hitam',    'Alat Tulis', 'pcs',    7000,   400),
  (9,  3,  'Stabilo Boss Highlighter Set 4 Warna','Alat Tulis', 'set',   28000,   150),
  (10, 3,  'Sticky Notes Post-it 3x3',            'Alat Tulis', 'pcs',   18000,   200),
  (11, 4,  'Samsung Galaxy A15 (4/128GB)',         'Elektronik', 'pcs', 2199000,    20),
  (12, 4,  'Kabel Data Anker USB-C 1m',           'Elektronik', 'pcs',   89000,    80),
  (13, 4,  'Earphone Samsung AKG Type-C',         'Elektronik', 'pcs',  150000,    60),
  (14, 5,  'Aqua 600ml',                          'Minuman',    'pcs',    4500,   500),
  (15, 5,  'Indomie Goreng',                      'Makanan',    'pcs',    3500,   400),
  (16, 5,  'Chitato Sapi Panggang 68g',            'Makanan',    'pcs',   12000,   200),
  (17, 6,  'Pisang Ijo Original (1 Porsi)',        'Kuliner',    'pcs',   20000,    60),
  (18, 6,  'Pisang Ijo Durian (1 Porsi)',          'Kuliner',    'pcs',   25000,    40),
  (19, 7,  'Coto Makassar (1 Mangkuk)',            'Makanan',    'pcs',   30000,    80),
  (20, 7,  'Ketupat (2 Biji)',                     'Makanan',    'pcs',    5000,   150),
  (21, 7,  'Es Kelapa Muda',                       'Minuman',    'pcs',   15000,    80),
  (22, 8,  'Konro Bakar (1 Porsi)',                'Makanan',    'pcs',   55000,    60),
  (23, 8,  'Sup Konro (1 Mangkuk)',                'Makanan',    'pcs',   60000,    50),
  (24, 9,  'Kopi Torabika Duo Sachet',             'Minuman',    'pcs',    3000,   500),
  (25, 9,  'Cappuccino Torabika (M)',              'Minuman',    'pcs',   22000,   100),
  (26, 10, 'J.CO Original Glazed (6 pcs)',         'Makanan',    'box',   75000,    50),
  (27, 10, 'Ice Blended Avocado (M)',              'Minuman',    'pcs',   48000,    80),
  (28, 11, 'Pocari Sweat 500ml',                   'Minuman',    'pcs',    8000,   400),
  (29, 11, 'Roti Tawar Sari Roti',                 'Makanan',    'pcs',   14000,   150),
  (30, 11, 'Mie Sedaap Goreng',                    'Makanan',    'pcs',    3500,   350),
  (31, 12, 'Samsung Galaxy S24 (8/256GB)',          'Elektronik', 'pcs',11999000,    10),
  (32, 12, 'Samsung Buds2 Pro',                    'Elektronik', 'pcs', 2199000,    25),
  (33, 13, 'Whopper Jr. Burger',                   'Makanan',    'pcs',   45000,   100),
  (34, 13, 'Chicken Fries (6 pcs)',                'Makanan',    'pcs',   35000,   100),
  (35, 14, 'KFC Original 2 Pcs + Nasi',            'Makanan',    'pcs',   55000,   100),
  (36, 14, 'Krushers Vanilla (M)',                 'Minuman',    'pcs',   28000,    80),
  (37, 15, 'Kamus Besar Bahasa Indonesia (KBBI)',   'Buku',       'pcs',  120000,    30),
  (38, 15, 'Buku Algoritma & Pemrograman',         'Buku',       'pcs',   85000,    40),
  (39, 16, 'Tumbler Miniso 500ml',                 'Aksesoris',  'pcs',   89000,    70),
  (40, 16, 'Pouch Kosmetik Miniso',                'Aksesoris',  'pcs',   55000,    60),
  (41, 16, 'Lampu Meja LED Miniso',                'Aksesoris',  'pcs',  149000,    35),
  (42, 17, 'Es Pisang Ijo Anugerah (1 Porsi)',     'Kuliner',    'pcs',   18000,    70),
  (43, 18, 'Pallubasa (1 Mangkuk)',                'Makanan',    'pcs',   35000,    60),
  (44, 18, 'Telur Pallubasa',                      'Makanan',    'pcs',    5000,   100),
  (45, 19, 'Kopi Susu Kanneng (M)',                'Minuman',    'pcs',   25000,   100),
  (46, 19, 'Es Kopi Americano (M)',                'Minuman',    'pcs',   22000,   100),
  (47, 20, 'Paracetamol 500mg (10 Tablet)',         'Obat',       'strip',  8000,   200),
  (48, 20, 'Vitamin C 1000mg Redoxon (10 Tab)',    'Suplemen',   'strip', 35000,   150),
  (49, 20, 'Masker Medis KF94 (10 pcs)',           'Kesehatan',  'box',   25000,   120)
ON CONFLICT (id) DO NOTHING;


CREATE TABLE IF NOT EXISTS satuan (
  id         SERIAL PRIMARY KEY,
  kode       VARCHAR(20)  NOT NULL UNIQUE,
  nama       VARCHAR(50)  NOT NULL,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS toko (
  id        SERIAL PRIMARY KEY,
  nama      VARCHAR(100) NOT NULL,
  pemilik   VARCHAR(100) NOT NULL,
  lokasi    TEXT         NOT NULL,
  kategori  VARCHAR(50)  NOT NULL,
  aktif     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barang (
  id           SERIAL PRIMARY KEY,
  toko_id      INT          NOT NULL REFERENCES toko(id) ON DELETE CASCADE,
  nama         VARCHAR(150) NOT NULL,
  kategori     VARCHAR(50)  NOT NULL,
  satuan       VARCHAR(20)  NOT NULL REFERENCES satuan(kode),
  harga_acuan  INT          NOT NULL CHECK (harga_acuan >= 0),
  stok         INT          NOT NULL DEFAULT 0 CHECK (stok >= 0),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index untuk pencarian barang berdasarkan toko
CREATE INDEX IF NOT EXISTS idx_barang_toko_id ON barang(toko_id);
-- Index untuk filter kategori
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori);
-- Index untuk filter toko aktif
CREATE INDEX IF NOT EXISTS idx_toko_aktif ON toko(aktif);
