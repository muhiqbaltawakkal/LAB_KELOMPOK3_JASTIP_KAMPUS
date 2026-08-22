// Manifest demo ternormalisasi dari JastipKampus_Dataset.xlsx.
// File ini sengaja berbentuk JavaScript agar deadline sesi aktif dapat dihitung relatif.
const accounts = [
  [1,"P001","Andi Rizki Pratama","andi.rizki@unismuh.ac.id","081234567001","Universitas Muhammadiyah Makassar","penitip"],
  [2,"P002","Siti Rahmawati","siti.rahma@unhas.ac.id","081234567002","Universitas Hasanuddin","penitip"],
  [3,"P003","Muhammad Fauzi","m.fauzi@uin-alauddin.ac.id","081234567003","UIN Alauddin Makassar","penitip"],
  [4,"P004","Nurul Hidayah","nurul.hidayah@stie-tri.ac.id","081234567004","STIE Tri Dharma Nusantara","penitip"],
  [5,"P005","Bagas Sulistyo","bagas.suli@polmed.ac.id","081234567005","Politeknik Negeri Ujung Pandang","penitip"],
  [6,"J001","Rizki Amalia Rasyid","rizki.amalia@unismuh.ac.id","082345678001","Universitas Muhammadiyah Makassar","penjastip"],
  [7,"J002","Muh. Iqbal Tawakkal","iqbal.tawakkal@unhas.ac.id","082345678002","Universitas Hasanuddin","penjastip"],
  [8,"J003","Putri Handayani","putri.handa@uin-alauddin.ac.id","082345678003","UIN Alauddin Makassar","penjastip"],
  [9,"J004","Dika Pratama","dika.pratama@polmed.ac.id","082345678004","Politeknik Negeri Ujung Pandang","penjastip"],
].map(([id,sourceId,nama,email,noHp,kampus,label])=>({id,sourceId,nama,email,noHp,kampus,label}));

const storesRaw = [
  [1,"Chatime Losari","Minuman Kekinian","Jl. Penghibur No.12, Makassar"],[2,"Mie Titi Makassar","Makanan Khas","Jl. Irian No.18, Makassar"],
  [3,"Gramedia Karebosi","Buku & Alat Tulis","Mall Karebosi Link Lt.2, Makassar"],[4,"Samsung Experience Store","Elektronik","Mall Ratu Indah Lt.1, Makassar"],
  [5,"Indomaret Tamalanrea","Minimarket","Jl. Tamalanrea Indah No.5, Makassar"],[6,"Pallubasa Serigala","Kuliner Khas","Jl. Serigala No.40, Makassar"],
  [7,"Kopi Janji Jiwa Unhas","Kafe & Kopi","Jl. Perintis Kemerdekaan Km.10, Makassar"],[8,"McDonald's Panakukang","Fast Food","Mall Panakukang Lt.1, Makassar"],
  [9,"Es Pisang Ijo Irwan","Kuliner Khas","Jl. Penghibur No.8, Makassar"],[10,"Alfamart Hertasning","Minimarket","Jl. Hertasning No.22, Makassar"],
  [11,"KFC Hasanuddin","Fast Food","Jl. Jend. Sudirman No.5, Makassar"],[12,"Toko Buku Fajar","Buku & Alat Tulis","Jl. Cokroaminoto No.9, Makassar"],
  [13,"Pisang Goreng Mafia","Kuliner Khas","Jl. Boulevard No.3, Makassar"],[14,"Miniso Panakukang","Lifestyle & Aksesoris","Mall Panakukang Lt.2, Makassar"],
  [15,"Apotek Kimia Farma","Apotek & Kesehatan","Jl. Veteran Selatan No.8, Makassar"],[16,"Sop Saudara Mandiri","Makanan Khas","Jl. Andalas No.7, Makassar"],
  [17,"Starbucks Trans Studio","Kafe & Kopi","Trans Studio Mall Lt.1, Makassar"],[18,"BurgerKing Panakukang","Fast Food","Mall Panakukang Lt.LG, Makassar"],
  [19,"Erafone MaRI","Elektronik","Mall Ratu Indah Lt.2, Makassar"],[20,"Lawson Tamalanrea","Minimarket","Jl. Tamalanrea Raya No.3, Makassar"],
];
const ownerForStore = (id) => [6,7,8,9][(id-1)%4];
const stores = storesRaw.map(([id,nama,kategori,alamat])=>({id,nama,kategori,alamat,ownerId:ownerForStore(id)}));

