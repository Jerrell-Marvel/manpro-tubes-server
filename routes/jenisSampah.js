import express from "express";

const router = express.Router();
import { getJenisSampah, createJenisSampah, deleteJenisSampah, updateJenisSampah } from "../controllers/jenisSampah.js";
import { authMiddleware } from "../middleware/auth.js";

router.get("/", getJenisSampah);
router.post("/", authMiddleware("admin"), createJenisSampah);
router.patch("/:jenisSampahId", authMiddleware("admin"), updateJenisSampah);
router.delete("/:jenisSampahId", authMiddleware("admin"), deleteJenisSampah);

export default router;
