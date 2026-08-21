import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getDaftarBarang, getDaftarToko, login } from "./api/endpoints";
import TransaksiScreen from "./screens/TransaksiScreen";
import SuksesScreen from "./screens/SuksesScreen";

const Stack = createNativeStackNavigator();

const C = {
  bg: "#F4F9FF",
  bgSoft: "#EAF4FF",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF3FF",
  border: "#C9DDF4",
  borderStrong: "#90B8E8",
  pink: "#0B63CE",
  pinkDark: "#0A3E7C",
  purple: "#1B88E5",
  mint: "#D9ECFF",
  sky: "#79B8FF",
  lemon: "#E7F3FF",
  peach: "#D5E8FF",
  success: "#2FA36B",
  danger: "#D95C74",
  text: "#17375E",
  textSoft: "#5C7DA4",
};

const ROLE_CONTENT = {
  penitip: {
    icon: "🛍️",
    title: "Penitip",
    subtitle: "Titipkan barang favoritmu tanpa keluar kampus",
    heroTitle: "Mau jastip apa hari ini?",
    heroSubtitle: "Pilih toko, pilih barang, lalu kirim titipan ke penjastip terpercaya.",
    cta: "Ajukan Titipan",
  },
  penjastip: {
    icon: "🛵",
    title: "Penjastip",
    subtitle: "Buka sesi jastip dan terima permintaan belanja",
    heroTitle: "Kelola sesi jastipmu",
    heroSubtitle: "Atur toko, batas waktu, dan kapasitas untuk menerima titipan masuk.",
    cta: "Buka Sesi Jastip",
  },
};

const KATEGORI_IKON = {
  "Minuman Kekinian": "🧋",
  "Makanan Khas": "🍜",
  "Buku & Alat Tulis": "📚",
  Elektronik: "📱",
  Minimarket: "🛒",
  "Kuliner Khas": "🍌",
  "Kafe & Kopi": "☕",
  "Fast Food": "🍔",
  "Lifestyle & Aksesoris": "🎀",
  "Apotek & Kesehatan": "💊",
  "Tas & Fashion": "👜",
  "Tas Branded": "👛",
  "Tas Sekolah & Kampus": "🎒",
  Umum: "🎁",
};

const REGISTER_DEFAULT = {
  nama: "",
  email: "",
  noHp: "",
  kampus: "",
  password: "",
  peran: "penitip",
};

const LOGIN_DEFAULT = {
  email: "",
  password: "",
  peran: "penitip",
  nama: "",
};

const DEMO_TOKO = [
  { id: 1,  nama: "KFC Panakkukang",          alamat: "Mall Panakkukang Lt.GF, Jl. Boulevard, Makassar",            kategori: "Fast Food" },
  { id: 2,  nama: "Chatime Losari",             alamat: "Pantai Losari, Jl. Penghibur No.1, Makassar",                kategori: "Minuman Kekinian" },
  { id: 3,  nama: "Mie Titi Makassar",          alamat: "Jl. Irian No.18, Makassar",                                  kategori: "Makanan Khas" },
  { id: 4,  nama: "Coto Makassar Nusantara",    alamat: "Jl. Nusantara No.32, Makassar",                              kategori: "Makanan Khas" },
  { id: 5,  nama: "J.CO Donuts & Coffee TSM",   alamat: "Trans Studio Mall Lt.GF, Jl. Metro Tanjung Bunga, Makassar", kategori: "Kafe & Kopi" },
  { id: 6,  nama: "Gramedia Karebosi",           alamat: "Mall Karebosi Link Lt.2, Jl. Jend. Ahmad Yani, Makassar",   kategori: "Buku & Alat Tulis" },
  { id: 7,  nama: "Erafone Trans Studio Mall",   alamat: "Trans Studio Mall Lt.1, Jl. Metro Tanjung Bunga, Makassar", kategori: "Elektronik" },
  { id: 8,  nama: "Tas Cantik Makassar",         alamat: "Mall Panakkukang Lt.1, Jl. Boulevard, Makassar",            kategori: "Tas & Fashion" },
  { id: 9,  nama: "Eiger Adventure MaRI",        alamat: "Mall Ratu Indah Lt.1, Jl. Dr. Sam Ratulangi, Makassar",     kategori: "Tas Sekolah & Kampus" },
  { id: 10, nama: "Zara Bag Store TSM",          alamat: "Trans Studio Mall Lt.2, Jl. Metro Tanjung Bunga, Makassar", kategori: "Tas Branded" },
];

