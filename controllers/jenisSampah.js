import pool from "../db/db.js";

export const getJenisSampah = async (req, res) => {
  const queryText = `SELECT * FROM jenis_sampah`;
  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};

export const createJenisSampah = async (req, res) => {
  return res.json("create jenis sampah");
};

export const updateJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("update jenis sampah" + jenisSampahId);
};

export const deleteJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("delete jenis sampah" + jenisSampahId);
};
