import express from "express";
import { getKecamatan } from "../controllers/kecamatan.js";

const router = express.Router();

router.get("/", getKecamatan);

export default router;