const DEMO_ITEMS = [
  // ── KFC Panakkukang (Fast Food) ─────────────────────────────────────────────
  { id: 1,  toko_id: 1, nama: "KFC Original Crispy Chicken 2 Pcs + Nasi",      harga: 55000,  stok: 50,  satuan: "pcs" },
  { id: 2,  toko_id: 1, nama: "KFC Burger Zinger Jr. Spicy",                    harga: 42000,  stok: 40,  satuan: "pcs" },
  { id: 3,  toko_id: 1, nama: "KFC Chicken Strips 3 Pcs + Saus",                harga: 38000,  stok: 35,  satuan: "pcs" },
  { id: 4,  toko_id: 1, nama: "Krushers Vanilla Ice Blended (M)",               harga: 28000,  stok: 60,  satuan: "pcs" },
  { id: 5,  toko_id: 1, nama: "KFC Bucket Keluarga 10 Pcs Original",            harga: 195000, stok: 15,  satuan: "pcs" },
  // ── Chatime Losari (Minuman Kekinian) ────────────────────────────────────────
  { id: 6,  toko_id: 2, nama: "Brown Sugar Boba Milk Tea (L)",                  harga: 42000,  stok: 30,  satuan: "pcs" },
  { id: 7,  toko_id: 2, nama: "Matcha Latte Chatime (M)",                       harga: 35000,  stok: 25,  satuan: "pcs" },
  { id: 8,  toko_id: 2, nama: "Classic Pearl Milk Tea (L)",                     harga: 32000,  stok: 35,  satuan: "pcs" },
  { id: 9,  toko_id: 2, nama: "Taro Milk Tea with Pudding (M)",                 harga: 37000,  stok: 28,  satuan: "pcs" },
  // ── Mie Titi Makassar (Makanan Khas) ─────────────────────────────────────────
  { id: 10, toko_id: 3, nama: "Mie Titi Original Crispy (Reguler)",             harga: 35000,  stok: 20,  satuan: "pcs" },
  { id: 11, toko_id: 3, nama: "Mie Titi Udang Saus Tiram",                      harga: 45000,  stok: 18,  satuan: "pcs" },
  { id: 12, toko_id: 3, nama: "Es Teh Manis Makassar",                          harga: 8000,   stok: 60,  satuan: "pcs" },
  // ── Coto Makassar Nusantara (Makanan Khas) ────────────────────────────────────
  { id: 13, toko_id: 4, nama: "Coto Makassar Daging Campur 1 Mangkuk",          harga: 30000,  stok: 30,  satuan: "pcs" },
  { id: 14, toko_id: 4, nama: "Ketupat Buras Coto Makassar 2 Biji",             harga: 5000,   stok: 80,  satuan: "pcs" },
  { id: 15, toko_id: 4, nama: "Es Kelapa Muda Coto Nusantara",                  harga: 15000,  stok: 40,  satuan: "pcs" },
  // ── J.CO Donuts & Coffee TSM (Kafe & Kopi) ───────────────────────────────────
  { id: 16, toko_id: 5, nama: "J.CO Donut Original Glazed 6 Pcs Box",           harga: 75000,  stok: 20,  satuan: "box" },
  { id: 17, toko_id: 5, nama: "J.CO Ice Blended Avocado Latte (M)",             harga: 48000,  stok: 30,  satuan: "pcs" },
  { id: 18, toko_id: 5, nama: "J.CO Cappuccino Hot (R)",                        harga: 38000,  stok: 35,  satuan: "pcs" },
  // ── Gramedia Karebosi (Buku & Alat Tulis) ────────────────────────────────────
  { id: 19, toko_id: 6, nama: "Novel Bumi - Tere Liye (Edisi Baru)",            harga: 89000,  stok: 12,  satuan: "pcs" },
  { id: 20, toko_id: 6, nama: "Buku Algoritma & Pemrograman Rinaldi Munir",     harga: 95000,  stok: 10,  satuan: "pcs" },
  { id: 21, toko_id: 6, nama: "Stabilo Boss Highlighter Set 4 Warna",           harga: 28000,  stok: 50,  satuan: "set" },
  { id: 22, toko_id: 6, nama: "Pulpen Faber-Castell 0.5mm Tinta Hitam",         harga: 7000,   stok: 100, satuan: "pcs" },
  // ── Erafone Trans Studio Mall (Elektronik) ────────────────────────────────────
  { id: 23, toko_id: 7, nama: "Samsung Galaxy A15 Smartphone 4/128GB",          harga: 2199000,stok: 8,   satuan: "pcs" },
  { id: 24, toko_id: 7, nama: "Kabel Data Anker USB-C 1 Meter Fast Charging",   harga: 89000,  stok: 30,  satuan: "pcs" },
  { id: 25, toko_id: 7, nama: "Earphone Samsung AKG In-Ear Type-C",             harga: 150000, stok: 20,  satuan: "pcs" },
  // ── Tas Cantik Makassar (Tas & Fashion) ──────────────────────────────────────
  { id: 26, toko_id: 8, nama: "Tas Selempang Wanita Kulit Sintetis Coklat",     harga: 85000,  stok: 15,  satuan: "pcs" },
  { id: 27, toko_id: 8, nama: "Tas Tote Bag Kanvas Motif Bunga Pastel Pink",    harga: 65000,  stok: 20,  satuan: "pcs" },
  { id: 28, toko_id: 8, nama: "Tas Clutch Mini Wanita Bahan Satin Hitam",       harga: 75000,  stok: 12,  satuan: "pcs" },
  { id: 29, toko_id: 8, nama: "Tas Belanja Anyaman Rotan Pantai Natural",       harga: 120000, stok: 10,  satuan: "pcs" },
  { id: 30, toko_id: 8, nama: "Tas Sling Bag Casual Pria Biru Navy",            harga: 95000,  stok: 18,  satuan: "pcs" },
  // ── Eiger Adventure MaRI (Tas Sekolah & Kampus) ──────────────────────────────
  { id: 31, toko_id: 9, nama: "Tas Ransel Eiger Cordura 30L Warna Hitam",       harga: 650000, stok: 8,   satuan: "pcs" },
  { id: 32, toko_id: 9, nama: "Tas Daypack Eiger Trail Lite 20L Abu-Abu",       harga: 425000, stok: 12,  satuan: "pcs" },
  { id: 33, toko_id: 9, nama: "Tas Laptop Eiger 15 Inch Army Green",            harga: 375000, stok: 10,  satuan: "pcs" },
  { id: 34, toko_id: 9, nama: "Tas Pinggang Eiger Waist Bag Olive Green",       harga: 185000, stok: 15,  satuan: "pcs" },
  { id: 35, toko_id: 9, nama: "Tas Kampus Eiger Student Pack 25L Merah",        harga: 320000, stok: 9,   satuan: "pcs" },
  // ── Zara Bag Store TSM (Tas Branded) ─────────────────────────────────────────
  { id: 36, toko_id: 10, nama: "Tas Bahu Zara Faux Leather Medium Putih Krem",  harga: 550000, stok: 5,   satuan: "pcs" },
  { id: 37, toko_id: 10, nama: "Tas Tote Zara Striped Canvas Hitam Putih",      harga: 480000, stok: 6,   satuan: "pcs" },
  { id: 38, toko_id: 10, nama: "Tas Mini Crossbody Zara Gold Chain Beige",      harga: 620000, stok: 4,   satuan: "pcs" },
];

function formatRupiah(angka = 0) {
  return `Rp ${Number(angka || 0).toLocaleString("id-ID")}`;
}

function capitalizeWords(teks = "") {
  return teks
    .split(" ")
    .filter(Boolean)
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
}

