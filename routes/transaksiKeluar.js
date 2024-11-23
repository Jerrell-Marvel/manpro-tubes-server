import express from "express";
import { createTransaksiKeluar, getTransaksiKeluar } from "../controllers/transaksiKeluar.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware("admin"), getTransaksiKeluar);
router.post("/", authMiddleware("admin"), createTransaksiKeluar);

export default router;
