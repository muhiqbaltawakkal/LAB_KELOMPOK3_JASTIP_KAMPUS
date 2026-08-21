// App.js — layar utama: daftar barang jastip dari API
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getDaftarBarang } from "./api/endpoints";
import TransaksiScreen from "./screens/TransaksiScreen";
import SuksesScreen from "./screens/SuksesScreen";

const Stack = createNativeStackNavigator();

function DaftarBarangScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);

  useEffect(() => {
    async function ambilData() {
      try {
        const json = await getDaftarBarang();
        const items = Array.isArray(json) ? json : json.items ?? [];
        setData(items);
      } catch (e) {
        setGalat(e.message || "Gagal memuat data");
      } finally {
        setMemuat(false);
      }
    }
    ambilData();
  }, []);

  if (memuat) {
    return (
      <SafeAreaView style={styles.tengah}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.info}>Memuat daftar barang jastip...</Text>
      </SafeAreaView>
    );
  }

  if (galat) {
    return (
      <SafeAreaView style={styles.tengah}>
        <Text style={styles.galat}>Gagal memuat: {galat}</Text>
        <Text style={styles.info}>
          Periksa BASE_URL di config.js dan pastikan HP satu jaringan dengan laptop.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wadah}>
      <Text style={styles.judul}>Daftar Barang Jastip</Text>
      <FlatList
        data={data}
        keyExtractor={(item, i) => String(item.id ?? i)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.kartu}
            onPress={() => navigation.navigate("Transaksi", { item })}
          >
            <Text style={styles.namaItem}>{item.nama ?? "Tanpa nama"}</Text>
            <View style={styles.baris}>
              <Text style={styles.harga}>Rp {(item.harga ?? 0).toLocaleString("id-ID")}</Text>
              <Text style={[styles.stok, item.stok < 5 ? styles.stokMenipis : null]}>
                Stok: {item.stok ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.info}>Belum ada barang tersedia.</Text>}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="Daftar" component={DaftarBarangScreen} options={{ title: "Jastip Kampus" }} />
        <Stack.Screen name="Transaksi" component={TransaksiScreen} options={{ title: "Buat Titipan" }} />
        <Stack.Screen name="Sukses" component={SuksesScreen} options={{ title: "Berhasil", headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  tengah: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0f172a" },
  judul: { color: "#f8fafc", fontSize: 22, fontWeight: "700", marginBottom: 12 },
  kartu: { backgroundColor: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 10 },
  namaItem: { color: "#e2e8f0", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  baris: { flexDirection: "row", justifyContent: "space-between" },
  harga: { color: "#38bdf8", fontSize: 14 },
  stok: { color: "#94a3b8", fontSize: 14 },
  stokMenipis: { color: "#f87171" },
  info: { color: "#94a3b8", marginTop: 8, textAlign: "center" },
  galat: { color: "#f87171", fontSize: 16, textAlign: "center" },
});
