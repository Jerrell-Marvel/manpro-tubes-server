import express from "express";
import { register, login, getAllUsers, updateUser, getSingleUser } from "../controllers/user.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", authMiddleware("admin"), getAllUsers);
router.get("/users/:penggunaId", authMiddleware("admin"), getSingleUser);
router.patch("/users/:penggunaId", authMiddleware("admin"), updateUser);
router.post("/register", register);
router.post("/login", login);

export default router;
