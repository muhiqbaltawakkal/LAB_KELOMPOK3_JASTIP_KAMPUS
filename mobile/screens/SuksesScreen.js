// screens/SuksesScreen.js — konfirmasi titipan berhasil, tampilan profesional
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const C = { bg:"#0B0F1A", card:"#141925", cardBorder:"#1E2736", accent:"#6C63FF", teal:"#00C9B1", green:"#4ade80", text:"#F0F4FF", muted:"#8892A4", badge:"#1A2035" };

export default function SuksesScreen({ route, navigation }) {
  const { order, item } = route.params;

  return (
    <SafeAreaView style={ss.wadah}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={ss.scroll} showsVerticalScrollIndicator={false}>

        {/* Ikon sukses animatif */}
        <View style={ss.heroWrap}>
          <View style={ss.lingkaran}>
            <Text style={ss.ikonSukses}>✓</Text>
          </View>
          <Text style={ss.judulSukses}>Titipan Berhasil!</Text>
          <Text style={ss.subSukses}>Permintaan jastipmu telah diterima sistem</Text>
        </View>

        {/* Detail Order */}
        <View style={ss.kartu}>
          <Text style={ss.kartuJudul}>Ringkasan Pesanan</Text>

          <View style={ss.baris}>
            <Text style={ss.label}>Barang</Text>
            <Text style={ss.nilai} numberOfLines={2}>{item?.nama ?? "-"}</Text>
          </View>
          <View style={ss.divider} />
          <View style={ss.baris}>
            <Text style={ss.label}>Jumlah</Text>
            <Text style={ss.nilai}>{order?.qty ?? "-"} {item?.satuan ?? "pcs"}</Text>
          </View>
          <View style={ss.baris}>
            <Text style={ss.label}>Total Bayar</Text>
            <Text style={[ss.nilai, ss.totalHarga]}>Rp {(order?.total ?? 0).toLocaleString("id-ID")}</Text>
          </View>
          <View style={ss.divider} />
          <View style={ss.baris}>
            <Text style={ss.label}>Status</Text>
            <View style={ss.statusBadge}>
              <Text style={ss.statusTeks}>🟢 {order?.status ?? "pending"}</Text>
            </View>
          </View>
          {order?.orderId ? (
            <View style={ss.baris}>
              <Text style={ss.label}>ID Pesanan</Text>
              <Text style={[ss.nilai, { color: C.accent }]}>#{order.orderId}</Text>
            </View>
          ) : null}
        </View>

        {/* Info langkah selanjutnya */}
        <View style={ss.infoBox}>
          <Text style={ss.infoJudul}>📋 Langkah Selanjutnya</Text>
          <Text style={ss.infoTeks}>1. Penjastip akan menerima notifikasi titipanmu</Text>
          <Text style={ss.infoTeks}>2. Tunggu konfirmasi dari penjastip</Text>
          <Text style={ss.infoTeks}>3. Lakukan pembayaran setelah disetujui</Text>
          <Text style={ss.infoTeks}>4. Barang akan diantarkan ke kamu</Text>
        </View>

        {/* Tombol */}
        <TouchableOpacity style={ss.tombolUtama} onPress={() => navigation.navigate("Beranda")}>
          <Text style={ss.tombolUtamaTeks}>🏠  Kembali ke Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={ss.tombolSecondary} onPress={() => navigation.navigate("Login")}>
          <Text style={ss.tombolSecondaryTeks}>Ganti Akun</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  heroWrap: { alignItems: "center", marginBottom: 24, marginTop: 12 },
  lingkaran: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#0F2820", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 3, borderColor: C.green },
  ikonSukses: { fontSize: 40, color: C.green, fontWeight: "700" },
  judulSukses: { color: C.text, fontSize: 24, fontWeight: "800", marginBottom: 6 },
  subSukses: { color: C.muted, fontSize: 14 },
  kartu: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder },
  kartuJudul: { color: C.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.cardBorder, marginVertical: 10 },
  baris: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  label: { color: C.muted, fontSize: 13, flex: 1 },
  nilai: { color: C.text, fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
  totalHarga: { color: C.teal, fontSize: 16, fontWeight: "800" },
  statusBadge: { backgroundColor: "#0F2820", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusTeks: { color: C.green, fontSize: 13, fontWeight: "600" },
  infoBox: { backgroundColor: "#111827", borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1E2736" },
  infoJudul: { color: C.text, fontWeight: "700", marginBottom: 10 },
  infoTeks: { color: C.muted, fontSize: 13, marginBottom: 6, lineHeight: 20 },
  tombolUtama: { backgroundColor: C.accent, padding: 18, borderRadius: 14, alignItems: "center", marginBottom: 10 },
  tombolUtamaTeks: { color: "#fff", fontWeight: "800", fontSize: 16 },
  tombolSecondary: { padding: 14, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: C.cardBorder },
  tombolSecondaryTeks: { color: C.muted, fontWeight: "600" },
});

