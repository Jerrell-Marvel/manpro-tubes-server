import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getAllTransaksi, createTransaksi, getPenggunaTransaksi, updateTransaksi } from "../controllers/transaksi.js";

const router = express.Router();

router.get("/", authMiddleware("pengguna"), getPenggunaTransaksi);
router.get("/all", authMiddleware("admin"), getAllTransaksi);
router.post("/", authMiddleware("admin"), createTransaksi);
router.patch("/:transaksiId", authMiddleware("admin"), updateTransaksi);

export default router;
