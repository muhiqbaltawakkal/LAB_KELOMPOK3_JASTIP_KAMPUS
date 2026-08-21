import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  bg: "#FFF8FC",
  bgSoft: "#FFF2F9",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF4E7",
  border: "#FFD8EC",
  borderStrong: "#FFB6D6",
  pink: "#FF77B7",
  pinkDark: "#D84F97",
  purple: "#8B80F9",
  mint: "#76E4CF",
  sky: "#8FD7FF",
  lemon: "#FFE48A",
  peach: "#FFBD9D",
  success: "#55C87A",
  danger: "#FF7A8A",
  text: "#5C3550",
  textSoft: "#8F6880",
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

function buildItemViewModel(items, tokoList) {
  const tokoMap = new Map((tokoList || []).map((toko) => [toko.id, toko]));
  return (items || []).map((item) => {
    const toko = tokoMap.get(item.toko_id) || {};
    const kategori = toko.kategori || "Umum";
    return {
      ...item,
      kategori,
      toko_nama: toko.nama || `Toko #${item.toko_id}`,
      toko_alamat: toko.alamat || "-",
      kategoriIkon: KATEGORI_IKON[kategori] || KATEGORI_IKON.Umum,
    };
  });
}

function StatCard({ label, value, tone }) {
  const mapTone = {
    pink: { bg: "#FFF0F7", border: "#FFC6E4" },
    purple: { bg: "#F4F1FF", border: "#D8D0FF" },
    mint: { bg: "#EEFFF9", border: "#BDEFE4" },
    lemon: { bg: "#FFFBEA", border: "#FFE7A8" },
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
      const auth = await login(
        loginForm.peran === "penjastip" ? "jastip" : loginForm.email.trim()
      );
      navigation.replace("Beranda", {
        peran: loginForm.peran,
        token: auth.token,
        profil: {
          nama: capitalizeWords(loginForm.nama || loginForm.email.split("@")[0] || "Pengguna"),
          email: loginForm.email.trim(),
          kampus: registerForm.kampus || "Kampus Makassar",
        },
      });
    } catch {
      setPesan({ type: "error", text: "Login gagal. Pastikan backend aktif dan port 8080 bisa diakses." });
    } finally {
      setMemuat(false);
    }
  }

  return (
    <SafeAreaView style={auth.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={auth.scroll} showsVerticalScrollIndicator={false}>
        <View style={auth.heroCard}>
          <View style={auth.heroBubbleLeft} />
          <View style={auth.heroBubbleRight} />
          <Text style={auth.heroEmoji}>🍭</Text>
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
  kategoriAktif,
  setKategoriAktif,
  daftarKategori,
  cari,
  setCari,
}) {
  const tokoUnggulan = tokoList.slice(0, 5);

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
            <Text style={shared.categoryChipText}>
              {kategori === "Semua" ? "🍬" : KATEGORI_IKON[kategori] || "🎁"} {kategori}
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
          <View
            key={toko.id}
            style={[
              penitip.storeCard,
              { backgroundColor: [C.surfaceAlt, "#F2F5FF", "#EFFFFB", "#FFF3F7", "#FFF8E5"][index % 5] },
            ]}
          >
            <Text style={penitip.storeEmoji}>{KATEGORI_IKON[toko.kategori] || "🏪"}</Text>
            <Text style={penitip.storeName}>{toko.nama}</Text>
            <Text style={penitip.storeCategory}>{toko.kategori}</Text>
          </View>
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
            <View style={penitip.itemTopRow}>
              <Text style={penitip.itemEmoji}>{item.kategoriIkon}</Text>
              <View style={penitip.stockPill}>
                <Text style={penitip.stockPillText}>Stok {item.stok}</Text>
              </View>
            </View>
            <Text style={penitip.itemName} numberOfLines={2}>{item.nama}</Text>
            <Text style={penitip.itemStore}>{item.toko_nama}</Text>
            <Text style={penitip.itemCategory}>{item.kategori}</Text>
            <Text style={penitip.itemPrice}>{formatRupiah(item.harga)}</Text>
            <View style={penitip.ctaButton}>
              <Text style={penitip.ctaButtonText}>{ROLE_CONTENT.penitip.cta}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={shared.emptyBox}>
            <Text style={shared.emptyEmoji}>🍬</Text>
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
              { backgroundColor: ["#FFF7FB", "#F4F8FF", "#F3FFF7", "#FFFBEF", "#FFF4EF"][index % 5] },
            ]}
          >
            <View style={penjastip.taskTopRow}>
              <Text style={penjastip.taskEmoji}>{item.kategoriIkon}</Text>
              <View style={penjastip.taskRight}>
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
  const [cari, setCari] = useState("");
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
      if (!sesiForm.tokoId && daftarToko[0]?.id) {
        setSesiForm((prev) => ({ ...prev, tokoId: String(daftarToko[0].id) }));
      }
    } catch (error) {
      setGalat(error.message || "Gagal memuat beranda");
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
  }, [items, kategoriAktif, cari]);

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
        <Text style={shared.emptyEmoji}>🍬</Text>
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
      />
    );
  }

  return (
    <PenitipDashboard
      profil={profil}
      navigation={navigation}
      filteredItems={filteredItems}
      tokoList={tokoList}
      kategoriAktif={kategoriAktif}
      setKategoriAktif={setKategoriAktif}
      daftarKategori={daftarKategori}
      cari={cari}
      setCari={setCari}
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
    backgroundColor: C.surfaceAlt,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 18,
  },
  heroBubbleLeft: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFD9EC",
    top: -20,
    left: -10,
  },
  heroBubbleRight: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#DFF7FF",
    bottom: -25,
    right: -15,
  },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { color: C.text, fontSize: 30, fontWeight: "800" },
  heroSubtitle: { color: C.textSoft, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 8 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#FFE6F3",
    borderRadius: 18,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  tabButtonActive: { backgroundColor: C.surface },
  tabText: { color: C.textSoft, fontWeight: "700" },
  tabTextActive: { color: C.pinkDark },
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
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
    backgroundColor: "#FFF8FD",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
  },
  roleCardActive: {
    borderColor: C.pink,
    backgroundColor: "#FFF1F8",
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
  rolePillActive: { backgroundColor: "#FFF0F9", borderColor: C.pink },
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
  noticeSuccess: { backgroundColor: "#F2FFF7", borderColor: "#BAEBCB" },
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
    backgroundColor: "#FFF1D6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profilePillText: { color: "#926B00", fontWeight: "700", fontSize: 12 },
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
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  categoryChipActive: { backgroundColor: "#FFF0F8", borderColor: C.pink },
  categoryChipText: { color: C.text, fontWeight: "700", fontSize: 12 },
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
    backgroundColor: "#FFF1F8",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: C.borderStrong,
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
  heroTitle: { color: C.text, fontSize: 28, fontWeight: "800" },
  heroSubtitle: { color: C.textSoft, lineHeight: 22, marginTop: 8 },
  heroStatsRow: { flexDirection: "row", marginTop: 16, marginHorizontal: -4 },
  storeRow: { gap: 12, paddingBottom: 4 },
  storeCard: {
    width: 180,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  storeEmoji: { fontSize: 28, marginBottom: 8 },
  storeName: { color: C.text, fontWeight: "800", fontSize: 15 },
  storeCategory: { color: C.textSoft, marginTop: 4, lineHeight: 20 },
  itemCard: {
    width: "48.3%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 16,
  },
  itemTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  itemEmoji: {
    fontSize: 26,
    backgroundColor: "#FFF4CC",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  stockPill: {
    backgroundColor: "#F1FFF8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockPillText: { color: C.success, fontWeight: "700", fontSize: 11 },
  itemName: { color: C.text, fontWeight: "800", fontSize: 14, lineHeight: 20, minHeight: 40 },
  itemStore: { color: C.pinkDark, marginTop: 6, fontWeight: "700", fontSize: 12 },
  itemCategory: { color: C.textSoft, marginTop: 3, fontSize: 12, minHeight: 18 },
  itemPrice: { color: C.purple, fontWeight: "800", fontSize: 16, marginTop: 12 },
  ctaButton: {
    marginTop: 14,
    backgroundColor: "#FFF0F8",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  ctaButtonText: { color: C.pinkDark, fontWeight: "800", fontSize: 12 },
});

const penjastip = StyleSheet.create({
  heroCard: {
    backgroundColor: "#F3F0FF",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D9D1FF",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  heroBadgeText: { color: C.purple, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: C.text, fontSize: 28, fontWeight: "800" },
  heroSubtitle: { color: C.textSoft, lineHeight: 22, marginTop: 8 },
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
  tokoChipActive: { backgroundColor: "#FFF0F8", borderColor: C.pink },
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
    backgroundColor: "#EEFFF8",
    borderWidth: 1,
    borderColor: "#BCEFD9",
    borderRadius: 20,
    padding: 18,
  },
  activeTitle: { color: "#278057", fontWeight: "800", fontSize: 16 },
  activeSubtitle: { color: "#487364", marginTop: 6, lineHeight: 20 },
  activeHighlight: { color: C.text, marginTop: 10, fontWeight: "700" },
  taskCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  taskTopRow: { flexDirection: "row", alignItems: "center" },
  taskEmoji: {
    fontSize: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 12,
  },
  taskRight: { flex: 1 },
  taskTitle: { color: C.text, fontWeight: "800", fontSize: 15 },
  taskMeta: { color: C.textSoft, marginTop: 4, lineHeight: 20 },
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
