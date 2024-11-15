import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const getJenisSampah = async (req, res) => {
  const queryText = `SELECT * FROM jenis_sampah`;
  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};

export const createJenisSampah = async (req, res) => {
  const { namaJenisSampah } = req.body;

  if (!namaJenisSampah) {
    throw new BadRequestError("All specified field must be included");
  }

  const queryText = `INSERT INTO Jenis_Sampah (nama_jenis_sampah) VALUES ($1) RETURNING jenis_sampah_id`;
  const values = [namaJenisSampah];

  const queryResult = await pool.query(queryText, values);

  const jenisSampahId = queryResult.rows[0].jenis_sampah_id;

  return res.json({ success: true, jenisSampahId });
};

export const updateJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("update jenis sampah" + jenisSampahId);
};

export const deleteJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("delete jenis sampah" + jenisSampahId);
};