const productsRaw = [
 [1,1,"Brown Sugar Boba Milk Tea (L)","Minuman",42000,"pcs",100,"01_brown_sugar_boba_milk_tea_L.jpg"],
 [2,1,"Matcha Latte (M)","Minuman",35000,"pcs",100,"02_matcha_latte_M.jpg"],[3,1,"Tiger Sugar Boba","Minuman",38000,"pcs",20,"03_tiger_sugar_boba.jpg"],[4,1,"Taro Milk Tea L","Minuman",40000,"pcs",16,"04_taro_milk_tea_L.jpg"],
 [5,2,"Mie Titi Original (Reguler)","Makanan",35000,"pcs",50,"05_mie_titi_original_reguler.jpg"],[6,2,"Mie Titi Spesial Jumbo","Makanan",55000,"pcs",8,"06_mie_titi_spesial_jumbo.jpg"],[7,2,"Es Teh Manis","Minuman",8000,"pcs",30,"07_es_teh_manis.jpg"],
 [8,3,"Novel Terlaris Bulan Ini","Buku & Alat Tulis",89000,"pcs",10,"08_novel_terlaris_bulan_ini.jpg"],[9,3,"Buku Tulis Sinar Dunia 40 Lembar","Buku & Alat Tulis",8500,"pcs",50,"09_buku_tulis_sinar_dunia_40_lembar.jpg"],[10,3,"Pulpen Pilot G2 Hitam","Buku & Alat Tulis",15000,"pcs",35,"10_pulpen_pilot_g2_hitam.jpg"],[11,3,"Spidol Snowman Whiteboard","Buku & Alat Tulis",12000,"pcs",25,"11_spidol_snowman_whiteboard.jpg"],
 [12,4,"Samsung Galaxy Buds Fe","Elektronik",799000,"pcs",7,"12_samsung_galaxy_buds_fe.jpg"],[13,4,"Samsung 25W Typec Charger","Elektronik",199000,"pcs",15,"13_samsung_25w_typec_charger.jpg"],[14,4,"Samsung Clear Case Galaxy A55","Elektronik",149000,"pcs",20,"14_samsung_clear_case_galaxy_a55.webp"],
 [15,5,"Indomie Goreng","Makanan",3500,"pcs",400,"15_mie_instan_indomie_goreng.jpg"],[16,5,"Aqua 600ml","Minuman",4500,"pcs",500,"16_aqua_air_mineral_600ml.webp"],[17,5,"Chitato Sapi Panggang 68g","Makanan",12000,"pcs",200,"17_snack_chitato_sapi_panggang.jpg"],[18,5,"Pocari Sweat 500ml","Minuman",8000,"pcs",400,"18_pocari_sweat_500ml.webp"],
 [19,6,"Pallubasa Sapi Spesial","Makanan",35000,"pcs",15,"19_pallubasa_sapi_spesial.webp"],[20,6,"Pallubasa Ayam","Makanan",28000,"pcs",15,"20_pallubasa_ayam.webp"],
 [21,7,"Americano Hot","Minuman",22000,"pcs",25,"21_americano_hot.jpg"],[22,7,"Kopi Susu Gula Aren","Minuman",25000,"pcs",30,"22_kopi_susu_gula_aren.jpg"],[23,7,"Es Kopi Hitam","Minuman",18000,"pcs",30,"23_es_kopi_hitam.jpg"],
 [24,8,"Mcflurry Oreo","Makanan",32000,"pcs",20,"24_mcflurry_oreo.jpg"],[25,8,"Paket Mcchicken Value","Makanan",45000,"pcs",25,"25_paket_mcchicken_value.jpg"],[26,8,"French Fries Large","Makanan",28000,"pcs",30,"26_french_fries_large.jpg"],
 [27,9,"Pisang Ijo Original (1 Porsi)","Kuliner",20000,"pcs",60,"27_es_pisang_ijo_original.jpg"],[28,10,"Goodday Kopi Sachet 10Pcs","Minuman",20000,"pcs",40,"28_goodday_kopi_sachet_10pcs.jpg"],[29,11,"KFC Original 2 Pcs + Nasi","Makanan",55000,"pcs",100,"29_kfc_original_2pcs.jpg"],
 [30,12,"Buku Kuliah Akuntansi Dasar","Buku & Alat Tulis",95000,"pcs",8,"30_buku_kuliah_akuntansi_dasar.jpg"],[31,13,"Pisang Goreng Keju","Makanan",15000,"pcs",30,"31_pisang_goreng_keju.jpg"],[32,14,"Tumbler Miniso 500ml","Aksesoris",89000,"pcs",70,"32_miniso_tumbler_500ml.jpg"],[33,15,"Paracetamol 500mg (10 Tablet)","Obat",8000,"strip",200,"33_paracetamol_500mg_10_tablet.png"],[34,16,"Sop Saudara Daging Reguler","Makanan",35000,"pcs",18,"34_sop_saudara_daging_reguler.jpg"],
];
const products = productsRaw.map(([id,storeId,nama,kategori,harga,satuan,stok,photo])=>({id,storeId,ownerId:ownerForStore(storeId),nama,kategori,harga,satuan,stok,photo}));

