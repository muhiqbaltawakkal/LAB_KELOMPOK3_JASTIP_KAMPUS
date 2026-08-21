import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, Image, StyleSheet, SafeAreaView, StatusBar,
  Platform, Dimensions,
} from 'react-native';

// ─── PALETTE ────────────────────────────────────────────────
const C = {
  primary:   '#1E40AF',
  primary2:  '#2563EB',
  accent:    '#059669',
  accentBg:  '#D1FAE5',
  warn:      '#D97706',
  warnBg:    '#FEF3C7',
  danger:    '#DC2626',
  dangerBg:  '#FEE2E2',
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E2E8F0',
  text:      '#1E293B',
  muted:     '#64748B',
  light:     '#F1F5F9',
};

// ─── SEED DATA ───────────────────────────────────────────────
const CATALOG = [
  {
    id: 1, tokoId: 1, toko: 'Chatime Losari',
    nama: 'Brown Sugar Boba Milk Tea L',
    kategori: 'Minuman', harga: 42000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    deskripsi: 'Teh susu dengan topping boba brown sugar.',
  },
  {
    id: 2, tokoId: 1, toko: 'Chatime Losari',
    nama: 'Matcha Latte M',
    kategori: 'Minuman', harga: 35000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    deskripsi: 'Matcha latte premium dengan susu segar.',
  },
  {
    id: 3, tokoId: 1, toko: 'Chatime Losari',
    nama: 'Taro Milk Tea L',
    kategori: 'Minuman', harga: 38000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
    deskripsi: 'Minuman taro creamy dengan susu.',
  },
  {
    id: 4, tokoId: 1, toko: 'Chatime Losari',
    nama: 'Thai Milk Tea L',
    kategori: 'Minuman', harga: 36000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
    deskripsi: 'Teh susu thai klasik dengan rasa khas.',
  },
  {
    id: 5, tokoId: 2, toko: 'Mie Titi Makassar',
    nama: 'Mie Titi Original Reguler',
    kategori: 'Makanan', harga: 35000, satuan: 'porsi',
    img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    deskripsi: 'Mie kering khas Makassar dengan kuah kental.',
  },
  {
    id: 6, tokoId: 2, toko: 'Mie Titi Makassar',
    nama: 'Mie Titi Spesial Jumbo',
    kategori: 'Makanan', harga: 55000, satuan: 'porsi',
    img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    deskripsi: 'Porsi jumbo dengan topping lengkap.',
  },
  {
    id: 7, tokoId: 3, toko: 'Ayam Geprek Bu Rum',
    nama: 'Ayam Geprek Level 5',
    kategori: 'Makanan', harga: 22000, satuan: 'porsi',
    img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
    deskripsi: 'Ayam goreng crispy dengan sambal ulek pedas.',
  },
  {
    id: 8, tokoId: 3, toko: 'Ayam Geprek Bu Rum',
    nama: 'Paket Ayam Geprek + Nasi + Es Teh',
    kategori: 'Makanan', harga: 27000, satuan: 'paket',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    deskripsi: 'Paket komplit ayam geprek nasi dan minuman.',
  },
  {
    id: 9, tokoId: 4, toko: 'Martabak Hot Plate 99',
    nama: 'Martabak Manis Coklat Keju',
    kategori: 'Makanan', harga: 45000, satuan: 'loyang',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    deskripsi: 'Martabak manis lembut isi coklat dan keju.',
  },
  {
    id: 10, tokoId: 4, toko: 'Martabak Hot Plate 99',
    nama: 'Martabak Telur Sapi',
    kategori: 'Makanan', harga: 40000, satuan: 'loyang',
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
    deskripsi: 'Martabak telur isi daging sapi cincang.',
  },
  {
    id: 11, tokoId: 5, toko: 'Indomaret Tamalanrea',
    nama: 'Mie Instan Indomie Goreng',
    kategori: 'Kebutuhan', harga: 3500, satuan: 'bungkus',
    img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80',
    deskripsi: 'Mie goreng instan paling populer.',
  },
  {
    id: 12, tokoId: 5, toko: 'Indomaret Tamalanrea',
    nama: 'Air Mineral Aqua 1500ml',
    kategori: 'Minuman', harga: 5000, satuan: 'botol',
    img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
    deskripsi: 'Air mineral murni kemasan botol besar.',
  },
  {
    id: 13, tokoId: 6, toko: 'Sate Taichan Goreng',
    nama: 'Sate Taichan 10 Tusuk',
    kategori: 'Makanan', harga: 30000, satuan: 'porsi',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    deskripsi: 'Sate ayam bakar tanpa kecap dengan sambal.',
  },
  {
    id: 14, tokoId: 7, toko: 'Kopi Janji Jiwa Unhas',
    nama: 'Kopi Susu Gula Aren',
    kategori: 'Minuman', harga: 25000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    deskripsi: 'Kopi susu dengan gula aren asli.',
  },
  {
    id: 15, tokoId: 7, toko: 'Kopi Janji Jiwa Unhas',
    nama: 'Americano Es',
    kategori: 'Minuman', harga: 18000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&q=80',
    deskripsi: 'Espresso dengan air dingin segar.',
  },
  {
    id: 16, tokoId: 8, toko: "McDonald's Panakukang",
    nama: 'Paket McChicken Value',
    kategori: 'Makanan', harga: 45000, satuan: 'paket',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    deskripsi: 'McChicken burger + kentang goreng + minuman.',
  },
  {
    id: 17, tokoId: 8, toko: "McDonald's Panakukang",
    nama: 'McFlurry Oreo',
    kategori: 'Makanan', harga: 27000, satuan: 'cup',
    img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
    deskripsi: 'Es krim lembut dengan remahan oreo.',
  },
  {
    id: 18, tokoId: 9, toko: 'Bakso Mas Kumis',
    nama: 'Bakso Urat Komplit',
    kategori: 'Makanan', harga: 20000, satuan: 'mangkuk',
    img: 'https://images.unsplash.com/photo-1548869569-6e93b1c3a47b?w=400&q=80',
    deskripsi: 'Bakso urat empuk dengan kuah segar.',
  },
  {
    id: 19, tokoId: 10, toko: 'Es Pisang Ijo Ny. Ratih',
    nama: 'Es Pisang Ijo Reguler',
    kategori: 'Minuman', harga: 15000, satuan: 'porsi',
    img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80',
    deskripsi: 'Pisang balut tepung hijau siraman santan.',
  },
];

