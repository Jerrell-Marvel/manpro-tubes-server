import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import { NotFoundError } from "../errors/NotFoundError.js";
import { query } from "express";

export const register = async (req, res) => {
  const { password, noHp, alamat, email, kelId, nama } = req.body;

  if (!password || !noHp || !alamat || !email || !kelId || !nama) {
    throw new BadRequestError("All specified field must be included");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const textQuery = `INSERT INTO Pengguna (no_hp, alamat, email, kel_id, password, nama) VALUES ($1, $2, $3, $4, $5, $6)`;
  const values = [noHp, alamat, email, kelId, hashedPassword, nama];

  await pool.query(textQuery, values);

  return res.status(200).json({ success: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("All specified field must be included");
  }

  const textQuery = `SELECT pengguna_id, password, email, role FROM Pengguna WHERE email = $1`;

  const queryResult = await pool.query(textQuery, [email]);

  if (queryResult.rowCount === 0) {
    throw new UnauthorizedError("Email is not registered");
  }

  const user = queryResult.rows[0];
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError("Incorrect password");
  }

  const token = jwt.sign({ pengguna_id: user.pengguna_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return res.status(200).json({ success: true, token });
};

export const getAllUsers = async (req, res) => {
  const queryText = "SELECT * FROM Pengguna p INNER JOIN Kelurahan k on p.kel_id = k.kel_id INNER JOIN kecamatan kec ON k.kec_id = kec.kec_id";
  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};

export const updateUser = async (req, res) => {
  const { penggunaId } = req.params;

  const { nama, noHp, alamat, email, kelurahanId } = req.body;

  if (!nama && !noHp && !alamat && !email && !kelurahanId) {
    throw new BadRequestError("No specified field");
  }

  const penggunaValues = [];
  const penggunaField = [];

  let placeHolderIdx = 1;
  if (nama) {
    penggunaField.push(`nama=$${placeHolderIdx++}`);
    penggunaValues.push(nama);
  }

  if (noHp) {
    penggunaField.push(`no_hp=$${placeHolderIdx++}`);
    penggunaValues.push(noHp);
  }

  if (alamat) {
    penggunaField.push(`alamat=$${placeHolderIdx++}`);
    penggunaValues.push(alamat);
  }

  if (email) {
    penggunaField.push(`email=$${placeHolderIdx++}`);
    penggunaValues.push(email);
  }

  if (kelurahanId) {
    penggunaField.push(`kelurahan_id=$${placeHolderIdx++}`);
    penggunaValues.push(kelurahanId);
  }

  const queryText = `UPDATE pengguna SET ${penggunaField.join(", ")} WHERE pengguna_id=$${placeHolderIdx++}`;
  penggunaValues.push(penggunaId);

  const queryResult = await pool.query(queryText, penggunaValues);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError("No pengguna found");
  }

  return res.json({ success: true });
};

export const getSingleUser = async (req, res) => {
  const { penggunaId } = req.params;

  const queryText = "SELECT * FROM Pengguna WHERE pengguna_id=$1";

  const queryResult = await pool.query(queryText, [penggunaId]);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`No pengguna with pengguna_id=${penggunaId}`);
  }

  return res.json(queryResult.rows[0]);
};
