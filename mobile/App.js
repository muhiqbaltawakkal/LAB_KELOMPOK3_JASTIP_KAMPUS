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
  bg: "#F0F4FF",
  bgSoft: "#E8EFFE",
  surface: "#FFFFFF",
  primary: "#1565C0",
  primaryLight: "#1976D2",
  primaryDark: "#0D47A1",
  accent: "#42A5F5",
  accentLight: "#E3F2FD",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  warning: "#E65100",
  warningLight: "#FFF3E0",
  danger: "#C62828",
  dangerLight: "#FFEBEE",
  text: "#1A237E",
  textMid: "#37474F",
  textSoft: "#607D8B",
  border: "#BBDEFB",
  divider: "#E3F2FD",
  shadow: "#90CAF9",
};

const IKON = {
  "Fast Food": "🍔",
  "Minuman Kekinian": "🧋",
  "Kafe & Kopi": "☕",
  "Makanan Khas": "🍜",
  "Buku & Alat Tulis": "📚",
  "Tas Outdoor": "🎒",
  "Tas & Fashion": "👜",
  "Tas Branded": "👛",
  Umum: "🛍️",
};

const DEMO_TOKO = [
  { id: 1,  nama: "KFC Panakkukang",         alamat: "Mall Panakkukang Lt.GF, Makassar",             kategori: "Fast Food" },
  { id: 2,  nama: "McDonald's Trans Studio",  alamat: "Trans Studio Mall Lt.GF, Makassar",           kategori: "Fast Food" },
  { id: 3,  nama: "Chatime Losari",           alamat: "Pantai Losari, Jl. Penghibur No.1, Makassar", kategori: "Minuman Kekinian" },
  { id: 4,  nama: "J.CO Donuts TSM",          alamat: "Trans Studio Mall Lt.GF, Makassar",           kategori: "Kafe & Kopi" },
  { id: 5,  nama: "Mie Titi Makassar",        alamat: "Jl. Irian No.18, Makassar",                   kategori: "Makanan Khas" },
  { id: 6,  nama: "Konro Bakar Karebosi",     alamat: "Jl. Gunung Lompobattang No.41, Makassar",     kategori: "Makanan Khas" },
  { id: 7,  nama: "Gramedia Karebosi",        alamat: "Mall Karebosi Link Lt.2, Makassar",            kategori: "Buku & Alat Tulis" },
  { id: 8,  nama: "Eiger Adventure MaRI",     alamat: "Mall Ratu Indah Lt.1, Makassar",               kategori: "Tas Outdoor" },
  { id: 9,  nama: "Tas Cantik Makassar",      alamat: "Mall Panakkukang Lt.1, Makassar",              kategori: "Tas & Fashion" },
  { id: 10, nama: "Zara Bag Store TSM",       alamat: "Trans Studio Mall Lt.2, Makassar",             kategori: "Tas Branded" },
];