const SESI_AKTIF = [
  { id: 'S003', penjastip: 'J001', toko: 'Indomaret Tamalanrea', batas: '19:00', kapasitas: 15, diisi: 3 },
  { id: 'S004', penjastip: 'J003', toko: 'Kopi Janji Jiwa Unhas', batas: '16:00', kapasitas: 12, diisi: 4 },
  { id: 'S005', penjastip: 'J004', toko: "McDonald's Panakukang", batas: '20:00', kapasitas: 10, diisi: 2 },
];

const STATUS_TRACKING = ['dititip', 'dibelanjakan', 'diantar', 'diterima'];

// ─── HELPERS ────────────────────────────────────────────────
const rp = (n) => 'Rp ' + n.toLocaleString('id-ID');

// ─── BADGE ──────────────────────────────────────────────────
function Badge({ label, color = C.primary, bg }) {
  return (
    <View style={[s.badge, { backgroundColor: bg || color + '20' }]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── SERVICE TAG ────────────────────────────────────────────
function SvcTag({ name }) {
  const colors = {
    'order-service':   { bg: '#EFF6FF', c: '#1D4ED8' },
    'catalog-service': { bg: '#F0FDF4', c: '#15803D' },
    'payment-service': { bg: '#FFF7ED', c: '#C2410C' },
    'tracking-service':{ bg: '#FAF5FF', c: '#7E22CE' },
  };
  const col = colors[name] || { bg: C.light, c: C.muted };
  return (
    <View style={[s.svcTag, { backgroundColor: col.bg }]}>
      <Text style={[s.svcText, { color: col.c }]}>⚙ {name}</Text>
    </View>
  );
}

// ─── BUTTON ─────────────────────────────────────────────────
function Btn({ label, onPress, style, textStyle, outline, danger, disabled }) {
  const bg = danger ? C.danger : outline ? 'transparent' : C.primary;
  const tc = outline ? C.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        outline && { borderWidth: 1.5, borderColor: C.primary },
        danger && { backgroundColor: C.danger },
        style,
      ]}
    >
      <Text style={[s.btnText, { color: tc }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── INPUT ──────────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput style={s.input} placeholderTextColor={C.muted} {...props} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  SCREENS
// ─────────────────────────────────────────────────────────────

// 1. REGISTER
function RegisterScreen({ onNavigate }) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [kampus, setKampus] = useState('');
  const [pass, setPass] = useState('');

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.logoRow}>
        <View style={s.logoCircle}><Text style={s.logoIcon}>🛵</Text></View>
        <Text style={s.appTitle}>JastipKampus</Text>
      </View>
      <Text style={s.heading}>Daftar Akun</Text>
      <Text style={s.sub}>Layanan jastip terpercaya antar mahasiswa</Text>
      <View style={s.card}>
        <Input label="Nama Lengkap" value={nama} onChangeText={setNama} placeholder="Nama kamu" />
        <Input label="Email / No. HP" value={email} onChangeText={setEmail} placeholder="email@kampus.ac.id" keyboardType="email-address" />
        <Input label="No. HP" value={hp} onChangeText={setHp} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
        <Input label="Kampus" value={kampus} onChangeText={setKampus} placeholder="Universitas Muhammadiyah Makassar" />
        <Input label="Password" value={pass} onChangeText={setPass} placeholder="••••••••" secureTextEntry />
        <Btn label="Buat Akun" onPress={() => onNavigate('Login')} />
        <TouchableOpacity onPress={() => onNavigate('Login')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: C.muted }}>Sudah punya akun? <Text style={{ color: C.primary, fontWeight: '600' }}>Masuk</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 2. LOGIN
function LoginScreen({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.logoRow}>
        <View style={s.logoCircle}><Text style={s.logoIcon}>🛵</Text></View>
        <Text style={s.appTitle}>JastipKampus</Text>
      </View>
      <Text style={s.heading}>Masuk</Text>
      <Text style={s.sub}>Selamat datang kembali 👋</Text>
      <View style={s.card}>
        <Input label="Email / No. HP" value={email} onChangeText={setEmail} placeholder="email@kampus.ac.id" keyboardType="email-address" />
        <Input label="Password" value={pass} onChangeText={setPass} placeholder="••••••••" secureTextEntry />
        <Btn label="Masuk" onPress={() => onLogin()} />
        <TouchableOpacity onPress={() => onNavigate('Register')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: C.muted }}>Belum punya akun? <Text style={{ color: C.primary, fontWeight: '600' }}>Daftar</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 3. PILIH PERAN
function PilihPeranScreen({ onNavigate }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.container, { paddingTop: 40 }]}>
      <View style={s.logoRow}>
        <View style={s.logoCircle}><Text style={s.logoIcon}>🛵</Text></View>
        <Text style={s.appTitle}>JastipKampus</Text>
      </View>
      <Text style={s.heading}>Pilih Peranmu</Text>
      <Text style={s.sub}>Kamu mau jadi apa hari ini?</Text>
      <TouchableOpacity style={[s.peranCard, { borderColor: C.primary }]} onPress={() => onNavigate('PenjastipDashboard')}>
        <Text style={s.peranEmoji}>🛵</Text>
        <Text style={s.peranTitle}>Penjastip</Text>
        <Text style={s.peranDesc}>Buka sesi jastip, pergi ke toko, dan bantu penitip belanja.</Text>
        <Badge label="order-service" color={C.primary2} />
      </TouchableOpacity>
      <TouchableOpacity style={[s.peranCard, { borderColor: C.accent }]} onPress={() => onNavigate('PenitipBrowse')}>
        <Text style={s.peranEmoji}>📦</Text>
        <Text style={s.peranTitle}>Penitip</Text>
        <Text style={s.peranDesc}>Titip belanjaan ke penjastip yang sedang ada di toko favoritmu.</Text>
        <Badge label="catalog-service" color={C.accent} />
      </TouchableOpacity>
    </ScrollView>
  );
}

