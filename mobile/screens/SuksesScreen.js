import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const C = {
  bg: "#F4F9FF",
  surface: "#FFFFFF",
  border: "#C9DDF4",
  pink: "#0B63CE",
  purple: "#1B88E5",
  mint: "#D9ECFF",
  success: "#2FA36B",
  text: "#17375E",
  textSoft: "#5C7DA4",
};

function formatRupiah(angka = 0) {
  return `Rp ${Number(angka || 0).toLocaleString("id-ID")}`;
}

export default function SuksesScreen({ route, navigation }) {
  const { order, item, peran, profil, varian, catatan } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.heroTitle}>Titipan berhasil dibuat!</Text>
          <Text style={styles.heroSubtitle}>
            Order-service sudah menerima titipanmu dan akan meneruskannya ke alur pembayaran serta tracking.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Ringkasan order</Text>
          <Image source={{ uri: item?.imageUrl }} style={styles.summaryImage} />

          <View style={styles.row}>
            <Text style={styles.label}>Nama penitip</Text>
            <Text style={styles.value}>{profil?.nama || "Mahasiswa"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Peran</Text>
            <Text style={styles.value}>{peran || "penitip"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Toko</Text>
            <Text style={styles.value}>{item?.toko_nama || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Barang</Text>
            <Text style={styles.value}>{item?.nama || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jumlah</Text>
            <Text style={styles.value}>{order?.qty ?? "-"} {item?.satuan || "pcs"}</Text>
          </View>
          {varian ? (
            <View style={styles.row}>
              <Text style={styles.label}>Varian</Text>
              <Text style={styles.value}>{varian}</Text>
            </View>
          ) : null}
          {catatan ? (
            <View style={styles.row}>
              <Text style={styles.label}>Catatan</Text>
              <Text style={styles.value}>{catatan}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(order?.total)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{order?.status || "pending"}</Text>
            </View>
          </View>
          {order?.orderId ? (
            <View style={styles.row}>
              <Text style={styles.label}>ID Order</Text>
              <Text style={[styles.value, styles.orderId]}>#{order.orderId}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Alur setelah ini</Text>
          <Text style={styles.timelineItem}>1. Penjastip membuka sesi jastip di toko pilihan.</Text>
          <Text style={styles.timelineItem}>2. Order-service menyimpan titipan dan total barang.</Text>
          <Text style={styles.timelineItem}>3. Payment-service menampung pembayaran tertahan.</Text>
          <Text style={styles.timelineItem}>4. Tracking-service mencatat status dibelanjakan, diantar, lalu diterima.</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Beranda", { peran, profil })}
        >
          <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.secondaryButtonText}>Kembali ke Login</Text>
        </TouchableOpacity>
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
    alignItems: "center",
  },
  successCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#DCEAFF",
    borderWidth: 3,
    borderColor: "#C3DCF7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successCheck: { color: C.success, fontSize: 40, fontWeight: "800" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", textAlign: "center" },
  heroSubtitle: { color: "#DCEAFF", marginTop: 8, lineHeight: 22, textAlign: "center" },
  summaryCard: {
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryImage: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#DDEEFF",
  },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  label: { flex: 1, color: C.textSoft, fontWeight: "700" },
  value: { flex: 1, color: C.text, textAlign: "right", fontWeight: "700", lineHeight: 20 },
  totalValue: { flex: 1, color: C.purple, textAlign: "right", fontWeight: "800", fontSize: 18 },
  statusPill: {
    backgroundColor: "#EEF6FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusPillText: { color: C.success, fontWeight: "800", fontSize: 12 },
  orderId: { color: C.pink },
  timelineCard: {
    marginTop: 16,
    backgroundColor: "#EEF6FF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BED9FB",
  },
  timelineItem: { color: C.textSoft, lineHeight: 22, marginBottom: 8 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: C.pink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryButtonText: { color: C.text, fontWeight: "800", fontSize: 16 },
});
