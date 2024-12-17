// routes/stats.js
import express from "express";
import { getDashboardStats } from "../controllers/stats.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", authMiddleware("admin"), getDashboardStats);

export default router;