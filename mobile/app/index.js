import React, { useMemo, useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const C = {
  primary: "#0B5FFF", primaryDark: "#0847C7", primarySoft: "#E8F0FF",
  accent: "#00A86B", accentSoft: "#E6F8F0", warn: "#E67E22", warnSoft: "#FFF4E8",
  danger: "#E74C3C", dangerSoft: "#FDECEC", bg: "#F5F7FB", surface: "#FFFFFF",
  border: "#E3E8F2", text: "#0F172A", muted: "#64748B", light: "#F1F5F9", ink: "#1E293B",
};

const IMG = {
  bobaBrown: require("../assets/products/01_brown_sugar_boba_milk_tea_L.jpg"),
  matcha: require("../assets/products/02_matcha_latte_M.jpeg"),
  tigerBoba: require("../assets/products/03_tiger_sugar_boba.jpg"),
  taro: require("../assets/products/04_taro_milk_tea_L.jpg"),
  mieTiti: require("../assets/products/05_mie_titi_original_reguler.jpg"),
  mieTitiJumbo: require("../assets/products/06_mie_titi_spesial_jumbo.jpg"),
  esTeh: require("../assets/products/07_es_teh_manis.jpg"),
  novel: require("../assets/products/08_novel_terlaris_bulan_ini.jpeg"),
  bukuTulis: require("../assets/products/09_buku_tulis_sinar_dunia_40_lembar.jpeg"),
  pulpen: require("../assets/products/10_pulpen_pilot_g2_hitam.jpeg"),
  spidol: require("../assets/products/11_spidol_snowman_whiteboard.jpeg"),
  buds: require("../assets/products/12_samsung_galaxy_buds_fe.jpeg"),
  charger: require("../assets/products/13_samsung_25w_typec_charger.jpg"),
  caseA55: require("../assets/products/14_samsung_clear_case_galaxy_a55.webp"),
  indomie: require("../assets/products/15_mie_instan_indomie_goreng.jpg"),
  aqua: require("../assets/products/16_aqua_air_mineral_600ml.webp"),
  chitato: require("../assets/products/17_snack_chitato_sapi_panggang.jpeg"),
  pocari: require("../assets/products/18_pocari_sweat_500ml.webp"),
  pallubasaSapi: require("../assets/products/19_pallubasa_sapi_spesial.webp"),
  pallubasaAyam: require("../assets/products/20_pallubasa_ayam.webp"),
  americano: require("../assets/products/21_americano_hot.jpg"),
  kopiAren: require("../assets/products/22_kopi_susu_gula_aren.jpg"),
  esKopi: require("../assets/products/23_es_kopi_hitam.jpg"),
  mcflurry: require("../assets/products/24_mcflurry_oreo.jpeg"),
  mcchicken: require("../assets/products/25_paket_mcchicken_value.jpeg"),
  fries: require("../assets/products/26_french_fries_large.jpeg"),
  pisangIjo: require("../assets/products/27_es_pisang_ijo_original.jpg"),
  goodday: require("../assets/products/28_goodday_kopi_sachet_10pcs.jpg"),
  kfc: require("../assets/products/29_kfc_original_2pcs.jpg"),
  akuntansi: require("../assets/products/30_buku_kuliah_akuntansi_dasar.jpeg"),
  pisangGoreng: require("../assets/products/31_pisang_goreng_keju.jpeg"),
  tumbler: require("../assets/products/32_miniso_tumbler_500ml.jpeg"),
  paracetamol: require("../assets/products/33_paracetamol_500mg_10_tablet.png"),
  sopSaudara: require("../assets/products/34_sop_saudara_daging_reguler.jpg"),
};

const CATALOG = [
  { id: 1, toko: "Chatime Losari", nama: "Brown Sugar Boba Milk Tea (L)", kategori: "Minuman", harga: 42000, satuan: "cup", img: IMG.bobaBrown, deskripsi: "Teh susu creamy dengan boba brown sugar legit." },
  { id: 2, toko: "Chatime Losari", nama: "Matcha Latte (M)", kategori: "Minuman", harga: 35000, satuan: "cup", img: IMG.matcha, deskripsi: "Matcha latte premium rasa Jepang." },
  { id: 3, toko: "Chatime Losari", nama: "Tiger Sugar Boba", kategori: "Minuman", harga: 40000, satuan: "cup", img: IMG.tigerBoba, deskripsi: "Signature tiger sugar dengan boba kenyal." },
  { id: 4, toko: "Chatime Losari", nama: "Taro Milk Tea (L)", kategori: "Minuman", harga: 38000, satuan: "cup", img: IMG.taro, deskripsi: "Taro milk tea creamy ukuran large." },
  { id: 5, toko: "Mie Titi Makassar", nama: "Mie Titi Original Reguler", kategori: "Makanan", harga: 35000, satuan: "porsi", img: IMG.mieTiti, deskripsi: "Mie kering khas Makassar kuah kental." },
  { id: 6, toko: "Mie Titi Makassar", nama: "Mie Titi Spesial Jumbo", kategori: "Makanan", harga: 55000, satuan: "porsi", img: IMG.mieTitiJumbo, deskripsi: "Porsi jumbo topping lengkap." },
  { id: 7, toko: "Mie Titi Makassar", nama: "Es Teh Manis", kategori: "Minuman", harga: 8000, satuan: "gelas", img: IMG.esTeh, deskripsi: "Es teh manis segar pelengkap makan." },
  { id: 8, toko: "Gramedia Karebosi", nama: "Novel Terlaris Bulan Ini", kategori: "Buku", harga: 89000, satuan: "pcs", img: IMG.novel, deskripsi: "Rekomendasi novel best seller terkini." },
  { id: 9, toko: "Gramedia Karebosi", nama: "Buku Tulis Sinar Dunia 40 Lembar", kategori: "Alat Tulis", harga: 5500, satuan: "pcs", img: IMG.bukuTulis, deskripsi: "Buku tulis SIDU 40 lembar." },
  { id: 10, toko: "Gramedia Karebosi", nama: "Pulpen Pilot G2 Hitam", kategori: "Alat Tulis", harga: 25000, satuan: "pcs", img: IMG.pulpen, deskripsi: "Pulpen gel halus tinta hitam." },
  { id: 11, toko: "Gramedia Karebosi", nama: "Spidol Snowman Whiteboard", kategori: "Alat Tulis", harga: 12000, satuan: "pcs", img: IMG.spidol, deskripsi: "Spidol papan tulis mudah dihapus." },
  { id: 12, toko: "Samsung Experience Store", nama: "Samsung Galaxy Buds FE", kategori: "Elektronik", harga: 799000, satuan: "pcs", img: IMG.buds, deskripsi: "Earphone wireless resmi Samsung." },
  { id: 13, toko: "Samsung Experience Store", nama: "Samsung 25W Type-C Charger", kategori: "Elektronik", harga: 250000, satuan: "pcs", img: IMG.charger, deskripsi: "Charger cepat 25W USB-C original." },
  { id: 14, toko: "Samsung Experience Store", nama: "Clear Case Galaxy A55", kategori: "Elektronik", harga: 149000, satuan: "pcs", img: IMG.caseA55, deskripsi: "Case transparan pelindung Galaxy A55." },
  { id: 15, toko: "Indomaret Tamalanrea", nama: "Indomie Goreng", kategori: "Kebutuhan", harga: 3500, satuan: "bungkus", img: IMG.indomie, deskripsi: "Mie instan goreng favorit mahasiswa." },
  { id: 16, toko: "Indomaret Tamalanrea", nama: "Aqua 600ml", kategori: "Minuman", harga: 4500, satuan: "botol", img: IMG.aqua, deskripsi: "Air mineral kemasan 600ml." },
  { id: 17, toko: "Indomaret Tamalanrea", nama: "Chitato Sapi Panggang", kategori: "Kebutuhan", harga: 12000, satuan: "pcs", img: IMG.chitato, deskripsi: "Snack kentang rasa sapi panggang." },
  { id: 18, toko: "Alfamart Perintis", nama: "Pocari Sweat 500ml", kategori: "Minuman", harga: 8000, satuan: "botol", img: IMG.pocari, deskripsi: "Minuman isotonik penyegar." },
  { id: 19, toko: "Warung Pallubasa Serigala", nama: "Pallubasa Sapi Spesial", kategori: "Makanan", harga: 40000, satuan: "mangkuk", img: IMG.pallubasaSapi, deskripsi: "Pallubasa daging sapi kuah santan." },
  { id: 20, toko: "Warung Pallubasa Serigala", nama: "Pallubasa Ayam", kategori: "Makanan", harga: 32000, satuan: "mangkuk", img: IMG.pallubasaAyam, deskripsi: "Pallubasa ayam khas Makassar." },
  { id: 21, toko: "Kopi Kanneng", nama: "Americano Hot", kategori: "Minuman", harga: 22000, satuan: "cup", img: IMG.americano, deskripsi: "Espresso hot dengan air panas." },
  { id: 22, toko: "Kopi Kanneng", nama: "Kopi Susu Gula Aren", kategori: "Minuman", harga: 25000, satuan: "cup", img: IMG.kopiAren, deskripsi: "Kopi susu manis gula aren." },
  { id: 23, toko: "Kopi Kanneng", nama: "Es Kopi Hitam", kategori: "Minuman", harga: 18000, satuan: "cup", img: IMG.esKopi, deskripsi: "Kopi hitam dingin tanpa gula." },
  { id: 24, toko: "McDonald's Panakkukang", nama: "McFlurry Oreo", kategori: "Makanan", harga: 27000, satuan: "cup", img: IMG.mcflurry, deskripsi: "Es krim lembut topping Oreo." },
  { id: 25, toko: "McDonald's Panakkukang", nama: "Paket McChicken Value", kategori: "Makanan", harga: 45000, satuan: "paket", img: IMG.mcchicken, deskripsi: "McChicken + fries + minuman." },
  { id: 26, toko: "McDonald's Panakkukang", nama: "French Fries Large", kategori: "Makanan", harga: 28000, satuan: "pcs", img: IMG.fries, deskripsi: "Kentang goreng ukuran large." },
  { id: 27, toko: "Es Pisang Ijo Anugerah", nama: "Es Pisang Ijo Original", kategori: "Makanan", harga: 18000, satuan: "porsi", img: IMG.pisangIjo, deskripsi: "Pisang ijo santan khas Makassar." },
  { id: 28, toko: "Indomaret Tamalanrea", nama: "Good Day Kopi Sachet 10pcs", kategori: "Kebutuhan", harga: 12000, satuan: "pack", img: IMG.goodday, deskripsi: "Kopi sachet siap seduh 10 pcs." },
  { id: 29, toko: "KFC Panakkukang", nama: "KFC Original 2pcs", kategori: "Makanan", harga: 42000, satuan: "paket", img: IMG.kfc, deskripsi: "Ayam goreng original 2 potong." },
  { id: 30, toko: "Gramedia Karebosi", nama: "Buku Kuliah Akuntansi Dasar", kategori: "Buku", harga: 95000, satuan: "pcs", img: IMG.akuntansi, deskripsi: "Buku pengantar akuntansi dasar." },
  { id: 31, toko: "Es Pisang Ijo Anugerah", nama: "Pisang Goreng Keju", kategori: "Makanan", harga: 15000, satuan: "porsi", img: IMG.pisangGoreng, deskripsi: "Pisang goreng renyah tabur keju." },
  { id: 32, toko: "Miniso Panakkukang", nama: "Miniso Tumbler 500ml", kategori: "Aksesoris", harga: 89000, satuan: "pcs", img: IMG.tumbler, deskripsi: "Tumbler stylish tahan panas/dingin." },
  { id: 33, toko: "Apotik Kimia Farma", nama: "Paracetamol 500mg (10 Tablet)", kategori: "Kesehatan", harga: 8000, satuan: "strip", img: IMG.paracetamol, deskripsi: "Obat penurun demam & pereda nyeri." },
  { id: 34, toko: "Sop Saudara", nama: "Sop Saudara Daging Reguler", kategori: "Makanan", harga: 35000, satuan: "mangkuk", img: IMG.sopSaudara, deskripsi: "Sop saudara daging kuah gurih." },
];

const TOKO_OPTIONS = [
  "Chatime Losari", "Mie Titi Makassar", "Gramedia Karebosi", "Samsung Experience Store",
  "Indomaret Tamalanrea", "Alfamart Perintis", "Warung Pallubasa Serigala", "Kopi Kanneng",
  "McDonald's Panakkukang", "Es Pisang Ijo Anugerah", "KFC Panakkukang", "Miniso Panakkukang",
  "Apotik Kimia Farma", "Sop Saudara",
];

const DEFAULT_SESI = [
  { id: "S003", penjastip: "Andi", toko: "Indomaret Tamalanrea", batas: "19:00", kapasitas: 15, diisi: 3 },
  { id: "S004", penjastip: "Sari", toko: "Kopi Kanneng", batas: "16:00", kapasitas: 12, diisi: 4 },
  { id: "S005", penjastip: "Bima", toko: "McDonald's Panakkukang", batas: "20:00", kapasitas: 10, diisi: 2 },
  { id: "S006", penjastip: "Rina", toko: "Chatime Losari", batas: "18:30", kapasitas: 12, diisi: 5 },
];

const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

function Badge({ label, color = C.primary, bg }) {
  return (
    <View style={[st.badge, { backgroundColor: bg || color + "18" }]}>
      <Text style={[st.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SvcTag({ name }) {
  const map = {
    "order-service": { bg: "#EEF4FF", c: "#1D4ED8" },
    "catalog-service": { bg: "#ECFDF5", c: "#047857" },
    "payment-service": { bg: "#FFF7ED", c: "#C2410C" },
    "tracking-service": { bg: "#F5F3FF", c: "#6D28D9" },
  };
  const col = map[name] || { bg: C.light, c: C.muted };
  return (
    <View style={[st.svcTag, { backgroundColor: col.bg }]}>
      <Text style={[st.svcText, { color: col.c }]}>{name}</Text>
    </View>
  );
}

function Btn({ label, onPress, style, outline, danger, success, disabled }) {
  let bg = C.primary; let tc = "#fff"; let borderColor = "transparent";
  if (outline) { bg = "#fff"; tc = C.primary; borderColor = C.primary; }
  if (danger) { bg = outline ? "#fff" : C.danger; tc = outline ? C.danger : "#fff"; borderColor = C.danger; }
  if (success) { bg = outline ? "#fff" : C.accent; tc = outline ? C.accent : "#fff"; borderColor = C.accent; }
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[st.btn, { backgroundColor: bg, borderColor, opacity: disabled ? 0.5 : 1 }, style]}>
      <Text style={[st.btnText, { color: tc }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={st.label}>{label}</Text> : null}
      <TextInput style={st.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
  );
}

function ScreenShell({ children }) {
  return (
    <SafeAreaView style={st.root} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={st.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={st.screen}
          contentContainerStyle={st.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TopBar({ title, right, onBack }) {
  return (
    <View style={st.topBar}>
      <View style={st.topBarLeft}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={st.backBtn}><Text style={st.backBtnText}>←</Text></TouchableOpacity>
        ) : null}
        <Text style={st.topBarTitle}>{title}</Text>
      </View>
      {right || null}
    </View>
  );
}

function BrandHeader({ subtitle }) {
  return (
    <View style={st.brandWrap}>
      <View style={st.logoCircle}><Text style={st.logoIcon}>🛵</Text></View>
      <Text style={st.appTitle}>JastipKampus</Text>
      {subtitle ? <Text style={st.sub}>{subtitle}</Text> : null}
    </View>
  );
}

function WelcomeScreen({ onNavigate, hasAccount }) {
  return (
    <ScreenShell>
      <View style={st.heroPanel}>
        <Text style={st.heroEyebrow}>JASTIP ANTAR MAHASISWA</Text>
        <Text style={st.heroTitle}>Belanja kampus jadi lebih gampang</Text>
        <Text style={st.heroDesc}>Titip belanja ke teman se-kampus, buka sesi jastip, tawar harga, bayar aman, dan lacak status sampai barang diterima.</Text>
        <View style={st.heroStats}>
          <View style={st.statBox}><Text style={st.statNum}>{CATALOG.length}</Text><Text style={st.statLabel}>Produk</Text></View>
          <View style={st.statBox}><Text style={st.statNum}>{TOKO_OPTIONS.length}</Text><Text style={st.statLabel}>Toko</Text></View>
          <View style={st.statBox}><Text style={st.statNum}>4</Text><Text style={st.statLabel}>Layanan</Text></View>
        </View>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Mulai sekarang</Text>
        <Text style={st.mutedLine}>Buat akun dulu sebelum masuk ke aplikasi.</Text>
        <Btn label="Daftar Akun Baru" onPress={() => onNavigate("Register")} />
        <Btn label={hasAccount ? "Masuk ke Akun" : "Masuk (perlu daftar dulu)"} outline disabled={!hasAccount}
          onPress={() => onNavigate("Login")} style={{ marginTop: 10 }} />
        <Text style={[st.mutedLine, { marginTop: 12, textAlign: "center", color: hasAccount ? C.accent : C.muted }]}>
          {hasAccount ? "Akun sudah tersedia. Silakan masuk." : "Belum ada akun. Silakan daftar terlebih dahulu."}
        </Text>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Alur singkat</Text>
        {["Daftar & login akun kampus", "Pilih peran: Penjastip atau Penitip", "Penjastip buka sesi · Penitip pilih produk", "Opsional tawar harga · bayar escrow · tracking"].map((t, i) => (
          <View key={t} style={st.stepRow}>
            <View style={st.stepDot}><Text style={st.stepDotText}>{i + 1}</Text></View>
            <Text style={st.stepText}>{t}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

function RegisterScreen({ onNavigate, onRegister }) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [kampus, setKampus] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!nama.trim() || !email.trim() || !hp.trim() || !kampus.trim() || !pass.trim()) { setError("Lengkapi semua data registrasi."); return; }
    if (pass.trim().length < 6) { setError("Password minimal 6 karakter."); return; }
    onRegister({ nama: nama.trim(), email: email.trim().toLowerCase(), hp: hp.trim(), kampus: kampus.trim(), pass: pass.trim() });
  };
  return (
    <ScreenShell>
      <BrandHeader subtitle="Langkah A–D · Registrasi akun" />
      <Text style={st.heading}>Buat Akun</Text>
      <Text style={st.subCenter}>Isi nama, email/HP, password, dan kampus</Text>
      <View style={st.card}>
        <Input label="Nama Lengkap" value={nama} onChangeText={setNama} placeholder="Nama kamu" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@kampus.ac.id" keyboardType="email-address" autoCapitalize="none" />
        <Input label="No. HP" value={hp} onChangeText={setHp} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
        <Input label="Kampus" value={kampus} onChangeText={setKampus} placeholder="Universitas Muhammadiyah Makassar" />
        <Input label="Password" value={pass} onChangeText={setPass} placeholder="Minimal 6 karakter" secureTextEntry />
        {error ? <Text style={st.errorText}>{error}</Text> : null}
        <Btn label="Buat Akun" onPress={submit} />
        <TouchableOpacity onPress={() => onNavigate("Login")} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ color: C.muted }}>Sudah punya akun? <Text style={{ color: C.primary, fontWeight: "700" }}>Masuk</Text></Text>
        </TouchableOpacity>
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate("Welcome")} />
    </ScreenShell>
  );
}

function LoginScreen({ onNavigate, onLogin, accounts }) {
  const [email, setEmail] = useState(accounts[0]?.email || "");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!accounts.length) { setError("Belum ada akun. Silakan daftar terlebih dahulu."); return; }
    const found = accounts.find((a) => a.email === email.trim().toLowerCase() || a.hp === email.trim());
    if (!found) { setError("Akun tidak ditemukan. Daftar dulu sebelum login."); return; }
    if (found.pass !== pass) { setError("Password salah."); return; }
    onLogin(found);
  };
  return (
    <ScreenShell>
      <BrandHeader subtitle="Langkah E–F · Login ke beranda" />
      <Text style={st.heading}>Masuk</Text>
      <Text style={st.subCenter}>Gunakan akun yang sudah kamu daftarkan</Text>
      <View style={st.card}>
        {!accounts.length ? (
          <View style={st.alertBox}>
            <Text style={st.alertTitle}>Akun belum dibuat</Text>
            <Text style={st.alertText}>Kamu harus daftar dulu sebelum bisa login.</Text>
            <Btn label="Daftar Sekarang" onPress={() => onNavigate("Register")} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <>
            <Input label="Email / No. HP" value={email} onChangeText={setEmail} placeholder="email@kampus.ac.id" autoCapitalize="none" />
            <Input label="Password" value={pass} onChangeText={setPass} placeholder="••••••••" secureTextEntry />
            {error ? <Text style={st.errorText}>{error}</Text> : null}
            <Btn label="Masuk" onPress={submit} />
          </>
        )}
        <TouchableOpacity onPress={() => onNavigate("Register")} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ color: C.muted }}>Belum punya akun? <Text style={{ color: C.primary, fontWeight: "700" }}>Daftar</Text></Text>
        </TouchableOpacity>
      </View>
      <Btn label="← Kembali" outline onPress={() => onNavigate("Welcome")} />
    </ScreenShell>
  );
}

function PilihPeranScreen({ user, onNavigate, onLogout }) {
  return (
    <ScreenShell>
      <View style={st.profileBanner}>
        <View style={{ flex: 1 }}>
          <Text style={st.helloText}>Halo, {user?.nama?.split(" ")[0] || "Mahasiswa"} 👋</Text>
          <Text style={st.helloSub}>{user?.kampus || "Kampus"} · {user?.email}</Text>
        </View>
        <TouchableOpacity onPress={onLogout}><Text style={st.logoutText}>Keluar</Text></TouchableOpacity>
      </View>
      <Text style={st.heading}>Pilih Peran</Text>
      <Text style={st.subCenter}>Langkah G · jadi Penjastip atau Penitip</Text>
      <TouchableOpacity style={[st.roleCard, { borderColor: C.primary }]} onPress={() => onNavigate("PenjastipDashboard")} activeOpacity={0.9}>
        <View style={[st.roleIconWrap, { backgroundColor: C.primarySoft }]}><Text style={{ fontSize: 34 }}>🛵</Text></View>
        <Text style={st.roleTitle}>Penjastip</Text>
        <Text style={st.roleDesc}>Buka sesi jastip, tentukan toko, batas waktu, dan kapasitas order.</Text>
        <SvcTag name="order-service" />
      </TouchableOpacity>
      <TouchableOpacity style={[st.roleCard, { borderColor: C.accent }]} onPress={() => onNavigate("PenitipBrowse")} activeOpacity={0.9}>
        <View style={[st.roleIconWrap, { backgroundColor: C.accentSoft }]}><Text style={{ fontSize: 34 }}>📦</Text></View>
        <Text style={st.roleTitle}>Penitip</Text>
        <Text style={st.roleDesc}>Lihat katalog produk dengan foto asli dataset, pilih jastip, dan titip belanja.</Text>
        <SvcTag name="catalog-service" />
      </TouchableOpacity>
    </ScreenShell>
  );
}

function PenjastipDashboard({ onNavigate, sesiList, onBukaSesi }) {
  const [toko, setToko] = useState(TOKO_OPTIONS[0]);
  const [batas, setBatas] = useState("17:00");
  const [kap, setKap] = useState("10");
  const [error, setError] = useState("");
  const [mine, setMine] = useState(null);
  const buka = () => {
    if (!toko || !batas) { setError("Isi toko dan batas waktu."); return; }
    const sesi = { id: "S" + String(100 + sesiList.length + 1), penjastip: "Kamu", toko, batas, kapasitas: parseInt(kap, 10) || 10, diisi: 0 };
    onBukaSesi(sesi); setMine(sesi); setError("");
  };
  return (
    <ScreenShell>
      <TopBar title="Dashboard Penjastip" right={<SvcTag name="order-service" />} onBack={() => onNavigate("PilihPeran")} />
      <View style={st.card}>
        <Text style={st.cardTitle}>Buka Sesi Jastip</Text>
        <Text style={st.mutedLine}>Langkah H–J · simpan toko, batas waktu, kapasitas</Text>
        <Text style={st.label}>Pilih Toko</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {TOKO_OPTIONS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setToko(t)} style={[st.chip, toko === t && st.chipActive]}>
              <Text style={[st.chipText, toko === t && st.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Input label="Batas Waktu Order (HH:MM)" value={batas} onChangeText={setBatas} placeholder="17:00" />
        <Input label="Kapasitas Order" value={kap} onChangeText={setKap} placeholder="10" keyboardType="numeric" />
        {error ? <Text style={st.errorText}>{error}</Text> : null}
        <Btn label="Buka Sesi Jastip" onPress={buka} />
      </View>
      {mine ? (
        <View style={[st.card, st.successCard]}>
          <Text style={st.cardTitle}>✅ Sesi kamu aktif</Text>
          <Text style={st.infoRow}><Text style={st.infoKey}>Toko · </Text>{mine.toko}</Text>
          <Text style={st.infoRow}><Text style={st.infoKey}>Batas · </Text>{mine.batas}</Text>
          <Text style={st.infoRow}><Text style={st.infoKey}>Kapasitas · </Text>{mine.diisi}/{mine.kapasitas}</Text>
          <Badge label="Tampil di aplikasi penitip" color={C.accent} bg={C.accentSoft} />
        </View>
      ) : null}
      <View style={st.card}>
        <Text style={st.cardTitle}>Sesi Aktif di Sekitar</Text>
        {sesiList.map((sesi) => (
          <View key={sesi.id} style={st.sesiRow}>
            <View style={{ flex: 1 }}>
              <Text style={st.sesiToko}>{sesi.toko}</Text>
              <Text style={st.sesiInfo}>Oleh {sesi.penjastip} · batas {sesi.batas}</Text>
            </View>
            <Badge label={`${sesi.diisi}/${sesi.kapasitas}`} color={C.primary} />
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

function PenitipBrowse({ onNavigate, onPilihBarang, sesiList }) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const cats = ["Semua", "Makanan", "Minuman", "Buku", "Alat Tulis", "Elektronik", "Kebutuhan", "Aksesoris", "Kesehatan"];
  const filtered = useMemo(
    () => CATALOG.filter((b) => (filter === "Semua" || b.kategori === filter) && (b.nama.toLowerCase().includes(search.toLowerCase()) || b.toko.toLowerCase().includes(search.toLowerCase()))),
    [search, filter]
  );
  const cols = width >= 1200 ? 4 : width >= 800 ? 3 : 2;
  const cardWidth = Math.max(140, Math.floor((Math.min(width, 960) - 32) / cols) - 8);
  return (
    <SafeAreaView style={st.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <TopBar title="Katalog Jastip" right={<SvcTag name="catalog-service" />} onBack={() => onNavigate("PilihPeran")} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, maxWidth: 960, width: "100%", alignSelf: "center" }}>
        <Text style={st.mutedLine}>Langkah K–L · toko, barang, harga acuan + foto dari JastipKampus_Gambar_Produk</Text>
        <TextInput style={st.searchBar} placeholder="Cari barang atau toko…" placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {cats.map((c) => (
            <TouchableOpacity key={c} onPress={() => setFilter(c)} style={[st.chip, filter === c && st.chipActive]}>
              <Text style={[st.chipText, filter === c && st.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={st.sesiStrip}>
          <Text style={st.sesiStripTitle}>Sesi jastip aktif · {sesiList.length}</Text>
          <Text style={st.sesiStripSub}>{sesiList.map((s) => s.toko).slice(0, 3).join(" · ")}</Text>
        </View>
      </View>
      <FlatList
        key={`cols-${cols}`}
        data={filtered}
        numColumns={cols}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ padding: 10, paddingBottom: 30, maxWidth: 960, width: "100%", alignSelf: "center" }}
        columnWrapperStyle={cols > 1 ? { justifyContent: "flex-start" } : undefined}
        renderItem={({ item }) => (
          <TouchableOpacity style={[st.prodCard, { width: cardWidth }]} onPress={() => onPilihBarang(item)} activeOpacity={0.9}>
            <View style={st.prodInner}>
              <Image source={item.img} style={st.prodImg} resizeMode="cover" />
              <View style={st.prodBody}>
                <Text style={st.prodNama} numberOfLines={2}>{item.nama}</Text>
                <Text style={st.prodToko} numberOfLines={1}>{item.toko}</Text>
                <View style={st.prodFooter}>
                  <Text style={st.prodHarga}>{rp(item.harga)}</Text>
                  <Text style={st.prodSatuan}>/{item.satuan}</Text>
                </View>
                <Badge label={item.kategori} color={C.primaryDark} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: C.muted, marginTop: 40 }}>Tidak ada barang ditemukan.</Text>}
      />
    </SafeAreaView>
  );
}

function FormTitipan({ barang, sesiList, onNavigate, onLanjut }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("");
  const [catatan, setCatatan] = useState("");
  const related = sesiList.filter((s) => s.toko === barang.toko);
  const options = related.length ? related : sesiList;
  const [sesiDipilih, setSesiDipilih] = useState(options[0] || null);
  const total = barang.harga * jumlah; const biaya = 5000;
  return (
    <ScreenShell>
      <TopBar title="Detail Titipan" right={<SvcTag name="order-service" />} onBack={() => onNavigate("PenitipBrowse")} />
      <View style={[st.card, st.rowCard]}>
        <Image source={barang.img} style={st.detailImg} />
        <View style={{ flex: 1 }}>
          <Text style={st.cardTitle}>{barang.nama}</Text>
          <Text style={st.prodToko}>{barang.toko}</Text>
          <Text style={st.prodHarga}>{rp(barang.harga)} / {barang.satuan}</Text>
          <Text style={st.mutedLine}>{barang.deskripsi}</Text>
          <SvcTag name="catalog-service" />
        </View>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Pilih Sesi Jastip</Text>
        <Text style={st.mutedLine}>Langkah M–O · cek sesi buka & kapasitas</Text>
        {options.map((sesi) => (
          <TouchableOpacity key={sesi.id} style={[st.sesiRow, sesiDipilih?.id === sesi.id && st.sesiSelected]} onPress={() => setSesiDipilih(sesi)}>
            <View style={{ flex: 1 }}>
              <Text style={st.sesiToko}>{sesi.toko}</Text>
              <Text style={st.sesiInfo}>Batas {sesi.batas} · {sesi.diisi}/{sesi.kapasitas} order · {sesi.penjastip}</Text>
            </View>
            {sesiDipilih?.id === sesi.id ? <Badge label="Dipilih" color={C.primary} /> : null}
          </TouchableOpacity>
        ))}
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Detail Titipan</Text>
        <Text style={st.mutedLine}>Langkah N · nama barang, jumlah, varian, catatan</Text>
        <Text style={st.label}>Jumlah</Text>
        <View style={st.qtyRow}>
          <TouchableOpacity style={st.qtyBtn} onPress={() => setJumlah(Math.max(1, jumlah - 1))}><Text style={st.qtyBtnText}>−</Text></TouchableOpacity>
          <Text style={st.qtyVal}>{jumlah}</Text>
          <TouchableOpacity style={st.qtyBtn} onPress={() => setJumlah(jumlah + 1)}><Text style={st.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        <Input label="Varian / ukuran" value={varian} onChangeText={setVarian} placeholder="cth: less sugar, large, rasa keju" />
        <Input label="Catatan" value={catatan} onChangeText={setCatatan} placeholder="Catatan ke penjastip (opsional)" multiline />
        <View style={st.summaryBox}>
          <View style={st.summaryRow}><Text style={st.summaryLabel}>Harga acuan</Text><Text style={st.summaryVal}>{rp(barang.harga)} × {jumlah}</Text></View>
          <View style={st.summaryRow}><Text style={st.summaryLabel}>Biaya jasa titip</Text><Text style={st.summaryVal}>{rp(biaya)}</Text></View>
          <View style={st.divider} />
          <View style={st.summaryRow}><Text style={st.totalLabel}>Total estimasi</Text><Text style={st.totalVal}>{rp(total + biaya)}</Text></View>
        </View>
      </View>
      <Text style={[st.mutedLine, { marginBottom: 8 }]}>Langkah Q · ingin tawar harga/jasa titip?</Text>
      <View style={st.rowGap}>
        <Btn label="💬 Tawar Harga" outline style={{ flex: 1, marginRight: 8 }} onPress={() => onNavigate("TawarHarga", { barang, jumlah, varian, catatan, sesi: sesiDipilih })} />
        <Btn label="Lanjut Bayar" style={{ flex: 1 }} disabled={!sesiDipilih} onPress={() => onLanjut({ barang, jumlah, varian, catatan, sesi: sesiDipilih, total: total + biaya, tawaran: null })} />
      </View>
    </ScreenShell>
  );
}

function TawarHargaScreen({ params, onNavigate, onLanjutBayar }) {
  const { barang, jumlah, varian, catatan, sesi } = params;
  const [tawaran, setTawaran] = useState(String(barang.harga));
  const [status, setStatus] = useState(null);
  return (
    <ScreenShell>
      <TopBar title="Proses Tawar" right={<SvcTag name="order-service" />} onBack={() => onNavigate("FormTitipan", params)} />
      <View style={[st.card, st.rowCard]}>
        <Image source={barang.img} style={st.thumbImg} />
        <View style={{ flex: 1 }}>
          <Text style={st.cardTitle}>{barang.nama}</Text>
          <Text style={st.prodToko}>{barang.toko}</Text>
          <Text style={st.mutedLine}>Harga acuan catalog-service: {rp(barang.harga)}</Text>
        </View>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Ajukan Tawaran</Text>
        <Text style={st.mutedLine}>Langkah R–V · tawar, setuju/tolak, ubah, atau batalkan</Text>
        <Input label={`Tawaran per ${barang.satuan}`} value={tawaran} onChangeText={setTawaran} keyboardType="numeric" />
        {!status && <Btn label="Kirim Tawaran" onPress={() => setStatus("menunggu")} />}
        {status === "menunggu" && (
          <View>
            <View style={st.warnBox}><Text style={st.warnText}>⏳ Menunggu konfirmasi penjastip…</Text></View>
            <View style={st.rowGap}>
              <Btn label="Simulasi Setuju" success style={{ flex: 1, marginRight: 8 }} onPress={() => setStatus("disetujui")} />
              <Btn label="Simulasi Tolak" danger style={{ flex: 1 }} onPress={() => setStatus("ditolak")} />
            </View>
          </View>
        )}
        {status === "disetujui" && (
          <View>
            <View style={st.okBox}><Text style={st.okText}>✅ Tawaran disetujui. Lanjut proses jastip.</Text></View>
            <Btn label="Lanjut Bayar →" style={{ marginTop: 12 }} onPress={() => onLanjutBayar({ barang, jumlah, varian, catatan, sesi, total: parseInt(tawaran, 10) * jumlah + 5000, tawaran: parseInt(tawaran, 10) })} />
          </View>
        )}
        {status === "ditolak" && (
          <View>
            <View style={st.badBox}><Text style={st.badText}>❌ Tawaran ditolak. Ubah tawaran atau batalkan titipan.</Text></View>
            <View style={st.rowGap}>
              <Btn label="Ubah Tawaran" outline style={{ flex: 1, marginRight: 8 }} onPress={() => setStatus(null)} />
              <Btn label="Batalkan" danger style={{ flex: 1 }} onPress={() => onNavigate("PenitipBrowse")} />
            </View>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

function PembayaranScreen({ order, onNavigate, onBayar }) {
  const [metode, setMetode] = useState("QRIS");
  const metodes = ["QRIS", "GoPay", "OVO", "Dana", "Transfer Bank"];
  return (
    <ScreenShell>
      <TopBar title="Pembayaran" right={<SvcTag name="payment-service" />} onBack={() => onNavigate("FormTitipan", order)} />
      <View style={st.card}>
        <Text style={st.cardTitle}>Ringkasan Order</Text>
        <Text style={st.mutedLine}>Langkah U–X1 · total titipan & saldo tertahan</Text>
        <View style={st.rowCard}>
          <Image source={order.barang.img} style={st.thumbImg} />
          <View style={{ flex: 1 }}>
            <Text style={st.prodNama}>{order.barang.nama}</Text>
            <Text style={st.prodToko}>{order.barang.toko}</Text>
            <Text style={st.sesiInfo}>Sesi {order.sesi?.toko} · batas {order.sesi?.batas}</Text>
            <Text style={st.prodHarga}>× {order.jumlah}{order.varian ? ` · ${order.varian}` : ""}</Text>
          </View>
        </View>
        <View style={st.summaryBox}>
          {order.tawaran ? <View style={st.summaryRow}><Text style={st.summaryLabel}>Harga disepakati</Text><Text style={st.summaryVal}>{rp(order.tawaran)}</Text></View> : null}
          <View style={st.summaryRow}><Text style={st.totalLabel}>Total bayar</Text><Text style={st.totalVal}>{rp(order.total)}</Text></View>
          <Text style={[st.mutedLine, { marginTop: 8 }]}>Dana ditahan escrow oleh payment-service sampai barang diterima.</Text>
        </View>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Metode Pembayaran</Text>
        {metodes.map((m) => (
          <TouchableOpacity key={m} style={[st.metodeRow, metode === m && st.metodeActive]} onPress={() => setMetode(m)}>
            <View style={[st.radio, metode === m && st.radioOn]} />
            <Text style={{ color: C.text, fontWeight: metode === m ? "700" : "500" }}>{m}</Text>
          </TouchableOpacity>
        ))}
        <Btn label={`Bayar ${rp(order.total)} via ${metode}`} onPress={() => onBayar(metode)} style={{ marginTop: 8 }} />
      </View>
    </ScreenShell>
  );
}

function TrackingScreen({ order, onNavigate }) {
  const [step, setStep] = useState(0);
  const steps = [
    { key: "dititip", title: "Dititip", desc: "Order dikonfirmasi. Status dicatat tracking-service." },
    { key: "dibelanjakan", title: "Dibelanjakan", desc: `Penjastip membeli barang di ${order.sesi?.toko}.` },
    { key: "diantar", title: "Diantar", desc: "Penjastip mengantar barang ke penitip." },
    { key: "diterima", title: "Diterima", desc: "Penitip konfirmasi terima. Dana dilepas ke penjastip." },
  ];
  return (
    <ScreenShell>
      <TopBar title="Tracking Titipan" right={<SvcTag name="tracking-service" />} onBack={() => onNavigate("PilihPeran")} />
      <View style={[st.card, st.rowCard]}>
        <Image source={order.barang.img} style={st.thumbImg} />
        <View style={{ flex: 1 }}>
          <Text style={st.prodNama}>{order.barang.nama}</Text>
          <Text style={st.prodToko}>{order.sesi?.toko}</Text>
          <Text style={st.prodHarga}>{rp(order.total)}</Text>
          <Badge label={order.metode || "QRIS"} color={C.warn} bg={C.warnSoft} />
        </View>
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Status Pengiriman</Text>
        <Text style={st.mutedLine}>Langkah Y–AI · dititip → dibelanjakan → diantar → diterima</Text>
        {steps.map((stItem, i) => (
          <View key={stItem.key} style={st.trackRow}>
            <View style={[st.trackDot, i <= step && st.trackDotOn]}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{i <= step ? "✓" : i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12, paddingBottom: 14 }}>
              <Text style={[st.trackLabel, i <= step && { color: C.primary, fontWeight: "800" }]}>{stItem.title}</Text>
              {i === step ? <Text style={st.trackDesc}>{stItem.desc}</Text> : null}
            </View>
          </View>
        ))}
      </View>
      {step < 3 ? (
        <Btn label={`Simulasikan: ${steps[step + 1].title} →`} onPress={() => setStep((v) => Math.min(3, v + 1))} />
      ) : (
        <View style={[st.card, st.successCard]}>
          <Text style={{ color: C.accent, fontWeight: "800", fontSize: 18, textAlign: "center" }}>🎉 Transaksi Selesai</Text>
          <Text style={{ color: C.accent, textAlign: "center", marginTop: 6 }}>payment-service sudah melepaskan dana ke penjastip.</Text>
        </View>
      )}
      <Btn label="Kembali ke Beranda" outline onPress={() => onNavigate("PilihPeran")} style={{ marginTop: 8 }} />
    </ScreenShell>
  );
}

export default function App() {
  const [screen, setScreen] = useState("Welcome");
  const [params, setParams] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [sesiList, setSesiList] = useState(DEFAULT_SESI);
  const go = useCallback((target, p) => { setScreen(target); if (p !== undefined) setParams(p || {}); }, []);
  const handleRegister = (akun) => { setAccounts((prev) => [...prev.filter((a) => a.email !== akun.email), akun]); go("Login"); };
  const handleLogin = (akun) => { setUser(akun); go("PilihPeran"); };
  const handleLogout = () => { setUser(null); go("Welcome"); };

  let current = null;
  if (screen === "Welcome") current = <WelcomeScreen onNavigate={go} hasAccount={accounts.length > 0} />;
  else if (screen === "Register") current = <RegisterScreen onNavigate={go} onRegister={handleRegister} />;
  else if (screen === "Login") current = <LoginScreen onNavigate={go} onLogin={handleLogin} accounts={accounts} />;
  else if (screen === "PilihPeran") current = <PilihPeranScreen user={user} onNavigate={go} onLogout={handleLogout} />;
  else if (screen === "PenjastipDashboard") current = (
    <PenjastipDashboard onNavigate={go} sesiList={sesiList} onBukaSesi={(sesi) => setSesiList((prev) => [sesi, ...prev.filter((x) => x.id !== sesi.id)])} />
  );
  else if (screen === "PenitipBrowse") current = (
    <PenitipBrowse onNavigate={go} sesiList={sesiList} onPilihBarang={(barang) => go("FormTitipan", { barang })} />
  );
  else if (screen === "FormTitipan" && params.barang) current = (
    <FormTitipan barang={params.barang} sesiList={sesiList} onNavigate={(t, p) => go(t, p || params)} onLanjut={(order) => go("Pembayaran", order)} />
  );
  else if (screen === "TawarHarga" && params.barang) current = (
    <TawarHargaScreen params={params} onNavigate={(t, p) => go(t, p || params)} onLanjutBayar={(order) => go("Pembayaran", order)} />
  );
  else if (screen === "Pembayaran" && params.barang) current = (
    <PembayaranScreen order={params} onNavigate={(t, p) => go(t, p || params)} onBayar={(metode) => go("Tracking", { ...params, metode })} />
  );
  else if (screen === "Tracking" && params.barang) current = <TrackingScreen order={params} onNavigate={go} />;
  else current = (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ color: C.muted, marginBottom: 12 }}>Memuat…</Text>
      <Btn label="Ke Beranda" outline onPress={() => go(user ? "PilihPeran" : "Welcome")} style={{ minWidth: 160 }} />
    </View>
  );
  return (
      <SafeAreaProvider>
        <View style={st.root}>{current}</View>
      </SafeAreaProvider>
    );
  }

  const st = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
      minHeight: Platform.OS === "web" ? "100vh" : undefined,
      width: "100%",
    },
    screen: { flex: 1, backgroundColor: C.bg, width: "100%" },
    container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: "100%", alignSelf: "center", flexGrow: 1 },
  card: { backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 6 },
  topBar: { backgroundColor: C.surface, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  topBarLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  topBarTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.light, alignItems: "center", justifyContent: "center", marginRight: 8 },
  backBtnText: { fontSize: 18, color: C.text, fontWeight: "700" },
  heading: { fontSize: 26, fontWeight: "800", color: C.text, textAlign: "center", marginBottom: 4 },
  sub: { fontSize: 14, color: C.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
  subCenter: { fontSize: 14, color: C.muted, textAlign: "center", marginBottom: 18 },
  brandWrap: { alignItems: "center", marginBottom: 10, marginTop: 8 },
  logoCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoIcon: { fontSize: 28 },
  appTitle: { fontSize: 24, fontWeight: "900", color: C.primary },
  label: { fontSize: 13, fontWeight: "700", color: C.ink, marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text },
  btn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", borderWidth: 1.5 },
  btnText: { fontSize: 15, fontWeight: "800" },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  svcTag: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  svcText: { fontSize: 11, fontWeight: "700" },
  mutedLine: { fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 8 },
  errorText: { color: C.danger, fontWeight: "600", marginBottom: 8, fontSize: 13 },
  heroPanel: { backgroundColor: C.primary, borderRadius: 24, padding: 22, marginBottom: 14 },
  heroEyebrow: { color: "#BFDBFE", fontWeight: "800", fontSize: 11, letterSpacing: 1.2, marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", lineHeight: 34 },
  heroDesc: { color: "#DBEAFE", marginTop: 10, lineHeight: 21, fontSize: 14 },
  heroStats: { flexDirection: "row", marginTop: 18 },
  statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 14, paddingVertical: 12, alignItems: "center", marginHorizontal: 4 },
  statNum: { color: "#fff", fontWeight: "900", fontSize: 18 },
  statLabel: { color: "#DBEAFE", fontSize: 11, marginTop: 2 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 10 },
  stepDotText: { color: C.primary, fontWeight: "800", fontSize: 12 },
  stepText: { color: C.text, flex: 1, fontSize: 13, lineHeight: 18 },
  alertBox: { backgroundColor: C.warnSoft, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F6D7A8" },
  alertTitle: { color: C.warn, fontWeight: "800", fontSize: 15 },
  alertText: { color: "#9A5B12", marginTop: 4, lineHeight: 18 },
  profileBanner: { backgroundColor: C.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  helloText: { fontSize: 18, fontWeight: "800", color: C.text },
  helloSub: { color: C.muted, marginTop: 3, fontSize: 12 },
  logoutText: { color: C.danger, fontWeight: "700" },
  roleCard: { backgroundColor: C.surface, borderRadius: 22, padding: 20, marginBottom: 14, borderWidth: 2, alignItems: "center" },
  roleIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  roleTitle: { fontSize: 22, fontWeight: "900", color: C.text, marginBottom: 6 },
  roleDesc: { fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 10, lineHeight: 19 },
  searchBar: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text, marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.light, marginRight: 8, borderWidth: 1, borderColor: "transparent" },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  sesiStrip: { backgroundColor: C.primarySoft, borderRadius: 14, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: "#C9DBFF" },
  sesiStripTitle: { color: C.primaryDark, fontWeight: "800", fontSize: 13 },
  sesiStripSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  prodCard: { padding: 6 },
  prodInner: { backgroundColor: C.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  prodImg: { width: "100%", height: 130, backgroundColor: C.light },
  prodBody: { padding: 10 },
  prodNama: { fontSize: 13, fontWeight: "800", color: C.text, minHeight: 34 },
  prodToko: { fontSize: 11, color: C.muted, marginTop: 2 },
  prodFooter: { flexDirection: "row", alignItems: "flex-end", marginTop: 6, marginBottom: 2 },
  prodHarga: { fontSize: 14, fontWeight: "900", color: C.primary },
  prodSatuan: { fontSize: 11, color: C.muted, marginLeft: 2, marginBottom: 1 },
  rowCard: { flexDirection: "row", alignItems: "flex-start" },
  detailImg: { width: 100, height: 100, borderRadius: 14, backgroundColor: C.light, marginRight: 12 },
  thumbImg: { width: 72, height: 72, borderRadius: 12, backgroundColor: C.light, marginRight: 12 },
  infoRow: { fontSize: 13, color: C.text, marginBottom: 4 },
  infoKey: { fontWeight: "700", color: C.muted },
  sesiRow: { backgroundColor: C.light, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  sesiSelected: { backgroundColor: C.primarySoft, borderColor: C.primary },
  sesiToko: { fontWeight: "800", color: C.text, fontSize: 13 },
  sesiInfo: { color: C.muted, fontSize: 12, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  qtyBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: "#fff", fontSize: 22, lineHeight: 26, fontWeight: "600" },
  qtyVal: { fontSize: 20, fontWeight: "800", color: C.text, minWidth: 48, textAlign: "center", marginHorizontal: 12 },
  summaryBox: { backgroundColor: C.light, borderRadius: 14, padding: 14, marginTop: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 12, color: C.muted },
  summaryVal: { fontSize: 13, fontWeight: "700", color: C.text },
  totalLabel: { fontSize: 14, fontWeight: "800", color: C.text },
  totalVal: { fontSize: 18, fontWeight: "900", color: C.primary },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  rowGap: { flexDirection: "row", marginBottom: 8 },
  metodeRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  metodeActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.primary, backgroundColor: "transparent", marginRight: 10 },
  radioOn: { backgroundColor: C.primary },
  trackRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  trackDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#CBD5E1" },
  trackDotOn: { backgroundColor: C.primary },
  trackLabel: { fontSize: 13, fontWeight: "700", color: C.muted },
  trackDesc: { fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 },
  successCard: { backgroundColor: C.accentSoft, borderColor: "#9AE6C4" },
  warnBox: { backgroundColor: C.warnSoft, borderRadius: 12, padding: 12, marginBottom: 10 },
  warnText: { color: "#9A5B12", fontWeight: "700" },
  okBox: { backgroundColor: C.accentSoft, borderRadius: 12, padding: 12 },
  okText: { color: C.accent, fontWeight: "700" },
  badBox: { backgroundColor: C.dangerSoft, borderRadius: 12, padding: 12, marginBottom: 10 },
  badText: { color: C.danger, fontWeight: "700" },
});
