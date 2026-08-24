import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";
import { API_URL, api } from "../lib/api";
import { enqueue, flushOutbox, storage } from "../lib/offline";
import { AppButton } from "../components/ui";
import { colors } from "../theme/tokens";

const C = { bg: colors.bg, card: colors.surface, blue: colors.pink, ink: colors.text, muted: colors.textSoft, green: colors.success, red: colors.danger, line: colors.border };
const money = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const futureIso = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); const d = new Date(); d.setHours(h, m, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1); return d.toISOString(); };

function Button({ title, onPress, secondary, disabled }) { return <AppButton title={title} onPress={onPress} secondary={secondary} disabled={disabled} style={s.button} textStyle={secondary ? { color: C.blue } : null} />; }
function Input({ label, ...props }) { return <View style={{ marginBottom: 12 }}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor={C.muted} style={s.input} {...props} /></View>; }
function Card({ title, children }) { return <View style={s.card}>{title ? <Text style={s.cardTitle}>{title}</Text> : null}{children}</View>; }
function Photo({ product, large }) { const uri=product?.foto_url?.startsWith("http")?product.foto_url:product?.foto_url?`${API_URL}${product.foto_url}`:null; return uri ? <Image source={{ uri }} style={[s.photo, large && { height: 220 }]} /> : <View style={[s.photo, s.placeholder, large && { height: 220 }]}><Text style={s.placeholderText}>Foto belum tersedia</Text></View>; }
function Shell({ title, children, logout, offline }) { return <SafeAreaView style={s.root}><View style={s.headerWrap}><View style={s.top}><Text style={s.title}>{title}</Text>{logout ? <Pressable onPress={logout} style={s.logoutButton}><Text style={s.logoutText}>Keluar</Text></Pressable> : null}</View></View>{offline ? <Text style={s.offline}>Mode offline - perubahan membutuhkan koneksi</Text> : null}<ScrollView contentContainerStyle={s.content}>{children}</ScrollView></SafeAreaView>; }

