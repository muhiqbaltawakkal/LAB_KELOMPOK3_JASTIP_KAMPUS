// App.js — Jastip Kampus: tampilan profesional dengan login, search, filter kategori
import { useEffect, useState } from "react";
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
import { getDaftarBarang } from "./api/endpoints";
import TransaksiScreen from "./screens/TransaksiScreen";
import SuksesScreen from "./screens/SuksesScreen";

const Stack = createNativeStackNavigator();

// ─── Warna tema ───────────────────────────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  card: "#141925",
  cardBorder: "#1E2736",
  accent: "#6C63FF",
  accentLight: "#8B85FF",
  teal: "#00C9B1",
  warn: "#FF6B6B",
  text: "#F0F4FF",
  muted: "#8892A4",
  badge: "#1A2035",
};

// ─── Peta ikon emoji per kategori ────────────────────────────────────────────
const KATEGORI_IKON = {
  "Minuman Kekinian": "🧋",
  "Makanan Khas":     "🍜",
  "Buku & Alat Tulis":"📚",
  "Elektronik":       "📱",
  "Minimarket":       "🛒",
  "Kuliner Khas":     "🍌",
  "Kafe & Kopi":      "☕",
  "Fast Food":        "🍔",
  "Lifestyle & Aksesoris": "🎀",
  "Apotek & Kesehatan": "💊",
};

// ─── Layar Login ─────────────────────────────────────────────────────────────
function LoginScreen({ navigation }) {
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);

  async function masuk(peran) {
    setMemuat(true);
    setGalat(null);
    // Tidak perlu panggil API saat login — token JWT diambil saat buat order
    setTimeout(() => {
      setMemuat(false);
      navigation.replace("Beranda", { peran });
    }, 300);
  }

  return (
    <SafeAreaView style={ls.wadah}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={ls.hero}>
        <Text style={ls.logo}>🎓</Text>
        <Text style={ls.judul}>Jastip Kampus</Text>
        <Text style={ls.sub}>Titip barang, hemat waktu, aman terpercaya</Text>
      </View>

      <View style={ls.kartu}>
        <Text style={ls.kartuJudul}>Masuk sebagai</Text>

        <TouchableOpacity style={[ls.tombol, ls.tombolPenitip]} onPress={() => masuk("penitip")} disabled={memuat}>
          <Text style={ls.tombolIkon}>🛍️</Text>
          <View>
            <Text style={ls.tombolLabel}>Penitip</Text>
            <Text style={ls.tombolSub}>Titipkan barang dari toko</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[ls.tombol, ls.tombolJastip]} onPress={() => masuk("penjastip")} disabled={memuat}>
          <Text style={ls.tombolIkon}>🏃</Text>
          <View>
            <Text style={ls.tombolLabel}>Penjastip</Text>
            <Text style={ls.tombolSub}>Belikan barang, raih komisi</Text>
          </View>
        </TouchableOpacity>

        {galat ? <Text style={ls.galat}>{galat}</Text> : null}
        {memuat ? <ActivityIndicator color={C.accent} style={{ marginTop: 16 }} /> : null}
      </View>

      <Text style={ls.footer}>Kelompok 3 · Lab Microservices 2026</Text>
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24 },
  hero: { alignItems: "center", marginTop: 64, marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 12 },
  judul: { color: C.text, fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },
  sub: { color: C.muted, fontSize: 14, marginTop: 6, textAlign: "center" },
  kartu: { backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.cardBorder },
  kartuJudul: { color: C.muted, fontSize: 13, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 },
  tombol: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, marginBottom: 12, gap: 14 },
  tombolPenitip: { backgroundColor: "#1A1F35", borderWidth: 1, borderColor: C.accent },
  tombolJastip: { backgroundColor: "#0F1F1C", borderWidth: 1, borderColor: C.teal },
  tombolIkon: { fontSize: 28 },
  tombolLabel: { color: C.text, fontWeight: "700", fontSize: 16 },
  tombolSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  galat: { color: C.warn, textAlign: "center", marginTop: 12 },
  footer: { color: C.muted, textAlign: "center", fontSize: 12, marginTop: 32 },
});

