import express from "express";
import { createSampah, deleteSampah, getSampah, updateSampah } from "../controllers/sampah.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSampah);
router.post("/", authMiddleware("admin"), createSampah);
router.patch("/:sampahId", authMiddleware("admin"), updateSampah);
router.delete("/:sampahId", authMiddleware("admin"), deleteSampah);

export default router;
