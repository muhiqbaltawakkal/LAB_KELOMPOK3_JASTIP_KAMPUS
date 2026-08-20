const express = require("express");
const app = express();
app.use(express.json());

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3001";

app.post("/orders", async (req, res) => {
  const { itemId, qty } = req.body;
  if (!Number.isInteger(itemId) || !Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: "itemId dan qty wajib angka, qty minimal 1" });
  }

  // Komunikasi antar layanan: tanya harga ke catalog.
  let item;
  try {
    const r = await fetch(`${CATALOG_URL}/items/${itemId}`);
    if (r.status === 404) return res.status(404).json({ error: "item tidak ada" });
    if (!r.ok) return res.status(502).json({ error: "catalog bermasalah" });
    item = await r.json();
  } catch {
    return res.status(502).json({ error: "catalog tidak tersedia" });
  }

  const order = { id: Date.now(), item: item.nama, qty, total: item.harga * qty };
  res.status(201).json(order);
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "order" }));

app.listen(3002, () => console.log("order berjalan di :3002"));