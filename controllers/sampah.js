import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export const getSampah = async (req, res) => {
  const { jenis_sampah } = req.query;

  let queryText = `SELECT * FROM Sampah s INNER JOIN Jenis_Sampah js ON s.jenis_sampah_id = js.jenis_sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id WHERE s.is_active=TRUE`;

  const values = [];
  if (jenis_sampah) {
    queryText += ` AND s.jenis_sampah_id = $1`;
    values.push(jenis_sampah);
  }

  const queryResult = await pool.query(queryText, values);
  return res.json(queryResult.rows);
};

export const createSampah = async (req, res) => {
  return res.json("create sampah");
};

export const updateSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("udpate sampah " + sampahId);
};

export const deleteSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("delete sampah " + sampahId);
};
