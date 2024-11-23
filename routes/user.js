import express from "express";
import { register, login, getAllUsers, updateUser } from "../controllers/user.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.patch("/users/:penggunaId", updateUser);
router.post("/register", register);
router.post("/login", login);

export default router;
