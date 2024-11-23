import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getAllTransaksi, createTransaksi, getPenggunaTransaksi, updateTransaksi } from "../controllers/transaksi.js";

const router = express.Router();

router.get("/masuk", authMiddleware("pengguna"), getPenggunaTransaksi);
router.get("/masuk/all", authMiddleware("admin"), getAllTransaksi);

router.post("/masuk", authMiddleware("admin"), createTransaksi);

router.patch("/:transaksiId", authMiddleware("admin"), updateTransaksi);

export default router;
