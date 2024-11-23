import express from "express";
import { register, login, getAllUsers, updateUser } from "../controllers/user.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", authMiddleware("admin"), getAllUsers);
router.patch("/users/:penggunaId", authMiddleware("admin"), updateUser);
router.post("/register", register);
router.post("/login", login);

export default router;