function getProductImagePrompt(name = "", category = "", storeName = "") {
  const cleanName = String(name || "product").trim();
  const cleanCategory = String(category || "shopping").trim();
  const cleanStore = String(storeName || "").trim();

  // Prompt dibuat dari NAMA PRODUK, bukan hanya kategori.
  // Ini jauh lebih relevan daripada loremflickr yang sering mengembalikan
  // foto acak yang tidak berhubungan dengan produk.
  return [
    "professional ecommerce product photo",
    cleanName,
    cleanCategory,
    cleanStore,
    "single product centered",
    "front view",
    "clean light background",
    "realistic",
    "high detail",
    "no people",
    "no text",
    "no watermark",
  ].filter(Boolean).join(", ");
}

function buildGeneratedProductImageUrl(item, category, storeName = "") {
  const prompt = getProductImagePrompt(item.nama, category, storeName);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=650&nologo=true&seed=${item.id}`;
}

function getBackendImage(item = {}) {
  // Dukung beberapa nama field umum dari backend.
  return (
    item.imageUrl ||
    item.image_url ||
    item.image ||
    item.gambar ||
    item.gambar_url ||
    item.foto ||
    item.foto_url ||
    item.photo ||
    item.thumbnail ||
    null
  );
}

function buildItemViewModel(items, tokoList) {
  const tokoMap = new Map((tokoList || []).map((toko) => [toko.id, toko]));

  return (items || []).map((item) => {
    const toko = tokoMap.get(item.toko_id) || {};
    const kategori = toko.kategori || item.kategori || "Umum";
    const tokoNama = toko.nama || item.toko_nama || `Toko #${item.toko_id}`;

    // Jika backend sudah memiliki foto produk, PAKAI FOTO ASLI.
    // Jika belum ada, fallback ke gambar yang dibuat berdasarkan nama produk.
    const backendImage = getBackendImage(item);

    return {
      ...item,
      kategori,
      toko_nama: tokoNama,
      toko_alamat: toko.alamat || item.toko_alamat || "-",
      kategoriIkon: KATEGORI_IKON[kategori] || KATEGORI_IKON.Umum,
      imageUrl: backendImage || buildGeneratedProductImageUrl(item, kategori, tokoNama),
      imageIsBackend: Boolean(backendImage),
    };
  });
}

function ProductImage({ item, style }) {
  const [uri, setUri] = useState(item.imageUrl);

  useEffect(() => {
    setUri(item.imageUrl);
  }, [item.imageUrl]);

  function handleImageError() {
    const fallback = buildGeneratedProductImageUrl(
      { ...item, id: `${item.id}-fallback` },
      item.kategori,
      item.toko_nama
    );
    if (uri !== fallback) setUri(fallback);
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={handleImageError}
    />
  );
}

