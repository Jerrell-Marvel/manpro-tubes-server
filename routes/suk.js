import express from "express";
import { createSUK, deleteSUK, getSUK, updateSUK } from "../controllers/suk.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSUK);
router.post("/", authMiddleware("admin"), createSUK);
router.patch("/:sukId", authMiddleware("admin"), updateSUK);
router.delete("/:sukId", authMiddleware("admin"), deleteSUK);

export default router;