// 4. PENJASTIP DASHBOARD
function PenjastipDashboard({ onNavigate }) {
  const [toko, setToko] = useState('');
  const [batas, setBatas] = useState('');
  const [kap, setKap] = useState('');
  const [sesiAktif, setSesiAktif] = useState(null);

  const buka = () => {
    if (!toko || !batas) return;
    setSesiAktif({ toko, batas, kap: parseInt(kap) || 10, diisi: 0 });
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Dashboard Penjastip</Text>
        <SvcTag name="order-service" />
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Buka Sesi Jastip</Text>
        <Input label="Nama Toko / Tempat" value={toko} onChangeText={setToko} placeholder="cth: Indomaret Tamalanrea" />
        <Input label="Batas Waktu Order (HH:MM)" value={batas} onChangeText={setBatas} placeholder="17:00" />
        <Input label="Kapasitas Order" value={kap} onChangeText={setKap} placeholder="10" keyboardType="numeric" />
        <Btn label="Buka Sesi Jastip" onPress={buka} />
      </View>
      {sesiAktif && (
        <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: C.accent }]}>
          <Text style={s.cardTitle}>✅ Sesi Sedang Berjalan</Text>
          <Text style={s.infoRow}><Text style={s.infoKey}>Toko</Text>  {sesiAktif.toko}</Text>
          <Text style={s.infoRow}><Text style={s.infoKey}>Batas Waktu</Text>  {sesiAktif.batas}</Text>
          <Text style={s.infoRow}><Text style={s.infoKey}>Kapasitas</Text>  {sesiAktif.diisi}/{sesiAktif.kap} order</Text>
          <Badge label="Sesi Aktif" color={C.accent} />
        </View>
      )}
      <View style={s.card}>
        <Text style={s.cardTitle}>Sesi Aktif di Sekitarmu</Text>
        {SESI_AKTIF.map((sesi) => (
          <View key={sesi.id} style={s.sesiRow}>
            <Text style={s.sesiToko}>{sesi.toko}</Text>
            <Text style={s.sesiInfo}>Batas: {sesi.batas} · {sesi.diisi}/{sesi.kapasitas} order</Text>
          </View>
        ))}
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate('PilihPeran')} />
    </ScrollView>
  );
}

