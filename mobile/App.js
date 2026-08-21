import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";



const { width } = Dimensions.get("window");

// ==========================================
// 1. TEMA WARNA & PALET (ROYAL BLUE THEME)
// ==========================================
const THEME = {
  primary: "#1E40AF", // Royal Blue
  primaryDark: "#172554", // Deep Navy
  primaryLight: "#3B82F6", // Bright Blue
  primarySoft: "#EFF6FF", // Soft Blue tint
  accentTeal: "#0D9488", // Turquoise / Teal
  accentEmerald: "#10B981", // Emerald Green
  accentAmber: "#F59E0B", // Amber Warm
  accentRose: "#E11D48", // Rose Red
  bg: "#F8FAFC", // Off-white / Clean slate
  surface: "#FFFFFF", // Pure white card
  surfaceAlt: "#F1F5F9", // Slate light
  border: "#E2E8F0", // Slate border
  borderFocus: "#93C5FD", // Light blue border
  textMain: "#0F172A", // Dark Slate
  textMuted: "#64748B", // Muted Slate
  textLight: "#94A3B8", // Subtle text
};

// ==========================================
// 2. DATA KATALOG DENGAN GAMBAR NYATA & RELEVAN
// ==========================================
const INITIAL_TOKO = [
  {
    id: 1,
    nama: "Kantin Pusat & Ayam Geprek Mas Bro",
    kategori: "Makanan Kampus",
    lokasi: "Gedung PKM Lt. 1",
    rating: 4.8,
    ikon: "🍗",
  },
  {
    id: 2,
    nama: "Kopi Kenangan & Minuman Santai",
    kategori: "Kopi & Boba",
    lokasi: "Kantin Fakultas Teknik",
    rating: 4.9,
    ikon: "☕",
  },
  {
    id: 3,
    nama: "Warung Makan Padang Salero",
    kategori: "Kuliner Nusantara",
    lokasi: "Depan Gerbang Utama Kampus",
    rating: 4.7,
    ikon: "🍛",
  },
  {
    id: 4,
    nama: "Koperasi Mahasiswa & Stationery",
    kategori: "Buku & Alat Tulis",
    lokasi: "Perpustakaan Pusat",
    rating: 4.6,
    ikon: "📚",
  },
  {
    id: 5,
    nama: "Campus Tech & Accessories",
    kategori: "Gadget & Elektronik",
    lokasi: "Student Center Hub",
    rating: 4.9,
    ikon: "🎧",
  },
];

const INITIAL_ITEMS = [
  {
    id: 101,
    toko_id: 1,
    nama: "Ayam Geprek Sambal Korek + Nasi",
    kategori: "Makanan Kampus",
    harga: 16000,
    satuan: "porsi",
    stok: 25,
    deskripsi: "Ayam krispi renyah digeprek dengan cabai rawit pedas mantap.",
    gambarUrl:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 102,
    toko_id: 1,
    nama: "Mie Goreng Spesial Telur Kornet",
    kategori: "Makanan Kampus",
    harga: 14000,
    satuan: "porsi",
    stok: 20,
    deskripsi: "Mie goreng racikan warkop dengan sayuran, telur ceplok dan kornet.",
    gambarUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 201,
    toko_id: 2,
    nama: "Es Kopi Susu Gula Aren Barista",
    kategori: "Kopi & Boba",
    harga: 18000,
    satuan: "cup",
    stok: 30,
    deskripsi: "Espresso robusta double shot dipadu susu segar & gula aren asli.",
    gambarUrl:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 202,
    toko_id: 2,
    nama: "Brown Sugar Boba Fresh Milk",
    kategori: "Kopi & Boba",
    harga: 22000,
    satuan: "cup",
    stok: 15,
    deskripsi: "Boba kenyal hangat dengan fresh milk dingin dan lelehan brown sugar.",
    gambarUrl:
      "https://images.unsplash.com/photo-1558857563-b37cf711d950?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 203,
    toko_id: 2,
    nama: "Iced Matcha Latte Creamy",
    kategori: "Kopi & Boba",
    harga: 20000,
    satuan: "cup",
    stok: 18,
    deskripsi: "Bubuk matcha Jepang murni dengan susu krim lembut dan es segar.",
    gambarUrl:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 301,
    toko_id: 3,
    nama: "Paket Nasi Rendang Daging Sapi",
    kategori: "Kuliner Nusantara",
    harga: 24000,
    satuan: "bungkus",
    stok: 12,
    deskripsi: "Nasi hangat, rendang empuk bumbu medok, sayur nangka dan sambal hijau.",
    gambarUrl:
      "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 401,
    toko_id: 4,
    nama: "Binder B5 Spiral + Refill Kertas",
    kategori: "Buku & Alat Tulis",
    harga: 28000,
    satuan: "set",
    stok: 10,
    deskripsi: "Binder kuliah kokoh 26 ring gratis 50 lembar loose leaf bergaris.",
    gambarUrl:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 501,
    toko_id: 5,
    nama: "Wireless TWS Earbuds Bass Edition",
    kategori: "Gadget & Elektronik",
    harga: 125000,
    satuan: "unit",
    stok: 8,
    deskripsi: "Bluetooth 5.3 earphone dengan baterai 24 jam dan bass mendalam.",
    gambarUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
  },
];

// Helper format Rupiah
function formatRupiah(val = 0) {
  return "Rp " + Number(val || 0).toLocaleString("id-ID");
}

