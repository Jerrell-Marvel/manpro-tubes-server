import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

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
  const { namaJenisSampah } = req.body;

  if (!namaJenisSampah) {
    throw new BadRequestError("All specified field must be included");
  }

  const queryText = `UPDATE Jenis_Sampah SET nama_jenis_sampah = $1 WHERE jenis_sampah_id = $2;`;
  const values = [namaJenisSampah, jenisSampahId];

  const queryResult = await pool.query(queryText, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`jenis_sampah_id ${jenisSampahId} not found`);
  }

  return res.json({ success: true });
};

export const deleteJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("delete jenis sampah" + jenisSampahId);
};