// 5. PENITIP BROWSE (catalog-service)
function PenitipBrowse({ onNavigate, onPilihBarang }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const cats = ['Semua', 'Makanan', 'Minuman', 'Kebutuhan'];
  const filtered = CATALOG.filter(
    (b) =>
      (filter === 'Semua' || b.kategori === filter) &&
      (b.nama.toLowerCase().includes(search.toLowerCase()) || b.toko.toLowerCase().includes(search.toLowerCase()))
  );
  const { width } = Dimensions.get('window');
  const cols = width >= 1200 ? 4 : width >= 800 ? 3 : width >= 500 ? 2 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView>
        <View style={s.topBar}>
          <Text style={s.topBarTitle}>Pilih Titipan</Text>
          <SvcTag name="catalog-service" />
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <TextInput
            style={s.searchBar}
            placeholder="Cari barang atau toko…"
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {cats.map((c) => (
              <TouchableOpacity key={c} onPress={() => setFilter(c)} style={[s.chip, filter === c && s.chipActive]}>
                <Text style={[s.chipText, filter === c && s.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
      <FlatList
        key={`cols-${cols}`}
        data={filtered}
        numColumns={cols}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 8, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.prodCard, { width: `${100 / cols}%` }]}
            onPress={() => onPilihBarang(item)}
          >
            <Image source={{ uri: item.img }} style={s.prodImg} resizeMode="cover" />
            <View style={s.prodBody}>
              <Text style={s.prodNama} numberOfLines={2}>{item.nama}</Text>
              <Text style={s.prodToko} numberOfLines={1}>{item.toko}</Text>
              <Text style={s.prodHarga}>{rp(item.harga)}</Text>
              <Badge label={item.kategori} color={item.kategori === 'Makanan' ? '#B45309' : item.kategori === 'Minuman' ? C.primary : C.muted} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: C.muted, marginTop: 40 }}>Tidak ada barang ditemukan.</Text>}
      />
      <View style={s.fabRow}>
        <Btn label="← Kembali" outline onPress={() => onNavigate('PilihPeran')} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// 6. FORM TITIPAN (order-service + catalog-service)
function FormTitipan({ barang, onNavigate, onLanjut }) {
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState('');
  const [sesiDipilih, setSesiDipilih] = useState(SESI_AKTIF[0]);
  const [inginTawar, setInginTawar] = useState(false);

  const total = barang.harga * jumlah;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Detail Titipan</Text>
        <SvcTag name="order-service" />
      </View>
      <View style={[s.card, { flexDirection: 'row', gap: 12 }]}>
        <Image source={{ uri: barang.img }} style={{ width: 80, height: 80, borderRadius: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{barang.nama}</Text>
          <Text style={s.prodToko}>{barang.toko}</Text>
          <Text style={s.prodHarga}>{rp(barang.harga)} / {barang.satuan}</Text>
          <SvcTag name="catalog-service" />
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Pilih Sesi Jastip</Text>
        {SESI_AKTIF.map((sesi) => (
          <TouchableOpacity
            key={sesi.id}
            style={[s.sesiRow, sesiDipilih?.id === sesi.id && { backgroundColor: '#EFF6FF', borderColor: C.primary, borderWidth: 1 }]}
            onPress={() => setSesiDipilih(sesi)}
          >
            <Text style={s.sesiToko}>{sesi.toko}</Text>
            <Text style={s.sesiInfo}>Batas {sesi.batas} · {sesi.diisi}/{sesi.kapasitas} order</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Jumlah &amp; Catatan</Text>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setJumlah(Math.max(1, jumlah - 1))}>
            <Text style={s.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyVal}>{jumlah}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setJumlah(jumlah + 1)}>
            <Text style={s.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Input placeholder="Catatan ke penjastip (opsional)…" value={catatan} onChangeText={setCatatan} multiline />
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>Harga Acuan</Text>
          <Text style={s.summaryVal}>{rp(barang.harga)} × {jumlah}</Text>
          <Text style={s.summaryLabel}>Biaya Jastip</Text>
          <Text style={s.summaryVal}>{rp(5000)}</Text>
          <View style={s.divider} />
          <Text style={[s.summaryLabel, { fontWeight: '700', color: C.text }]}>Total Estimasi</Text>
          <Text style={[s.summaryVal, { fontWeight: '700', color: C.primary, fontSize: 16 }]}>{rp(total + 5000)}</Text>
        </View>
      </View>
      <View style={s.rowGap}>
        <Btn label="💬 Ajukan Tawaran" outline onPress={() => onNavigate('TawarHarga', { barang, jumlah, catatan, sesi: sesiDipilih })} style={{ flex: 1 }} />
        <Btn label="Lanjut Bayar →" onPress={() => onLanjut({ barang, jumlah, catatan, sesi: sesiDipilih, total: total + 5000 })} style={{ flex: 1 }} />
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate('PenitipBrowse')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

// 7. TAWAR HARGA (order-service)
function TawarHargaScreen({ params, onNavigate, onLanjutBayar }) {
  const { barang, jumlah, catatan, sesi } = params;
  const [tawaran, setTawaran] = useState(String(barang.harga));
  const [status, setStatus] = useState(null); // null | 'menunggu' | 'disetujui' | 'ditolak'

  const ajukan = () => setStatus('menunggu');
  const simulasiSetuju = () => setStatus('disetujui');
  const simulasiTolak = () => setStatus('ditolak');

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Ajukan Tawaran</Text>
        <SvcTag name="order-service" />
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>{barang.nama}</Text>
        <Text style={s.prodToko}>{barang.toko}</Text>
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>Harga Acuan (catalog-service)</Text>
          <Text style={s.summaryVal}>{rp(barang.harga)}</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Tawaran Harga per {barang.satuan}</Text>
        <Input
          value={tawaran}
          onChangeText={setTawaran}
          placeholder="Masukkan tawaran harga"
          keyboardType="numeric"
        />
        {!status && <Btn label="Kirim Tawaran" onPress={ajukan} />}
        {status === 'menunggu' && (
          <View>
            <Badge label="⏳ Menunggu konfirmasi penjastip…" color={C.warn} bg={C.warnBg} />
            <View style={s.rowGap}>
              <Btn label="✅ Simulasi: Setuju" onPress={simulasiSetuju} style={{ flex: 1, backgroundColor: C.accent }} />
              <Btn label="❌ Simulasi: Tolak" danger onPress={simulasiTolak} style={{ flex: 1 }} />
            </View>
          </View>
        )}
        {status === 'disetujui' && (
          <View>
            <Badge label="✅ Tawaran Disetujui!" color={C.accent} bg={C.accentBg} />
            <Btn label="Lanjut Bayar →" onPress={() => onLanjutBayar({ barang, jumlah, catatan, sesi, total: parseInt(tawaran) * jumlah + 5000 })} style={{ marginTop: 12 }} />
          </View>
        )}
        {status === 'ditolak' && (
          <View>
            <Badge label="❌ Tawaran Ditolak" color={C.danger} bg={C.dangerBg} />
            <View style={s.rowGap}>
              <Btn label="Ubah Tawaran" outline onPress={() => setStatus(null)} style={{ flex: 1 }} />
              <Btn label="Batalkan" danger onPress={() => onNavigate('PenitipBrowse')} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate('FormTitipan')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

// 8. PEMBAYARAN (payment-service)
function PembayaranScreen({ order, onNavigate, onBayar }) {
  const [metode, setMetode] = useState('QRIS');
  const metodes = ['QRIS', 'GoPay', 'OVO', 'Dana', 'Transfer Bank'];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Pembayaran</Text>
        <SvcTag name="payment-service" />
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Ringkasan Order</Text>
        <View style={[s.rowGap, { alignItems: 'flex-start' }]}>
          <Image source={{ uri: order.barang.img }} style={{ width: 72, height: 72, borderRadius: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.prodNama}>{order.barang.nama}</Text>
            <Text style={s.prodToko}>{order.barang.toko}</Text>
            <Text style={s.sesiInfo}>Sesi: {order.sesi.toko} · batas {order.sesi.batas}</Text>
            <Text style={s.prodHarga}>× {order.jumlah}</Text>
          </View>
        </View>
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>Total Pembayaran</Text>
          <Text style={[s.summaryVal, { color: C.primary, fontWeight: '700', fontSize: 20 }]}>{rp(order.total)}</Text>
          <Text style={[s.summaryLabel, { color: C.muted, fontSize: 11 }]}>Dana akan ditahan (escrow) oleh payment-service hingga barang diterima.</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Metode Pembayaran</Text>
        {metodes.map((m) => (
          <TouchableOpacity key={m} style={[s.metodeRow, metode === m && { borderColor: C.primary, backgroundColor: '#EFF6FF' }]} onPress={() => setMetode(m)}>
            <View style={[s.radio, metode === m && { backgroundColor: C.primary }]} />
            <Text style={{ color: C.text, fontWeight: metode === m ? '600' : '400' }}>{m}</Text>
          </TouchableOpacity>
        ))}
        <Btn label={`Bayar ${rp(order.total)} via ${metode}`} onPress={() => onBayar(metode)} style={{ marginTop: 12 }} />
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate('FormTitipan')} />
    </ScrollView>
  );
}

// 9. TRACKING (tracking-service)
function TrackingScreen({ order, onNavigate }) {
  const [step, setStep] = useState(0);
  const steps = ['dititip', 'dibelanjakan', 'diantar', 'diterima'];
  const descs = [
    'Titipan dikonfirmasi oleh order-service. Penjastip akan segera berbelanja.',
    'Penjastip sedang membeli barang di ' + order.sesi.toko + '.',
    'Penjastip sedang dalam perjalanan mengantar barangmu.',
    'Barang telah diterima! payment-service melepaskan dana ke penjastip.',
  ];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Status Titipan</Text>
        <SvcTag name="tracking-service" />
      </View>
      <View style={[s.card, { flexDirection: 'row', gap: 12, alignItems: 'center' }]}>
        <Image source={{ uri: order.barang.img }} style={{ width: 60, height: 60, borderRadius: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={s.prodNama}>{order.barang.nama}</Text>
          <Text style={s.prodToko}>{order.sesi.toko}</Text>
          <Text style={s.prodHarga}>{rp(order.total)}</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Status Pengiriman</Text>
        {steps.map((st, i) => (
          <View key={st} style={s.trackRow}>
            <View style={[s.trackDot, i <= step ? { backgroundColor: C.primary } : { backgroundColor: C.border }]}>
              {i <= step && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.trackLabel, i <= step && { color: C.primary, fontWeight: '700' }]}>{st.toUpperCase()}</Text>
              {i === step && <Text style={s.trackDesc}>{descs[i]}</Text>}
            </View>
          </View>
        ))}
      </View>
      <SvcTag name="payment-service" />
      {step < 3 && (
        <Btn label={`Simulasi: ${steps[step + 1]?.toUpperCase() || 'SELESAI'} →`} onPress={() => setStep(Math.min(3, step + 1))} style={{ marginVertical: 8 }} />
      )}
      {step === 3 && (
        <View style={[s.card, { backgroundColor: C.accentBg, borderColor: C.accent, borderWidth: 1 }]}>
          <Text style={{ color: C.accent, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>🎉 Transaksi Selesai!</Text>
          <Text style={{ color: C.accent, textAlign: 'center', marginTop: 4 }}>Dana telah dilepaskan ke penjastip oleh payment-service.</Text>
        </View>
      )}
      <Btn label="← Kembali ke Beranda" outline onPress={() => onNavigate('PilihPeran')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('Login');
  const [params, setParams] = useState({});

  const go = useCallback((target, p) => {
    setScreen(target);
    if (p) setParams(p);
  }, []);

  const screens = {
    Register: <RegisterScreen onNavigate={go} />,
    Login: <LoginScreen onNavigate={go} onLogin={() => go('PilihPeran')} />,
    PilihPeran: <PilihPeranScreen onNavigate={go} />,
    PenjastipDashboard: <PenjastipDashboard onNavigate={go} />,
    PenitipBrowse: (
      <PenitipBrowse
        onNavigate={go}
        onPilihBarang={(barang) => go('FormTitipan', { barang })}
      />
    ),
    FormTitipan: params.barang ? (
      <FormTitipan
        barang={params.barang}
        onNavigate={(t, p) => go(t, p || params)}
        onLanjut={(order) => go('Pembayaran', order)}
      />
    ) : null,
    TawarHarga: params.sesi ? (
      <TawarHargaScreen
        params={params}
        onNavigate={(t) => go(t, params)}
        onLanjutBayar={(order) => go('Pembayaran', order)}
      />
    ) : null,
    Pembayaran: params.barang ? (
      <PembayaranScreen
        order={params}
        onNavigate={(t) => go(t, params)}
        onBayar={() => go('Tracking', params)}
      />
    ) : null,
    Tracking: params.barang ? (
      <TrackingScreen order={params} onNavigate={go} />
    ) : null,
  };

  const current = screens[screen];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {current || (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.muted }}>Memuat…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  card:      { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 10 },
  topBar:    { backgroundColor: C.primary, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  heading:   { fontSize: 24, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 4 },
  sub:       { fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 20 },
  logoRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoIcon:  { fontSize: 22 },
  appTitle:  { fontSize: 22, fontWeight: '800', color: C.primary },
  label:     { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 4 },
  input:     { backgroundColor: C.light, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12, fontSize: 14, color: C.text },
  btn:       { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 },
  btnText:   { fontSize: 15, fontWeight: '700' },
  badge:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  svcTag:    { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  svcText:   { fontSize: 11, fontWeight: '600' },
  peranCard: { backgroundColor: C.surface, borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 2, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  peranEmoji:{ fontSize: 40, marginBottom: 8 },
  peranTitle:{ fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },
  peranDesc: { fontSize: 13, color: C.muted, textAlign: 'center', marginBottom: 8 },
  searchBar: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 11, fontSize: 14, color: C.text, marginBottom: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.light, marginRight: 8 },
  chipActive:{ backgroundColor: C.primary },
  chipText:  { fontSize: 13, color: C.muted },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  prodCard:  { padding: 6 },
  prodImg:   { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: C.light },
  prodBody:  { padding: 4, paddingTop: 6 },
  prodNama:  { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 2 },
  prodToko:  { fontSize: 11, color: C.muted, marginBottom: 2 },
  prodHarga: { fontSize: 14, fontWeight: '700', color: C.primary, marginBottom: 4 },
  fabRow:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, padding: 12, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', gap: 10 },
  infoRow:   { fontSize: 13, color: C.text, marginBottom: 4 },
  infoKey:   { fontWeight: '600' },
  sesiRow:   { backgroundColor: C.light, borderRadius: 10, padding: 10, marginBottom: 8 },
  sesiToko:  { fontWeight: '700', color: C.text, fontSize: 13 },
  sesiInfo:  { color: C.muted, fontSize: 12, marginTop: 2 },
  qtyRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 16 },
  qtyBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:{ color: '#fff', fontSize: 22, lineHeight: 26 },
  qtyVal:    { fontSize: 20, fontWeight: '700', color: C.text, minWidth: 36, textAlign: 'center' },
  summaryBox:{ backgroundColor: C.light, borderRadius: 10, padding: 12, marginTop: 8 },
  summaryLabel: { fontSize: 12, color: C.muted },
  summaryVal:{ fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 6 },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 6 },
  rowGap:    { flexDirection: 'row', gap: 10, marginBottom: 8 },
  metodeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  radio:     { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.primary, backgroundColor: 'transparent' },
  trackRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  trackDot:  { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.border },
  trackLabel:{ fontSize: 13, fontWeight: '600', color: C.muted },
  trackDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
});
