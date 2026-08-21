// screens/TransaksiScreen.js — layar buat titipan dengan handling semua jenis galat
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { buatTitipan, login } from "../api/endpoints";

export default function TransaksiScreen({ route, navigation }) {
  const { item } = route.params;
  const [qty, setQty] = useState("1");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);

  async function pesan() {
    if (memuat) return; // kunci: cegah kirim ganda saat tombol ditekan dua kali
    const jumlahQty = parseInt(qty, 10);
    if (!jumlahQty || jumlahQty < 1) {
      setGalat("Jumlah harus minimal 1");
      return;
    }

    setMemuat(true);
    setGalat(null);

    try {
      // Ambil token JWT dulu
      const authData = await login("mhs");
      const token = authData.token;

      // Buat titipan — panggil POST /v1/orders (sumber daya rebutan)
      const order = await buatTitipan({ itemId: item.id, qty: jumlahQty, token });
      navigation.replace("Sukses", { order, item });
    } catch (e) {
      // Tangani tiap jenis galat dengan pesan yang tepat
      if (e.status === 409) {
        setGalat("Stok barang ini baru saja habis. Pilih barang lain.");
      } else if (e.status === 429) {
        setGalat("Server sedang sibuk. Sedang mencoba ulang otomatis...");
        // client.js sudah retry — jika sampai sini artinya sudah 3x gagal
      } else if (e.status === 401) {
        setGalat("Sesi habis. Silakan restart aplikasi.");
      } else if (e.status === 503) {
        setGalat("Layanan katalog sedang tidak tersedia. Coba lagi beberapa saat.");
      } else if (!e.status) {
        setGalat("Jaringan bermasalah. Periksa koneksi lalu ulangi.");
      } else {
        setGalat(`Gagal membuat titipan (${e.status}). Coba lagi.`);
      }
    } finally {
      setMemuat(false);
    }
  }

  return (
    <SafeAreaView style={styles.wadah}>
      <View style={styles.kartuBarang}>
        <Text style={styles.namaBarang}>{item.nama}</Text>
        <Text style={styles.harga}>Rp {(item.harga ?? 0).toLocaleString("id-ID")}</Text>
        <Text style={styles.stok}>Stok tersedia: {item.stok}</Text>
      </View>

      <Text style={styles.label}>Jumlah</Text>
      <TextInput
        style={styles.input}
        value={qty}
        onChangeText={setQty}
        keyboardType="numeric"
        placeholder="1"
        placeholderTextColor="#64748b"
        editable={!memuat}
      />

      {galat ? <Text style={styles.galat}>{galat}</Text> : null}

      <Pressable
        style={[styles.tombol, memuat && styles.tombolMati]}
        onPress={pesan}
        disabled={memuat}
      >
        {memuat
          ? <ActivityIndicator color="#0f172a" />
          : <Text style={styles.tombolTeks}>Pesan Sekarang</Text>
        }
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wadah: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  kartuBarang: { backgroundColor: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 24 },
  namaBarang: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  harga: { color: "#38bdf8", fontSize: 16, marginBottom: 4 },
  stok: { color: "#94a3b8", fontSize: 14 },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#1e293b", color: "#f8fafc", padding: 14,
    borderRadius: 10, fontSize: 16, marginBottom: 16,
  },
  tombol: {
    backgroundColor: "#38bdf8", padding: 16,
    borderRadius: 12, alignItems: "center", marginTop: 8,
  },
  tombolMati: { opacity: 0.6 },
  tombolTeks: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  galat: { color: "#f87171", marginBottom: 12, textAlign: "center" },
});