const sessions = [
 {id:1,sourceId:"S001",ownerId:6,storeId:1,productIds:[1,2,3,4],capacity:10,fee:5000,status:"ditutup"},
 {id:2,sourceId:"S002",ownerId:7,storeId:2,productIds:[5,6,7],capacity:8,fee:8000,status:"ditutup"},
 {id:3,sourceId:"S003",ownerId:6,storeId:5,productIds:[15,16,17,18],capacity:15,fee:5000,status:"buka"},
 {id:4,sourceId:"S004",ownerId:8,storeId:7,productIds:[21,22,23],capacity:12,fee:5000,status:"buka"},
 {id:5,sourceId:"S005",ownerId:9,storeId:8,productIds:[24,25,26],capacity:10,fee:8000,status:"buka"},
];
const orders = [
 {id:1,sessionId:1,customerId:1,productId:1,qty:2,fee:5000,mode:"tawar",offer:"accepted",status:"selesai",note:"tanpa es batu"},
 {id:2,sessionId:1,customerId:2,productId:2,qty:1,fee:5000,mode:"langsung",status:"selesai",note:"less sweet"},
 {id:3,sessionId:2,customerId:3,productId:5,qty:2,fee:8000,mode:"tawar",offer:"accepted",status:"dibayar",note:"tambah kerupuk"},
 {id:4,sessionId:2,customerId:4,productId:6,qty:1,fee:5000,mode:"tawar",offer:"rejected",status:"dibatalkan",note:"harga tidak sepakat"},
 {id:5,sessionId:3,customerId:1,productId:15,qty:5,fee:5000,mode:"langsung",status:"dibayar",note:"rasa ayam bawang juga boleh"},
 {id:6,sessionId:4,customerId:5,productId:22,qty:3,fee:5000,mode:"tawar",offer:"accepted",status:"dibayar",note:"gula aren banyak"},
 {id:7,sessionId:5,customerId:2,productId:25,qty:2,fee:8000,mode:"langsung",status:"dibayar",note:"minuman diganti teh"},
];
const payments = [
 [1,1,1,"QRIS","dilepas"],[2,2,2,"Transfer Bank","dilepas"],[3,3,3,"GoPay","tertahan"],[4,5,1,"OVO","tertahan"],[5,6,5,"Dana","tertahan"],[6,7,2,"QRIS","tertahan"],
].map(([id,titipanId,customerId,method,status])=>({id,titipanId,customerId,method,status}));
const tracking = [
 [1,1,"dititip","Titipan diterima dan dikonfirmasi"],[2,1,"dibelanjakan","Barang dibeli di Chatime Losari"],[3,1,"diantar","Barang diantar ke penitip"],[4,1,"diterima","Barang diterima penitip"],
 [5,2,"dititip","Titipan diterima dan dikonfirmasi"],[6,2,"dibelanjakan","Barang dibeli di Chatime Losari"],[7,2,"diantar","Barang diantar ke penitip"],[8,2,"diterima","Barang diterima penitip"],
 [9,3,"dititip","Titipan Mie Titi dikonfirmasi"],[10,3,"dibelanjakan","Barang dibeli di Mie Titi Makassar"],[11,3,"diantar","Barang diantar ke penitip"],
 [12,5,"dititip","Titipan Indomie diterima"],[13,5,"dibelanjakan","Barang dibeli di Indomaret Tamalanrea"],[14,6,"dititip","Titipan Kopi Susu dikonfirmasi"],[15,7,"dititip","Titipan McChicken dikonfirmasi"],
].map(([id,titipanId,status,note])=>({id,titipanId,status,note}));

module.exports = { password:"Penjastip2026!", accounts, stores, products, sessions, orders, payments, tracking };
