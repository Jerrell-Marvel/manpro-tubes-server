import express from "express";
import { register, login, getAllUsers } from "../controllers/user.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/register", register);
router.post("/login", login);

export default router;
