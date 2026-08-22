import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { buatTitipan, login } from "../api/endpoints";
import { AppButton } from "../components/ui";
import { colors as C, radius, shadow, spacing, typography } from "../theme/tokens";

function formatRupiah(angka = 0) {
  return `Rp ${Number(angka || 0).toLocaleString("id-ID")}`;
}

export default function TransaksiScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
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
        <View style={styles.page}>
          <View style={styles.heroCard}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>Flow Penitip</Text>
            </View>
            <Text style={styles.heroTitle}>Lengkapi detail titipanmu</Text>
            <Text style={styles.heroSubtitle}>
              Isi jumlah, varian, dan catatan agar penjastip bisa memahami kebutuhanmu dengan jelas.
            </Text>
          </View>

          <View style={[styles.bodyGrid, isWide && styles.bodyGridWide]}>
            <View style={styles.mainColumn}>
              <View style={styles.productCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
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
            </View>

            <View style={styles.sideColumn}>
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

              <AppButton title="Kirim Titipan" onPress={pesan} loading={memuat} style={styles.primaryButton} />

              <Text style={styles.footerNote}>
                Setelah terkirim, order-service akan menyimpan permintaan dan statusnya akan masuk ke tracking.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: spacing.lg, paddingBottom: 32 },
  page: { width: "100%", maxWidth: 1180, alignSelf: "center" },
  heroCard: {
    backgroundColor: C.pink,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow.hero,
  },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  rolePillText: { color: C.pinkDark, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: typography.h1, fontWeight: "800" },
  heroSubtitle: { color: "#DCEAFF", marginTop: 8, lineHeight: 22 },
  bodyGrid: { marginTop: 16, gap: 16 },
  bodyGridWide: { flexDirection: "row", alignItems: "flex-start" },
  mainColumn: { flex: 1.18, gap: 16 },
  sideColumn: { flex: 0.82, gap: 16 },
  productCard: {
    backgroundColor: C.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow.card,
  },
  productImage: {
    width: "100%",
    height: 190,
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: "#DDEEFF",
  },
  productTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  productEmoji: {
    fontSize: 26,
    backgroundColor: "#EAF4FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockPill: {
    backgroundColor: "#EEF6FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stockPillText: { color: C.pink, fontWeight: "700", fontSize: 12 },
  productStore: { color: C.pink, fontWeight: "700", fontSize: 13 },
  productName: { color: C.text, fontSize: 20, fontWeight: "800", marginTop: 6, lineHeight: 28 },
  productMeta: { color: C.textSoft, marginTop: 6, lineHeight: 20, fontSize: typography.body },
  productPrice: { color: C.purple, fontSize: typography.h2, fontWeight: "800", marginTop: spacing.md },
  formCard: {
    backgroundColor: C.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow.card,
  },
  sectionLabel: { color: C.text, fontSize: typography.h3, fontWeight: "800", marginBottom: spacing.md },
  inputLabel: { color: C.textSoft, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  qtyButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF4FF",
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
    borderColor: C.border,
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
    backgroundColor: "#EEF6FF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BED9FB",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { color: C.textSoft, fontSize: 14 },
  summaryValue: { color: C.text, fontWeight: "700" },
  summaryHint: { color: C.pinkDark, fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#CFE1F7", marginVertical: 8 },
  totalLabel: { color: C.text, fontSize: 15, fontWeight: "800" },
  totalValue: { color: C.purple, fontSize: 20, fontWeight: "800" },
  errorBox: {
    backgroundColor: "#FDEFF2",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6C4CD",
  },
  errorText: { color: C.danger, fontWeight: "700", lineHeight: 20 },
  primaryButton: {
    marginTop: 2,
  },
  footerNote: { color: C.textSoft, textAlign: "center", lineHeight: 20, fontSize: 12 },
});
