// screens/TransaksiScreen.js — form buat titipan, tampilan profesional
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { buatTitipan, login } from "../api/endpoints";

const C = { bg:"#0B0F1A", card:"#141925", cardBorder:"#1E2736", accent:"#6C63FF", teal:"#00C9B1", warn:"#FF6B6B", text:"#F0F4FF", muted:"#8892A4", badge:"#1A2035" };

const KATEGORI_IKON = { "Minuman Kekinian":"🧋","Makanan Khas":"🍜","Buku & Alat Tulis":"📚","Elektronik":"📱","Minimarket":"🛒","Kuliner Khas":"🍌","Kafe & Kopi":"☕","Fast Food":"🍔","Lifestyle & Aksesoris":"🎀","Apotek & Kesehatan":"💊" };

export default function TransaksiScreen({ route, navigation }) {
  const { item, peran } = route.params;
  const [qty, setQty] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);

  const subtotal = (item.harga ?? 0) * (parseInt(qty, 10) || 0);

  async function pesan() {
    if (memuat) return;
    const jumlahQty = parseInt(qty, 10);
    if (!jumlahQty || jumlahQty < 1) { setGalat("Jumlah minimal 1"); return; }
    if (jumlahQty > item.stok) { setGalat(`Stok hanya ${item.stok} ${item.satuan}`); return; }
    setMemuat(true); setGalat(null);
    try {
      const authData = await login("mhs");
      const order = await buatTitipan({ itemId: item.id, qty: jumlahQty, token: authData.token });
      navigation.replace("Sukses", { order, item });
    } catch (e) {
      if (e.status === 409) setGalat("Stok habis saat dipesan. Pilih barang lain.");
      else if (e.status === 429) setGalat("Server sibuk. Coba lagi sesaat.");
      else if (e.status === 401) setGalat("Sesi habis. Restart aplikasi.");
      else if (e.status === 503) setGalat("Layanan tidak tersedia sementara.");
      else if (!e.status) setGalat("Periksa koneksi internet kamu.");
      else setGalat(`Gagal (${e.status}). Coba lagi.`);
    } finally { setMemuat(false); }
  }

  return (
    <SafeAreaView style={ts.wadah}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={ts.scroll} showsVerticalScrollIndicator={false}>

        {/* Info Barang */}
        <View style={ts.kartuBarang}>
          <View style={ts.kartuHeader}>
            <View style={ts.ikonWrap}>
              <Text style={ts.ikon}>{KATEGORI_IKON[item.kategori] ?? "📦"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ts.kategoriLabel}>{item.kategori ?? "Umum"}</Text>
              <Text style={ts.namaBarang}>{item.nama}</Text>
            </View>
          </View>
          <View style={ts.divider} />
          <View style={ts.baris}>
            <Text style={ts.labelKecil}>Harga Satuan</Text>
            <Text style={ts.hargaBesar}>Rp {(item.harga ?? 0).toLocaleString("id-ID")}</Text>
          </View>
          <View style={ts.baris}>
            <Text style={ts.labelKecil}>Stok Tersedia</Text>
            <View style={[ts.stokBadge, item.stok < 10 && ts.stokMenipisBadge]}>
              <Text style={ts.stokTeks}>✓ {item.stok} {item.satuan}</Text>
            </View>
          </View>
        </View>

        {/* Form Jumlah */}
        <View style={ts.seksi}>
          <Text style={ts.labelSeksi}>Detail Titipan</Text>

          <Text style={ts.label}>Jumlah</Text>
          <View style={ts.qtyRow}>
            <TouchableOpacity style={ts.qtyBtn} onPress={() => setQty(v => String(Math.max(1, parseInt(v||1)-1)))}>
              <Text style={ts.qtyBtnTeks}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={ts.qtyInput}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              textAlign="center"
              editable={!memuat}
            />
            <TouchableOpacity style={ts.qtyBtn} onPress={() => setQty(v => String(Math.min(item.stok, parseInt(v||1)+1)))}>
              <Text style={ts.qtyBtnTeks}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={ts.label}>Catatan (opsional)</Text>
          <TextInput
            style={[ts.input, ts.inputArea]}
            value={catatan}
            onChangeText={setCatatan}
            placeholder="Contoh: varian rasa, ukuran, instruksi khusus..."
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={3}
            editable={!memuat}
          />
        </View>

        {/* Ringkasan Harga */}
        <View style={ts.ringkasan}>
          <View style={ts.baris}>
            <Text style={ts.labelKecil}>{item.nama.substring(0,25)}{item.nama.length>25?"...":""} × {parseInt(qty)||0}</Text>
            <Text style={ts.ringkasanHarga}>Rp {subtotal.toLocaleString("id-ID")}</Text>
          </View>
          <View style={ts.divider} />
          <View style={ts.baris}>
            <Text style={{ color: C.text, fontWeight: "700" }}>Total Bayar</Text>
            <Text style={ts.totalHarga}>Rp {subtotal.toLocaleString("id-ID")}</Text>
          </View>
        </View>

        {galat ? (
          <View style={ts.galatBox}>
            <Text style={ts.galatTeks}>⚠️ {galat}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={[ts.tombol, memuat && ts.tombolMati]} onPress={pesan} disabled={memuat}>
          {memuat
            ? <ActivityIndicator color="#fff" />
            : <Text style={ts.tombolTeks}>🛍️  Buat Titipan Sekarang</Text>
          }
        </TouchableOpacity>

        <Text style={ts.disclaimer}>Dengan menekan tombol di atas, kamu menyetujui ketentuan layanan Jastip Kampus.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const ts = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  kartuBarang: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder },
  kartuHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  ikonWrap: { backgroundColor: C.badge, borderRadius: 12, width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  ikon: { fontSize: 26 },
  kategoriLabel: { color: C.accent, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  namaBarang: { color: C.text, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  divider: { height: 1, backgroundColor: C.cardBorder, marginVertical: 12 },
  baris: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  labelKecil: { color: C.muted, fontSize: 13 },
  hargaBesar: { color: C.teal, fontSize: 18, fontWeight: "800" },
  stokBadge: { backgroundColor: "#0F2820", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stokMenipisBadge: { backgroundColor: "#2D1515" },
  stokTeks: { color: "#4ade80", fontSize: 12, fontWeight: "600" },
  seksi: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder },
  labelSeksi: { color: C.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
  label: { color: C.muted, fontSize: 13, marginBottom: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  qtyBtn: { backgroundColor: C.badge, width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.cardBorder },
  qtyBtnTeks: { color: C.text, fontSize: 22, fontWeight: "300", lineHeight: 26 },
  qtyInput: { flex: 1, backgroundColor: C.badge, color: C.text, fontSize: 18, fontWeight: "700", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: C.accent },
  input: { backgroundColor: C.badge, color: C.text, padding: 12, borderRadius: 12, fontSize: 14, borderWidth: 1, borderColor: C.cardBorder },
  inputArea: { height: 80, textAlignVertical: "top" },
  ringkasan: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder },
  ringkasanHarga: { color: C.text, fontSize: 14, fontWeight: "600" },
  totalHarga: { color: C.teal, fontSize: 18, fontWeight: "800" },
  galatBox: { backgroundColor: "#2D1515", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.warn },
  galatTeks: { color: C.warn, fontSize: 14 },
  tombol: { backgroundColor: C.accent, padding: 18, borderRadius: 14, alignItems: "center" },
  tombolMati: { opacity: 0.5 },
  tombolTeks: { color: "#fff", fontWeight: "800", fontSize: 16 },
  disclaimer: { color: C.muted, fontSize: 11, textAlign: "center", marginTop: 12 },
});

