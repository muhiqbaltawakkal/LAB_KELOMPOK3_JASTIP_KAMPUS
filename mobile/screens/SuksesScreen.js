import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AppButton } from "../components/ui";
import { colors as C, radius, shadow, spacing, typography } from "../theme/tokens";

function formatRupiah(angka = 0) {
  return `Rp ${Number(angka || 0).toLocaleString("id-ID")}`;
}

export default function SuksesScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1040;
  const { order, item, peran, profil, varian, catatan } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.heroCard}>
            <View style={styles.successCircle}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.heroTitle}>Titipan berhasil dibuat!</Text>
            <Text style={styles.heroSubtitle}>
              Order-service sudah menerima titipanmu dan akan meneruskannya ke alur pembayaran serta tracking.
            </Text>
          </View>

          <View style={[styles.detailGrid, isWide && styles.detailGridWide]}>
            <View style={styles.detailMain}>
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
            </View>

            <View style={styles.detailSide}>
              <View style={styles.timelineCard}>
                <Text style={styles.sectionTitle}>Alur setelah ini</Text>
                <Text style={styles.timelineItem}>1. Penjastip membuka sesi jastip di toko pilihan.</Text>
                <Text style={styles.timelineItem}>2. Order-service menyimpan titipan dan total barang.</Text>
                <Text style={styles.timelineItem}>3. Payment-service menampung pembayaran tertahan.</Text>
                <Text style={styles.timelineItem}>4. Tracking-service mencatat status dibelanjakan, diantar, lalu diterima.</Text>
              </View>
            </View>
          </View>

          <AppButton
            title="Kembali ke Beranda"
            onPress={() => navigation.navigate("Beranda", { peran, profil })}
            style={styles.primaryButton}
          />

          <AppButton title="Kembali ke Login" secondary onPress={() => navigation.navigate("Login")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: spacing.lg, paddingBottom: 32 },
  page: { width: "100%", maxWidth: 1040, alignSelf: "center" },
  heroCard: {
    backgroundColor: C.pink,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    ...shadow.hero,
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
  heroTitle: { color: "#FFFFFF", fontSize: typography.h1, fontWeight: "800", textAlign: "center" },
  heroSubtitle: { color: "#DCEAFF", marginTop: 8, lineHeight: 22, textAlign: "center" },
  detailGrid: { marginTop: 16, gap: 16 },
  detailGridWide: { flexDirection: "row", alignItems: "flex-start" },
  detailMain: { flex: 1.05 },
  detailSide: { flex: 0.95 },
  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow.card,
  },
  summaryImage: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#DDEEFF",
  },
  sectionTitle: { color: C.text, fontSize: typography.h3, fontWeight: "800", marginBottom: 12 },
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
    backgroundColor: "#EEF6FF",
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#BED9FB",
  },
  timelineItem: { color: C.textSoft, lineHeight: 22, marginBottom: 8 },
  primaryButton: { marginTop: spacing.lg, marginBottom: spacing.sm },
});
