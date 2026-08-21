// screens/SuksesScreen.js — konfirmasi titipan berhasil dibuat
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuksesScreen({ route, navigation }) {
  const { order, item } = route.params;

  return (
    <SafeAreaView style={styles.wadah}>
      <View style={styles.kartu}>
        <Text style={styles.ikon}>✓</Text>
        <Text style={styles.judul}>Titipan Berhasil Dibuat</Text>
        <Text style={styles.sub}>Detail pesanan kamu:</Text>

        <View style={styles.baris}>
          <Text style={styles.label}>Barang</Text>
          <Text style={styles.nilai}>{item?.nama ?? "-"}</Text>
        </View>
        <View style={styles.baris}>
          <Text style={styles.label}>Jumlah</Text>
          <Text style={styles.nilai}>{order?.qty ?? "-"}</Text>
        </View>
        <View style={styles.baris}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.nilai}>Rp {(order?.total ?? 0).toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.baris}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.nilai, styles.statusAktif]}>{order?.status ?? "pending"}</Text>
        </View>
        {order?.orderId ? (
          <View style={styles.baris}>
            <Text style={styles.label}>ID Pesanan</Text>
            <Text style={styles.nilai}>#{order.orderId}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.tombol}
        onPress={() => navigation.navigate("Daftar")}
      >
        <Text style={styles.tombolTeks}>Kembali ke Daftar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: "#0f172a", padding: 20, justifyContent: "center" },
  kartu: { backgroundColor: "#1e293b", borderRadius: 16, padding: 24, marginBottom: 24 },
  ikon: { fontSize: 48, textAlign: "center", marginBottom: 12, color: "#4ade80" },
  judul: { color: "#f8fafc", fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  sub: { color: "#94a3b8", textAlign: "center", marginBottom: 16 },
  baris: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#64748b", fontSize: 14 },
  nilai: { color: "#e2e8f0", fontSize: 14, fontWeight: "600" },
  statusAktif: { color: "#4ade80" },
  tombol: { backgroundColor: "#38bdf8", padding: 16, borderRadius: 12, alignItems: "center" },
  tombolTeks: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
});