function Auth({ onAuth }) {
  const { width } = useWindowDimensions();
  const wide = width >= 920;
  const [mode, setMode] = useState("login"); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", email: "", password: "", noHp: "", kampus: "", defaultMode: "penitip" });
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  async function submit() { setError(""); if (mode === "register" && form.password.length < 8) { setError("Password minimal 8 karakter"); return; } setLoading(true); try { if (mode === "register") { await api.register(form); const auth = await api.login(form.email, form.password); await onAuth({ ...auth, defaultMode: form.defaultMode }); } else { await onAuth(await api.login(form.email, form.password)); } } catch (e) { setError(e.message); } finally { setLoading(false); } }
  return <Shell title="Jastip Kampus"><View style={[s.authLayout, wide && s.authLayoutWide]}><View style={s.authHero}><Text style={s.authBadge}>PLATFORM JASTIP KAMPUS</Text><Text style={s.authHeroTitle}>Titip belanja kampus, cepat dan transparan.</Text><Text style={s.authHeroText}>Masuk untuk memantau sesi, transaksi, pembayaran escrow, dan tracking dalam satu dashboard.</Text><View style={s.authPillRow}><View style={s.authPill}><Text style={s.authPillText}>Order realtime</Text></View><View style={s.authPill}><Text style={s.authPillText}>Tracking status</Text></View><View style={s.authPill}><Text style={s.authPillText}>Escrow aman</Text></View></View></View><Card title={mode === "login" ? "Masuk" : "Buat akun"}>{mode === "register" ? <><Text style={s.label}>Bergabung sebagai</Text><View style={s.wrap}>{[["penitip","Penitip (Titip Barang)"],["penjastip","Penjastip (Jalan & Belanja)"]].map(([val,lbl])=><Pressable key={val} onPress={()=>set("defaultMode",val)} style={[s.chip,form.defaultMode===val&&s.chipOn]}><Text style={form.defaultMode===val?s.chipTextOn:s.chipText}>{lbl}</Text></Pressable>)}</View><Input label="Nama" value={form.nama} onChangeText={(v) => set("nama", v)} /><Input label="No. HP" value={form.noHp} onChangeText={(v) => set("noHp", v)} /><Input label="Kampus" value={form.kampus} onChangeText={(v) => set("kampus", v)} /></> : null}<Input label="Email" autoCapitalize="none" value={form.email} onChangeText={(v) => set("email", v)} /><Input label={mode === "register" ? "Password (minimal 8 karakter)" : "Password"} secureTextEntry value={form.password} onChangeText={(v) => set("password", v)} />{error ? <Text style={s.error}>{error}</Text> : null}<Button disabled={loading} title={loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"} onPress={submit} /><Button secondary title={mode === "login" ? "Belum punya akun" : "Sudah punya akun"} onPress={() => setMode(mode === "login" ? "register" : "login")} /></Card></View></Shell>;
}

function Penjastip({ token, user, offline, logout }) {
  const [stores, setStores] = useState([]); const [products, setProducts] = useState([]); const [sessions, setSessions] = useState([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]); const [orderTracking, setOrderTracking] = useState({});
  const [store, setStore] = useState({ nama: "", alamat: "", kategori: "" });
  const [product, setProduct] = useState({ tokoId: "", nama: "", kategori: "", harga: "", stok: "", satuan: "pcs", foto: null });
  const [session, setSession] = useState({ storeId: "", productIds: [], batas: "17:00", kapasitas: "10", biayaJasaPerUnit: "5000" });
  async function refresh() { const [a, b, c, d] = await Promise.all([api.myStores(token), api.myProducts(token), api.mySessions(token), api.penjastipTitipan(token)]); const mine=d.titipan||[]; const tracking={}; for(const x of mine){tracking[x.id]=(await api.tracking(x.id,token).catch(()=>({events:[]}))).events||[];} setStores(a.stores || []); setProducts(b.products || []); setSessions(c.sessions || []); setOrders(mine); setOrderTracking(tracking); await storage.saveCache({ owner: user.id, stores: a.stores, products: b.products, sessions: c.sessions, penjastipOrders:mine, orderTracking:tracking }); }
  useEffect(() => { storage.loadCache().then((x) => { if (x?.value?.owner === user.id) { setStores(x.value.stores || []); setProducts(x.value.products || []); setSessions(x.value.sessions || []); setOrders(x.value.penjastipOrders||[]); setOrderTracking(x.value.orderTracking||{}); } }); if (!offline) refresh().catch((e) => setError(e.message)); }, [offline]);
  async function run(action) { if (offline) return setError("Aksi ini membutuhkan koneksi internet."); setBusy(true); setError(""); try { await action(); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function pick(camera) { const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return setError("Izin foto ditolak. Aktifkan melalui Pengaturan."); const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: .8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: .8 }); if (!result.canceled) setProduct((x) => ({ ...x, foto: result.assets[0] })); }
  const storeProducts = products.filter((p) => String(p.store_id) === String(session.storeId) && p.aktif);
  return <Shell title={`Dashboard ${user.nama}`} logout={logout} offline={offline}>{error ? <Text style={s.error}>{error}</Text> : null}{busy ? <ActivityIndicator color={C.blue} /> : null}
    <Card title="Toko Saya"><Input label="Nama toko" value={store.nama} onChangeText={(v) => setStore({ ...store, nama: v })} /><Input label="Alamat" value={store.alamat} onChangeText={(v) => setStore({ ...store, alamat: v })} /><Input label="Kategori toko" value={store.kategori} onChangeText={(v) => setStore({ ...store, kategori: v })} /><Button title="Tambah toko" onPress={() => run(async () => { await api.createStore(store, token); setStore({ nama: "", alamat: "", kategori: "" }); })} />{stores.map((x) => <View key={x.id} style={s.list}><Text style={s.strong}>{x.nama}</Text><Text style={s.muted}>{x.alamat} - {x.kategori}</Text></View>)}</Card>
    <Card title="Produk Saya"><Text style={s.label}>Pilih toko</Text><View style={s.wrap}>{stores.map((x) => <Pressable key={x.id} onPress={() => setProduct({ ...product, tokoId: String(x.id) })} style={[s.chip, String(x.id) === product.tokoId && s.chipOn]}><Text style={String(x.id) === product.tokoId ? s.chipTextOn : s.chipText}>{x.nama}</Text></Pressable>)}</View><Input label="Nama produk" value={product.nama} onChangeText={(v) => setProduct({ ...product, nama: v })} /><Input label="Kategori" value={product.kategori} onChangeText={(v) => setProduct({ ...product, kategori: v })} /><Input label="Harga" keyboardType="numeric" value={product.harga} onChangeText={(v) => setProduct({ ...product, harga: v })} /><Input label="Stok" keyboardType="numeric" value={product.stok} onChangeText={(v) => setProduct({ ...product, stok: v })} /><Input label="Satuan" value={product.satuan} onChangeText={(v) => setProduct({ ...product, satuan: v })} />{product.foto ? <Image source={{ uri: product.foto.uri }} style={s.preview} /> : <View style={[s.preview, s.placeholder]}><Text style={s.placeholderText}>Foto wajib dipilih</Text></View>}<View style={s.row}><Button secondary title="Galeri" onPress={() => pick(false)} /><Button secondary title="Kamera" onPress={() => pick(true)} />{product.foto ? <Button secondary title="Hapus foto" onPress={() => setProduct({ ...product, foto: null })} /> : null}</View><Button title="Tambah produk" onPress={() => run(async () => { await api.createProduct(product, token); setProduct({ tokoId: "", nama: "", kategori: "", harga: "", stok: "", satuan: "pcs", foto: null }); })} />{products.map((x) => <View key={x.id} style={s.product}><Photo product={x} /><View style={{ flex: 1 }}><Text style={s.strong}>{x.nama}</Text><Text style={s.muted}>{x.toko_nama} - {money(x.harga)} - stok {x.stok}</Text><Text style={{ color: x.aktif ? C.green : C.red }}>{x.aktif ? "Aktif" : "Nonaktif"}</Text>{x.aktif ? <Pressable onPress={() => run(() => api.disableProduct(x.id, token))}><Text style={{ color: C.red, fontWeight: "700" }}>Nonaktifkan</Text></Pressable> : null}</View></View>)}</Card>
    <Card title="Buka Sesi"><Text style={s.label}>Toko</Text><View style={s.wrap}>{stores.map((x) => <Pressable key={x.id} onPress={() => setSession({ ...session, storeId: String(x.id), productIds: [] })} style={[s.chip, String(x.id) === session.storeId && s.chipOn]}><Text style={String(x.id) === session.storeId ? s.chipTextOn : s.chipText}>{x.nama}</Text></Pressable>)}</View><Text style={s.label}>Produk sesi</Text>{storeProducts.map((x) => { const on = session.productIds.includes(x.id); return <Pressable key={x.id} onPress={() => setSession({ ...session, productIds: on ? session.productIds.filter((id) => id !== x.id) : [...session.productIds, x.id] })} style={s.check}><Text>{on ? "☑" : "☐"} {x.nama}</Text></Pressable>; })}<Input label="Batas waktu (HH:MM)" value={session.batas} onChangeText={(v) => setSession({ ...session, batas: v })} /><Input label="Kapasitas" keyboardType="numeric" value={session.kapasitas} onChangeText={(v) => setSession({ ...session, kapasitas: v })} /><Input label="Biaya jasa per unit" keyboardType="numeric" value={session.biayaJasaPerUnit} onChangeText={(v) => setSession({...session,biayaJasaPerUnit:v})}/><Button title="Buka sesi" onPress={() => run(() => api.createSession({ storeId: Number(session.storeId), productIds: session.productIds, batasWaktu: futureIso(session.batas), kapasitas: Number(session.kapasitas), biayaJasaPerUnit:Number(session.biayaJasaPerUnit) }, token))} /></Card>
    <Card title="Sesi Saya">{sessions.length ? sessions.map((x) => <View key={x.id} style={s.list}><Text style={s.strong}>{x.store_name}</Text><Text style={s.muted}>{x.status} - kapasitas {x.kapasitas_terpakai}/{x.kapasitas_maksimal} · jasa {money(x.biaya_jasa_per_unit)}/unit</Text><Text style={s.muted}>{(x.products || []).map((p) => p.nama).join(", ")}</Text></View>) : <Text style={s.muted}>Belum ada sesi.</Text>}</Card>
    <Card title="Tawaran Masuk">{orders.filter(x=>x.status==="menunggu_tawaran"&&x.latest_offer?.status==="pending").map(x=><View key={x.id} style={s.list}><Text style={s.strong}>{x.product_name} · qty {x.qty}</Text><Text style={s.muted}>{x.customer_name} · ronde {x.latest_offer.round} · {money(x.latest_offer.amount_per_unit)}/unit</Text><Text style={s.muted}>Berlaku sampai {new Date(x.reservation_expires_at).toLocaleString("id-ID")}</Text><View style={s.row}><Button title="Terima" onPress={()=>run(()=>api.decideOffer(x.latest_offer.id,"accepted",token))}/><Button secondary title="Tolak" onPress={()=>run(()=>api.decideOffer(x.latest_offer.id,"rejected",token))}/></View></View>)}{!orders.some(x=>x.status==="menunggu_tawaran"&&x.latest_offer?.status==="pending")?<Text style={s.muted}>Tidak ada tawaran pending.</Text>:null}</Card>
    <Card title="Titipan Aktif">{orders.filter(x=>["dibayar","selesai"].includes(x.status)).map(x=>{const events=orderTracking[x.id]||[],latest=events.at(-1)?.status,next={dititip:"dibelanjakan",dibelanjakan:"diantar"}[latest];return <View key={x.id} style={s.list}><Text style={s.strong}>#{x.id} · {x.product_name} · qty {x.qty}</Text><Text style={s.muted}>{x.customer_name} · {x.store_name} · titipan {x.status}</Text><Text style={s.muted}>Tracking terakhir: {latest||"menunggu event pembayaran"}</Text>{next?<Button title={`Ubah ke ${next}`} onPress={()=>run(()=>api.advanceTracking({titipanId:x.id,status:next},token))}/>:null}{x.status==="selesai"?<Text style={s.success}>Transaksi selesai dan escrow telah dilepas.</Text>:null}</View>})}{!orders.some(x=>["dibayar","selesai"].includes(x.status))?<Text style={s.muted}>Belum ada titipan aktif.</Text>:null}</Card>
  </Shell>;
}

const adminTabs = ["Ringkasan", "Pengguna", "Toko", "Produk", "Sesi", "Transaksi", "Tracking", "Audit"];
function AdminDashboard({ token, user, offline, logout }) {
  const { width } = useWindowDimensions(); const desktop = width >= 900; const tablet = width >= 600;
  const [tab, setTab] = useState("Ringkasan"); const [data, setData] = useState({ users: [], stores: [], products: [], sessions: [], orders: [], payments: [], tracking: [], audit: [] });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [q, setQ] = useState("");
  const emptyUser = { nama: "", email: "", password: "", noHp: "", kampus: "", role: "penitip" };
  const emptyStore = { ownerId: "", nama: "", alamat: "", kategori: "" };
  const emptyProduct = { tokoId: "", nama: "", kategori: "", harga: "", stok: "", satuan: "pcs", foto: null };
  const [userForm, setUserForm] = useState(emptyUser); const [storeForm, setStoreForm] = useState(emptyStore); const [productForm, setProductForm] = useState(emptyProduct);
  const [editing, setEditing] = useState({ user: null, store: null, product: null });
  async function refresh() {
    const result = await Promise.all([api.adminUsers(token, q), api.adminStores(token, q), api.adminProducts(token, q), api.adminSessions(token), api.adminOrders(token), api.adminPayments(token), api.adminTracking(token), api.adminAudit(token)]);
    const next = { users: result[0].users || [], stores: result[1].stores || [], products: result[2].products || [], sessions: result[3].sessions || [], orders: result[4].orders || [], payments: result[5].payments || [], tracking: result[6].events || [], audit: result[7].audit || [] };
    setData(next); await storage.saveCache({ admin: user.id, data: next });
  }
  useEffect(() => { storage.loadCache().then((x) => { if (x?.value?.admin === user.id) setData(x.value.data || data); }); if (!offline) refresh().catch((e) => setError(e.message)); }, [offline]);
  async function run(action) { if (offline) return setError("Perubahan data admin membutuhkan koneksi internet."); setBusy(true); setError(""); try { await action(); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function pickAdminPhoto(camera) { const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return setError("Izin foto ditolak."); const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: .8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: .8 }); if (!result.canceled) setProductForm({ ...productForm, foto: result.assets[0] }); }
  const owners = data.users.filter((x) => x.role === "penjastip" && x.aktif);
  const nav = <View style={[s.adminNav, desktop && s.adminSidebar]}>{adminTabs.map((x) => <Pressable key={x} onPress={() => setTab(x)} style={[s.navItem, tab === x && s.navOn]}><Text style={tab === x ? s.navTextOn : s.navText}>{x}</Text></Pressable>)}</View>;
  const actions = (onEdit, onDelete, active = true) => <View style={s.row}><Button secondary title="Edit" onPress={onEdit} />{active ? <Button secondary title="Nonaktifkan" onPress={onDelete} /> : null}</View>;
  let content;
  if (tab === "Ringkasan") content = <><View style={[s.stats, tablet && s.statsWide]}>{[["Pengguna", data.users.length], ["Toko", data.stores.length], ["Produk", data.products.length], ["Sesi aktif", data.sessions.filter((x) => x.status === "buka").length], ["Titipan", data.orders.length], ["Pembayaran", data.payments.length]].map(([label, value]) => <View key={label} style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.muted}>{label}</Text></View>)}</View><Card title="Status sistem"><Text style={s.success}>Dashboard tersambung ke seluruh service.</Text><Text style={s.muted}>Gunakan menu untuk mengelola master data dan memantau transaksi.</Text></Card></>;
  if (tab === "Pengguna") content = <><Card title={editing.user ? `Edit akun #${editing.user}` : "Tambah akun"}><Input label="Nama" value={userForm.nama} onChangeText={(v) => setUserForm({ ...userForm, nama: v })} /><Input label="Email" autoCapitalize="none" value={userForm.email} onChangeText={(v) => setUserForm({ ...userForm, email: v })} /><Input label={editing.user ? "Password baru (opsional)" : "Password minimal 8 karakter"} secureTextEntry value={userForm.password} onChangeText={(v) => setUserForm({ ...userForm, password: v })} /><View style={s.wrap}>{["penitip", "penjastip", "admin"].map((role) => <Pressable key={role} onPress={() => setUserForm({ ...userForm, role })} style={[s.chip, userForm.role === role && s.chipOn]}><Text style={userForm.role === role ? s.chipTextOn : s.chipText}>{role}</Text></Pressable>)}</View><Button title="Simpan akun" onPress={() => run(async () => { const payload = { ...userForm }; if (editing.user && !payload.password) delete payload.password; editing.user ? await api.adminUpdateUser(editing.user, payload, token) : await api.adminCreateUser(payload, token); setUserForm(emptyUser); setEditing({ ...editing, user: null }); })} /></Card>{[["admin","Administrator"],["penjastip","Penjastip"],["penitip","Penitip"]].map(([role,label])=>{const list=data.users.filter(x=>x.role===role);return list.length?<View key={role}><View style={s.sectionBadge}><Text style={s.sectionBadgeText}>{label} ({list.length})</Text></View>{list.map(x=><Card key={x.id}><Text style={s.strong}>{x.nama}</Text><Text style={s.muted}>{x.email} · {x.aktif?"aktif":"nonaktif"} · {x.kampus||"-"}</Text>{actions(()=>{setEditing({...editing,user:x.id});setUserForm({nama:x.nama,email:x.email,password:"",noHp:x.no_hp||"",kampus:x.kampus||"",role:x.role})},()=>run(()=>api.adminDeleteUser(x.id,token)),x.aktif)}</Card>)}</View>:null})}</>;
  if (tab === "Toko") content = <><Card title={editing.store ? `Edit toko #${editing.store}` : "Tambah toko"}><Text style={s.label}>Owner penjastip</Text><View style={s.wrap}>{owners.map((x) => <Pressable key={x.id} onPress={() => setStoreForm({ ...storeForm, ownerId: String(x.id) })} style={[s.chip, storeForm.ownerId === String(x.id) && s.chipOn]}><Text style={storeForm.ownerId === String(x.id) ? s.chipTextOn : s.chipText}>{x.nama}</Text></Pressable>)}</View><Input label="Nama toko" value={storeForm.nama} onChangeText={(v) => setStoreForm({ ...storeForm, nama: v })} /><Input label="Alamat" value={storeForm.alamat} onChangeText={(v) => setStoreForm({ ...storeForm, alamat: v })} /><Input label="Kategori" value={storeForm.kategori} onChangeText={(v) => setStoreForm({ ...storeForm, kategori: v })} /><Button title="Simpan toko" onPress={() => run(async () => { editing.store ? await api.adminUpdateStore(editing.store, storeForm, token) : await api.adminCreateStore(storeForm, token); setStoreForm(emptyStore); setEditing({ ...editing, store: null }); })} /></Card>{data.stores.map((x) => <Card key={x.id}><Text style={s.strong}>{x.nama}</Text><Text style={s.muted}>{x.alamat} · owner #{x.owner_id} · {x.aktif ? "aktif" : "nonaktif"}</Text>{actions(() => { setEditing({ ...editing, store: x.id }); setStoreForm({ ownerId: String(x.owner_id), nama: x.nama, alamat: x.alamat, kategori: x.kategori }); }, () => run(() => api.adminDeleteStore(x.id, token)), x.aktif)}</Card>)}</>;
  if (tab === "Produk") content = <><Card title={editing.product ? `Edit produk #${editing.product}` : "Tambah produk"}><Text style={s.label}>Toko</Text><View style={s.wrap}>{data.stores.filter((x) => x.aktif).map((x) => <Pressable key={x.id} onPress={() => setProductForm({ ...productForm, tokoId: String(x.id) })} style={[s.chip, productForm.tokoId === String(x.id) && s.chipOn]}><Text style={productForm.tokoId === String(x.id) ? s.chipTextOn : s.chipText}>{x.nama}</Text></Pressable>)}</View><Input label="Nama" value={productForm.nama} onChangeText={(v) => setProductForm({ ...productForm, nama: v })} /><Input label="Kategori" value={productForm.kategori} onChangeText={(v) => setProductForm({ ...productForm, kategori: v })} /><Input label="Harga" keyboardType="numeric" value={productForm.harga} onChangeText={(v) => setProductForm({ ...productForm, harga: v })} /><Input label="Stok" keyboardType="numeric" value={productForm.stok} onChangeText={(v) => setProductForm({ ...productForm, stok: v })} /><Input label="Satuan" value={productForm.satuan} onChangeText={(v) => setProductForm({ ...productForm, satuan: v })} />{productForm.foto ? <Image source={{ uri: productForm.foto.uri }} style={s.preview} /> : null}<View style={s.row}><Button secondary title="Galeri" onPress={() => pickAdminPhoto(false)} /><Button secondary title="Kamera" onPress={() => pickAdminPhoto(true)} /></View><Button title="Simpan produk" onPress={() => run(async () => { editing.product ? await api.adminUpdateProduct(editing.product, productForm, token) : await api.adminCreateProduct(productForm, token); setProductForm(emptyProduct); setEditing({ ...editing, product: null }); })} /></Card>{data.products.map((x) => <Card key={x.id}><View style={s.product}><Photo product={x} /><View style={{ flex: 1 }}><Text style={s.strong}>{x.nama}</Text><Text style={s.muted}>{x.toko_nama} · {money(x.harga)} · stok {x.stok} · {x.aktif ? "aktif" : "nonaktif"}</Text>{actions(() => { setEditing({ ...editing, product: x.id }); setProductForm({ tokoId: String(x.toko_id), nama: x.nama, kategori: x.kategori, harga: String(x.harga), stok: String(x.stok), satuan: x.satuan, foto: null }); }, () => run(() => api.adminDeleteProduct(x.id, token)), x.aktif)}</View></View></Card>)}</>;
  if (tab === "Sesi") content = data.sessions.map((x) => <Card key={x.id}><Text style={s.strong}>#{x.id} · {x.toko_nama}</Text><Text style={s.muted}>{x.status} · {x.kapasitas_terpakai}/{x.kapasitas_maksimal} · owner #{x.pembuka}</Text>{x.status === "buka" ? <Button secondary title="Tutup sesi" onPress={() => run(() => api.adminCloseSession(x.id, token))} /> : null}</Card>);
  if (tab === "Transaksi") content = <>{data.orders.map((x) => <Card key={`o${x.id}`}><Text style={s.strong}>Titipan #{x.id} · {x.product_name}</Text><Text style={s.muted}>{x.status} · {money(x.total)} · qty {x.qty}</Text><View style={s.row}>{x.status === "menunggu_pembayaran" ? <Button secondary title="Batalkan" onPress={() => run(() => api.adminOrderStatus(x.id, "dibatalkan", token))} /> : null}{x.status === "dibayar" ? <><Button secondary title="Selesaikan" onPress={() => run(() => api.adminOrderStatus(x.id, "selesai", token))} /><Button secondary title="Batalkan" onPress={() => run(() => api.adminOrderStatus(x.id, "dibatalkan", token))} /></> : null}</View></Card>)}{data.payments.map((x) => <Card key={`p${x.id}`}><Text style={s.strong}>Pembayaran #{x.id} · titipan #{x.titipan_id}</Text><Text style={s.muted}>{x.status} · {money(x.amount)}</Text>{x.status === "tertahan" ? <View style={s.row}><Button secondary title="Release" onPress={() => run(() => api.adminPaymentStatus(x.id, "dilepas", token))} /><Button secondary title="Refund" onPress={() => run(() => api.adminPaymentStatus(x.id, "dikembalikan", token))} /></View> : null}</Card>)}</>;
  if (tab === "Tracking") content = data.tracking.length ? data.tracking.map((x) => <Card key={x.id}><Text style={s.strong}>Titipan #{x.titipan_id} · {x.status}</Text><Text style={s.muted}>{x.note || "Tanpa keterangan"} · {x.created_at}</Text></Card>) : <Card><Text style={s.muted}>Belum ada tracking.</Text></Card>;
  if (tab === "Audit") content = data.audit.length ? data.audit.map((x) => <Card key={x.id}><Text style={s.strong}>{x.action} · {x.resource_type} #{x.resource_id}</Text><Text style={s.muted}>Admin #{x.actor_id} · {x.created_at}</Text></Card>) : <Card><Text style={s.muted}>Belum ada aktivitas admin.</Text></Card>;
  return <Shell title={`Admin · ${user.nama}`} logout={logout} offline={offline}><View style={desktop ? s.adminLayout : null}>{nav}<View style={desktop ? s.adminMain : null}>{error ? <Text style={s.error}>{error}</Text> : null}<View style={s.row}><Input label="Cari master data" value={q} onChangeText={setQ} /><Button secondary title="Muat ulang" disabled={busy} onPress={() => run(async () => {})} /></View>{busy ? <ActivityIndicator color={C.blue} /> : null}{content}</View></View></Shell>;
}

function Penitip({ token, user, offline, logout }) {
  const tabs=["Sesi","Detail","Tawaran & Bayar","Tracking","Riwayat"];const[tab,setTab]=useState("Sesi");const[sessions,setSessions]=useState([]);const[orders,setOrders]=useState([]);const[chosen,setChosen]=useState(null);const[qty,setQty]=useState("5");const[variant,setVariant]=useState("");const[note,setNote]=useState("");const[offer,setOffer]=useState("");const[message,setMessage]=useState("");const[events,setEvents]=useState([]);const[payments,setPayments]=useState({});const[historyTracking,setHistoryTracking]=useState({});const[revisions,setRevisions]=useState({});const[busy,setBusy]=useState(false);
  async function refresh(){const[a,b]=await Promise.all([api.sessions(),api.myTitipan(token)]),history=b.titipan||[];const paymentEntries=await Promise.all(history.map(async x=>[x.id,await api.payment(x.id,token).catch(()=>null)]));const trackingEntries=await Promise.all(history.map(async x=>[x.id,(await api.tracking(x.id,token).catch(()=>({events:[]}))).events||[]]));const paymentMap=Object.fromEntries(paymentEntries),trackingMap=Object.fromEntries(trackingEntries);setSessions(a.sessions||[]);setOrders(history);setPayments(paymentMap);setHistoryTracking(trackingMap);await storage.saveCache({publicSessions:a.sessions||[],history,owner:user.id,payments:paymentMap,historyTracking:trackingMap})}
  useEffect(()=>{storage.loadCache().then(x=>{if(x?.value?.owner===user.id){setSessions(x.value.publicSessions||[]);setOrders(x.value.history||[]);setPayments(x.value.payments||{});setHistoryTracking(x.value.historyTracking||{})}});if(!offline)refresh().catch(e=>setMessage(e.message))},[offline]);
  const products=useMemo(()=>sessions.flatMap(session=>(session.products||[]).map(product=>({...product,session}))),[sessions]);
  async function create(mode){const qtyNum=Number(qty);if(!Number.isInteger(qtyNum)||qtyNum<5){setMessage("Jumlah minimal 5.");return;}const key=`titipan-${user.id}-${Date.now()}`,payload={sesiId:chosen.session.id,barangId:chosen.id,qty:qtyNum,varian:variant,catatan:note,mode,...(mode==="tawar"?{tawaranJasaPerUnit:Number(offer)}:{})};if(offline){await enqueue({id:key,path:"/v1/titipan",options:{method:"POST",token,headers:{"Idempotency-Key":key},body:JSON.stringify(payload)},status:"menunggu_sinkronisasi"});setMessage("Titipan disimpan di outbox dan menunggu sinkronisasi.");setTab("Riwayat");return}try{const result=await api.createTitipan(payload,token,key);setMessage(`Titipan #${result.id} dibuat.`);setChosen(null);setTab("Tawaran & Bayar");await refresh()}catch(e){setMessage(e.message)}}
  async function online(action){if(offline)return setMessage("Aksi ini membutuhkan koneksi internet.");setBusy(true);try{await action()}catch(e){setMessage(e.message)}finally{setBusy(false)}}
  async function pay(item){await online(async()=>{await api.pay({titipanId:item.id,amount:item.total,method:"simulasi"},`pay-${item.id}`,token);setMessage("Dana escrow berhasil ditahan.");await refresh()})}
  async function revise(item){const amount=Number(revisions[item.id]);if(!Number.isInteger(amount)||amount<0)return setMessage("Isi revisi biaya jasa yang valid.");await online(async()=>{await api.reviseOffer(item.id,amount,token);setMessage("Revisi tawaran berhasil dikirim.");await refresh()})}
  async function cancel(item){await online(async()=>{await api.cancelTitipan(item.id,token);setMessage("Titipan dibatalkan dan kapasitas dikembalikan.");await refresh()})}
  async function showTracking(item){try{setEvents((await api.tracking(item.id,token)).events||[]);setChosen(item);setTab("Tracking")}catch(e){setMessage(e.message)}}
  async function confirm(item){await online(async()=>{await api.confirmReceived(item.id,token);setMessage("Barang diterima. Menunggu pelepasan escrow otomatis...");for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,1000));await refresh();const p=await api.payment(item.id,token).catch(()=>null);if(p?.status==="dilepas")break}await showTracking(item);setMessage("Konfirmasi selesai; pembayaran dan riwayat telah diperbarui.")})}
  let content;
  if(tab==="Sesi")content=<>{products.length?products.map(x=><Pressable key={`${x.session.id}-${x.id}`} onPress={()=>{setChosen(x);setTab("Detail")}} style={s.catalog}><Photo product={x} large/><Text style={s.cardTitle}>{x.nama}</Text><Text style={s.muted}>{x.session.store_name} · {money(x.harga)}/{x.satuan}</Text><Text style={s.muted}>Sisa kapasitas {x.session.kapasitas_tersisa} · jasa {money(x.session.biaya_jasa_per_unit)}/unit</Text></Pressable>):<Card><Text style={s.muted}>Belum ada sesi aktif.</Text></Card>}</>;
  if(tab==="Detail")content=chosen?<Card title={chosen.nama}><Photo product={chosen} large/><Text style={s.muted}>Deadline {new Date(chosen.session.batas_waktu).toLocaleString("id-ID")}</Text><Input label="Jumlah (min. 5)" keyboardType="numeric" value={qty} onChangeText={setQty} placeholder="Ketik jumlah..."/><View style={s.wrap}>{[5,10,15,20,25,30].map(n=><Pressable key={n} onPress={()=>setQty(String(n))} style={[s.chip,qty===String(n)&&s.chipOn]}><Text style={qty===String(n)?s.chipTextOn:s.chipText}>{n}</Text></Pressable>)}</View><Input label="Varian" value={variant} onChangeText={setVariant}/><Input label="Catatan" value={note} onChangeText={setNote}/><Button title="Titip langsung" onPress={()=>create("langsung")}/><Input label="Tawaran jasa per unit" keyboardType="numeric" value={offer} onChangeText={setOffer}/><Button secondary title="Ajukan tawaran" onPress={()=>create("tawar")}/></Card>:<Card><Text>Pilih produk dari daftar sesi.</Text></Card>;
  if(tab==="Tawaran & Bayar")content=<>{orders.map(x=>{
  const lastTracking=(historyTracking[x.id]||[]).at(-1)?.status;

  return <Card key={x.id} title={`Titipan #${x.id}`}>
    <Text style={s.muted}>
      {x.product_name} · {x.status} · {money(x.total)}
    </Text>

    {x.latest_offer?
      <Text style={s.muted}>
        Tawaran ronde {x.latest_offer.round}: {money(x.latest_offer.amount_per_unit)} ({x.latest_offer.status})
      </Text>
    :null}

    {x.status==="menunggu_pembayaran"?
      <Button
        disabled={busy}
        title="Bayar escrow simulasi"
        onPress={()=>pay(x)}
      />
    :null}

    {x.status==="tawaran_ditolak"?
      <>
        <Input
          label="Revisi biaya jasa per unit"
          keyboardType="numeric"
          value={revisions[x.id]||""}
          onChangeText={v=>setRevisions({...revisions,[x.id]:v})}
        />

        <View style={s.row}>
          <Button
            disabled={busy}
            title="Kirim revisi"
            onPress={()=>revise(x)}
          />

          <Button
            secondary
            disabled={busy}
            title="Batalkan titipan"
            onPress={()=>cancel(x)}
          />
        </View>
      </>
    :null}

    <Text style={s.muted}>
      Pembayaran: {payments[x.id]?.status||"belum ada"}
    </Text>

    <Text style={s.muted}>
      Tracking: {lastTracking||"belum ada"}
    </Text>

    {lastTracking==="diantar"?
      <Button
        disabled={busy}
        title="Konfirmasi barang diterima"
        onPress={()=>confirm(x)}
      />
    :null}

    {lastTracking==="diterima"?
      <Text style={s.success}>
        Barang telah diterima.
        Escrow: {payments[x.id]?.status||"diproses"}.
      </Text>
    :null}

    <Button
      secondary
      title="Lihat tracking"
      onPress={()=>showTracking(x)}
    />
  </Card>
})}</>;
  if(tab==="Tracking")content=<Card title={chosen?`Tracking #${chosen.id}`:"Tracking"}>{events.length?events.map(e=><View key={e.id} style={s.list}><Text style={s.strong}>{e.status}</Text><Text style={s.muted}>{new Date(e.created_at).toLocaleString("id-ID")} {e.note||""}</Text></View>):<Text style={s.muted}>Belum ada event tracking.</Text>}{events.at(-1)?.status==="diantar"?<Button disabled={busy} title="Konfirmasi barang diterima" onPress={()=>confirm(chosen)}/>:null}{events.at(-1)?.status==="diterima"?<Text style={s.success}>Barang telah diterima. Escrow: {payments[chosen?.id]?.status||"diproses"}.</Text>:null}</Card>;
  if(tab==="Riwayat")content=<>{orders.length?orders.map(x=>{
  const tracking=(historyTracking[x.id]||[]).at(-1)?.status;
  const paymentStatus =
    payments[x.id]?.status ||
    (x.status==="dibayar" ? "tertahan" :
     x.status==="selesai" ? "dilepas" :
     "belum ada");

  return <Card key={x.id} title={`#${x.id} · ${x.product_name}`}>
    <Text style={s.muted}>
      {x.store_name} · qty {x.qty} · {money(x.total)}
    </Text>
    <Text style={s.muted}>
      Titipan: {x.status} · Pembayaran: {paymentStatus} · Tracking: {tracking||"belum ada"}
    </Text>
    {x.latest_offer?<Text style={s.muted}>
      Tawaran terakhir ronde {x.latest_offer.round}: {money(x.latest_offer.amount_per_unit)} ({x.latest_offer.status})
    </Text>:null}
    {x.status==="selesai"&&paymentStatus==="dilepas"?
      <Text style={s.success}>Transaksi selesai · dana telah dilepas.</Text>
    :null}
  </Card>
}):<Card><Text style={s.muted}>Riwayat kosong. Data terakhir tetap tersedia saat offline.</Text></Card>}</>;
  return <Shell title="Jastip Kampus · Penitip" logout={logout} offline={offline}><View style={s.wrap}>{tabs.map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[s.chip,tab===x&&s.chipOn]}><Text style={tab===x?s.chipTextOn:s.chipText}>{x}</Text></Pressable>)}</View>{message?<Text style={s.success}>{message}</Text>:null}{busy?<ActivityIndicator color={C.blue}/>:null}{content}</Shell>
}

export default function App() {
  const [auth, setAuth] = useState(null); const [offline, setOffline] = useState(false); const [ready, setReady] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  useEffect(() => { storage.loadAuth().then(async (x) => { if (x?.token) { try { await api.me(x.token); setAuth(x); if (x.defaultMode) setActiveMode(x.defaultMode); } catch { await storage.clearAll(); } } setReady(true); }); return NetInfo.addEventListener((x) => setOffline(!(x.isConnected && x.isInternetReachable !== false))); }, []);
  useEffect(() => { if (!offline && auth?.token) flushOutbox().catch(() => null); }, [offline, auth?.token]);
  async function logged(value) { setAuth(value); if (value.defaultMode) setActiveMode(value.defaultMode); await storage.saveAuth(value); }
  async function logout() { setAuth(null); setActiveMode(null); await storage.clearAuth(); }
  if (!ready) return <View style={[s.root, { justifyContent: "center" }]}><ActivityIndicator color={C.blue} /></View>;
  if (!auth) return <Auth onAuth={logged} />;
  if (auth.user.roles?.includes("admin")) return <AdminDashboard token={auth.token} user={auth.user} offline={offline} logout={logout} />;
  const resolvedMode = activeMode || "penitip";
  return resolvedMode === "penjastip" ? <Penjastip token={auth.token} user={auth.user} offline={offline} logout={logout} /> : <Penitip token={auth.token} user={auth.user} offline={offline} logout={logout} />;
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  headerWrap: {
    backgroundColor: C.blue,
    paddingBottom: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#0A3E7C",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  top: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: C.blue,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0A3E7C",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardTitle: {
    color: C.ink,
    fontWeight: "900",
    fontSize: 24,
    marginBottom: 12,
  },
  label: {
    color: C.ink,
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    padding: 14,
    color: C.ink,
    backgroundColor: "#f5f9ff",
    minWidth: 180,
    fontSize: 17,
    shadowColor: "#0A3E7C",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  button: {
    marginVertical: 6,
    flexGrow: 1,
  },
  secondary: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.blue,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#f5f9ff",
  },
  chipOn: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  chipText: {
    color: C.ink,
    fontWeight: "700",
  },
  chipTextOn: {
    color: "white",
    fontWeight: "800",
  },
  list: {
    borderTopWidth: 1,
    borderColor: C.line,
    paddingVertical: 12,
  },
  strong: {
    color: C.ink,
    fontWeight: "800",
  },
  muted: {
    color: C.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  error: {
    color: C.red,
    fontWeight: "800",
    marginBottom: 12,
  },
  success: {
    color: C.green,
    fontWeight: "800",
    marginBottom: 12,
  },
  offline: {
    backgroundColor: "#f59e0b",
    color: "white",
    padding: 9,
    textAlign: "center",
    fontWeight: "700",
  },
  product: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingVertical: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: C.muted,
    textAlign: "center",
    padding: 8,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#e2e8f0",
  },
  check: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  catalog: {
    backgroundColor: C.card,
    borderRadius: 22,
    overflow: "hidden",
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: "#0A3E7C",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  adminLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },
  adminMain: {
    flex: 1,
    minWidth: 0,
  },
  adminNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  adminSidebar: {
    width: 190,
    flexDirection: "column",
    flexShrink: 0,
  },
  navItem: {
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
  },
  navOn: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  navText: {
    color: C.ink,
    fontWeight: "700",
  },
  navTextOn: {
    color: "white",
    fontWeight: "800",
  },
  stats: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 14,
  },
  authLayout: {
    gap: 16,
  },
  authLayoutWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  authHero: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#0B63CE",
    padding: 22,
    shadowColor: "#0A3E7C",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    minHeight: 260,
  },
  authBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 11,
  },
  authHeroTitle: {
    color: "#ffffff",
    marginTop: 14,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  authHeroText: {
    color: "#DBEAFE",
    marginTop: 10,
    lineHeight: 22,
    fontSize: 15,
  },
  authPillRow: {
    marginTop: 16,
    gap: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  authPill: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  authPillText: {
    color: "#0A3E7C",
    fontWeight: "800",
    fontSize: 12,
  },
  sectionBadge: {
    backgroundColor: C.blue,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  sectionBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  stat: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    padding: 16,
    minWidth: 145,
    flexGrow: 1,
  },
  statValue: {
    color: C.blue,
    fontSize: 28,
    fontWeight: "900",
  },
});
