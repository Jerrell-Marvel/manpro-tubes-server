import express from "express";
import { createSampah, deleteSampah, getSampah, updateSampah } from "../controllers/sampah.js";
import { authMiddleware } from "../middleware/auth.js";
import { fileUpload } from "../middleware/fileUpload.js";

const router = express.Router();

router.get("/", getSampah);
router.post("/", authMiddleware("admin"), fileUpload("./public").single("gambarSampah"), createSampah);
router.patch("/:sampahId", authMiddleware("admin"), fileUpload("./public").single("gambarSampah"), updateSampah);
router.delete("/:sampahId", authMiddleware("admin"), deleteSampah);

export default router;