// ==========================================
// 3. KOMPONEN SERVICE BADGE
// ==========================================
function ServiceBadge({ service, stepCode, actionText }) {
  const configs = {
    catalog: {
      name: "catalog-service",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      color: "#4338CA",
      icon: "🗂️",
    },
    order: {
      name: "order-service",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#1D4ED8",
      icon: "📦",
    },
    payment: {
      name: "payment-service",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      color: "#047857",
      icon: "💳",
    },
    tracking: {
      name: "tracking-service",
      bg: "#FFFBEB",
      border: "#FDE68A",
      color: "#B45309",
      icon: "📍",
    },
  };

  const cfg = configs[service] || configs.order;

  return (
    <View style={[styles.serviceBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={styles.serviceBadgeHeader}>
        <Text style={styles.serviceIcon}>{cfg.icon}</Text>
        <Text style={[styles.serviceName, { color: cfg.color }]}>[{cfg.name}]</Text>
        {stepCode ? <View style={styles.stepPill}><Text style={styles.stepPillText}>{stepCode}</Text></View> : null}
      </View>
      {actionText ? (
        <Text style={styles.serviceDesc}>{actionText}</Text>
      ) : null}
    </View>
  );
}

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Navigation / Screen State
  // Screens: 'AUTH', 'BERANDA_PENITIP', 'BERANDA_PENJASTIP', 'DETAIL_BARANG', 'FORM_ORDER', 'PROSES_TAWAR', 'PEMBAYARAN', 'TRACKING'
  const [currentScreen, setCurrentScreen] = useState("AUTH");

  // User State
  const [user, setUser] = useState({
    isLoggedIn: false,
    nama: "Budi Santoso",
    email: "budi.mahasiswa@kampus.ac.id",
    noHp: "081234567890",
    kampus: "Universitas Indonesia",
    peran: "penitip", // 'penitip' | 'penjastip'
  });

  // Auth Form State
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'register'
  const [regForm, setRegForm] = useState({
    nama: "",
    emailHp: "",
    password: "",
    kampus: "Universitas Indonesia",
    peran: "penitip",
  });
  const [loginForm, setLoginForm] = useState({
    emailHp: "budi.mahasiswa@kampus.ac.id",
    password: "password123",
    peran: "penitip",
  });

  // Penjastip Sesi State (Langkah H, I, J)
  const [sesiJastip, setSesiJastip] = useState({
    isActive: true,
    tokoId: 1,
    tokoNama: "Kantin Pusat & Ayam Geprek Mas Bro",
    batasWaktu: "16:30 WIB",
    kapasitasTotal: 5,
    kapasitasTerisi: 2,
    ongkosJastipDasar: 5000,
  });

  // State Form Buka Sesi Baru
  const [formSesi, setFormSesi] = useState({
    tokoId: 1,
    batasWaktu: "17:00 WIB",
    kapasitas: "5",
    ongkosDasar: "5000",
  });

  // Katalog Filter State
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");
  const [cariTeks, setCariTeks] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Pemesanan Penitip (Langkah N, O, P, Q)
  const [orderDraft, setOrderDraft] = useState({
    item: null,
    jumlah: 1,
    varian: "Original / Standar",
    catatan: "Sambal dipisah, tolong bungkus rapi ya kak.",
    mauTawar: false,
    tawaranOngkos: 3000,
  });

  // Tawaran Nego State (Langkah R, S, T, V, X, Z1)
  const [negoState, setNegoState] = useState({
    status: "PENGAJUAN", // 'PENGAJUAN', 'DITOLAK_PENJASTIP', 'DISETUJUI', 'BATAL'
    tawaranPengguna: 3000,
    alasanTolak: "Maaf antrean toko sedang ramai, ongkos minimal Rp 4.500 ya!",
  });

  // Transaksi & Tracking State (Langkah U, W, X1, Y, AA - AI)
  const [activeTransaction, setActiveTransaction] = useState({
    id: "TRX-JST-9821",
    item: INITIAL_ITEMS[0],
    jumlah: 1,
    varian: "Sambal Pedas Manis",
    catatan: "Bungkus plastik ganda.",
    hargaBarang: 16000,
    ongkosJastip: 5000,
    totalBiaya: 21000,
    metodePembayaran: "QRIS Saldo Mahasiswa",
    statusEscrow: "TERTAHAN", // 'TERTAHAN', 'DILEPASKAN'
    trackingStep: "AA", // 'AA' (dititip), 'AC' (dibelanjakan), 'AE' (diantar), 'AG' (diterima), 'AH' (dana cair), 'AI' (selesai)
    ratingBintang: 5,
    waktu: "Hari ini, 14:15",
  });

  // Daftar Kategori Unik
  const daftarKategori = useMemo(() => {
    return ["Semua", ...new Set(INITIAL_ITEMS.map((i) => i.kategori))];
  }, []);

  // Filtered Item Katalog
  const filteredCatalog = useMemo(() => {
    return INITIAL_ITEMS.filter((item) => {
      const matchKat =
        kategoriTerpilih === "Semua" || item.kategori === kategoriTerpilih;
      const matchCari =
        item.nama.toLowerCase().includes(cariTeks.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(cariTeks.toLowerCase());
      return matchKat && matchCari;
    });
  }, [kategoriTerpilih, cariTeks]);

  // ==========================================
  // HANDLERS ALUR SISTEM (A - AI)
  // ==========================================

  // Langkah B, C, D: Registrasi
  const handleRegister = () => {
    if (!regForm.nama || !regForm.emailHp || !regForm.password) {
      Alert.alert("Perhatian", "Semua kolom registrasi wajib diisi!");
      return;
    }
    Alert.alert("Akun Dibuat (Langkah D)", "Registrasi berhasil! Silakan login.");
    setLoginForm({
      emailHp: regForm.emailHp,
      password: regForm.password,
      peran: regForm.peran,
    });
    setAuthTab("login");
  };

  // Langkah E, F, G: Login & Masuk Beranda
  const handleLogin = () => {
    if (!loginForm.emailHp || !loginForm.password) {
      Alert.alert("Perhatian", "Email/No HP dan Password harus diisi!");
      return;
    }
    setUser({
      isLoggedIn: true,
      nama: loginForm.emailHp.includes("budi") ? "Budi Mahasiswa" : "Rian Jastiper",
      email: loginForm.emailHp,
      noHp: "081298765432",
      kampus: "Universitas Indonesia",
      peran: loginForm.peran,
    });

    if (loginForm.peran === "penjastip") {
      setCurrentScreen("BERANDA_PENJASTIP");
    } else {
      setCurrentScreen("BERANDA_PENITIP");
    }
  };

  // Ganti Peran Cepat (Langkah G)
  const handleSwitchRole = (newRole) => {
    setUser((prev) => ({ ...prev, peran: newRole }));
    if (newRole === "penjastip") {
      setCurrentScreen("BERANDA_PENJASTIP");
    } else {
      setCurrentScreen("BERANDA_PENITIP");
    }
  };

  // Langkah H, I, J: Buka Sesi Jastip oleh Penjastip
  const handleSimpanSesi = () => {
    const tokoObj = INITIAL_TOKO.find((t) => t.id === Number(formSesi.tokoId)) || INITIAL_TOKO[0];
    setSesiJastip({
      isActive: true,
      tokoId: tokoObj.id,
      tokoNama: tokoObj.nama,
      batasWaktu: formSesi.batasWaktu,
      kapasitasTotal: Number(formSesi.kapasitas),
      kapasitasTerisi: 0,
      ongkosJastipDasar: Number(formSesi.ongkosDasar),
    });
    Alert.alert(
      "Sesi Tersimpan [order-service]",
      `Sesi Jastip untuk ${tokoObj.nama} berhasil dibuka dan aktif di aplikasi.`
    );
  };

  // Langkah M: Pilih Barang
  const handleSelectProduct = (item) => {
    setSelectedItem(item);
    setOrderDraft({
      item: item,
      jumlah: 1,
      varian: "Standar / Normal",
      catatan: "Tolong pastikan kemasan rapat ya kak.",
      mauTawar: false,
      tawaranOngkos: sesiJastip.ongkosJastipDasar,
    });
    setCurrentScreen("DETAIL_BARANG");
  };

  // Langkah N, O, P, Q: Cek Kondisi & Masuk Form Order / Tawar
  const handleLanjutKeOrder = () => {
    // Validasi order-service (Langkah O)
    if (!sesiJastip.isActive) {
      Alert.alert("Sesi Tutup [order-service]", "Sesi jastip belum dibuka oleh penjastip.");
      return;
    }
    if (sesiJastip.kapasitasTerisi >= sesiJastip.kapasitasTotal) {
      Alert.alert("Kapasitas Penuh [order-service]", "Slot jastip saat ini sudah penuh.");
      return;
    }

    setCurrentScreen("FORM_ORDER");
  };

  // Langkah Q: Keputusan Tawar / Langsung
  const handleProsesOrderDecision = () => {
    if (orderDraft.mauTawar) {
      // Langkah R: Penitip ajukan tawar
      setNegoState({
        status: "PENGAJUAN",
        tawaranPengguna: Number(orderDraft.tawaranOngkos),
        alasanTolak: "Penjastip minta sedikit penyesuaian karena antrean panjang.",
      });
      setCurrentScreen("PROSES_TAWAR");
    } else {
      // Langkah U: Langsung proses jastip
      const total =
        orderDraft.item.harga * orderDraft.jumlah + sesiJastip.ongkosJastipDasar;
      setActiveTransaction({
        id: "TRX-" + Math.floor(1000 + Math.random() * 9000),
        item: orderDraft.item,
        jumlah: orderDraft.jumlah,
        varian: orderDraft.varian,
        catatan: orderDraft.catatan,
        hargaBarang: orderDraft.item.harga,
        ongkosJastip: sesiJastip.ongkosJastipDasar,
        totalBiaya: total,
        metodePembayaran: "QRIS Kampus Pay (Escrow)",
        statusEscrow: "TERTAHAN",
        trackingStep: "AA",
        ratingBintang: 5,
        waktu: "Baru saja",
      });
      setCurrentScreen("PEMBAYARAN");
    }
  };

  // Simulasi Respon Penjastip pada Tawar Menawar (Langkah T, V, X, Z1)
  const handleSimulasiPenjastipResponse = (isAccepted) => {
    if (isAccepted) {
      // Langkah T: Ya -> Masuk Langkah U
      setNegoState((prev) => ({ ...prev, status: "DISETUJUI" }));
      const total =
        orderDraft.item.harga * orderDraft.jumlah + Number(negoState.tawaranPengguna);
      setActiveTransaction({
        id: "TRX-" + Math.floor(1000 + Math.random() * 9000),
        item: orderDraft.item,
        jumlah: orderDraft.jumlah,
        varian: orderDraft.varian,
        catatan: orderDraft.catatan,
        hargaBarang: orderDraft.item.harga,
        ongkosJastip: Number(negoState.tawaranPengguna),
        totalBiaya: total,
        metodePembayaran: "QRIS Kampus Pay (Escrow)",
        statusEscrow: "TERTAHAN",
        trackingStep: "AA",
        ratingBintang: 5,
        waktu: "Baru saja",
      });
      setTimeout(() => {
        setCurrentScreen("PEMBAYARAN");
      }, 700);
    } else {
      // Langkah T: Tidak -> Langkah V
      setNegoState((prev) => ({ ...prev, status: "DITOLAK_PENJASTIP" }));
    }
  };

  // Langkah Z1: Batal Nego & Kembali ke Katalog
  const handleBatalkanNego = () => {
    Alert.alert("Titipan Dibatalkan (Langkah Z1)", "Proses penawaran telah dihentikan.");
    setCurrentScreen("BERANDA_PENITIP");
  };

  // Langkah W & X1: Bayar & Escrow Payment Service
  const handleKonfirmasiBayar = () => {
    // Sesi kapasitas bertambah
    setSesiJastip((prev) => ({
      ...prev,
      kapasitasTerisi: Math.min(prev.kapasitasTotal, prev.kapasitasTerisi + 1),
    }));
    setCurrentScreen("TRACKING");
  };

  // Siklus Tracking Service (Langkah AA - AI)
  const handleAdvanceTracking = () => {
    const sequence = ["AA", "AC", "AE", "AG", "AH", "AI"];
    const curIdx = sequence.indexOf(activeTransaction.trackingStep);
    if (curIdx < sequence.length - 1) {
      const nextStep = sequence[curIdx + 1];
      const updated = { ...activeTransaction, trackingStep: nextStep };
      if (nextStep === "AH" || nextStep === "AI") {
        updated.statusEscrow = "DILEPASKAN";
      }
      setActiveTransaction(updated);
    }
  };

  // =========================================================================
  // RENDER SCREEN 1: AUTH (A, B, C, D, E, G)
  // ==========================================
  const renderAuthScreen = () => (
    <SafeAreaView style={styles.authContainer}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primaryDark} />
      <ScrollView contentContainerStyle={styles.authScroll}>
        {/* Hero Header */}
        <View style={styles.authHero}>
          <View style={styles.appLogoCircle}>
            <Text style={styles.appLogoIcon}>🚀</Text>
          </View>
          <Text style={styles.appTitle}>JastipKampus</Text>
          <Text style={styles.appSubtitle}>
            Solusi Titip Belanja Antar-Mahasiswa Mudah, Cepat & Terpercaya
          </Text>

          {/* Microservice Info */}
          <View style={styles.authBadgeWrap}>
            <ServiceBadge
              service="order"
              stepCode="Langkah A-G"
              actionText="Autentikasi Mahasiswa & Pemilihan Peran Sistem"
            />
          </View>
        </View>

        {/* Tab Switcher: Login / Register */}
        <View style={styles.authCard}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authTab === "login" && styles.tabButtonActive]}
              onPress={() => setAuthTab("login")}
            >
              <Text style={[styles.tabText, authTab === "login" && styles.tabTextActive]}>
                Masuk (Login)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, authTab === "register" && styles.tabButtonActive]}
              onPress={() => setAuthTab("register")}
            >
              <Text style={[styles.tabText, authTab === "register" && styles.tabTextActive]}>
                Daftar (Register)
              </Text>
            </TouchableOpacity>
          </View>

          {authTab === "register" ? (
            // Form Registrasi (Langkah B, C, D)
            <View style={styles.formContent}>
              <Text style={styles.formHeading}>Daftar Akun Baru (Langkah B & C)</Text>
              <Text style={styles.inputLabel}>Nama Lengkap Mahasiswa</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor={THEME.textLight}
                value={regForm.nama}
                onChangeText={(v) => setRegForm({ ...regForm, nama: v })}
              />

              <Text style={styles.inputLabel}>Email Kampus / No. WhatsApp</Text>
              <TextInput
                style={styles.textInput}
                placeholder="budi@kampus.ac.id / 0812..."
                placeholderTextColor={THEME.textLight}
                keyboardType="email-address"
                value={regForm.emailHp}
                onChangeText={(v) => setRegForm({ ...regForm, emailHp: v })}
              />

              <Text style={styles.inputLabel}>Asal Kampus</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Universitas Indonesia"
                placeholderTextColor={THEME.textLight}
                value={regForm.kampus}
                onChangeText={(v) => setRegForm({ ...regForm, kampus: v })}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={THEME.textLight}
                secureTextEntry
                value={regForm.password}
                onChangeText={(v) => setRegForm({ ...regForm, password: v })}
              />

              <Text style={styles.inputLabel}>Pilih Peran Utama (Langkah G)</Text>
              <View style={styles.rolePickerRow}>
                <TouchableOpacity
                  style={[
                    styles.roleCardOption,
                    regForm.peran === "penitip" && styles.roleCardActive,
                  ]}
                  onPress={() => setRegForm({ ...regForm, peran: "penitip" })}
                >
                  <Text style={styles.roleIcon}>🛍️</Text>
                  <Text style={styles.roleTitle}>Penitip</Text>
                  <Text style={styles.roleDesc}>Titip belanjaan ke teman</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCardOption,
                    regForm.peran === "penjastip" && styles.roleCardActive,
                  ]}
                  onPress={() => setRegForm({ ...regForm, peran: "penjastip" })}
                >
                  <Text style={styles.roleIcon}>🛵</Text>
                  <Text style={styles.roleTitle}>Penjastip</Text>
                  <Text style={styles.roleDesc}>Buka sesi & antar pesanan</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>Buat Akun Sekarang (Langkah D)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Form Login (Langkah E, F, G)
            <View style={styles.formContent}>
              <Text style={styles.formHeading}>Masuk ke Akun Anda (Langkah E)</Text>
              <Text style={styles.inputLabel}>Email / No. Handphone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="budi.mahasiswa@kampus.ac.id"
                placeholderTextColor={THEME.textLight}
                value={loginForm.emailHp}
                onChangeText={(v) => setLoginForm({ ...loginForm, emailHp: v })}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={THEME.textLight}
                secureTextEntry
                value={loginForm.password}
                onChangeText={(v) => setLoginForm({ ...loginForm, password: v })}
              />

              <Text style={styles.inputLabel}>Masuk Sebagai Peran (Langkah G)</Text>
              <View style={styles.rolePillRow}>
                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    loginForm.peran === "penitip" && styles.rolePillActive,
                  ]}
                  onPress={() => setLoginForm({ ...loginForm, peran: "penitip" })}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      loginForm.peran === "penitip" && styles.rolePillTextActive,
                    ]}
                  >
                    🛍️ Penitip Barang
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    loginForm.peran === "penjastip" && styles.rolePillActive,
                  ]}
                  onPress={() => setLoginForm({ ...loginForm, peran: "penjastip" })}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      loginForm.peran === "penjastip" && styles.rolePillTextActive,
                    ]}
                  >
                    🛵 Penjastip (Kurir)
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
                <Text style={styles.btnPrimaryText}>Masuk ke Beranda (Langkah F)</Text>
              </TouchableOpacity>

              {/* Quick Demo Fill Buttons */}
              <View style={styles.demoBox}>
                <Text style={styles.demoBoxTitle}>⚡ Quick Demo Preset:</Text>
                <View style={styles.demoBtnRow}>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => {
                      setLoginForm({
                        emailHp: "budi.mahasiswa@kampus.ac.id",
                        password: "password123",
                        peran: "penitip",
                      });
                    }}
                  >
                    <Text style={styles.demoBtnText}>Sebagai Penitip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => {
                      setLoginForm({
                        emailHp: "rian.penjastip@kampus.ac.id",
                        password: "password123",
                        peran: "penjastip",
                      });
                    }}
                  >
                    <Text style={styles.demoBtnText}>Sebagai Penjastip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // =========================================================================
  // RENDER SCREEN 2: BERANDA PENITIP (K, L, M)
  // ==========================================
  const renderBerandaPenitip = () => (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>Halo, {user.nama} 👋</Text>
          <Text style={styles.headerCampus}>{user.kampus}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerRoleSwitch}
          onPress={() => handleSwitchRole("penjastip")}
        >
          <Text style={styles.headerRoleSwitchText}>Ganti ke Penjastip 🛵</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCatalog}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.catalogList}
        ListHeaderComponent={
          <View>
            {/* Service & Flow Indicator */}
            <ServiceBadge
              service="catalog"
              stepCode="Langkah K & L"
              actionText="catalog-service menampilkan daftar toko, barang, harga acuan, dan satuan resmi."
            />

            {/* Sesi Jastip Banner */}
            <View style={styles.sesiStatusCard}>
              <View style={styles.sesiTopLine}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>SESI JASTIP AKTIF [order-service]</Text>
                </View>
                <Text style={styles.sesiDeadline}>Tutup: {sesiJastip.batasWaktu}</Text>
              </View>
              <Text style={styles.sesiTokoName}>📍 {sesiJastip.tokoNama}</Text>
              <View style={styles.sesiDetailsRow}>
                <Text style={styles.sesiDetailPill}>
                  Slot: {sesiJastip.kapasitasTerisi}/{sesiJastip.kapasitasTotal} Terisi
                </Text>
                <Text style={styles.sesiDetailPill}>
                  Jasa Dasar: {formatRupiah(sesiJastip.ongkosJastipDasar)}
                </Text>
              </View>
            </View>

            {/* Search Box */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari menu, ayam geprek, boba, buku..."
                placeholderTextColor={THEME.textLight}
                value={cariTeks}
                onChangeText={setCariTeks}
              />
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {daftarKategori.map((kat) => (
                <TouchableOpacity
                  key={kat}
                  style={[
                    styles.catChip,
                    kategoriTerpilih === kat && styles.catChipActive,
                  ]}
                  onPress={() => setKategoriTerpilih(kat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      kategoriTerpilih === kat && styles.catChipTextActive,
                    ]}
                  >
                    {kat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionHeading}>Daftar Menu & Barang Jastip</Text>
              <Text style={styles.sectionSub}>
                Langkah M: Pilih barang untuk melihat detail & acuan harga
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const tokoInfo = INITIAL_TOKO.find((t) => t.id === item.toko_id);
          return (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.9}
              onPress={() => handleSelectProduct(item)}
            >
              <Image
                source={{ uri: item.gambarUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <View style={styles.productBadgeRow}>
                  <Text style={styles.productCatTag}>{item.kategori}</Text>
                  <Text style={styles.productStokTag}>Stok: {item.stok}</Text>
                </View>

                <Text style={styles.productName}>{item.nama}</Text>
                <Text style={styles.productStore}>🏪 {tokoInfo?.nama || "Toko Kampus"}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>
                  {item.deskripsi}
                </Text>

                <View style={styles.productPriceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Harga Acuan (catalog-service)</Text>
                    <Text style={styles.productPrice}>
                      {formatRupiah(item.harga)}{" "}
                      <Text style={styles.productUnit}>/{item.satuan}</Text>
                    </Text>
                  </View>
                  <View style={styles.btnPilihPill}>
                    <Text style={styles.btnPilihText}>Titip Ini ＋</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Barang tidak ditemukan</Text>
            <Text style={styles.emptyDesc}>Coba ganti kata kunci pencarian atau kategori.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );

  // =========================================================================
  // RENDER SCREEN 3: BERANDA PENJASTIP (H, I, J)
  // ==========================================
  const renderBerandaPenjastip = () => (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>Dashboard Penjastip 🛵</Text>
          <Text style={styles.headerCampus}>{user.nama} • {user.kampus}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerRoleSwitch}
          onPress={() => handleSwitchRole("penitip")}
        >
          <Text style={styles.headerRoleSwitchText}>Ganti ke Penitip 🛍️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.penjastipScroll}>
        <ServiceBadge
          service="order"
          stepCode="Langkah H, I, J"
          actionText="order-service menyimpan & mempublikasikan sesi jastip (toko, batas waktu, kapasitas)."
        />

        {/* Status Sesi Saat Ini */}
        <View style={styles.sessionOverviewCard}>
          <Text style={styles.sessionCardTitle}>Sesi Jastip Aktif Anda</Text>
          <View style={styles.sessionCardDetails}>
            <View style={styles.sessionDetailItem}>
              <Text style={styles.sessionItemLabel}>Toko Pilihan:</Text>
              <Text style={styles.sessionItemVal}>{sesiJastip.tokoNama}</Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Text style={styles.sessionItemLabel}>Batas Waktu Order:</Text>
              <Text style={styles.sessionItemVal}>{sesiJastip.batasWaktu}</Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Text style={styles.sessionItemLabel}>Kapasitas Terisi:</Text>
              <Text style={styles.sessionItemVal}>
                {sesiJastip.kapasitasTerisi} dari {sesiJastip.kapasitasTotal} titipan
              </Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Text style={styles.sessionItemLabel}>Jasa Jastip Dasar:</Text>
              <Text style={styles.sessionItemVal}>
                {formatRupiah(sesiJastip.ongkosJastipDasar)}
              </Text>
            </View>
          </View>
        </View>

        {/* Form Atur / Buka Sesi Jastip Baru (Langkah H & I) */}
        <View style={styles.formSesiCard}>
          <Text style={styles.formSesiTitle}>Buka Sesi Jastip Baru (Langkah H)</Text>
          <Text style={styles.formSesiSubtitle}>
            Tentukan toko tujuan dan kapasitas belanja sebelum berangkat.
          </Text>

          <Text style={styles.inputLabel}>Pilih Toko Tujuan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tokoSelectRow}>
            {INITIAL_TOKO.map((toko) => (
              <TouchableOpacity
                key={toko.id}
                style={[
                  styles.tokoOptionCard,
                  Number(formSesi.tokoId) === toko.id && styles.tokoOptionActive,
                ]}
                onPress={() => setFormSesi({ ...formSesi, tokoId: toko.id })}
              >
                <Text style={styles.tokoOptionIcon}>{toko.ikon}</Text>
                <Text
                  style={[
                    styles.tokoOptionName,
                    Number(formSesi.tokoId) === toko.id && styles.tokoOptionNameActive,
                  ]}
                  numberOfLines={2}
                >
                  {toko.nama}
                </Text>
                <Text style={styles.tokoOptionLokasi}>{toko.lokasi}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGridTwo}>
            <View style={styles.gridCol}>
              <Text style={styles.inputLabel}>Batas Waktu</Text>
              <TextInput
                style={styles.textInput}
                placeholder="16:30 WIB"
                value={formSesi.batasWaktu}
                onChangeText={(v) => setFormSesi({ ...formSesi, batasWaktu: v })}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.inputLabel}>Maks. Kapasitas (Slot)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="5"
                value={formSesi.kapasitas}
                onChangeText={(v) => setFormSesi({ ...formSesi, kapasitas: v })}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Biaya Jasa Titip Dasar (Rp)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="5000"
            value={formSesi.ongkosDasar}
            onChangeText={(v) => setFormSesi({ ...formSesi, ongkosDasar: v })}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSimpanSesi}>
            <Text style={styles.btnPrimaryText}>
              Simpan & Buka Sesi Jastip (Langkah I & J)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Titipan Masuk Demo */}
        <View style={styles.liveOrderBox}>
          <Text style={styles.liveOrderTitle}>📥 Antrean Titipan Masuk Saat Ini</Text>
          <View style={styles.liveOrderItem}>
            <View style={styles.liveOrderItemHeader}>
              <Text style={styles.liveOrderUser}>Titipan dari: Sarah (Fasilkom)</Text>
              <Text style={styles.liveOrderBadge}>dititip (AA)</Text>
            </View>
            <Text style={styles.liveOrderDesc}>
              1x Ayam Geprek Sambal Korek (Level 3, nasi setengah)
            </Text>
            <Text style={styles.liveOrderTotal}>
              Estimasi: {formatRupiah(16000 + 5000)} (Saldo Tertahan di Escrow)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // =========================================================================
  // RENDER SCREEN 4: DETAIL BARANG & ACUAN HARGA (M, N, O, P)
  // ==========================================
  const renderDetailBarang = () => {
    if (!selectedItem) return null;
    const tokoInfo = INITIAL_TOKO.find((t) => t.id === selectedItem.toko_id);

    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        {/* Top Header */}
        <View style={styles.subHeaderBar}>
          <TouchableOpacity
            style={styles.subHeaderBack}
            onPress={() => setCurrentScreen("BERANDA_PENITIP")}
          >
            <Text style={styles.subHeaderBackText}>‹ Kembali ke Katalog</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Detail Pilihan Barang</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <ServiceBadge
            service="catalog"
            stepCode="Langkah L & P"
            actionText="order-service mengambil harga acuan & spesifikasi resmi dari catalog-service."
          />

          <Image
            source={{ uri: selectedItem.gambarUrl }}
            style={styles.detailHeroImage}
            resizeMode="cover"
          />

          <View style={styles.detailCard}>
            <View style={styles.detailBadgeRow}>
              <Text style={styles.detailCategory}>{selectedItem.kategori}</Text>
              <Text style={styles.detailStock}>Tersedia {selectedItem.stok} {selectedItem.satuan}</Text>
            </View>

            <Text style={styles.detailTitle}>{selectedItem.nama}</Text>
            <Text style={styles.detailStore}>🏪 {tokoInfo?.nama} • {tokoInfo?.lokasi}</Text>

            <View style={styles.divider} />

            <Text style={styles.detailDescTitle}>Deskripsi Produk:</Text>
            <Text style={styles.detailDesc}>{selectedItem.deskripsi}</Text>

            {/* Price Box */}
            <View style={styles.detailPriceBox}>
              <View>
                <Text style={styles.detailPriceLabel}>Harga Acuan catalog-service</Text>
                <Text style={styles.detailPriceValue}>
                  {formatRupiah(selectedItem.harga)}{" "}
                  <Text style={styles.detailPriceUnit}>/{selectedItem.satuan}</Text>
                </Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ Terverifikasi</Text>
              </View>
            </View>

            {/* Validation Check Box (order-service Langkah O) */}
            <View style={styles.validationBox}>
              <Text style={styles.validationTitle}>
                🔍 Kondisi Sesi Jastip [order-service]:
              </Text>
              <Text style={styles.validationItem}>
                • Sesi Belanja:{" "}
                <Text style={{ color: THEME.accentEmerald, fontWeight: "700" }}>
                  Buka (s.d {sesiJastip.batasWaktu})
                </Text>
              </Text>
              <Text style={styles.validationItem}>
                • Kapasitas Slot:{" "}
                <Text style={{ color: THEME.primary, fontWeight: "700" }}>
                  Tersedia ({sesiJastip.kapasitasTotal - sesiJastip.kapasitasTerisi} sisa slot)
                </Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLanjutKeOrder}>
              <Text style={styles.btnPrimaryText}>
                Lanjut Isi Detail Titipan (Langkah N) ›
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // =========================================================================
  // RENDER SCREEN 5: FORM DETAIL TITIPAN & PILIHAN TAWAR (N, O, P, Q)
  // ==========================================
  const renderFormOrder = () => {
    if (!orderDraft.item) return null;

    const subtotalBarang = orderDraft.item.harga * orderDraft.jumlah;
    const estimasiTotal =
      subtotalBarang + (orderDraft.mauTawar ? Number(orderDraft.tawaranOngkos) : sesiJastip.ongkosJastipDasar);

    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        {/* Top Header */}
        <View style={styles.subHeaderBar}>
          <TouchableOpacity
            style={styles.subHeaderBack}
            onPress={() => setCurrentScreen("DETAIL_BARANG")}
          >
            <Text style={styles.subHeaderBackText}>‹ Ubah Barang</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Detail & Keputusan Titipan</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <ServiceBadge
            service="order"
            stepCode="Langkah N, O, P, Q"
            actionText="Mengisi detail titipan & mengambil keputusan tawar biaya jastip."
          />

          <View style={styles.formCardWhite}>
            <Text style={styles.formCardHeading}>Formulir Titipan Mahasiswa (Langkah N)</Text>

            {/* Ringkasan Barang Terpilih */}
            <View style={styles.selectedItemMiniCard}>
              <Image
                source={{ uri: orderDraft.item.gambarUrl }}
                style={styles.miniImage}
              />
              <View style={styles.miniInfo}>
                <Text style={styles.miniName}>{orderDraft.item.nama}</Text>
                <Text style={styles.miniPrice}>
                  {formatRupiah(orderDraft.item.harga)} /{orderDraft.item.satuan}
                </Text>
              </View>
            </View>

            {/* Qty Stepper */}
            <Text style={styles.inputLabel}>Jumlah Barang (Qty)</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() =>
                  setOrderDraft({
                    ...orderDraft,
                    jumlah: Math.max(1, orderDraft.jumlah - 1),
                  })
                }
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{orderDraft.jumlah}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() =>
                  setOrderDraft({
                    ...orderDraft,
                    jumlah: Math.min(10, orderDraft.jumlah + 1),
                  })
                }
              >
                <Text style={styles.stepperBtnText}>＋</Text>
              </TouchableOpacity>
              <Text style={styles.stepperSubtotal}>
                Subtotal: {formatRupiah(subtotalBarang)}
              </Text>
            </View>

            {/* Varian */}
            <Text style={styles.inputLabel}>Pilihan Varian / Tingkat Pedas / Opsi</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Sambal Pisah, Less Sugar, dsb."
              value={orderDraft.varian}
              onChangeText={(v) => setOrderDraft({ ...orderDraft, varian: v })}
            />

            {/* Catatan Tambahan */}
            <Text style={styles.inputLabel}>Catatan Khusus untuk Penjastip</Text>
            <TextInput
              style={[styles.textInput, { height: 75, textAlignVertical: "top" }]}
              multiline
              placeholder="Contoh: Titip antar ke Gazebo Gedung B lantai 2 ya kak."
              value={orderDraft.catatan}
              onChangeText={(v) => setOrderDraft({ ...orderDraft, catatan: v })}
            />

            {/* Keputusan Tawar (Langkah Q) */}
            <View style={styles.decisionBox}>
              <Text style={styles.decisionTitle}>
                ⚖️ Keputusan Tawar Biaya Jastip? (Langkah Q)
              </Text>
              <Text style={styles.decisionDesc}>
                Biaya jasa standar dari penjastip adalah{" "}
                <Text style={{ fontWeight: "700" }}>
                  {formatRupiah(sesiJastip.ongkosJastipDasar)}
                </Text>
                . Apakah Anda ingin mengajukan tawar ongkos jastip?
              </Text>

              <View style={styles.decisionToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.decisionToggleBtn,
                    !orderDraft.mauTawar && styles.decisionToggleBtnActive,
                  ]}
                  onPress={() => setOrderDraft({ ...orderDraft, mauTawar: false })}
                >
                  <Text
                    style={[
                      styles.decisionToggleText,
                      !orderDraft.mauTawar && styles.decisionToggleTextActive,
                    ]}
                  >
                    Tidak, Pakai Tarif Standar ({formatRupiah(sesiJastip.ongkosJastipDasar)})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.decisionToggleBtn,
                    orderDraft.mauTawar && styles.decisionToggleBtnActiveTawar,
                  ]}
                  onPress={() => setOrderDraft({ ...orderDraft, mauTawar: true })}
                >
                  <Text
                    style={[
                      styles.decisionToggleText,
                      orderDraft.mauTawar && styles.decisionToggleTextActive,
                    ]}
                  >
                    Ya, Ajukan Tawar Ongkos Jastip
                  </Text>
                </TouchableOpacity>
              </View>

              {orderDraft.mauTawar ? (
                <View style={styles.negoInputWrap}>
                  <Text style={styles.inputLabel}>
                    Masukkan Nominal Tawaran Jasa Titip (Rp)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="3000"
                    value={String(orderDraft.tawaranOngkos)}
                    onChangeText={(v) =>
                      setOrderDraft({ ...orderDraft, tawaranOngkos: v })
                    }
                  />
                  <Text style={styles.negoTip}>
                    💡 Tawaran akan dikirim ke penjastip untuk disetujui (Langkah R).
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Total Preview */}
            <View style={styles.totalPreviewBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Titipan (order-service):</Text>
                <Text style={styles.totalVal}>{formatRupiah(estimasiTotal)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleProsesOrderDecision}
            >
              <Text style={styles.btnPrimaryText}>
                {orderDraft.mauTawar
                  ? "Kirim Pengajuan Tawar (Langkah R) ›"
                  : "Lanjut ke Pembayaran Escrow (Langkah U) ›"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // =========================================================================
  // RENDER SCREEN 6: PROSES TAWAR (R, S, T, V, X, Z1)
  // ==========================================
  const renderProsesTawar = () => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        {/* Top Header */}
        <View style={styles.subHeaderBar}>
          <TouchableOpacity
            style={styles.subHeaderBack}
            onPress={() => setCurrentScreen("FORM_ORDER")}
          >
            <Text style={styles.subHeaderBackText}>‹ Ubah Tawaran</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Proses Negosiasi Harga</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <ServiceBadge
            service="order"
            stepCode="Langkah R, S, T, V, X, Z1"
            actionText="order-service menyimpan tawaran penitip & menunggu persetujuan penjastip."
          />

          <View style={styles.negoCard}>
            <Text style={styles.negoCardHeading}>Negosiasi Jasa Jastip (Langkah R & S)</Text>
            <Text style={styles.negoCardSub}>
              Penitip mengajukan penawaran harga titip kepada penjastip yang bertugas.
            </Text>

            <View style={styles.negoSummaryBox}>
              <View style={styles.negoSummaryRow}>
                <Text style={styles.negoSummaryLabel}>Menu / Barang:</Text>
                <Text style={styles.negoSummaryVal}>{orderDraft.item?.nama}</Text>
              </View>
              <View style={styles.negoSummaryRow}>
                <Text style={styles.negoSummaryLabel}>Tarif Standar Toko:</Text>
                <Text style={styles.negoSummaryVal}>
                  {formatRupiah(sesiJastip.ongkosJastipDasar)}
                </Text>
              </View>
              <View style={styles.negoSummaryRow}>
                <Text style={styles.negoSummaryLabel}>Tawaran Penitip:</Text>
                <Text style={[styles.negoSummaryVal, { color: THEME.primary, fontWeight: "800" }]}>
                  {formatRupiah(negoState.tawaranPengguna)}
                </Text>
              </View>
            </View>

            {/* State Handling Berdasarkan Respon Flowchart */}
            {negoState.status === "PENGAJUAN" ? (
              <View style={styles.statusBoxWaiting}>
                <ActivityIndicator color={THEME.primary} size="small" />
                <Text style={styles.statusBoxWaitingText}>
                  Menunggu respon penjastip (Simulasi Langkah T)...
                </Text>

                {/* Tombol Simulasi Persetujuan Penjastip */}
                <View style={styles.simulasiActionRow}>
                  <Text style={styles.simulasiTitle}>Simulasikan Respon Penjastip:</Text>
                  <View style={styles.simulasiBtnRow}>
                    <TouchableOpacity
                      style={styles.simulasiBtnAccept}
                      onPress={() => handleSimulasiPenjastipResponse(true)}
                    >
                      <Text style={styles.simulasiBtnText}>✓ Setujui Tawaran (Ya -> U)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.simulasiBtnReject}
                      onPress={() => handleSimulasiPenjastipResponse(false)}
                    >
                      <Text style={styles.simulasiBtnText}>✕ Tolak Tawaran (Tidak -> V)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}

            {negoState.status === "DITOLAK_PENJASTIP" ? (
              <View style={styles.statusBoxRejected}>
                <Text style={styles.statusRejectedTitle}>
                  ⚠️ Tawaran Ditolak Penjastip (Langkah V)
                </Text>
                <Text style={styles.statusRejectedDesc}>
                  Pesan Penjastip: "{negoState.alasanTolak}"
                </Text>

                <View style={styles.decisionBranchBox}>
                  <Text style={styles.decisionBranchTitle}>
                    Keputusan Penitip: Lanjutkan Titipan? (Langkah X)
                  </Text>

                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => {
                      setNegoState((prev) => ({ ...prev, status: "PENGAJUAN" }));
                      setCurrentScreen("FORM_ORDER");
                    }}
                  >
                    <Text style={styles.btnSecondaryText}>
                      🔄 Ya, Ubah Nominal Tawaran (Kembali ke R)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDanger}
                    onPress={handleBatalkanNego}
                  >
                    <Text style={styles.btnDangerText}>
                      🚫 Tidak, Batalkan Titipan (Langkah Z1)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {negoState.status === "DISETUJUI" ? (
              <View style={styles.statusBoxAccepted}>
                <Text style={styles.statusAcceptedTitle}>
                  🎉 Tawaran Disetujui Penjastip!
                </Text>
                <Text style={styles.statusAcceptedDesc}>
                  Melanjutkan ke penetapan total titipan & pembayaran (Langkah U)...
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // =========================================================================
  // RENDER SCREEN 7: PEMBAYARAN ESCROW (U, W, X1, Y)
  // ==========================================
  const renderPembayaran = () => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        {/* Top Header */}
        <View style={styles.subHeaderBar}>
          <TouchableOpacity
            style={styles.subHeaderBack}
            onPress={() => setCurrentScreen("FORM_ORDER")}
          >
            <Text style={styles.subHeaderBackText}>‹ Batal</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Pembayaran Saldo Tertahan</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <ServiceBadge
            service="payment"
            stepCode="Langkah U, W, X1, Y"
            actionText="payment-service menampung pembayaran sebagai saldo tertahan di rekening bersama kampus."
          />

          <View style={styles.paymentCard}>
            <Text style={styles.paymentHeading}>Rincian Tagihan Titipan (Langkah U)</Text>

            {/* Item Line */}
            <View style={styles.billLine}>
              <Text style={styles.billItem}>
                {activeTransaction.item.nama} (x{activeTransaction.jumlah})
              </Text>
              <Text style={styles.billValue}>
                {formatRupiah(activeTransaction.hargaBarang * activeTransaction.jumlah)}
              </Text>
            </View>

            {/* Jasa Line */}
            <View style={styles.billLine}>
              <Text style={styles.billItem}>Biaya Jasa Titip (Penjastip)</Text>
              <Text style={styles.billValue}>
                {formatRupiah(activeTransaction.ongkosJastip)}
              </Text>
            </View>

            {/* Platform Fee */}
            <View style={styles.billLine}>
              <Text style={styles.billItem}>Biaya Layanan Aplikasi</Text>
              <Text style={styles.billValue}>Rp 0 (Gratis Mahasiswa)</Text>
            </View>

            <View style={styles.divider} />

            {/* Total Line */}
            <View style={styles.billTotalLine}>
              <Text style={styles.billTotalText}>Total Pembayaran:</Text>
              <Text style={styles.billTotalNumber}>
                {formatRupiah(activeTransaction.totalBiaya)}
              </Text>
            </View>

            {/* Escrow Guarantee Box */}
            <View style={styles.escrowGuaranteeBox}>
              <Text style={styles.escrowIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.escrowTitle}>
                  Jaminan Keamanan Rekening Bersama (Escrow)
                </Text>
                <Text style={styles.escrowDesc}>
                  Dana Anda akan ditampung dengan status{" "}
                  <Text style={{ fontWeight: "700", color: THEME.accentTeal }}>
                    [SALDO TERTAHAN]
                  </Text>{" "}
                  oleh payment-service. Dana baru akan diteruskan ke penjastip setelah Anda
                  menerima barang titipan.
                </Text>
              </View>
            </View>

            {/* Metode Bayar Simulator */}
            <Text style={styles.inputLabel}>Metode Pembayaran Tersedia</Text>
            <View style={styles.paymentMethodOption}>
              <Text style={styles.pmIcon}>📱</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pmTitle}>QRIS Saldo Mahasiswa / E-Wallet</Text>
                <Text style={styles.pmSub}>Instan verifikasi tanpa biaya admin</Text>
              </View>
              <Text style={styles.pmCheck}>✓ Dipilih</Text>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleKonfirmasiBayar}>
              <Text style={styles.btnPrimaryText}>
                Bayar Sekarang & Konfirmasi Titipan (Langkah W & Y) ›
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // =========================================================================
  // RENDER SCREEN 8: TRACKING REAL-TIME TRANSAKSI (AA - AI)
  // ==========================================
  const renderTracking = () => {
    const stepsConfig = [
      {
        code: "AA",
        label: "Dititip",
        desc: "tracking-service mencatat status: dititip. order-service mengonfirmasi.",
        icon: "📝",
      },
      {
        code: "AC",
        label: "Dibelanjakan",
        desc: "Penjastip sedang membeli barang di toko sesuai pesanan.",
        icon: "🛍️",
      },
      {
        code: "AE",
        label: "Diantar",
        desc: "Penjastip sedang mengantar barang ke titik temu kampus.",
        icon: "🛵",
      },
      {
        code: "AG",
        label: "Diterima",
        desc: "Penitip mengonfirmasi barang telah diterima dengan lengkap.",
        icon: "📦",
      },
      {
        code: "AH",
        label: "Dana Dilepaskan",
        desc: "payment-service melepaskan dana saldo tertahan ke rekening Penjastip.",
        icon: "💰",
      },
      {
        code: "AI",
        label: "Selesai",
        desc: "Transaksi berhasil selesai secara tuntas.",
        icon: "🎉",
      },
    ];

    const currentStepIndex = stepsConfig.findIndex(
      (s) => s.code === activeTransaction.trackingStep
    );

    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        {/* Top Header */}
        <View style={styles.subHeaderBar}>
          <TouchableOpacity
            style={styles.subHeaderBack}
            onPress={() => setCurrentScreen("BERANDA_PENITIP")}
          >
            <Text style={styles.subHeaderBackText}>‹ Beranda</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Status Pelacakan Titipan</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <ServiceBadge
            service="tracking"
            stepCode={`Status: ${activeTransaction.trackingStep}`}
            actionText="tracking-service memantau & menyinkronkan status pesanan secara real-time."
          />

          {/* Order Header Summary */}
          <View style={styles.trackingCard}>
            <View style={styles.trackingHeaderRow}>
              <View>
                <Text style={styles.trxIdText}>{activeTransaction.id}</Text>
                <Text style={styles.trxTimeText}>{activeTransaction.waktu}</Text>
              </View>
              <View
                style={[
                  styles.escrowStatusBadge,
                  activeTransaction.statusEscrow === "DILEPASKAN"
                    ? styles.escrowReleased
                    : styles.escrowHolding,
                ]}
              >
                <Text style={styles.escrowStatusText}>
                  Escrow: {activeTransaction.statusEscrow}
                </Text>
              </View>
            </View>

            <View style={styles.trxItemMini}>
              <Image
                source={{ uri: activeTransaction.item.gambarUrl }}
                style={styles.miniTrxImage}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.trxItemTitle}>
                  {activeTransaction.jumlah}x {activeTransaction.item.nama}
                </Text>
                <Text style={styles.trxItemSub}>
                  Varian: {activeTransaction.varian}
                </Text>
                <Text style={styles.trxItemPrice}>
                  Total: {formatRupiah(activeTransaction.totalBiaya)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Stepper Timeline Visualizer */}
            <Text style={styles.timelineHeading}>Alur Perjalanan Jastip (AA - AI):</Text>

            <View style={styles.timelineWrap}>
              {stepsConfig.map((st, index) => {
                const isPassed = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <View key={st.code} style={styles.timelineStepRow}>
                    <View style={styles.timelineLeftCol}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isPassed && styles.timelineCirclePassed,
                          isCurrent && styles.timelineCircleCurrent,
                        ]}
                      >
                        <Text style={styles.timelineIconText}>{st.icon}</Text>
                      </View>
                      {index < stepsConfig.length - 1 ? (
                        <View
                          style={[
                            styles.timelineLine,
                            index < currentStepIndex && styles.timelineLinePassed,
                          ]}
                        />
                      ) : null}
                    </View>

                    <View style={styles.timelineRightCol}>
                      <View style={styles.timelineTitleRow}>
                        <Text
                          style={[
                            styles.timelineStepTitle,
                            isCurrent && styles.timelineStepTitleCurrent,
                          ]}
                        >
                          Langkah {st.code}: {st.label}
                        </Text>
                        {isCurrent ? (
                          <View style={styles.activeStepTag}>
                            <Text style={styles.activeStepTagText}>Aktif</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.timelineStepDesc}>{st.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Simulator Action Button to advance flowchart steps */}
            {activeTransaction.trackingStep !== "AI" ? (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleAdvanceTracking}
              >
                <Text style={styles.btnPrimaryText}>
                  ▶ Simulasikan Langkah Berikutnya (
                  {stepsConfig[currentStepIndex + 1]?.code} -{" "}
                  {stepsConfig[currentStepIndex + 1]?.label})
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBox}>
                <Text style={styles.completedEmoji}>🎊</Text>
                <Text style={styles.completedTitle}>Transaksi Selesai Sempurna!</Text>
                <Text style={styles.completedDesc}>
                  Barang telah diterima penitip dan payment-service telah sukses melepaskan
                  dana ke dompet penjastip.
                </Text>
                <TouchableOpacity
                  style={[styles.btnPrimary, { marginTop: 12 }]}
                  onPress={() => setCurrentScreen("BERANDA_PENITIP")}
                >
                  <Text style={styles.btnPrimaryText}>Kembali ke Beranda Utama</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // ==========================================
  // 5. MAIN ROUTING RENDER
  // ==========================================
  switch (currentScreen) {
    case "AUTH":
      return renderAuthScreen();
    case "BERANDA_PENITIP":
      return renderBerandaPenitip();
    case "BERANDA_PENJASTIP":
      return renderBerandaPenjastip();
    case "DETAIL_BARANG":
      return renderDetailBarang();
    case "FORM_ORDER":
      return renderFormOrder();
    case "PROSES_TAWAR":
      return renderProsesTawar();
    case "PEMBAYARAN":
      return renderPembayaran();
    case "TRACKING":
      return renderTracking();
    default:
      return renderAuthScreen();
  }
}

// ==========================================
// 6. STYLESHEET (PROFESSIONAL ROYAL BLUE)
// ==========================================
const styles = StyleSheet.create({
  // Global Containers
  authContainer: {
    flex: 1,
    backgroundColor: THEME.primaryDark,
  },
  authScroll: {
    paddingBottom: 40,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Auth Styles
  authHero: {
    padding: 24,
    paddingTop: Platform.OS === "android" ? 30 : 16,
    alignItems: "center",
  },
  appLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME.borderFocus,
  },
  appLogoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: "#CBD5E1",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  authBadgeWrap: {
    width: "100%",
    marginTop: 16,
  },
  authCard: {
    backgroundColor: THEME.surface,
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: THEME.surfaceAlt,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: THEME.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMuted,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  formContent: {
    width: "100%",
  },
  formHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: THEME.textMain,
  },
  rolePickerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  roleCardOption: {
    flex: 1,
    backgroundColor: THEME.bg,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  roleCardActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  roleIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textMain,
  },
  roleDesc: {
    fontSize: 10,
    color: THEME.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  rolePillRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rolePill: {
    flex: 1,
    backgroundColor: THEME.bg,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  rolePillActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
  },
  rolePillTextActive: {
    color: THEME.primary,
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  demoBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  demoBoxTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMuted,
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: THEME.surfaceAlt,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.primary,
  },

  // Service Badge Styles
  serviceBadge: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
  },
  serviceBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  stepPill: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  stepPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
  },
  serviceDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },

  // Main Headers
  headerBar: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 24 : 12,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerCampus: {
    fontSize: 12,
    color: "#BFDBFE",
    marginTop: 2,
  },
  headerRoleSwitch: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerRoleSwitchText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subHeaderBar: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 24 : 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subHeaderBack: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  subHeaderBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  subHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Penitip Catalog Styles
  catalogList: {
    padding: 16,
    paddingBottom: 40,
  },
  sesiStatusCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: THEME.borderFocus,
    marginBottom: 12,
  },
  sesiTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accentEmerald,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  sesiDeadline: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMuted,
  },
  sesiTokoName: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
    marginTop: 6,
  },
  sesiDetailsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  sesiDetailPill: {
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: THEME.primarySoft,
    color: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.textMain,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
  },
  catChip: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
  },
  catChipTextActive: {
    color: "#FFFFFF",
  },
  sectionHeaderWrap: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.textMain,
  },
  sectionSub: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },

  // Product Card Styles
  productCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: THEME.surfaceAlt,
  },
  productInfo: {
    padding: 14,
  },
  productBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productCatTag: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accentTeal,
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productStokTag: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.textMuted,
  },
  productName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 2,
  },
  productStore: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 6,
  },
  productDesc: {
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 16,
    marginBottom: 10,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: THEME.textLight,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "900",
    color: THEME.primaryDark,
  },
  productUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.textMuted,
  },
  btnPilihPill: {
    backgroundColor: THEME.primarySoft,
    borderWidth: 1,
    borderColor: THEME.borderFocus,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnPilihText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
  },

  // Penjastip Styles
  penjastipScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sessionOverviewCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  sessionCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 10,
  },
  sessionCardDetails: {
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sessionDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionItemLabel: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  sessionItemVal: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
  },
  formSesiCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  formSesiTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
  },
  formSesiSubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  tokoSelectRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 6,
  },
  tokoOptionCard: {
    width: 140,
    backgroundColor: THEME.bg,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 10,
  },
  tokoOptionActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  tokoOptionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tokoOptionName: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
  },
  tokoOptionNameActive: {
    color: THEME.primary,
  },
  tokoOptionLokasi: {
    fontSize: 10,
    color: THEME.textLight,
    marginTop: 4,
  },
  inputGridTwo: {
    flexDirection: "row",
    gap: 10,
  },
  gridCol: {
    flex: 1,
  },
  liveOrderBox: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  liveOrderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 10,
  },
  liveOrderItem: {
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  liveOrderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveOrderUser: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMain,
  },
  liveOrderBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.primary,
    backgroundColor: THEME.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveOrderDesc: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 4,
  },
  liveOrderTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.accentTeal,
    marginTop: 6,
  },

  // Detail & Form Order Styles
  detailScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  detailHeroImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 14,
  },
  detailCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  detailBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailCategory: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.accentTeal,
  },
  detailStock: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.accentEmerald,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textMain,
  },
  detailStore: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.primary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 14,
  },
  detailDescTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMain,
    marginBottom: 4,
  },
  detailDesc: {
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  detailPriceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.bg,
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  detailPriceLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "700",
  },
  detailPriceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.primaryDark,
  },
  detailPriceUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textMuted,
  },
  verifiedTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedTagText: {
    color: THEME.accentEmerald,
    fontSize: 10,
    fontWeight: "800",
  },
  validationBox: {
    backgroundColor: THEME.primarySoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.borderFocus,
  },
  validationTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primaryDark,
    marginBottom: 4,
  },
  validationItem: {
    fontSize: 12,
    color: THEME.textMain,
    marginTop: 2,
  },

  // Form Order White Card
  formCardWhite: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  formCardHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 12,
  },
  selectedItemMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  miniImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  miniInfo: {
    marginLeft: 10,
    flex: 1,
  },
  miniName: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textMain,
  },
  miniPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: THEME.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textMain,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
  },
  stepperSubtotal: {
    marginLeft: "auto",
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMuted,
  },  
  decisionBox: {
    backgroundColor: THEME.bg,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  decisionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textMain,
  },
  decisionDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
  decisionToggleRow: {
    gap: 8,
    marginTop: 10,
  },
  decisionToggleBtn: {
    backgroundColor: THEME.surface,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 10,
  },
  decisionToggleBtnActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  decisionToggleBtnActiveTawar: {
    borderColor: THEME.accentAmber,
    backgroundColor: "#FFFBEB",
  },
  decisionToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
    textAlign: "center",
  },
  decisionToggleTextActive: {
    color: THEME.textMain,
  },
  negoInputWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  negoTip: {
    fontSize: 10,
    color: THEME.accentAmber,
    marginTop: 4,
    fontWeight: "600",
  },
  totalPreviewBox: {
    backgroundColor: THEME.primarySoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.borderFocus,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primaryDark,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: "900",
    color: THEME.primary,
  },

  // Negosiasi Screen Styles
  negoCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  negoCardHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
  },
  negoCardSub: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  negoSummaryBox: {
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  negoSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  negoSummaryLabel: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  negoSummaryVal: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
  },
  statusBoxWaiting: {
    marginTop: 16,
    padding: 14,
    backgroundColor: THEME.primarySoft,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.borderFocus,
  },
  statusBoxWaitingText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
    marginTop: 8,
  },
  simulasiActionRow: {
    width: "100%",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.borderFocus,
  },
  simulasiTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 8,
    textAlign: "center",
  },
  simulasiBtnRow: {
    gap: 8,
  },
  simulasiBtnAccept: {
    backgroundColor: THEME.accentEmerald,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  simulasiBtnReject: {
    backgroundColor: THEME.accentRose,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  simulasiBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  statusBoxRejected: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#FFF1F2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  statusRejectedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.accentRose,
  },
  statusRejectedDesc: {
    fontSize: 12,
    color: THEME.textMain,
    marginTop: 4,
    fontStyle: "italic",
  },
  decisionBranchBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#FECDD3",
    gap: 8,
  },
  decisionBranchTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 4,
  },
  btnSecondary: {
    backgroundColor: THEME.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  btnDanger: {
    backgroundColor: THEME.surface,
    borderWidth: 1.5,
    borderColor: THEME.accentRose,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDangerText: {
    color: THEME.accentRose,
    fontSize: 12,
    fontWeight: "800",
  },
  statusBoxAccepted: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusAcceptedTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.accentEmerald,
  },
  statusAcceptedDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 4,
  },

  // Payment Screen Styles
  paymentCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  paymentHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 12,
  },
  billLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  billItem: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  billValue: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
  },
  billTotalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  billTotalText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textMain,
  },
  billTotalNumber: {
    fontSize: 19,
    fontWeight: "900",
    color: THEME.primary,
  },
  escrowGuaranteeBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  escrowIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.accentTeal,
  },
  escrowDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  paymentMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bg,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  pmIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  pmTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMain,
  },
  pmSub: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  pmCheck: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.primary,
  },

  // Tracking Screen Styles
  trackingCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  trackingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trxIdText: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
  },
  trxTimeText: {
    fontSize: 11,
    color: THEME.textLight,
  },
  escrowStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  escrowHolding: {
    backgroundColor: "#FEF3C7",
  },
  escrowReleased: {
    backgroundColor: "#ECFDF5",
  },
  escrowStatusText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
  },
  trxItemMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  miniTrxImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trxItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textMain,
  },
  trxItemSub: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  trxItemPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
    marginTop: 2,
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textMain,
    marginBottom: 12,
  },
  timelineWrap: {
    paddingLeft: 4,
  },
  timelineStepRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineLeftCol: {
    alignItems: "center",
    width: 32,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.surfaceAlt,
    borderWidth: 1.5,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineCirclePassed: {
    backgroundColor: THEME.primarySoft,
    borderColor: THEME.primary,
  },
  timelineCircleCurrent: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  timelineIconText: {
    fontSize: 12,
  },
  timelineLine: {
    position: "absolute",
    top: 28,
    width: 2,
    height: 38,
    backgroundColor: THEME.border,
    zIndex: 1,
  },
  timelineLinePassed: {
    backgroundColor: THEME.primary,
  },
  timelineRightCol: {
    flex: 1,
    marginLeft: 10,
  },
  timelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMuted,
  },
  timelineStepTitleCurrent: {
    color: THEME.primary,
    fontWeight: "800",
  },
  activeStepTag: {
    backgroundColor: THEME.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeStepTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.primary,
  },
  timelineStepDesc: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
    lineHeight: 14,
  },
  completedBox: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  completedEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.accentEmerald,
  },
  completedDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },

  // Empty State
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 4,
  },
});