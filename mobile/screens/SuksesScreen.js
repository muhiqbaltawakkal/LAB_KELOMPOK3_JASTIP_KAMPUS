import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const C = {
  bg: "#F0F4FF",
  surface: "#FFFFFF",
  primary: "#1565C0",
  primaryDark: "#0D47A1",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  text: "#1A237E",
  textMid: "#37474F",
  textSoft: "#607D8B",
  border: "#BBDEFB",
};

function formatRp(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

const TRACKING_STEPS = [
  { key: "dititip",      label: "Dititip",       desc: "Titipanmu sudah diterima",           icon: "📋" },
  { key: "dibelanjakan", label: "Dibelanjakan",  desc: "Penjastip membeli di toko",           icon: "🛒" },
  { key: "diantar",      label: "Diantar",        desc: "Barang dalam perjalanan ke kamu",    icon: "🛵" },
  { key: "diterima",     label: "Diterima",       desc: "Barang sudah sampai & dana dilepas", icon: "✅" },
];

export default function SuksesScreen({ route, navigation }) {
  const { order, item, peran, profil, varian, catatan, modeTawar, hargaTawar, alasanTawar } = route.params || {};
  const hargaFinal = modeTawar && hargaTawar ? hargaTawar : item?.harga;

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Titipan Berhasil</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Sukses */}
        <View style={s.heroCard}>
          <View style={s.checkCircle}>
            <Text style={s.checkIcon}>✓</Text>
          </View>
          <Text style={s.heroTitle}>Titipan Berhasil Dibuat!</Text>
          <Text style={s.heroSub}>
            Order-service sudah menerima titipanmu. Penjastip akan segera memproses pesananmu.
          </Text>
          {modeTawar && (
            <View style={s.tawarBadge}>
              <Text style={s.tawarBadgeText}>💬 Mode Tawar Harga Aktif</Text>
            </View>
          )}
        </View>

        {/* Info Produk */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Detail Pesanan</Text>
          {item?.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={s.productImg} resizeMode="cover" />
          ) : null}
          <InfoRow label="Produk" value={item?.nama || "-"} />
          <InfoRow label="Toko" value={item?.toko_nama || "-"} />
          <InfoRow label="Kategori" value={item?.kategori || "-"} />
          <InfoRow label="Satuan" value={item?.satuan || "pcs"} />
          {varian ? <InfoRow label="Varian" value={varian} /> : null}
          {catatan ? <InfoRow label="Catatan" value={catatan} /> : null}

          <View style={s.divider} />

          <InfoRow label="Pemesan" value={profil?.nama || "-"} />
          <InfoRow label="Kampus" value={profil?.kampus || "-"} />

          <View style={s.divider} />

          {modeTawar && hargaTawar ? (
            <>
              <InfoRow label="Mode" value="Tawar Harga" accent />
              <InfoRow label="Harga Ditawar" value={formatRp(hargaTawar) + " / " + (item?.satuan || "pcs")} accent />
              {alasanTawar ? <InfoRow label="Alasan Tawar" value={alasanTawar} /> : null}
              <InfoRow label="Harga Acuan" value={formatRp(item?.harga)} soft />
            </>
          ) : (
            <InfoRow label="Mode" value="Langsung Pesan" />
          )}
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Estimasi Total</Text>
            <Text style={s.totalValue}>{formatRp(hargaFinal)}</Text>
          </View>
        </View>

        {/* Alur Tracking */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Alur Proses Jastip</Text>
          {TRACKING_STEPS.map((step, idx) => (
            <View key={step.key} style={s.trackStep}>
              <View style={s.trackLeft}>
                <View style={[s.trackDot, idx === 0 && s.trackDotActive]}>
                  <Text style={s.trackDotText}>{step.icon}</Text>
                </View>
                {idx < TRACKING_STEPS.length - 1 && <View style={s.trackLine} />}
              </View>
              <View style={s.trackRight}>
                <Text style={[s.trackLabel, idx === 0 && s.trackLabelActive]}>{step.label}</Text>
                <Text style={s.trackDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Pembayaran */}
        <View style={s.paymentCard}>
          <Text style={s.paymentTitle}>💳 Alur Pembayaran</Text>
          <Text style={s.paymentStep}>W → Lakukan pembayaran ke payment-service</Text>
          <Text style={s.paymentStep}>X1 → Dana ditahan sebagai saldo tertahan</Text>
          <Text style={s.paymentStep}>AF → Konfirmasi barang diterima</Text>
          <Text style={s.paymentStep}>AH → Dana dilepaskan ke penjastip</Text>
        </View>

        {/* Tombol Kembali */}
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.replace("Beranda", { peran, profil })}>
          <Text style={s.backBtnText}>🏠 Kembali ke Beranda</Text>
        </TouchableOpacity>

        <Text style={s.footerNote}>
          Status pesanan dapat dipantau melalui tracking-service di beranda.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, accent, soft }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, accent && s.infoAccent, soft && s.infoSoft]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 16, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  scroll: { padding: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: C.primary, borderRadius: 24, padding: 28, alignItems: "center",
    marginBottom: 14,
  },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
    shadowColor: "#90CAF9", shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  checkIcon: { fontSize: 40, color: C.success },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  heroSub: { color: "#90CAF9", fontSize: 14, textAlign: "center", lineHeight: 22 },
  tawarBadge: {
    marginTop: 14, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  tawarBadgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: C.border, elevation: 2,
  },
  cardTitle: { color: C.text, fontWeight: "800", fontSize: 17, marginBottom: 14 },
  productImg: { width: "100%", height: 180, borderRadius: 14, marginBottom: 14, backgroundColor: "#E8EFFE" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  infoLabel: { color: C.textSoft, fontSize: 13, flex: 1 },
  infoValue: { color: C.textMid, fontWeight: "700", fontSize: 13, flex: 2, textAlign: "right" },
  infoAccent: { color: C.primary },
  infoSoft: { textDecorationLine: "line-through", color: "#90A4AE" },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },

  totalBox: {
    backgroundColor: C.bg, borderRadius: 14, padding: 14, marginTop: 6,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: C.border,
  },
  totalLabel: { color: C.text, fontWeight: "800", fontSize: 15 },
  totalValue: { color: C.primary, fontWeight: "900", fontSize: 22 },

  trackStep: { flexDirection: "row", marginBottom: 0 },
  trackLeft: { alignItems: "center", width: 48, marginRight: 12 },
  trackDot: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#E3F2FD",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.border,
  },
  trackDotActive: { backgroundColor: C.primary, borderColor: C.primaryDark },
  trackDotText: { fontSize: 20 },
  trackLine: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 4 },
  trackRight: { flex: 1, paddingVertical: 10, paddingBottom: 14 },
  trackLabel: { color: C.textMid, fontWeight: "700", fontSize: 14, marginBottom: 4 },
  trackLabelActive: { color: C.primary },
  trackDesc: { color: C.textSoft, fontSize: 12, lineHeight: 18 },

  paymentCard: {
    backgroundColor: "#E8F5E9", borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#A5D6A7",
  },
  paymentTitle: { color: C.success, fontWeight: "800", fontSize: 16, marginBottom: 12 },
  paymentStep: { color: "#37474F", fontSize: 13, lineHeight: 22, marginBottom: 4 },

  backBtn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  backBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  footerNote: { color: C.textSoft, textAlign: "center", fontSize: 12, lineHeight: 18 },
});
