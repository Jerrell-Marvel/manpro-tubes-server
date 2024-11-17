import express from "express";
import { getKelurahan } from "../controllers/kelurahan.js";

const router = express.Router();

router.get("/", getKelurahan);

export default router;