function StatCard({ label, value, tone }) {
  const mapTone = {
    pink: { bg: "#EEF6FF", border: "#B9D8F8" },
    purple: { bg: "#E8F3FF", border: "#C3DCF8" },
    mint: { bg: "#F3F9FF", border: "#D2E6FB" },
    lemon: { bg: "#ECF6FF", border: "#C8DEFA" },
  };
  const toneStyle = mapTone[tone] || mapTone.pink;
  return (
    <View style={[shared.statCard, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}>
      <Text style={shared.statValue}>{value}</Text>
      <Text style={shared.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={shared.sectionHeader}>
      <Text style={shared.eyebrow}>{eyebrow}</Text>
      <Text style={shared.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={shared.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function AuthScreen({ navigation }) {
  const [tab, setTab] = useState("register");
  const [registerForm, setRegisterForm] = useState(REGISTER_DEFAULT);
  const [loginForm, setLoginForm] = useState(LOGIN_DEFAULT);
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState(null);

  function setRegisterField(key, value) {
    setRegisterForm((prev) => ({ ...prev, [key]: value }));
  }

  function setLoginField(key, value) {
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleRegister() {
    const wajib = ["nama", "email", "noHp", "kampus", "password"];
    const belumIsi = wajib.find((field) => !registerForm[field].trim());
    if (belumIsi) {
      setPesan({ type: "error", text: "Semua field registrasi wajib diisi." });
      return;
    }
    setPesan({ type: "success", text: "Akun demo berhasil dibuat. Sekarang login untuk masuk ke aplikasi." });
    setLoginForm({
      email: registerForm.email,
      password: registerForm.password,
      peran: registerForm.peran,
      nama: registerForm.nama,
    });
    setTab("login");
  }

  async function handleLogin() {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setPesan({ type: "error", text: "Email dan password wajib diisi." });
      return;
    }

    setMemuat(true);
    setPesan(null);

    try {
      let authToken = null;
      let modeDemoAuth = false;

      try {
        const auth = await login(
          loginForm.peran === "penjastip" ? "jastip" : loginForm.email.trim()
        );
        authToken = auth.token;
      } catch {
        modeDemoAuth = true;
      }

      navigation.replace("Beranda", {
        peran: loginForm.peran,
        token: authToken,
        demoAuth: modeDemoAuth,
        profil: {
          nama: capitalizeWords(loginForm.nama || loginForm.email.split("@")[0] || "Pengguna"),
          email: loginForm.email.trim(),
          kampus: registerForm.kampus || "Kampus Makassar",
        },
      });
    } finally {
      setMemuat(false);
    }
  }

  return (
    <SafeAreaView style={auth.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={auth.scroll} showsVerticalScrollIndicator={false}>
        <View style={auth.heroCard}>
          <Text style={auth.heroEmoji}>🎓</Text>
          <Text style={auth.heroTitle}>Jastip Kampus</Text>
          <Text style={auth.heroSubtitle}>
            Alur lengkap sesuai flowchart: register, login, pilih peran, lalu masuk ke dashboard yang berbeda.
          </Text>
        </View>

        <View style={auth.tabRow}>
          <TouchableOpacity
            style={[auth.tabButton, tab === "register" && auth.tabButtonActive]}
            onPress={() => setTab("register")}
          >
            <Text style={[auth.tabText, tab === "register" && auth.tabTextActive]}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[auth.tabButton, tab === "login" && auth.tabButtonActive]}
            onPress={() => setTab("login")}
          >
            <Text style={[auth.tabText, tab === "login" && auth.tabTextActive]}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={auth.formCard}>
          {tab === "register" ? (
            <>
              <SectionHeader
                eyebrow="Langkah 1"
                title="Buat akun baru"
                subtitle="Isi data diri mahasiswa atau penjastip sebelum masuk ke aplikasi."
              />
              <TextInput
                style={auth.input}
                placeholder="Nama lengkap"
                placeholderTextColor={C.textSoft}
                value={registerForm.nama}
                onChangeText={(value) => setRegisterField("nama", value)}
              />
              <TextInput
                style={auth.input}
                placeholder="Email"
                placeholderTextColor={C.textSoft}
                keyboardType="email-address"
                value={registerForm.email}
                onChangeText={(value) => setRegisterField("email", value)}
              />
              <TextInput
                style={auth.input}
                placeholder="No. HP"
                placeholderTextColor={C.textSoft}
                keyboardType="phone-pad"
                value={registerForm.noHp}
                onChangeText={(value) => setRegisterField("noHp", value)}
              />
              <TextInput
                style={auth.input}
                placeholder="Asal kampus"
                placeholderTextColor={C.textSoft}
                value={registerForm.kampus}
                onChangeText={(value) => setRegisterField("kampus", value)}
              />
              <TextInput
                style={auth.input}
                placeholder="Password"
                placeholderTextColor={C.textSoft}
                secureTextEntry
                value={registerForm.password}
                onChangeText={(value) => setRegisterField("password", value)}
              />

              <Text style={auth.roleLabel}>Pilih peran</Text>
              <View style={auth.roleRow}>
                {["penitip", "penjastip"].map((peran) => (
                  <TouchableOpacity
                    key={peran}
                    style={[
                      auth.roleCard,
                      registerForm.peran === peran && auth.roleCardActive,
                    ]}
                    onPress={() => setRegisterField("peran", peran)}
                  >
                    <Text style={auth.roleIcon}>{ROLE_CONTENT[peran].icon}</Text>
                    <Text style={auth.roleTitle}>{ROLE_CONTENT[peran].title}</Text>
                    <Text style={auth.roleSubtitle}>{ROLE_CONTENT[peran].subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={auth.primaryButton} onPress={handleRegister}>
                <Text style={auth.primaryButtonText}>Buat Akun</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <SectionHeader
                eyebrow="Langkah 2"
                title="Login ke aplikasi"
                subtitle="Masuk sesuai peran agar tampilan beranda berbeda antara Penitip dan Penjastip."
              />
              <TextInput
                style={auth.input}
                placeholder="Email"
                placeholderTextColor={C.textSoft}
                keyboardType="email-address"
                value={loginForm.email}
                onChangeText={(value) => setLoginField("email", value)}
              />
              <TextInput
                style={auth.input}
                placeholder="Password"
                placeholderTextColor={C.textSoft}
                secureTextEntry
                value={loginForm.password}
                onChangeText={(value) => setLoginField("password", value)}
              />

              <Text style={auth.roleLabel}>Masuk sebagai</Text>
              <View style={auth.rolePillRow}>
                {["penitip", "penjastip"].map((peran) => (
                  <TouchableOpacity
                    key={peran}
                    style={[
                      auth.rolePill,
                      loginForm.peran === peran && auth.rolePillActive,
                    ]}
                    onPress={() => setLoginField("peran", peran)}
                  >
                    <Text style={auth.rolePillText}>
                      {ROLE_CONTENT[peran].icon} {ROLE_CONTENT[peran].title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[auth.primaryButton, memuat && auth.buttonDisabled]}
                onPress={handleLogin}
                disabled={memuat}
              >
                {memuat ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={auth.primaryButtonText}>Masuk Sekarang</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {pesan ? (
            <View
              style={[
                auth.noticeBox,
                pesan.type === "error" ? auth.noticeError : auth.noticeSuccess,
              ]}
            >
              <Text
                style={[
                  auth.noticeText,
                  pesan.type === "error" ? auth.noticeTextError : auth.noticeTextSuccess,
                ]}
              >
                {pesan.text}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PenitipDashboard({
  profil,
  navigation,
  filteredItems,
  tokoList,
  selectedStoreId,
  setSelectedStoreId,
  kategoriAktif,
  setKategoriAktif,
  daftarKategori,
  cari,
  setCari,
  modeDemo,
  demoReason,
}) {
  const tokoUnggulan = [{ id: "Semua", nama: "Semua Toko", kategori: "Semua katalog" }, ...tokoList.slice(0, 5)];

  const header = (
    <View>
      <View style={penitip.heroCard}>
        <View style={penitip.heroTag}>
          <Text style={penitip.heroTagText}>Dashboard Penitip</Text>
        </View>
        <Text style={penitip.heroTitle}>Halo, {profil.nama || "Mahasiswa"} 👋</Text>
        <Text style={penitip.heroSubtitle}>{ROLE_CONTENT.penitip.heroSubtitle}</Text>
        <View style={penitip.heroStatsRow}>
          <StatCard label="Barang Ready" value={filteredItems.length} tone="pink" />
          <StatCard label="Toko Aktif" value={tokoList.length} tone="purple" />
          <StatCard label="Flow" value="3 Langkah" tone="mint" />
        </View>
      </View>

      <View style={shared.utilityRow}>
        <TouchableOpacity style={shared.switchButton} onPress={() => navigation.replace("Login")}>
          <Text style={shared.switchButtonText}>Ganti Akun</Text>
        </TouchableOpacity>
        <View style={shared.profilePill}>
          <Text style={shared.profilePillText}>{profil.kampus || "Kampus Makassar"}</Text>
        </View>
      </View>

      {modeDemo ? (
        <View style={shared.demoBanner}>
          <Text style={shared.demoBannerText}>{demoReason || "Mode demo aktif karena backend belum merespons."}</Text>
        </View>
      ) : null}

      <View style={shared.searchBox}>
        <Text style={shared.searchIcon}>🔎</Text>
        <TextInput
          style={shared.searchInput}
          placeholder="Cari barang, toko, atau kategori..."
          placeholderTextColor={C.textSoft}
          value={cari}
          onChangeText={setCari}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={shared.categoryRow}
      >
        {daftarKategori.map((kategori) => (
          <TouchableOpacity
            key={kategori}
            style={[
              shared.categoryChip,
              kategoriAktif === kategori && shared.categoryChipActive,
            ]}
            onPress={() => setKategoriAktif(kategori)}
          >
            <Text style={[shared.categoryChipText, kategoriAktif === kategori && shared.categoryChipTextActive]}>
              {kategori === "Semua" ? "📚" : KATEGORI_IKON[kategori] || "🎁"} {kategori}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionHeader
        eyebrow="Toko Pilihan"
        title="Buka daftar jastip berdasarkan toko"
        subtitle="Flowchart bagian penitip: lihat toko, pilih barang, lalu kirim detail titipan."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={penitip.storeRow}
      >
        {tokoUnggulan.map((toko, index) => (
          <TouchableOpacity
            key={toko.id}
            style={[
              penitip.storeCard,
              { backgroundColor: [C.surfaceAlt, "#F2F7FF", "#EEF6FF", "#EAF4FF", "#F7FBFF", "#EEF6FF"][index % 6] },
              selectedStoreId === String(toko.id) && penitip.storeCardActive,
            ]}
            onPress={() => setSelectedStoreId(String(toko.id))}
            activeOpacity={0.9}
          >
            <Text style={penitip.storeEmoji}>
              {toko.id === "Semua" ? "🏬" : KATEGORI_IKON[toko.kategori] || "🏪"}
            </Text>
            <Text style={[penitip.storeName, selectedStoreId === String(toko.id) && penitip.storeNameActive]}>{toko.nama}</Text>
            <Text style={[penitip.storeCategory, selectedStoreId === String(toko.id) && penitip.storeCategoryActive]}>{toko.kategori}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionHeader
        eyebrow="Katalog Penitip"
        title="Pilih barang untuk dititipkan"
        subtitle="Setiap kartu menampilkan toko, kategori, harga, dan stok."
      />
    </View>
  );

  return (
    <SafeAreaView style={shared.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={header}
        contentContainerStyle={shared.listContainer}
        columnWrapperStyle={shared.gridRow}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={penitip.itemCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Transaksi", { item, peran: "penitip", profil })}
          >
            <ProductImage item={item} style={penitip.itemImage} />
            <View style={penitip.itemCategoryBadge}>
              <Text style={penitip.itemCategoryBadgeText}>{item.kategori}</Text>
            </View>
            <View style={penitip.itemTopRow}>
              <Text style={penitip.itemEmoji}>{item.kategoriIkon}</Text>
              <View style={penitip.stockPill}>
                <Text style={penitip.stockPillText}>Stok {item.stok}</Text>
              </View>
            </View>
            <Text style={penitip.itemName} numberOfLines={2}>{item.nama}</Text>

            <View style={penitip.storeLine}>
              <Text style={penitip.storeIcon}>●</Text>
              <Text style={penitip.itemStore} numberOfLines={1}>{item.toko_nama}</Text>
            </View>

            <Text style={penitip.itemCategory} numberOfLines={2}>{item.toko_alamat}</Text>

            <View style={penitip.priceRow}>
              <View>
                <Text style={penitip.priceLabel}>Mulai dari</Text>
                <Text style={penitip.itemPrice}>{formatRupiah(item.harga)}</Text>
              </View>
              <View style={penitip.buyCircle}>
                <Text style={penitip.buyCircleText}>›</Text>
              </View>
            </View>

            <View style={penitip.ctaButton}>
              <Text style={penitip.ctaButtonText}>＋ {ROLE_CONTENT.penitip.cta}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={shared.emptyBox}>
            <Text style={shared.emptyEmoji}>📦</Text>
            <Text style={shared.emptyText}>Barang yang kamu cari belum tersedia.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PenjastipDashboard({
  profil,
  navigation,
  items,
  tokoList,
  sesiForm,
  setSesiForm,
  sesiAktif,
  setSesiAktif,
  modeDemo,
  demoReason,
}) {
  const tugasMasuk = items.slice(0, 5);
  const tokoAktif = tokoList.find((item) => String(item.id) === sesiForm.tokoId) || tokoList[0];
  const estimasiKomisi = tugasMasuk.length ? `${Math.min(18, tugasMasuk.length * 3)}%` : "12%";

  function bukaSesi() {
    const kapasitas = Number(sesiForm.kapasitas);
    if (!sesiForm.tokoId || !kapasitas || kapasitas < 1 || !sesiForm.batasWaktu.trim()) {
      return;
    }
    const tokoTerpilih = tokoList.find((toko) => String(toko.id) === sesiForm.tokoId);
    setSesiAktif({
      tokoNama: tokoTerpilih?.nama || "Toko pilihan",
      kategori: tokoTerpilih?.kategori || "Umum",
      kapasitas,
      batasWaktu: sesiForm.batasWaktu,
    });
  }

  function ambilTugas(item) {
    const tokoTerpilih = tokoList.find((toko) => toko.id === item.toko_id);
    setSesiAktif((prev) => ({
      tokoNama: prev?.tokoNama || tokoTerpilih?.nama || "Toko pilihan",
      kategori: prev?.kategori || tokoTerpilih?.kategori || "Umum",
      kapasitas: prev?.kapasitas || Number(sesiForm.kapasitas || 5),
      batasWaktu: prev?.batasWaktu || sesiForm.batasWaktu || "18:00",
      highlight: item.nama,
    }));
  }

  return (
    <SafeAreaView style={shared.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={shared.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={penjastip.heroCard}>
          <View style={penjastip.heroBadge}>
            <Text style={penjastip.heroBadgeText}>Dashboard Penjastip</Text>
          </View>
          <Text style={penjastip.heroTitle}>Hai, {profil.nama || "Kak Penjastip"} ✨</Text>
          <Text style={penjastip.heroSubtitle}>{ROLE_CONTENT.penjastip.heroSubtitle}</Text>
          <View style={penjastip.statRow}>
            <StatCard label="Toko Aktif" value={tokoList.length} tone="purple" />
            <StatCard label="Titipan Masuk" value={tugasMasuk.length} tone="mint" />
            <StatCard label="Estimasi Komisi" value={estimasiKomisi} tone="lemon" />
          </View>
        </View>

        <View style={shared.utilityRow}>
          <TouchableOpacity style={shared.switchButton} onPress={() => navigation.replace("Login")}>
            <Text style={shared.switchButtonText}>Ganti Akun</Text>
          </TouchableOpacity>
          <View style={shared.profilePill}>
            <Text style={shared.profilePillText}>{profil.kampus || "Kampus Makassar"}</Text>
          </View>
        </View>

        {modeDemo ? (
          <View style={shared.demoBanner}>
            <Text style={shared.demoBannerText}>{demoReason || "Mode demo aktif karena backend belum merespons."}</Text>
          </View>
        ) : null}

        <View style={penjastip.sessionCard}>
          <SectionHeader
            eyebrow="Buka Sesi"
            title="Atur sesi jastip"
            subtitle="Sesuai flowchart: pilih toko, atur batas waktu, lalu buka sesi agar muncul di aplikasi."
          />

          <Text style={penjastip.inputLabel}>Pilih toko</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={penjastip.tokoChipRow}
          >
            {tokoList.map((toko) => (
              <TouchableOpacity
                key={toko.id}
                style={[
                  penjastip.tokoChip,
                  sesiForm.tokoId === String(toko.id) && penjastip.tokoChipActive,
                ]}
                onPress={() => setSesiForm((prev) => ({ ...prev, tokoId: String(toko.id) }))}
              >
                <Text style={penjastip.tokoChipText}>
                  {KATEGORI_IKON[toko.kategori] || "🏪"} {toko.nama}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={penjastip.inlineRow}>
            <View style={penjastip.inlineField}>
              <Text style={penjastip.inputLabel}>Kapasitas</Text>
              <TextInput
                style={penjastip.input}
                keyboardType="numeric"
                value={sesiForm.kapasitas}
                onChangeText={(value) => setSesiForm((prev) => ({ ...prev, kapasitas: value }))}
              />
            </View>
            <View style={penjastip.inlineField}>
              <Text style={penjastip.inputLabel}>Batas waktu</Text>
              <TextInput
                style={penjastip.input}
                value={sesiForm.batasWaktu}
                onChangeText={(value) => setSesiForm((prev) => ({ ...prev, batasWaktu: value }))}
              />
            </View>
          </View>

          <TouchableOpacity style={penjastip.openButton} onPress={bukaSesi}>
            <Text style={penjastip.openButtonText}>{ROLE_CONTENT.penjastip.cta}</Text>
          </TouchableOpacity>
        </View>

        {sesiAktif ? (
          <View style={penjastip.activeSessionBox}>
            <Text style={penjastip.activeTitle}>Sesi aktif di {sesiAktif.tokoNama}</Text>
            <Text style={penjastip.activeSubtitle}>
              Kategori {sesiAktif.kategori} • kapasitas {sesiAktif.kapasitas} order • tutup {sesiAktif.batasWaktu}
            </Text>
            {sesiAktif.highlight ? (
              <Text style={penjastip.activeHighlight}>Titipan terbaru: {sesiAktif.highlight}</Text>
            ) : null}
          </View>
        ) : null}

        <SectionHeader
          eyebrow="Daftar Titipan Masuk"
          title="Permintaan yang bisa kamu ambil"
          subtitle={`Toko prioritas: ${tokoAktif?.nama || "pilih toko dulu"}`}
        />

        {tugasMasuk.map((item, index) => (
          <View
            key={item.id}
            style={[
              penjastip.taskCard,
              { backgroundColor: ["#F7FBFF", "#EEF6FF", "#EAF4FF", "#F2F8FF", "#F4FAFF"][index % 5] },
            ]}
          >
            <View style={penjastip.taskTopRow}>
              <View style={penjastip.taskImageWrap}>
                <ProductImage item={item} style={penjastip.taskImage} />
                <View style={penjastip.taskImageBadge}>
                  <Text style={penjastip.taskImageBadgeText}>{item.kategoriIkon}</Text>
                </View>
              </View>
              <View style={penjastip.taskRight}>
                <Text style={penjastip.taskCategory}>{item.kategori}</Text>
                <Text style={penjastip.taskTitle}>{item.nama}</Text>
                <Text style={penjastip.taskMeta}>{item.toko_nama} • {formatRupiah(item.harga)}</Text>
              </View>
            </View>
            <TouchableOpacity style={penjastip.taskButton} onPress={() => ambilTugas(item)}>
              <Text style={penjastip.taskButtonText}>Ambil Tugas Demo</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function BerandaScreen({ route, navigation }) {
  const peran = route.params?.peran ?? "penitip";
  const profil = route.params?.profil ?? { nama: peran === "penjastip" ? "Kak Penjastip" : "Mahasiswa" };
  const [items, setItems] = useState([]);
  const [tokoList, setTokoList] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);
  const [modeDemo, setModeDemo] = useState(Boolean(route.params?.demoAuth));
  const [demoReason, setDemoReason] = useState(
    route.params?.demoAuth ? "Login backend tidak merespons, jadi tampilan demo tetap dibuka." : ""
  );
  const [cari, setCari] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("Semua");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [sesiForm, setSesiForm] = useState({ tokoId: "", kapasitas: "5", batasWaktu: "18:00" });
  const [sesiAktif, setSesiAktif] = useState(null);

  async function muatData() {
    setMemuat(true);
    setGalat(null);
    try {
      const [itemsRes, tokoRes] = await Promise.all([getDaftarBarang(), getDaftarToko()]);
      const daftarBarang = Array.isArray(itemsRes) ? itemsRes : itemsRes.items ?? [];
      const daftarToko = Array.isArray(tokoRes) ? tokoRes : tokoRes.toko ?? [];
      const mergedItems = buildItemViewModel(daftarBarang, daftarToko);
      setItems(mergedItems);
      setTokoList(daftarToko);
      setModeDemo(false);
      setDemoReason("");
      if (!sesiForm.tokoId && daftarToko[0]?.id) {
        setSesiForm((prev) => ({ ...prev, tokoId: String(daftarToko[0].id) }));
      }
    } catch (error) {
      const mergedItems = buildItemViewModel(DEMO_ITEMS, DEMO_TOKO);
      setItems(mergedItems);
      setTokoList(DEMO_TOKO);
      setModeDemo(true);
      setDemoReason("Backend katalog belum terjangkau, jadi data demo ditampilkan agar UI tetap bisa dilihat.");
      setGalat(null);
      if (!sesiForm.tokoId && DEMO_TOKO[0]?.id) {
        setSesiForm((prev) => ({ ...prev, tokoId: String(DEMO_TOKO[0].id) }));
      }
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  const daftarKategori = useMemo(() => {
    return ["Semua", ...Array.from(new Set(items.map((item) => item.kategori))).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    let hasil = items;
    if (kategoriAktif !== "Semua") {
      hasil = hasil.filter((item) => item.kategori === kategoriAktif);
    }
    if (selectedStoreId !== "Semua") {
      hasil = hasil.filter((item) => String(item.toko_id) === selectedStoreId);
    }
    if (cari.trim()) {
      const q = cari.toLowerCase();
      hasil = hasil.filter(
        (item) =>
          item.nama.toLowerCase().includes(q) ||
          item.toko_nama.toLowerCase().includes(q) ||
          item.kategori.toLowerCase().includes(q)
      );
    }
    return hasil;
  }, [items, kategoriAktif, cari, selectedStoreId]);

  if (memuat) {
    return (
      <SafeAreaView style={shared.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.pink} />
        <Text style={shared.loadingText}>Memuat dashboard {ROLE_CONTENT[peran].title.toLowerCase()}...</Text>
      </SafeAreaView>
    );
  }

  if (galat) {
    return (
      <SafeAreaView style={shared.loadingScreen}>
        <Text style={shared.emptyEmoji}>📦</Text>
        <Text style={shared.errorTitle}>Beranda belum bisa dimuat</Text>
        <Text style={shared.errorText}>{galat}</Text>
        <TouchableOpacity style={shared.retryButton} onPress={muatData}>
          <Text style={shared.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (peran === "penjastip") {
    return (
      <PenjastipDashboard
        profil={profil}
        navigation={navigation}
        items={filteredItems}
        tokoList={tokoList}
        sesiForm={sesiForm}
        setSesiForm={setSesiForm}
        sesiAktif={sesiAktif}
        setSesiAktif={setSesiAktif}
        modeDemo={modeDemo}
        demoReason={demoReason}
      />
    );
  }

  return (
    <PenitipDashboard
      profil={profil}
      navigation={navigation}
      filteredItems={filteredItems}
      tokoList={tokoList}
      selectedStoreId={selectedStoreId}
      setSelectedStoreId={setSelectedStoreId}
      kategoriAktif={kategoriAktif}
      setKategoriAktif={setKategoriAktif}
      daftarKategori={daftarKategori}
      cari={cari}
      setCari={setCari}
      modeDemo={modeDemo}
      demoReason={demoReason}
    />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Beranda" component={BerandaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Transaksi" component={TransaksiScreen} options={{ title: "Form Titipan" }} />
        <Stack.Screen name="Sukses" component={SuksesScreen} options={{ title: "Status Titipan", headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const auth = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 36 },
  heroCard: {
    backgroundColor: C.pink,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "#0A56B5",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0A3E7C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
  heroEmoji: { fontSize: 42, marginBottom: 6 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  heroSubtitle: { color: "#E7F1FF", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 7 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#DCEBFA",
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C9DDF4",
  },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  tabButtonActive: { backgroundColor: C.pink },
  tabText: { color: C.pinkDark, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D3E3F4",
    shadowColor: "#1D4E89",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.text,
    fontSize: 14,
    marginBottom: 12,
  },
  roleLabel: { color: C.textSoft, fontWeight: "700", marginTop: 4, marginBottom: 10 },
  roleRow: { gap: 12 },
  roleCard: {
    backgroundColor: "#F7FBFF",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
  },
  roleCardActive: {
    borderColor: C.pink,
    backgroundColor: "#EAF4FF",
  },
  roleIcon: { fontSize: 28, marginBottom: 8 },
  roleTitle: { color: C.text, fontWeight: "800", fontSize: 16 },
  roleSubtitle: { color: C.textSoft, marginTop: 4, lineHeight: 20 },
  rolePillRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  rolePill: {
    flex: 1,
    backgroundColor: C.bgSoft,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  rolePillActive: { backgroundColor: "#EAF4FF", borderColor: C.pink },
  rolePillText: { color: C.text, fontWeight: "700", fontSize: 13 },
  primaryButton: {
    backgroundColor: C.pink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
  noticeBox: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  noticeSuccess: { backgroundColor: "#EEF8FF", borderColor: "#B7D9FA" },
  noticeError: { backgroundColor: "#FFF3F5", borderColor: "#FFC4CC" },
  noticeText: { fontWeight: "600", lineHeight: 20 },
  noticeTextSuccess: { color: "#2A8A4A" },
  noticeTextError: { color: "#D45565" },
});

const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollContainer: { padding: 18, paddingBottom: 32 },
  listContainer: { padding: 18, paddingBottom: 32 },
  loadingScreen: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: C.textSoft, marginTop: 12, fontSize: 14 },
  errorTitle: { color: C.text, fontSize: 20, fontWeight: "800", marginTop: 8 },
  errorText: { color: C.textSoft, textAlign: "center", marginTop: 8, lineHeight: 22 },
  retryButton: {
    marginTop: 18,
    backgroundColor: C.purple,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "800" },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: C.textSoft, marginTop: 8 },
  sectionHeader: { marginTop: 18, marginBottom: 12 },
  eyebrow: {
    color: C.pinkDark,
    textTransform: "uppercase",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: { color: C.text, fontSize: 22, fontWeight: "800" },
  sectionSubtitle: { color: C.textSoft, marginTop: 6, lineHeight: 22 },
  utilityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 8 },
  switchButton: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchButtonText: { color: C.text, fontWeight: "700" },
  profilePill: {
    backgroundColor: "#EAF4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profilePillText: { color: C.pinkDark, fontWeight: "700", fontSize: 12 },
  demoBanner: {
    backgroundColor: "#EEF6FF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#BED9FB",
    marginTop: 8,
    marginBottom: 4,
  },
  demoBannerText: { color: C.pinkDark, fontWeight: "700", lineHeight: 20, fontSize: 12 },
  searchBox: {
    marginTop: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  categoryRow: { gap: 10, paddingTop: 16, paddingBottom: 8 },
  categoryChip: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "#C9DDF4",
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#1D4E89",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  categoryChipActive: { backgroundColor: C.pink, borderColor: C.pink },
  categoryChipText: { color: C.text, fontWeight: "700", fontSize: 12 },
  categoryChipTextActive: { color: "#FFFFFF" },
  gridRow: { justifyContent: "space-between", marginBottom: 14 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 4,
  },
  statValue: { color: C.text, fontSize: 18, fontWeight: "800" },
  statLabel: { color: C.textSoft, fontSize: 12, marginTop: 4 },
});

const penitip = StyleSheet.create({
  heroCard: {
    backgroundColor: C.pink,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "#0A56B5",
    shadowColor: "#0A3E7C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
    overflow: "hidden",
  },
  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  heroTagText: { color: C.pinkDark, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  heroSubtitle: { color: "#DCEAFF", lineHeight: 22, marginTop: 8 },
  heroStatsRow: { flexDirection: "row", marginTop: 16, marginHorizontal: -4 },
  storeRow: { gap: 12, paddingBottom: 4 },
  storeCard: {
    width: 180,
    borderRadius: 24,
    padding: 17,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#1D4E89",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  storeCardActive: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  storeEmoji: { fontSize: 30, marginBottom: 9 },
  storeName: { color: C.text, fontWeight: "800", fontSize: 15 },
  storeCategory: { color: C.textSoft, marginTop: 4, lineHeight: 20 },
  storeNameActive: { color: "#FFFFFF" },
  storeCategoryActive: { color: "#DCEAFF" },
  itemCard: {
    width: "48.3%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "#D5E5F5",
    borderRadius: 26,
    padding: 10,
    shadowColor: "#1D4E89",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: "#EAF4FF",
  },
  itemCategoryBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    backgroundColor: "rgba(10,62,124,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 2,
  },
  itemCategoryBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  itemTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  itemEmoji: {
    fontSize: 23,
    backgroundColor: "#EEF6FF",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 14,
  },
  stockPill: {
    backgroundColor: "#EEF8FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockPillText: { color: C.pinkDark, fontWeight: "700", fontSize: 11 },
  itemName: { color: C.text, fontWeight: "900", fontSize: 14, lineHeight: 20, minHeight: 40 },
  storeLine: { flexDirection: "row", alignItems: "center", marginTop: 7 },
  storeIcon: { color: C.purple, fontSize: 10, marginRight: 6 },
  itemStore: { color: C.pinkDark, fontWeight: "800", fontSize: 12, flex: 1 },
  itemCategory: { color: C.textSoft, marginTop: 4, fontSize: 11, minHeight: 34, lineHeight: 16 },
  priceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  priceLabel: { color: C.textSoft, fontSize: 9, fontWeight: "700", marginBottom: 2 },
  itemPrice: { color: C.purple, fontWeight: "900", fontSize: 16 },
  buyCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  buyCircleText: { color: "#FFFFFF", fontSize: 25, lineHeight: 28, fontWeight: "700" },
  ctaButton: {
    marginTop: 12,
    backgroundColor: "#EAF4FF",
    borderRadius: 15,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C9E1FA",
  },
  ctaButtonText: { color: C.pinkDark, fontWeight: "900", fontSize: 11 },
});

const penjastip = StyleSheet.create({
  heroCard: {
    backgroundColor: C.pink,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "#0A56B5",
    shadowColor: "#0A3E7C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
    overflow: "hidden",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  heroBadgeText: { color: C.pinkDark, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  heroSubtitle: { color: "#DCEAFF", lineHeight: 22, marginTop: 8 },
  statRow: { flexDirection: "row", marginTop: 16, marginHorizontal: -4 },
  sessionCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 8,
  },
  inputLabel: { color: C.textSoft, fontWeight: "700", marginTop: 6, marginBottom: 8 },
  tokoChipRow: { gap: 10, paddingBottom: 6 },
  tokoChip: {
    backgroundColor: C.bgSoft,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  tokoChipActive: { backgroundColor: "#EAF4FF", borderColor: C.pink },
  tokoChipText: { color: C.text, fontWeight: "700", fontSize: 12 },
  inlineRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  inlineField: { flex: 1 },
  input: {
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
  },
  openButton: {
    marginTop: 16,
    backgroundColor: C.purple,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  openButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  activeSessionBox: {
    marginTop: 16,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#B9D8F8",
    borderRadius: 20,
    padding: 18,
  },
  activeTitle: { color: C.pinkDark, fontWeight: "800", fontSize: 16 },
  activeSubtitle: { color: C.textSoft, marginTop: 6, lineHeight: 20 },
  activeHighlight: { color: C.text, marginTop: 10, fontWeight: "700" },
  taskCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  taskTopRow: { flexDirection: "row", alignItems: "center" },
  taskImageWrap: { position: "relative", marginRight: 12 },
  taskImage: {
    width: 82,
    height: 82,
    borderRadius: 20,
    backgroundColor: "#DDEEFF",
  },
  taskImageBadge: {
    position: "absolute",
    right: -5,
    bottom: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  taskImageBadgeText: { fontSize: 15 },
  taskRight: { flex: 1 },
  taskCategory: {
    color: C.purple,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  taskTitle: { color: C.text, fontWeight: "900", fontSize: 15, lineHeight: 20 },
  taskMeta: { color: C.textSoft, marginTop: 5, lineHeight: 18, fontSize: 12 },
  taskButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  taskButtonText: { color: C.purple, fontWeight: "800", fontSize: 12 },
});
