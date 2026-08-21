import { useMemo, useState } from "react";
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

const C = {
  bg: "#FFF8FC",
  bgSoft: "#FFF1F8",
  surface: "#FFFFFF",
  border: "#FFD8EC",
  pink: "#FF77B7",
  purple: "#8B80F9",
  peach: "#FFBD9D",
  mint: "#76E4CF",
  success: "#55C87A",
  danger: "#FF7A8A",
  text: "#5C3550",
  textSoft: "#8F6880",
};

function formatRupiah(angka = 0) {
  return `Rp ${Number(angka || 0).toLocaleString("id-ID")}`;
}

export default function TransaksiScreen({ route, navigation }) {
  const { item, peran, profil } = route.params;
  const [qty, setQty] = useState("1");
  const [varian, setVarian] = useState("");
  const [catatan, setCatatan] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);

  const jumlahQty = Number(qty || 0);
  const subtotal = useMemo(() => (item.harga ?? 0) * (jumlahQty || 0), [item.harga, jumlahQty]);

  async function pesan() {
    if (memuat) return;
    if (!jumlahQty || jumlahQty < 1) {
      setGalat("Jumlah titipan minimal 1.");
      return;
    }
    if (jumlahQty > item.stok) {
      setGalat(`Stok tersedia hanya ${item.stok} ${item.satuan}.`);
      return;
    }

    setMemuat(true);
    setGalat(null);

    try {
      const authData = await login(profil?.email || "mhs");
      const order = await buatTitipan({
        itemId: item.id,
        qty: jumlahQty,
        token: authData.token,
      });

      navigation.replace("Sukses", {
        order,
        item,
        peran,
        profil,
        varian,
        catatan,
      });
    } catch (e) {
      if (e.status === 409) setGalat("Stok habis saat proses titipan. Silakan pilih barang lain.");
      else if (e.status === 429) setGalat("Server sedang sibuk. Coba lagi sebentar.");
      else if (e.status === 401) setGalat("Sesi login tidak valid. Kembali ke halaman login.");
      else if (e.status === 503) setGalat("Layanan katalog belum tersedia sementara.");
      else if (!e.status) setGalat("Koneksi internet bermasalah. Periksa lalu ulangi.");
      else setGalat(`Titipan gagal diproses (${e.status}).`);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>Flow Penitip</Text>
          </View>
          <Text style={styles.heroTitle}>Lengkapi detail titipanmu</Text>
          <Text style={styles.heroSubtitle}>
            Isi jumlah, varian, dan catatan agar penjastip bisa memahami kebutuhanmu dengan jelas.
          </Text>
        </View>

        <View style={styles.productCard}>
          <View style={styles.productTop}>
            <Text style={styles.productEmoji}>{item.kategoriIkon || "🎁"}</Text>
            <View style={styles.stockPill}>
              <Text style={styles.stockPillText}>Stok {item.stok}</Text>
            </View>
          </View>
          <Text style={styles.productStore}>{item.toko_nama || "Toko pilihan"}</Text>
          <Text style={styles.productName}>{item.nama}</Text>
          <Text style={styles.productMeta}>
            {item.kategori || "Umum"} • {item.satuan || "pcs"}
          </Text>
          <Text style={styles.productPrice}>{formatRupiah(item.harga)}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Detail barang</Text>

          <Text style={styles.inputLabel}>Jumlah</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQty(String(Math.max(1, jumlahQty - 1 || 1)))}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              editable={!memuat}
            />
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQty(String(Math.min(item.stok, (jumlahQty || 0) + 1)))}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Varian / ukuran</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Matcha, ukuran large, warna pink"
            placeholderTextColor={C.textSoft}
            value={varian}
            onChangeText={setVarian}
          />

          <Text style={styles.inputLabel}>Catatan tambahan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Contoh: tanpa es, kemasan gift, minta struk pembelian"
            placeholderTextColor={C.textSoft}
            multiline
            numberOfLines={4}
            value={catatan}
            onChangeText={setCatatan}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Ringkasan pembayaran</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Barang x {jumlahQty || 0}</Text>
            <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya jasa</Text>
            <Text style={styles.summaryHint}>Dikonfirmasi penjastip</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Estimasi subtotal</Text>
            <Text style={styles.totalValue}>{formatRupiah(subtotal)}</Text>
          </View>
        </View>

        {galat ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{galat}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, memuat && styles.buttonDisabled]}
          onPress={pesan}
          disabled={memuat}
        >
          {memuat ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Kirim Titipan</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Setelah terkirim, order-service akan menyimpan permintaan dan statusnya akan masuk ke tracking.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 18, paddingBottom: 32 },
  heroCard: {
    backgroundColor: "#FFF0F8",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
  },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  rolePillText: { color: C.pink, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: C.text, fontSize: 26, fontWeight: "800" },
  heroSubtitle: { color: C.textSoft, marginTop: 8, lineHeight: 22 },
  productCard: {
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  productTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  productEmoji: {
    fontSize: 26,
    backgroundColor: "#FFF4CC",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockPill: {
    backgroundColor: "#F1FFF8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stockPillText: { color: C.success, fontWeight: "700", fontSize: 12 },
  productStore: { color: C.pink, fontWeight: "700", fontSize: 13 },
  productName: { color: C.text, fontSize: 20, fontWeight: "800", marginTop: 6, lineHeight: 28 },
  productMeta: { color: C.textSoft, marginTop: 6, lineHeight: 20 },
  productPrice: { color: C.purple, fontSize: 22, fontWeight: "800", marginTop: 14 },
  formCard: {
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionLabel: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  inputLabel: { color: C.textSoft, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  qtyButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF0F8",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { color: C.pink, fontSize: 26, fontWeight: "500" },
  qtyInput: {
    flex: 1,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
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
  textArea: { minHeight: 96, textAlignVertical: "top" },
  summaryCard: {
    marginTop: 16,
    backgroundColor: "#FFFDF4",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FFE8B5",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { color: C.textSoft, fontSize: 14 },
  summaryValue: { color: C.text, fontWeight: "700" },
  summaryHint: { color: "#C58A00", fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#F6E2AB", marginVertical: 8 },
  totalLabel: { color: C.text, fontSize: 15, fontWeight: "800" },
  totalValue: { color: C.purple, fontSize: 20, fontWeight: "800" },
  errorBox: {
    marginTop: 16,
    backgroundColor: "#FFF2F4",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFC7D0",
  },
  errorText: { color: C.danger, fontWeight: "700", lineHeight: 20 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: C.pink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  footerNote: { color: C.textSoft, textAlign: "center", marginTop: 14, lineHeight: 20, fontSize: 12 },
});