const DEMO_ITEMS = [
  { id: 1,  toko_id: 1, nama: "Ayam KFC Original Crispy 2 Pcs dan Nasi",         harga: 55000,  stok: 50, satuan: "porsi" },
  { id: 2,  toko_id: 1, nama: "KFC Burger Zinger Junior Spicy",                   harga: 42000,  stok: 40, satuan: "pcs" },
  { id: 3,  toko_id: 1, nama: "KFC Nuggets Ayam Goreng 5 Pcs Saus BBQ",          harga: 38000,  stok: 35, satuan: "pcs" },
  { id: 4,  toko_id: 1, nama: "Krushers Vanilla Ice Blended KFC",                 harga: 28000,  stok: 60, satuan: "gelas" },
  { id: 5,  toko_id: 1, nama: "KFC Bucket Ayam Original Crispy 10 Pcs",          harga: 195000, stok: 15, satuan: "bucket" },
  { id: 6,  toko_id: 2, nama: "McChicken Burger dan Kentang Goreng Medium",       harga: 55000,  stok: 45, satuan: "porsi" },
  { id: 7,  toko_id: 2, nama: "Big Mac Burger McDonalds Double Patty",            harga: 65000,  stok: 40, satuan: "pcs" },
  { id: 8,  toko_id: 2, nama: "McFlurry Oreo Vanilla Ice Cream McDonalds",        harga: 25000,  stok: 60, satuan: "cup" },
  { id: 9,  toko_id: 2, nama: "Chicken McNuggets 10 Pcs McDonalds",              harga: 55000,  stok: 50, satuan: "pcs" },
  { id: 10, toko_id: 2, nama: "French Fries Kentang Goreng McDonalds Large",     harga: 32000,  stok: 70, satuan: "porsi" },
  { id: 11, toko_id: 3, nama: "Brown Sugar Boba Milk Tea Chatime Large",          harga: 42000,  stok: 30, satuan: "gelas" },
  { id: 12, toko_id: 3, nama: "Matcha Green Tea Latte Chatime Medium",            harga: 35000,  stok: 25, satuan: "gelas" },
  { id: 13, toko_id: 3, nama: "Taro Milk Tea Boba Chatime Large",                 harga: 37000,  stok: 28, satuan: "gelas" },
  { id: 14, toko_id: 3, nama: "Classic Pearl Milk Tea Chatime Large",             harga: 32000,  stok: 35, satuan: "gelas" },
  { id: 15, toko_id: 3, nama: "Mango Yakult Slush Chatime Medium",                harga: 35000,  stok: 22, satuan: "gelas" },
  { id: 16, toko_id: 4, nama: "Donut JCO Original Glazed 6 Pcs Box",             harga: 75000,  stok: 20, satuan: "box" },
  { id: 17, toko_id: 4, nama: "JCO Avocado Ice Blended Coffee Medium",           harga: 48000,  stok: 30, satuan: "gelas" },
  { id: 18, toko_id: 4, nama: "Donut JCO Choco Lava Cream 6 Pcs Box",           harga: 85000,  stok: 18, satuan: "box" },
  { id: 19, toko_id: 4, nama: "JCO Cappuccino Hot Coffee Regular",               harga: 38000,  stok: 35, satuan: "gelas" },
  { id: 20, toko_id: 4, nama: "Donut JCO AlCaPone Cream Cheese 3 Pcs",          harga: 45000,  stok: 25, satuan: "pcs" },
  { id: 21, toko_id: 5, nama: "Mie Titi Makassar Original Crispy Reguler",       harga: 35000,  stok: 20, satuan: "porsi" },
  { id: 22, toko_id: 5, nama: "Mie Titi Udang Crispy Saus Tiram",                harga: 45000,  stok: 18, satuan: "porsi" },
  { id: 23, toko_id: 5, nama: "Mie Titi Ayam Crispy Bumbu Pedas Makassar",       harga: 40000,  stok: 15, satuan: "porsi" },
  { id: 24, toko_id: 5, nama: "Es Teh Manis Mie Titi Makassar",                  harga: 8000,   stok: 60, satuan: "gelas" },
  { id: 25, toko_id: 5, nama: "Mie Titi Bakso Sapi Kuah Kaldu",                 harga: 42000,  stok: 12, satuan: "porsi" },
  { id: 26, toko_id: 6, nama: "Konro Bakar Iga Sapi Makassar 1 Porsi",          harga: 55000,  stok: 25, satuan: "porsi" },
  { id: 27, toko_id: 6, nama: "Sup Konro Iga Sapi Makassar 1 Mangkuk",          harga: 60000,  stok: 20, satuan: "mangkuk" },
  { id: 28, toko_id: 6, nama: "Coto Makassar Daging Campur 1 Mangkuk",          harga: 30000,  stok: 30, satuan: "mangkuk" },
  { id: 29, toko_id: 6, nama: "Es Pisang Ijo Makassar Original 1 Porsi",        harga: 18000,  stok: 40, satuan: "porsi" },
  { id: 30, toko_id: 6, nama: "Ketupat Buras Khas Makassar 2 Biji",             harga: 5000,   stok: 80, satuan: "pcs" },
  { id: 31, toko_id: 7, nama: "Novel Bumi Seri Tere Liye Fantasy Book",          harga: 89000,  stok: 12, satuan: "pcs" },
  { id: 32, toko_id: 7, nama: "Buku Algoritma Pemrograman Rinaldi Munir",        harga: 95000,  stok: 10, satuan: "pcs" },
  { id: 33, toko_id: 7, nama: "Stabilo Boss Highlighter 4 Warna Set",           harga: 28000,  stok: 50, satuan: "set" },
  { id: 34, toko_id: 7, nama: "Pulpen Pilot G2 Gel Tinta Hitam 0.5mm",          harga: 15000,  stok: 80, satuan: "pcs" },
  { id: 35, toko_id: 7, nama: "Kamus Besar Bahasa Indonesia KBBI Edisi V",       harga: 120000, stok: 8,  satuan: "pcs" },
  { id: 36, toko_id: 8, nama: "Tas Ransel Eiger Cordura 30 Liter Warna Hitam",  harga: 650000, stok: 8,  satuan: "pcs" },
  { id: 37, toko_id: 8, nama: "Tas Daypack Eiger Trail Lite 20 Liter Abu Abu",   harga: 425000, stok: 12, satuan: "pcs" },
  { id: 38, toko_id: 8, nama: "Tas Laptop Eiger 15 Inch Army Green",             harga: 375000, stok: 10, satuan: "pcs" },
  { id: 39, toko_id: 8, nama: "Tas Pinggang Eiger Waist Bag Olive Green",        harga: 185000, stok: 15, satuan: "pcs" },
  { id: 40, toko_id: 8, nama: "Tas Kampus Eiger Student Pack 25 Liter Merah",    harga: 320000, stok: 9,  satuan: "pcs" },
  { id: 41, toko_id: 9, nama: "Tas Selempang Wanita Kulit Coklat Elegan",        harga: 85000,  stok: 15, satuan: "pcs" },
  { id: 42, toko_id: 9, nama: "Tas Tote Bag Kanvas Motif Bunga Pink Pastel",     harga: 65000,  stok: 20, satuan: "pcs" },
  { id: 43, toko_id: 9, nama: "Tas Clutch Mini Pesta Wanita Hitam Satin",        harga: 75000,  stok: 12, satuan: "pcs" },
  { id: 44, toko_id: 9, nama: "Tas Belanja Anyaman Rotan Pantai Natural",        harga: 120000, stok: 10, satuan: "pcs" },
  { id: 45, toko_id: 9, nama: "Tas Sling Bag Casual Pria Biru Navy",             harga: 95000,  stok: 18, satuan: "pcs" },
  { id: 46, toko_id: 10, nama: "Tas Bahu Zara Faux Leather Medium Putih Krem",   harga: 550000, stok: 5,  satuan: "pcs" },
  { id: 47, toko_id: 10, nama: "Tas Tote Zara Striped Canvas Hitam Putih",       harga: 480000, stok: 6,  satuan: "pcs" },
  { id: 48, toko_id: 10, nama: "Tas Mini Crossbody Zara Gold Chain Beige",       harga: 620000, stok: 4,  satuan: "pcs" },
  { id: 49, toko_id: 10, nama: "Tas Handbag Zara Woven Rattan Brown",            harga: 695000, stok: 3,  satuan: "pcs" },
  { id: 50, toko_id: 10, nama: "Tas Shoulder Bag Zara Croc Embossed Camel",      harga: 580000, stok: 5,  satuan: "pcs" },
];

