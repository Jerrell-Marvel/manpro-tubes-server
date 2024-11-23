import express from "express";
import { getAllInventory } from "../controllers/inventory.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware("admin"), getAllInventory);

export default router;
