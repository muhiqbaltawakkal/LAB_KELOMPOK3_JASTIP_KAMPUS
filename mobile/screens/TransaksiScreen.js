import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { buatTitipan, login } from "../api/endpoints";

const C = {
  bg: "#F0F4FF",
  bgSoft: "#E8EFFE",
  surface: "#FFFFFF",
  primary: "#1565C0",
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
};

function formatRp(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export default function TransaksiScreen({ route, navigation }) {
  const { item, peran, profil } = route.params;
  const [qty, setQty] = useState("1");
  const [varian, setVarian] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [galat, setGalat] = useState(null);

  // Langkah Q: null = belum pilih, "tawar" = tawar harga, "langsung" = langsung pesan
  const [modePesan, setModePesan] = useState(null);
  const [hargaTawar, setHargaTawar] = useState("");
  const [alasanTawar, setAlasanTawar] = useState("");

  const jumlahQty = useMemo(() => Math.max(0, Number(qty || 0)), [qty]);
  const subtotal = useMemo(() => item.harga * jumlahQty, [item.harga, jumlahQty]);
  const totalTawar = useMemo(() => Number(hargaTawar || 0) * jumlahQty, [hargaTawar, jumlahQty]);

  async function kirimTitipan() {
    if (loading) return;
    if (jumlahQty < 1) { setGalat("Jumlah titipan minimal 1."); return; }
    if (jumlahQty > item.stok) { setGalat("Stok tidak mencukupi."); return; }
    if (modePesan === "tawar" && Number(hargaTawar || 0) < 1000) {
      setGalat("Masukkan harga tawar yang valid (minimal Rp 1.000).");
      return;
    }
    setLoading(true);
    setGalat(null);
    try {
      const auth = await login(profil?.email || "mhs");
      const order = await buatTitipan({ itemId: item.id, qty: jumlahQty, token: auth.token });
      navigation.replace("Sukses", {
        order, item, peran, profil, varian, catatan,
        modeTawar: modePesan === "tawar",
        hargaTawar: modePesan === "tawar" ? Number(hargaTawar) : null,
        alasanTawar: modePesan === "tawar" ? alasanTawar : null,
      });
    } catch (e) {
      if (e.status === 409) setGalat("Stok habis. Pilih barang lain.");
      else if (e.status === 401) setGalat("Sesi tidak valid. Kembali ke login.");
      else if (!e.status) setGalat("Koneksi internet bermasalah.");
      else setGalat("Titipan gagal (kode: " + e.status + ").");
    } finally {
      setLoading(false);
    }
  }

  const showHargaFinal = modePesan === "tawar" && Number(hargaTawar) > 0 ? totalTawar : subtotal;

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detail Titipan</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Kartu Produk */}
        <View style={s.productCard}>
          <Image source={{ uri: item.imageUrl }} style={s.productImg} resizeMode="cover" />
          <View style={s.productInfo}>
            <View style={s.prodBadgeRow}>
              <View style={s.prodBadge}><Text style={s.prodBadgeText}>{item.kategori}</Text></View>
              <View style={s.stockBadge}><Text style={s.stockBadgeText}>Stok: {item.stok}</Text></View>
            </View>
            <Text style={s.productName}>{item.nama}</Text>
            <Text style={s.productStore}>📍 {item.toko_nama}</Text>
            <Text style={s.productPrice}>{formatRp(item.harga)} / {item.satuan}</Text>
          </View>
        </View>

        {/* Form Detail (Langkah N) */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Detail Titipan</Text>

          <Text style={s.label}>Jumlah</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn}
              onPress={() => setQty(String(Math.max(1, jumlahQty - 1)))}>
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput style={s.qtyInput} value={qty} onChangeText={setQty}
              keyboardType="numeric" textAlign="center" />
            <TouchableOpacity style={s.qtyBtn}
              onPress={() => setQty(String(Math.min(item.stok, jumlahQty + 1)))}>
              <Text style={s.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>Varian / Ukuran (opsional)</Text>
          <TextInput style={s.input} placeholder="cth: Large, Warna Hitam, Ukuran L"
            placeholderTextColor={C.textSoft} value={varian} onChangeText={setVarian} />

          <Text style={s.label}>Catatan (opsional)</Text>
          <TextInput style={[s.input, s.textArea]} placeholder="cth: tanpa es, minta struk, kemasan rapih"
            placeholderTextColor={C.textSoft} multiline numberOfLines={3}
            value={catatan} onChangeText={setCatatan} />
        </View>

        {/* Langkah Q: Tawar atau Langsung */}
        <View style={s.tawarCard}>
          <View style={s.tawarHeader}>
            <View style={s.stepBadge}><Text style={s.stepBadgeText}>Langkah Q</Text></View>
            <Text style={s.tawarTitle}>Ingin tawar harga / jasa titip?</Text>
          </View>
          <Text style={s.tawarSub}>
            Pilih "Tawar Harga" untuk mengajukan penawaran ke penjastip, atau "Langsung" untuk memakai harga acuan.
          </Text>
          <View style={s.tawarChoices}>
            <TouchableOpacity
              style={[s.choiceBtn, modePesan === "tawar" && s.choiceBtnActive]}
              onPress={() => setModePesan("tawar")}>
              <Text style={[s.choiceBtnText, modePesan === "tawar" && s.choiceBtnTextActive]}>💬 Tawar Harga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.choiceBtn, modePesan === "langsung" && s.choiceBtnActive]}
              onPress={() => setModePesan("langsung")}>
              <Text style={[s.choiceBtnText, modePesan === "langsung" && s.choiceBtnTextActive]}>⚡ Langsung Pesan</Text>
            </TouchableOpacity>
          </View>

          {/* Langkah R: Form Tawar */}
          {modePesan === "tawar" && (
            <View style={s.tawarFormBox}>
              <View style={s.tawarFormHeader}>
                <View style={s.stepBadgeBlue}><Text style={s.stepBadgeText}>Langkah R</Text></View>
                <Text style={s.tawarFormTitle}>Ajukan Tawaran</Text>
              </View>
              <Text style={s.tawarHint}>
                Harga acuan: <Text style={s.tawarHintBold}>{formatRp(item.harga)}</Text> / {item.satuan}
              </Text>
              <Text style={s.label}>Harga tawar per {item.satuan}</Text>
              <TextInput style={s.input}
                placeholder={"cth: " + Math.round(item.harga * 0.9).toLocaleString("id-ID")}
                placeholderTextColor={C.textSoft} keyboardType="numeric"
                value={hargaTawar} onChangeText={setHargaTawar} />
              <Text style={s.label}>Alasan penawaran (opsional)</Text>
              <TextInput style={[s.input, s.textArea]}
                placeholder="cth: mahasiswa, beli rutin, minta diskon jasa titip"
                placeholderTextColor={C.textSoft} multiline numberOfLines={3}
                value={alasanTawar} onChangeText={setAlasanTawar} />
              {Number(hargaTawar) > 0 && (
                <View style={s.tawarTotalBox}>
                  <Text style={s.tawarTotalLabel}>Total tawar ({jumlahQty} {item.satuan})</Text>
                  <Text style={s.tawarTotalValue}>{formatRp(totalTawar)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Langkah U: Ringkasan Pembayaran */}
        <View style={s.summaryCard}>
          <Text style={s.cardTitle}>Ringkasan Pembayaran</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Harga satuan</Text>
            <Text style={s.summaryValue}>
              {modePesan === "tawar" && Number(hargaTawar) > 0 ? formatRp(Number(hargaTawar)) : formatRp(item.harga)}
            </Text>
          </View>
          {modePesan === "tawar" && Number(hargaTawar) > 0 && (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Harga acuan</Text>
              <Text style={[s.summaryValue, s.strikethrough]}>{formatRp(item.harga)}</Text>
            </View>
          )}
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Jumlah</Text>
            <Text style={s.summaryValue}>x {jumlahQty} {item.satuan}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Biaya jasa titip</Text>
            <Text style={s.summaryNote}>
              {modePesan === "tawar" ? "Termasuk dalam tawaran" : "Dikonfirmasi penjastip"}
            </Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Estimasi Total</Text>
            <Text style={s.totalValue}>{formatRp(showHargaFinal)}</Text>
          </View>
        </View>

        {galat && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ {galat}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.submitBtn, (!modePesan || loading) && s.submitBtnDisabled]}
          onPress={kirimTitipan}
          disabled={!modePesan || loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitBtnText}>
                {modePesan === "tawar" ? "💬 Kirim Titipan + Tawaran" : "⚡ Kirim Titipan Langsung"}
              </Text>}
        </TouchableOpacity>

        {!modePesan && (
          <Text style={s.footerNote}>Pilih dulu mode pengiriman di atas sebelum mengirim titipan.</Text>
        )}
        <Text style={s.footerNote}>
          Setelah dikirim, order-service akan menyimpan dan tracking dimulai.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F4FF" },
  header: {
    backgroundColor: "#1565C0", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  scroll: { padding: 16, paddingBottom: 40 },
  productCard: {
    backgroundColor: "#fff", borderRadius: 18, overflow: "hidden",
    borderWidth: 1, borderColor: "#BBDEFB", marginBottom: 14, elevation: 3,
  },
  productImg: { width: "100%", height: 200, backgroundColor: "#E8EFFE" },
  productInfo: { padding: 16 },
  prodBadgeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  prodBadge: { backgroundColor: "#E3F2FD", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  prodBadgeText: { color: "#1565C0", fontSize: 11, fontWeight: "700" },
  stockBadge: { backgroundColor: "#E8F5E9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  stockBadgeText: { color: "#2E7D32", fontSize: 11, fontWeight: "700" },
  productName: { color: "#1A237E", fontSize: 18, fontWeight: "800", marginBottom: 6, lineHeight: 24 },
  productStore: { color: "#607D8B", fontSize: 13, marginBottom: 8 },
  productPrice: { color: "#1565C0", fontSize: 22, fontWeight: "900" },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#BBDEFB",
  },
  cardTitle: { color: "#1A237E", fontSize: 17, fontWeight: "800", marginBottom: 14 },
  label: { color: "#607D8B", fontWeight: "700", fontSize: 13, marginBottom: 8, marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  qtyBtn: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#E3F2FD",
    borderWidth: 1, borderColor: "#BBDEFB", alignItems: "center", justifyContent: "center",
  },
  qtyBtnText: { color: "#1565C0", fontSize: 24, fontWeight: "700" },
  qtyInput: {
    flex: 1, backgroundColor: "#F0F4FF", borderWidth: 1, borderColor: "#BBDEFB",
    borderRadius: 14, paddingVertical: 12, color: "#1A237E", fontSize: 18, fontWeight: "700",
  },
  input: {
    backgroundColor: "#F0F4FF", borderWidth: 1, borderColor: "#BBDEFB",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: "#1A237E", fontSize: 14, marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  tawarCard: {
    backgroundColor: "#FFF8E1", borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#FFE082",
  },
  tawarHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  stepBadge: { backgroundColor: "#E65100", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  stepBadgeBlue: { backgroundColor: "#1565C0", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  stepBadgeText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  tawarTitle: { color: "#1A237E", fontSize: 15, fontWeight: "800" },
  tawarSub: { color: "#607D8B", fontSize: 13, lineHeight: 20, marginBottom: 14 },
  tawarChoices: { flexDirection: "row", gap: 10 },
  choiceBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
    borderColor: "#FFE082", alignItems: "center", backgroundColor: "#fff",
  },
  choiceBtnActive: { backgroundColor: "#1565C0", borderColor: "#0D47A1" },
  choiceBtnText: { color: "#37474F", fontWeight: "700", fontSize: 13 },
  choiceBtnTextActive: { color: "#fff" },
  tawarFormBox: {
    marginTop: 14, backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#BBDEFB",
  },
  tawarFormHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tawarFormTitle: { color: "#1A237E", fontSize: 14, fontWeight: "800" },
  tawarHint: { color: "#607D8B", fontSize: 13, marginBottom: 12 },
  tawarHintBold: { color: "#1565C0", fontWeight: "800" },
  tawarTotalBox: {
    backgroundColor: "#E3F2FD", borderRadius: 12, padding: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4,
  },
  tawarTotalLabel: { color: "#607D8B", fontSize: 13 },
  tawarTotalValue: { color: "#1565C0", fontWeight: "800", fontSize: 16 },
  summaryCard: {
    backgroundColor: "#E3F2FD", borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#90CAF9",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { color: "#607D8B", fontSize: 14 },
  summaryValue: { color: "#1A237E", fontWeight: "700" },
  strikethrough: { textDecorationLine: "line-through", color: "#90A4AE" },
  summaryNote: { color: "#0D47A1", fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#90CAF9", marginVertical: 8 },
  totalLabel: { color: "#1A237E", fontSize: 16, fontWeight: "800" },
  totalValue: { color: "#1565C0", fontSize: 22, fontWeight: "900" },
  errorBox: {
    backgroundColor: "#FFEBEE", borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: "#EF9A9A",
  },
  errorText: { color: "#C62828", fontWeight: "700", fontSize: 13, lineHeight: 20 },
  submitBtn: { backgroundColor: "#1565C0", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  footerNote: { color: "#90A4AE", textAlign: "center", fontSize: 12, lineHeight: 18, marginBottom: 6 },
});