function formatRp(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function buildImageUrl(item, storeName) {
  const prompt = item.nama + " " + (storeName || "") + " product photo clean white background";
  return (
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(prompt) +
    "?width=600&height=450&nologo=true&seed=" +
    item.id
  );
}

function buildItemViewModel(items, tokoList) {
  const map = new Map((tokoList || []).map((t) => [t.id, t]));
  return (items || []).map((item) => {
    const toko = map.get(item.toko_id) || {};
    const kategori = toko.kategori || item.kategori || "Umum";
    const tokoNama = toko.nama || "Toko";
    const backendImg = item.imageUrl || item.image_url || item.gambar || item.foto || null;
    return {
      ...item,
      kategori,
      toko_nama: tokoNama,
      toko_alamat: toko.alamat || "-",
      ikon: IKON[kategori] || IKON.Umum,
      imageUrl: backendImg || buildImageUrl(item, tokoNama),
    };
  });
}

function ProdukGambar({ item, style }) {
  const [uri, setUri] = useState(item.imageUrl);
  useEffect(() => { setUri(item.imageUrl); }, [item.imageUrl]);
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setUri(buildImageUrl({ ...item, id: item.id + 99 }, item.toko_nama))}
    />
  );
}

function AuthScreen({ navigation }) {
  const [tab, setTab] = useState("register");
  const [reg, setReg] = useState({ nama: "", email: "", noHp: "", kampus: "", password: "", peran: "penitip" });
  const [log, setLog] = useState({ email: "", password: "", peran: "penitip", nama: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function setRegField(k, v) { setReg((p) => ({ ...p, [k]: v })); }
  function setLogField(k, v) { setLog((p) => ({ ...p, [k]: v })); }

  function handleRegister() {
    if (!reg.nama || !reg.email || !reg.noHp || !reg.kampus || !reg.password) {
      setMsg({ type: "error", text: "Semua field wajib diisi." });
      return;
    }
    setMsg({ type: "success", text: "Akun berhasil dibuat! Silakan login." });
    setLog({ email: reg.email, password: reg.password, peran: reg.peran, nama: reg.nama });
    setTab("login");
  }

  async function handleLogin() {
    if (!log.email || !log.password) {
      setMsg({ type: "error", text: "Email dan password wajib diisi." });
      return;
    }
    setLoading(true);
    setMsg(null);
    let token = null;
    try {
      const res = await login(log.peran === "penjastip" ? "jastip" : log.email);
      token = res.token;
    } catch (_) {}
    setLoading(false);
    const nama = reg.nama || log.email.split("@")[0];
    navigation.replace("Beranda", {
      peran: log.peran,
      token,
      profil: { nama, email: log.email, kampus: reg.kampus || "Kampus Makassar" },
    });
  }

  return (
    <SafeAreaView style={aS.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <ScrollView contentContainerStyle={aS.scroll} showsVerticalScrollIndicator={false}>
        <View style={aS.hero}>
          <Text style={aS.heroEmoji}>🎓</Text>
          <Text style={aS.heroTitle}>Jastip Kampus</Text>
          <Text style={aS.heroSub}>Titip belanja, hemat waktu, tanpa keluar kampus</Text>
        </View>

        <View style={aS.tabRow}>
          {["register", "login"].map((t) => (
            <TouchableOpacity key={t} style={[aS.tab, tab === t && aS.tabActive]}
              onPress={() => { setTab(t); setMsg(null); }}>
              <Text style={[aS.tabText, tab === t && aS.tabTextActive]}>
                {t === "register" ? "Daftar Akun" : "Masuk"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={aS.card}>
          {tab === "register" ? (
            <>
              <Text style={aS.cardTitle}>Buat Akun Baru</Text>
              {[
                { key: "nama", placeholder: "Nama lengkap", kb: "default" },
                { key: "email", placeholder: "Email", kb: "email-address" },
                { key: "noHp", placeholder: "No. HP", kb: "phone-pad" },
                { key: "kampus", placeholder: "Asal kampus", kb: "default" },
                { key: "password", placeholder: "Password", kb: "default", secure: true },
              ].map((f) => (
                <TextInput
                  key={f.key}
                  style={aS.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={C.textSoft}
                  keyboardType={f.kb}
                  secureTextEntry={!!f.secure}
                  value={reg[f.key]}
                  onChangeText={(v) => setRegField(f.key, v)}
                />
              ))}
              <Text style={aS.roleLabel}>Daftar sebagai:</Text>
              <View style={aS.roleRow}>
                {[
                  { value: "penitip", label: "🛍️ Penitip", desc: "Titipkan belanja" },
                  { value: "penjastip", label: "🛵 Penjastip", desc: "Belanjakan titipan" },
                ].map((r) => (
                  <TouchableOpacity key={r.value}
                    style={[aS.roleCard, reg.peran === r.value && aS.roleCardActive]}
                    onPress={() => setRegField("peran", r.value)}>
                    <Text style={aS.roleEmoji}>{r.label}</Text>
                    <Text style={[aS.roleDesc, reg.peran === r.value && aS.roleDescActive]}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={aS.btn} onPress={handleRegister}>
                <Text style={aS.btnText}>Buat Akun</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={aS.cardTitle}>Masuk ke Aplikasi</Text>
              <TextInput style={aS.input} placeholder="Email" placeholderTextColor={C.textSoft}
                keyboardType="email-address" value={log.email} onChangeText={(v) => setLogField("email", v)} />
              <TextInput style={aS.input} placeholder="Password" placeholderTextColor={C.textSoft}
                secureTextEntry value={log.password} onChangeText={(v) => setLogField("password", v)} />
              <Text style={aS.roleLabel}>Masuk sebagai:</Text>
              <View style={aS.pillRow}>
                {["penitip", "penjastip"].map((p) => (
                  <TouchableOpacity key={p} style={[aS.pill, log.peran === p && aS.pillActive]}
                    onPress={() => setLogField("peran", p)}>
                    <Text style={[aS.pillText, log.peran === p && aS.pillTextActive]}>
                      {p === "penitip" ? "🛍️ Penitip" : "🛵 Penjastip"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[aS.btn, loading && aS.btnDisabled]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={aS.btnText}>Masuk Sekarang</Text>}
              </TouchableOpacity>
            </>
          )}
          {msg && (
            <View style={[aS.msgBox, msg.type === "error" ? aS.msgError : aS.msgSuccess]}>
              <Text style={[aS.msgText, msg.type === "error" ? aS.msgTextError : aS.msgTextSuccess]}>{msg.text}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PenitipDashboard({ profil, navigation, items, tokoList, modeDemo }) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [tokoId, setTokoId] = useState("Semua");

  const daftarKategori = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.kategori))).sort();
    return ["Semua", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    let h = items;
    if (kategori !== "Semua") h = h.filter((i) => i.kategori === kategori);
    if (tokoId !== "Semua") h = h.filter((i) => String(i.toko_id) === tokoId);
    if (cari.trim()) {
      const q = cari.toLowerCase();
      h = h.filter((i) => i.nama.toLowerCase().includes(q) || i.toko_nama.toLowerCase().includes(q));
    }
    return h;
  }, [items, kategori, tokoId, cari]);

  const tokoFilter = [{ id: "Semua", nama: "Semua Toko", kategori: "Umum" }, ...tokoList.slice(0, 9)];

  const header = (
    <View>
      <View style={pS.hero}>
        <View style={pS.heroTop}>
          <View>
            <Text style={pS.heroGreet}>Halo, {profil.nama} 👋</Text>
            <Text style={pS.heroSub}>Mau jastip apa hari ini?</Text>
          </View>
          <View style={pS.heroBadge}><Text style={pS.heroBadgeText}>Penitip</Text></View>
        </View>
        <View style={pS.statsRow}>
          <View style={pS.statBox}>
            <Text style={pS.statNum}>{items.length}</Text>
            <Text style={pS.statLbl}>Produk</Text>
          </View>
          <View style={pS.statDivider} />
          <View style={pS.statBox}>
            <Text style={pS.statNum}>{tokoList.length}</Text>
            <Text style={pS.statLbl}>Toko</Text>
          </View>
          <View style={pS.statDivider} />
          <View style={pS.statBox}>
            <Text style={pS.statNum}>{daftarKategori.length - 1}</Text>
            <Text style={pS.statLbl}>Kategori</Text>
          </View>
        </View>
      </View>

      {modeDemo && (
        <View style={sh.demoBanner}>
          <Text style={sh.demoBannerText}>Mode demo aktif — backend belum terhubung</Text>
        </View>
      )}

      <View style={sh.searchBox}>
        <Text style={sh.searchIcon}>🔍</Text>
        <TextInput style={sh.searchInput} placeholder="Cari produk atau toko..."
          placeholderTextColor={C.textSoft} value={cari} onChangeText={setCari} />
        {cari ? <TouchableOpacity onPress={() => setCari("")}><Text style={sh.searchClear}>✕</Text></TouchableOpacity> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.chipRow}>
        {daftarKategori.map((k) => (
          <TouchableOpacity key={k} style={[sh.chip, kategori === k && sh.chipActive]} onPress={() => setKategori(k)}>
            <Text style={[sh.chipText, kategori === k && sh.chipTextActive]}>
              {k === "Semua" ? "🏬" : (IKON[k] || "🛍️")} {k}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.chipRow}>
        {tokoFilter.map((t) => (
          <TouchableOpacity key={t.id} style={[sh.chip, tokoId === String(t.id) && sh.chipActive]}
            onPress={() => setTokoId(String(t.id))}>
            <Text style={[sh.chipText, tokoId === String(t.id) && sh.chipTextActive]}>
              {t.id === "Semua" ? "🏬" : (IKON[t.kategori] || "🏪")} {t.nama}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={sh.sectionTitle}>{filtered.length} Produk Tersedia</Text>
    </View>
  );

  return (
    <SafeAreaView style={sh.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        ListHeaderComponent={header}
        contentContainerStyle={sh.listPad}
        columnWrapperStyle={sh.gridGap}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={pS.card} activeOpacity={0.92}
            onPress={() => navigation.navigate("Transaksi", { item, peran: "penitip", profil })}>
            <ProdukGambar item={item} style={pS.cardImg} />
            <View style={pS.cardBadgeRow}>
              <View style={pS.cardBadge}><Text style={pS.cardBadgeText}>{item.kategori}</Text></View>
              <View style={pS.stockBadge}><Text style={pS.stockBadgeText}>Stok {item.stok}</Text></View>
            </View>
            <Text style={pS.cardName} numberOfLines={2}>{item.nama}</Text>
            <Text style={pS.cardStore} numberOfLines={1}>📍 {item.toko_nama}</Text>
            <View style={pS.cardPriceRow}>
              <Text style={pS.cardPrice}>{formatRp(item.harga)}</Text>
            </View>
            <View style={pS.cardBtn}>
              <Text style={pS.cardBtnText}>+ Ajukan Titipan</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={sh.empty}>
            <Text style={sh.emptyEmoji}>📦</Text>
            <Text style={sh.emptyText}>Tidak ada produk ditemukan</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PenjastipDashboard({ profil, navigation, items, tokoList, modeDemo }) {
  const [sesiForm, setSesiForm] = useState({ tokoId: String(tokoList[0]?.id || "1"), kapasitas: "5", batasWaktu: "18:00" });
  const [sesiAktif, setSesiAktif] = useState(null);

  function bukaSesi() {
    const kap = Number(sesiForm.kapasitas);
    if (!sesiForm.tokoId || !kap || !sesiForm.batasWaktu) return;
    const toko = tokoList.find((t) => String(t.id) === sesiForm.tokoId);
    setSesiAktif({ tokoNama: toko?.nama || "Toko", kategori: toko?.kategori || "", kapasitas: kap, batasWaktu: sesiForm.batasWaktu });
  }

  return (
    <SafeAreaView style={sh.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView contentContainerStyle={sh.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={jS.hero}>
          <View style={jS.heroTop}>
            <View>
              <Text style={jS.heroGreet}>Hai, {profil.nama} ✨</Text>
              <Text style={jS.heroSub}>Kelola sesi jastipmu hari ini</Text>
            </View>
            <View style={jS.heroBadge}><Text style={jS.heroBadgeText}>Penjastip</Text></View>
          </View>
          <View style={pS.statsRow}>
            <View style={pS.statBox}>
              <Text style={pS.statNum}>{tokoList.length}</Text>
              <Text style={[pS.statLbl, { color: "#90CAF9" }]}>Toko</Text>
            </View>
            <View style={pS.statDivider} />
            <View style={pS.statBox}>
              <Text style={pS.statNum}>{items.length}</Text>
              <Text style={[pS.statLbl, { color: "#90CAF9" }]}>Barang</Text>
            </View>
            <View style={pS.statDivider} />
            <View style={pS.statBox}>
              <Text style={pS.statNum}>{sesiAktif ? "ON" : "OFF"}</Text>
              <Text style={[pS.statLbl, { color: "#90CAF9" }]}>Sesi</Text>
            </View>
          </View>
        </View>

        {modeDemo && (
          <View style={sh.demoBanner}>
            <Text style={sh.demoBannerText}>Mode demo aktif — backend belum terhubung</Text>
          </View>
        )}

        <View style={jS.card}>
          <Text style={jS.cardTitle}>🛵 Buka Sesi Jastip</Text>
          <Text style={jS.label}>Pilih Toko</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.chipRow}>
            {tokoList.map((t) => (
              <TouchableOpacity key={t.id}
                style={[sh.chip, sesiForm.tokoId === String(t.id) && sh.chipActive]}
                onPress={() => setSesiForm((p) => ({ ...p, tokoId: String(t.id) }))}>
                <Text style={[sh.chipText, sesiForm.tokoId === String(t.id) && sh.chipTextActive]}>
                  {IKON[t.kategori] || "🏪"} {t.nama}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={jS.inlineRow}>
            <View style={{ flex: 1 }}>
              <Text style={jS.label}>Kapasitas</Text>
              <TextInput style={jS.input} keyboardType="numeric" value={sesiForm.kapasitas}
                onChangeText={(v) => setSesiForm((p) => ({ ...p, kapasitas: v }))} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={jS.label}>Batas Waktu</Text>
              <TextInput style={jS.input} value={sesiForm.batasWaktu}
                onChangeText={(v) => setSesiForm((p) => ({ ...p, batasWaktu: v }))} />
            </View>
          </View>
          <TouchableOpacity style={jS.btn} onPress={bukaSesi}>
            <Text style={jS.btnText}>Buka Sesi Jastip</Text>
          </TouchableOpacity>
        </View>

        {sesiAktif && (
          <View style={jS.activeBox}>
            <Text style={jS.activeTitle}>Sesi Aktif</Text>
            <Text style={jS.activeSub}>{sesiAktif.tokoNama} · Kapasitas {sesiAktif.kapasitas} · Tutup {sesiAktif.batasWaktu}</Text>
          </View>
        )}

        <Text style={sh.sectionTitle}>Titipan Masuk</Text>
        {items.slice(0, 5).map((item) => (
          <View key={item.id} style={jS.taskCard}>
            <ProdukGambar item={item} style={jS.taskImg} />
            <View style={{ flex: 1 }}>
              <Text style={jS.taskName} numberOfLines={2}>{item.nama}</Text>
              <Text style={jS.taskStore}>{item.toko_nama}</Text>
              <Text style={jS.taskPrice}>{formatRp(item.harga)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function BerandaScreen({ route, navigation }) {
  const peran = route.params?.peran || "penitip";
  const profil = route.params?.profil || { nama: "Pengguna", email: "", kampus: "" };
  const [items, setItems] = useState([]);
  const [tokoList, setTokoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeDemo, setModeDemo] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ir, tr] = await Promise.all([getDaftarBarang(), getDaftarToko()]);
        const barang = Array.isArray(ir) ? ir : ir.items || [];
        const toko = Array.isArray(tr) ? tr : tr.toko || [];
        setItems(buildItemViewModel(barang, toko));
        setTokoList(toko);
        setModeDemo(false);
      } catch (_) {
        setItems(buildItemViewModel(DEMO_ITEMS, DEMO_TOKO));
        setTokoList(DEMO_TOKO);
        setModeDemo(true);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={sh.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={sh.loadingText}>Memuat katalog...</Text>
      </SafeAreaView>
    );
  }

  if (peran === "penjastip") {
    return <PenjastipDashboard profil={profil} navigation={navigation} items={items} tokoList={tokoList} modeDemo={modeDemo} />;
  }
  return <PenitipDashboard profil={profil} navigation={navigation} items={items} tokoList={tokoList} modeDemo={modeDemo} />;
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="Beranda" component={BerandaScreen} />
        <Stack.Screen name="Transaksi" component={TransaksiScreen} />
        <Stack.Screen name="Sukses" component={SuksesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const sh = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  scrollPad: { padding: 16, paddingBottom: 40 },
  listPad: { paddingHorizontal: 12, paddingBottom: 40 },
  gridGap: { gap: 10, paddingHorizontal: 4 },
  loadingText: { color: C.textSoft, marginTop: 12, fontSize: 14 },
  demoBanner: {
    marginHorizontal: 16, marginBottom: 10, padding: 10,
    backgroundColor: C.warningLight, borderRadius: 12, borderWidth: 1, borderColor: "#FFB74D",
  },
  demoBannerText: { color: C.warning, fontWeight: "700", fontSize: 13 },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.surface,
    borderRadius: 14, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.border, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: C.text, fontSize: 14 },
  searchClear: { color: C.textSoft, fontSize: 16, padding: 4 },
  chipRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.primary, borderColor: C.primaryDark },
  chipText: { color: C.textMid, fontWeight: "600", fontSize: 12 },
  chipTextActive: { color: "#fff" },
  sectionTitle: { color: C.text, fontWeight: "800", fontSize: 16, marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  empty: { alignItems: "center", padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: C.textSoft, fontSize: 15 },
});

const aS = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.primary },
  scroll: { paddingBottom: 40 },
  hero: { backgroundColor: C.primary, alignItems: "center", paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { color: "#fff", fontSize: 34, fontWeight: "900", letterSpacing: 0.5 },
  heroSub: { color: "#90CAF9", marginTop: 8, fontSize: 14, textAlign: "center", lineHeight: 20 },
  tabRow: { flexDirection: "row", backgroundColor: C.primaryDark, marginHorizontal: 16, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#fff" },
  tabText: { color: "#90CAF9", fontWeight: "700", fontSize: 14 },
  tabTextActive: { color: C.primary },
  card: { backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 20 },
  cardTitle: { color: C.primary, fontWeight: "800", fontSize: 20, marginBottom: 16 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, color: C.text, fontSize: 14, marginBottom: 12,
  },
  roleLabel: { color: C.textMid, fontWeight: "700", marginBottom: 10, fontSize: 14 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  roleCard: { flex: 1, borderWidth: 2, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: "center" },
  roleCardActive: { borderColor: C.primary, backgroundColor: C.accentLight },
  roleEmoji: { fontSize: 20, marginBottom: 4 },
  roleDesc: { color: C.textSoft, fontSize: 12, textAlign: "center" },
  roleDescActive: { color: C.primary, fontWeight: "700" },
  pillRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  pill: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: "center" },
  pillActive: { backgroundColor: C.primary, borderColor: C.primaryDark },
  pillText: { color: C.textMid, fontWeight: "700", fontSize: 13 },
  pillTextActive: { color: "#fff" },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  msgBox: { marginTop: 14, borderRadius: 12, padding: 12 },
  msgError: { backgroundColor: C.dangerLight },
  msgSuccess: { backgroundColor: C.successLight },
  msgText: { fontWeight: "700", fontSize: 13 },
  msgTextError: { color: C.danger },
  msgTextSuccess: { color: C.success },
});

const pS = StyleSheet.create({
  hero: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, marginBottom: 14 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  heroGreet: { color: "#fff", fontSize: 22, fontWeight: "800" },
  heroSub: { color: "#90CAF9", fontSize: 13, marginTop: 4 },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12 },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 22, fontWeight: "900" },
  statLbl: { color: "#90CAF9", fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: 8 },
  card: {
    backgroundColor: C.surface, borderRadius: 18, overflow: "hidden",
    borderWidth: 1, borderColor: C.border, elevation: 3,
  },
  cardImg: { width: "100%", height: 120, backgroundColor: C.bgSoft },
  cardBadgeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 8, marginBottom: 4 },
  cardBadge: { backgroundColor: C.accentLight, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  cardBadgeText: { color: C.primary, fontSize: 9, fontWeight: "700" },
  stockBadge: { backgroundColor: C.successLight, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  stockBadgeText: { color: C.success, fontSize: 9, fontWeight: "700" },
  cardName: { color: C.text, fontWeight: "700", fontSize: 12, paddingHorizontal: 8, marginBottom: 4, lineHeight: 17 },
  cardStore: { color: C.textSoft, fontSize: 10, paddingHorizontal: 8, marginBottom: 6 },
  cardPriceRow: { paddingHorizontal: 8, marginBottom: 8 },
  cardPrice: { color: C.primary, fontWeight: "800", fontSize: 14 },
  cardBtn: { backgroundColor: C.primary, margin: 8, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  cardBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },
});

const jS = StyleSheet.create({
  hero: { backgroundColor: C.primaryDark, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, marginBottom: 16 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  heroGreet: { color: "#fff", fontSize: 22, fontWeight: "800" },
  heroSub: { color: "#90CAF9", fontSize: 13, marginTop: 4 },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  cardTitle: { color: C.primary, fontWeight: "800", fontSize: 18, marginBottom: 14 },
  label: { color: C.textMid, fontWeight: "700", fontSize: 13, marginBottom: 8 },
  inlineRow: { flexDirection: "row", marginVertical: 12 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: C.text, fontSize: 14 },
  btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  activeBox: { backgroundColor: C.successLight, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#A5D6A7" },
  activeTitle: { color: C.success, fontWeight: "800", fontSize: 16, marginBottom: 4 },
  activeSub: { color: C.success, fontSize: 13 },
  taskCard: { flexDirection: "row", backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border, gap: 12 },
  taskImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: C.bgSoft },
  taskName: { color: C.text, fontWeight: "700", fontSize: 13, marginBottom: 4, lineHeight: 18 },
  taskStore: { color: C.textSoft, fontSize: 11, marginBottom: 4 },
  taskPrice: { color: C.primary, fontWeight: "800", fontSize: 14 },
});
