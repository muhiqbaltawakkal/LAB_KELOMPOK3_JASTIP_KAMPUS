const express = require("express");

const app = express();

app.use(express.json());

// Data sementara masih disimpan di memori.
// Pada pertemuan berikutnya data akan dipindahkan ke database.
const items = [
    {
        id: 1,
        nama: "Item A",
        harga: 15000,
        sisa: 500
    },
    {
        id: 2,
        nama: "Item B",
        harga: 25000,
        sisa: 500
    }
];

// Mengambil semua item
app.get("/items", (_req, res) => {
    res.json(items);
});

// Mengambil satu item berdasarkan ID
app.get("/items/:id", (req, res) => {
    const item = items.find(
        (x) => x.id === Number(req.params.id)
    );

    if (!item) {
        return res.status(404).json({
            error: "item tidak ditemukan"
        });
    }

    res.json(item);
});

// Health check
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "catalog-service"
    });
});

// Menjalankan server
app.listen(3001, () => {
    console.log("catalog-service berjalan di :3001");
});