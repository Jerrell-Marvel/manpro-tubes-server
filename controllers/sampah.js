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
  const { namaSampah, jenisSampahId, harga, sukId } = req.body;

  if (!req.file || !namaSampah || !jenisSampahId || !harga || !sukId) {
    throw new BadRequestError("All specified field must be included");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const queryTextSampah = `INSERT INTO Sampah (nama_sampah, jenis_sampah_id, harga_sekarang, url_gambar, suk_id) VALUES ($1, $2, $3, $4, $5) RETURNING sampah_id`;
    const sampahValues = [namaSampah, jenisSampahId, harga, req.file.filename, sukId];
    const queryResultSampah = await client.query(queryTextSampah, sampahValues);
    const sampahId = queryResultSampah.rows[0].sampah_id;

    const queryTextHarga = `INSERT INTO Harga (harga_sampah, sampah_id) VALUES ($1, $2)`;
    const queryTextValues = [harga, sampahId];
    await client.query(queryTextHarga, queryTextValues);

    await client.query("COMMIT");
    return res.json({ success: true, sampahId });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");

    throw new InternalServerError("An unexpected error occurred");
  } finally {
    client.release();
  }
};

export const updateSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("udpate sampah " + sampahId);
};

export const deleteSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("delete sampah " + sampahId);
};
