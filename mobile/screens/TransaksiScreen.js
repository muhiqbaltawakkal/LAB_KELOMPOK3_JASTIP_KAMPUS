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
  bg: "#F4F9FF",
  bgSoft: "#EAF4FF",
  surface: "#FFFFFF",
  border: "#C9DDF4",
  pink: "#0B63CE",
  pinkDark: "#0A3E7C",
  purple: "#1B88E5",
  peach: "#D7EAFF",
  mint: "#D9ECFF",
  success: "#2FA36B",
  danger: "#D95C74",
  warning: "#E68A00",
  text: "#17375E",
  textSoft: "#5C7DA4",
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

  // â”€â”€ Langkah Q: pilih tawar atau langsung â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // null = belum pilih, "tawar" = mau tawar, "langsung" = langsung pesan
  const [modePesan, setModePesan] = useState(null);
  const [hargaTawar, setHargaTawar] = useState("");
  const [alasanTawar, setAlasanTawar] = useState("");

  const jumlahQty = Number(qty || 0);
  const subtotal = useMemo(() => (item.harga ?? 0) * (jumlahQty || 0), [item.harga, jumlahQty]);
  const totalTawar = useMemo(() => Number(hargaTawar || 0) * (jumlahQty || 0), [hargaTawar, jumlahQty]);

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
    if (modePesan === "tawar") {
      const tawarNum = Number(hargaTawar || 0);
      if (!tawarNum || tawarNum < 1000) {
        setGalat("Masukkan harga tawar yang valid (minimal Rp 1.000).");
        return;
      }
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
        modeTawar: modePesan === "tawar",
        hargaTawar: modePesan === "tawar" ? Number(hargaTawar) : null,
        alasanTawar: modePesan === "tawar" ? alasanTawar : null,
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
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>Flow Penitip</Text>
          </View>
          <Text style={styles.heroTitle}>Lengkapi detail titipanmu</Text>
          <Text style={styles.heroSubtitle}>
            Isi jumlah dan varian, lalu pilih apakah ingin menawar harga atau langsung memesan.
          </Text>
        </View>

        {/* Kartu Produk */}
        <View style={styles.productCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          <View style={styles.productTop}>
            <Text style={styles.productEmoji}>{item.kategoriIkon || "ðŸŽ"}</Text>
            <View style={styles.stockPill}>
              <Text style={styles.stockPillText}>Stok {item.stok}</Text>
            </View>
          </View>
          <Text style={styles.productStore}>{item.toko_nama || "Toko pilihan"}</Text>
          <Text style={styles.productName}>{item.nama}</Text>
          <Text style={styles.productMeta}>
            {item.kategori || "Umum"} â€¢ {item.satuan || "pcs"}
          </Text>
          <Text style={styles.productPrice}>{formatRupiah(item.harga)}</Text>
        </View>

        {/* Form Detail */}
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

        {/* â”€â”€ Langkah Q: Ingin tawar harga/jasa titip? â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <View style={styles.tawarCard}>
          <View style={styles.tawarHeaderRow}>
            <Text style={styles.tawarStepBadge}>Langkah Q</Text>
            <Text style={styles.tawarTitle}>Ingin tawar harga / jasa titip?</Text>
          </View>
          <Text style={styles.tawarSubtitle}>
            Pilih "Tawar Harga" jika ingin mengajukan penawaran ke penjastip, atau "Langsung Pesan" untuk memakai harga acuan.
          </Text>
          <View style={styles.tawarChoiceRow}>
            <TouchableOpacity
              style={[styles.tawarChoiceBtn, modePesan === "tawar" && styles.tawarChoiceBtnActive]}
              onPress={() => setModePesan("tawar")}
            >
              <Text style={[styles.tawarChoiceBtnText, modePesan === "tawar" && styles.tawarChoiceBtnTextActive]}>
                ðŸ’¬ Tawar Harga
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tawarChoiceBtn, modePesan === "langsung" && styles.tawarChoiceBtnActive]}
              onPress={() => setModePesan("langsung")}
            >
              <Text style={[styles.tawarChoiceBtnText, modePesan === "langsung" && styles.tawarChoiceBtnTextActive]}>
                âš¡ Langsung Pesan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Langkah R: Form Tawar (muncul jika pilih "Tawar") */}
          {modePesan === "tawar" && (
            <View style={styles.tawarFormBox}>
              <View style={styles.tawarFormHeader}>
                <Text style={styles.tawarFormBadge}>Langkah R</Text>
                <Text style={styles.tawarFormTitle}>Ajukan tawaran harga</Text>
              </View>
              <Text style={styles.tawarFormHint}>
                Harga acuan: <Text style={styles.tawarFormHintBold}>{formatRupiah(item.harga)}</Text> / {item.satuan}
              </Text>
              <Text style={styles.inputLabel}>Harga tawar per {item.satuan || "pcs"}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Contoh: ${Math.round(item.harga * 0.9).toLocaleString("id-ID")}`}
                placeholderTextColor={C.textSoft}
                keyboardType="numeric"
                value={hargaTawar}
                onChangeText={setHargaTawar}
              />
              <Text style={styles.inputLabel}>Alasan penawaran (opsional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Contoh: mahasiswa, beli rutin, minta diskon jasa titip"
                placeholderTextColor={C.textSoft}
                multiline
                numberOfLines={3}
                value={alasanTawar}
                onChangeText={setAlasanTawar}
              />
              {hargaTawar ? (
                <View style={styles.tawarTotalBox}>
                  <Text style={styles.tawarTotalLabel}>Estimasi total tawar ({jumlahQty} {item.satuan})</Text>
                  <Text style={styles.tawarTotalValue}>{formatRupiah(totalTawar)}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Ringkasan Pembayaran */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Ringkasan pembayaran</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Barang x {jumlahQty || 0}</Text>
            <Text style={styles.summaryValue}>
              {modePesan === "tawar" && Number(hargaTawar) > 0
                ? formatRupiah(totalTawar)
                : formatRupiah(subtotal)}
            </Text>
          </View>
          {modePesan === "tawar" && Number(hargaTawar) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Harga acuan</Text>
              <Text style={[styles.summaryValue, styles.summaryStrike]}>{formatRupiah(subtotal)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya jasa</Text>
            <Text style={styles.summaryHint}>
              {modePesan === "tawar" ? "Termasuk dalam tawaran" : "Dikonfirmasi penjastip"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Estimasi subtotal</Text>
            <Text style={styles.totalValue}>
              {modePesan === "tawar" && Number(hargaTawar) > 0
                ? formatRupiah(totalTawar)
                : formatRupiah(subtotal)}
            </Text>
          </View>
        </View>

        {galat ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{galat}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !modePesan && styles.buttonDisabled,
            memuat && styles.buttonDisabled,
          ]}
          onPress={pesan}
          disabled={memuat || !modePesan}
        >
          {memuat ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {modePesan === "tawar" ? "ðŸ’¬ Kirim Titipan + Tawaran" : "âš¡ Kirim Titipan Langsung"}
            </Text>
          )}
        </TouchableOpacity>

        {!modePesan && (
          <Text style={styles.footerNote}>
            Pilih dulu: Tawar Harga atau Langsung Pesan sebelum mengirim titipan.
          </Text>
        )}
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
    backgroundColor: C.pink,
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
  rolePillText: { color: C.pinkDark, fontWeight: "800", fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800" },
  heroSubtitle: { color: "#DCEAFF", marginTop: 8, lineHeight: 22 },
  productCard: {
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
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

  // â”€â”€ Tawar Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  tawarCard: {
    marginTop: 16,
    backgroundColor: "#FFF8EC",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FDDCA0",
  },
  tawarHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  tawarStepBadge: {
    backgroundColor: "#E68A00",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  tawarTitle: { color: C.text, fontSize: 16, fontWeight: "800" },
  tawarSubtitle: { color: C.textSoft, lineHeight: 20, marginBottom: 14 },
  tawarChoiceRow: { flexDirection: "row", gap: 10 },
  tawarChoiceBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FDDCA0",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  tawarChoiceBtnActive: {
    backgroundColor: C.pink,
    borderColor: C.pinkDark,
  },
  tawarChoiceBtnText: { color: C.text, fontWeight: "700", fontSize: 13 },
  tawarChoiceBtnTextActive: { color: "#FFFFFF" },

  // â”€â”€ Tawar Form (Langkah R) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  tawarFormBox: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C9DDF4",
  },
  tawarFormHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tawarFormBadge: {
    backgroundColor: C.purple,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  tawarFormTitle: { color: C.text, fontSize: 15, fontWeight: "800" },
  tawarFormHint: { color: C.textSoft, marginBottom: 12, fontSize: 13 },
  tawarFormHintBold: { color: C.purple, fontWeight: "800" },
  tawarTotalBox: {
    backgroundColor: "#EEF6FF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  tawarTotalLabel: { color: C.textSoft, fontSize: 13 },
  tawarTotalValue: { color: C.pink, fontWeight: "800", fontSize: 16 },

  // â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  summaryCard: {
    marginTop: 16,
    backgroundColor: "#EEF6FF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BED9FB",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { color: C.textSoft, fontSize: 14 },
  summaryValue: { color: C.text, fontWeight: "700" },
  summaryStrike: { textDecorationLine: "line-through", color: C.textSoft },
  summaryHint: { color: C.pinkDark, fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#CFE1F7", marginVertical: 8 },
  totalLabel: { color: C.text, fontSize: 15, fontWeight: "800" },
  totalValue: { color: C.purple, fontSize: 20, fontWeight: "800" },
  errorBox: {
    marginTop: 16,
    backgroundColor: "#FDEFF2",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6C4CD",
  },
  errorText: { color: C.danger, fontWeight: "700", lineHeight: 20 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: C.pink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  footerNote: { color: C.textSoft, textAlign: "center", marginTop: 14, lineHeight: 20, fontSize: 12 },
});
