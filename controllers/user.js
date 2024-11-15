import { BadRequestError } from "../errors/BadRequestError.js";
import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import { text } from "express";

export const register = async (req, res) => {
  const { password, noHp, alamat, email, kelId } = req.body;

  if (!password || !noHp || !alamat || !email || !kelId) {
    throw new BadRequestError("All specified field must be included");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const textQuery = `INSERT INTO Pengguna (no_hp, alamat, email, kel_id, password) VALUES ($1, $2, $3, $4, $5)`;
  const values = [noHp, alamat, email, kelId, hashedPassword];

  await pool.query(textQuery, values);

  return res.status(200).json({ success: true });
};