// ─── Layar Beranda (Daftar Barang) ───────────────────────────────────────────
function BerandaScreen({ route, navigation }) {
  const peran = route.params?.peran ?? "penitip";
  const [semua, setSemua] = useState([]);
  const [tampil, setTampil] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);
  const [cari, setCari] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  const daftarKategori = ["Semua", ...Array.from(new Set(semua.map(i => i.kategori ?? "Lainnya"))).sort()];

  useEffect(() => {
    getDaftarBarang()
      .then(json => {
        const items = Array.isArray(json) ? json : json.items ?? [];
        setSemua(items);
        setTampil(items);
      })
      .catch(e => setGalat(e.message))
      .finally(() => setMemuat(false));
  }, []);

  useEffect(() => {
    let hasil = semua;
    if (kategoriAktif !== "Semua") hasil = hasil.filter(i => i.kategori === kategoriAktif);
    if (cari.trim()) hasil = hasil.filter(i => i.nama.toLowerCase().includes(cari.toLowerCase()));
    setTampil(hasil);
  }, [cari, kategoriAktif, semua]);

  if (memuat) return (
    <SafeAreaView style={[hs.wadah, hs.tengah]}>
      <ActivityIndicator size="large" color={C.accent} />
      <Text style={hs.muatTeks}>Memuat katalog jastip...</Text>
    </SafeAreaView>
  );

  if (galat) return (
    <SafeAreaView style={[hs.wadah, hs.tengah]}>
      <Text style={{ fontSize: 40 }}>😵</Text>
      <Text style={hs.galatTeks}>{galat}</Text>
      <TouchableOpacity style={hs.tombolRetry} onPress={() => { setGalat(null); setMemuat(true); getDaftarBarang().then(j => { const it = Array.isArray(j)?j:j.items??[]; setSemua(it); setTampil(it); }).catch(e=>setGalat(e.message)).finally(()=>setMemuat(false)); }}>
        <Text style={hs.tombolRetryTeks}>Coba Lagi</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={hs.wadah}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={hs.header}>
        <View>
          <Text style={hs.headerJudul}>Jastip Kampus 🎓</Text>
          <Text style={hs.headerSub}>{tampil.length} barang tersedia · {peran}</Text>
        </View>
        <TouchableOpacity style={hs.badgePeran} onPress={() => navigation.replace("Login")}>
          <Text style={hs.badgePeranTeks}>{peran === "penjastip" ? "🏃" : "🛍️"}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={hs.searchBox}>
        <Text style={hs.searchIkon}>🔍</Text>
        <TextInput
          style={hs.searchInput}
          placeholder="Cari barang jastip..."
          placeholderTextColor={C.muted}
          value={cari}
          onChangeText={setCari}
        />
        {cari ? <TouchableOpacity onPress={() => setCari("")}><Text style={hs.clearBtn}>✕</Text></TouchableOpacity> : null}
      </View>

      {/* Filter Kategori */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hs.filterScroll} contentContainerStyle={hs.filterContainer}>
        {daftarKategori.map(k => (
          <TouchableOpacity
            key={k}
            style={[hs.chip, kategoriAktif === k && hs.chipAktif]}
            onPress={() => setKategoriAktif(k)}
          >
            {k !== "Semua" && <Text style={hs.chipIkon}>{KATEGORI_IKON[k] ?? "📦"}</Text>}
            <Text style={[hs.chipTeks, kategoriAktif === k && hs.chipTeksAktif]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Daftar Barang */}
      <FlatList
        data={tampil}
        keyExtractor={(item, i) => String(item.id ?? i)}
        numColumns={2}
        columnWrapperStyle={hs.kolom}
        contentContainerStyle={hs.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={hs.kartu}
            onPress={() => navigation.navigate("Transaksi", { item, peran })}
            activeOpacity={0.85}
          >
            <View style={hs.kartuIkonWrap}>
              <Text style={hs.kartuIkon}>{KATEGORI_IKON[item.kategori] ?? "📦"}</Text>
            </View>
            <Text style={hs.kartuNama} numberOfLines={2}>{item.nama}</Text>
            <Text style={hs.kartuHarga}>Rp {(item.harga ?? 0).toLocaleString("id-ID")}</Text>
            <View style={hs.kartuFooter}>
              <View style={[hs.stokBadge, item.stok < 10 && hs.stokMenipis]}>
                <Text style={hs.stokTeks}>{item.stok < 10 ? "⚠️ " : "✓ "}{item.stok} {item.satuan}</Text>
              </View>
            </View>
            {item.stok < 5 && <View style={hs.habisOverlay}><Text style={hs.habisTeks}>Hampir habis!</Text></View>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={hs.kosong}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={hs.kosongTeks}>Tidak ada barang yang cocok.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const hs = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: C.bg },
  tengah: { alignItems: "center", justifyContent: "center" },
  muatTeks: { color: C.muted, marginTop: 12 },
  galatTeks: { color: C.warn, marginTop: 8, textAlign: "center", paddingHorizontal: 24 },
  tombolRetry: { marginTop: 16, backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  tombolRetryTeks: { color: "#fff", fontWeight: "700" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerJudul: { color: C.text, fontSize: 20, fontWeight: "800" },
  headerSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  badgePeran: { backgroundColor: C.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: C.cardBorder },
  badgePeranTeks: { fontSize: 20 },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 12 },
  searchIkon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },
  clearBtn: { color: C.muted, fontSize: 16, paddingLeft: 8 },

  filterScroll: { marginBottom: 8 },
  filterContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.cardBorder, gap: 4 },
  chipAktif: { backgroundColor: C.accent, borderColor: C.accent },
  chipIkon: { fontSize: 13 },
  chipTeks: { color: C.muted, fontSize: 13, fontWeight: "600" },
  chipTeksAktif: { color: "#fff" },

  list: { paddingHorizontal: 12, paddingBottom: 32 },
  kolom: { justifyContent: "space-between", marginBottom: 12 },
  kartu: { backgroundColor: C.card, borderRadius: 16, padding: 14, width: "48.5%", borderWidth: 1, borderColor: C.cardBorder, overflow: "hidden" },
  kartuIkonWrap: { backgroundColor: C.badge, borderRadius: 12, width: 48, height: 48, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  kartuIkon: { fontSize: 24 },
  kartuNama: { color: C.text, fontSize: 13, fontWeight: "700", marginBottom: 6, lineHeight: 18 },
  kartuHarga: { color: C.teal, fontSize: 14, fontWeight: "800", marginBottom: 8 },
  kartuFooter: { flexDirection: "row" },
  stokBadge: { backgroundColor: "#0F2820", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  stokMenipis: { backgroundColor: "#2D1515" },
  stokTeks: { color: "#4ade80", fontSize: 11, fontWeight: "600" },
  habisOverlay: { position: "absolute", top: 8, right: 8, backgroundColor: C.warn, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  habisTeks: { color: "#fff", fontSize: 9, fontWeight: "700" },

  kosong: { alignItems: "center", paddingTop: 60 },
  kosongTeks: { color: C.muted, marginTop: 8 },
});

// ─── App utama dengan navigasi ────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Beranda" component={BerandaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Transaksi" component={TransaksiScreen} options={{ title: "Buat Titipan" }} />
        <Stack.Screen name="Sukses" component={SuksesScreen} options={{ title: "Titipan Berhasil", headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

