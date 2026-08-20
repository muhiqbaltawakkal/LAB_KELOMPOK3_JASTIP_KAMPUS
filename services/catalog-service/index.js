const express = require("express");
const app = express();
app.use(express.json());

const items = {
  1: { nama: "Item A", harga: 15000 },
  2: { nama: "Item B", harga: 25000 }
};

app.get("/items/:id", (req, res) => {
  const item = items[req.params.id];
  if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
  res.json(item);
});

app.listen(3001, () => console.log("catalog berjalan di :3001"));