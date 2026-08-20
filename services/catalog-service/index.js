const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

// Seed data dari dataset — pertemuan 2 kita pindah ke database.
const seed = require(path.join(__dirname, "../../dataset/catalog-seed.json"));
const items = seed.barang;
const toko = seed.toko;
const satuan = seed.satuan;

app.get("/items", (_req, res) => res.json(items));

app.get("/items/:id", (req, res) => {
  const item = items.find((x) => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "item tidak ditemukan" });
  res.json(item);
});

app.get("/toko", (_req, res) => res.json(toko));

app.get("/toko/:id", (req, res) => {
  const t = toko.find((x) => x.id === Number(req.params.id));
  if (!t) return res.status(404).json({ error: "toko tidak ditemukan" });
  res.json(t);
});

app.get("/satuan", (_req, res) => res.json(satuan));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "catalog" }));

app.listen(3001, () => console.log("catalog berjalan di :3001"));