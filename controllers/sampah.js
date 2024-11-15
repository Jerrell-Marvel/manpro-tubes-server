import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { InternalServerError } from "../errors/InternalServerError.js";

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

export const updateSampah = async (req, res, next) => {
  const { sampahId } = req.params;
  const { namaSampah, harga } = req.body;

  if (!namaSampah && !harga && !req.file) {
    console.log("here", harga);
    throw new BadRequestError("Required at least 1 field");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sampahValues = [];
    const sampahField = [];

    let placeHolderIdx = 1;
    if (namaSampah) {
      sampahField.push(`nama_sampah = $${placeHolderIdx++}`);
      sampahValues.push(namaSampah);
    }
    if (harga) {
      sampahField.push(`harga_sekarang = $${placeHolderIdx++}`);
      sampahValues.push(harga);
    }
    if (req.file) {
      sampahField.push(`url_gambar = $${placeHolderIdx++}`);
      sampahValues.push(req.file.filename);
    }

    const queryTextSampah = `UPDATE Sampah SET ${sampahField.join(", ")} WHERE sampah_id = $${placeHolderIdx++}`;
    sampahValues.push(sampahId);

    const querySampahResult = await pool.query(queryTextSampah, sampahValues);

    if (querySampahResult.rowCount === 0) {
      next(new NotFoundError(`sampah_id ${sampahId} not found`));
    }

    if (harga) {
      const queryTextHarga = `INSERT INTO Harga (harga_sampah, sampah_id) VALUES ($1, $2)`;
      const hargaValues = [harga, sampahId];

      await pool.query(queryTextHarga, hargaValues);
    }

    await client.query("COMMIT");

    return res.json({ success: true, sampahId });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");

    throw new InternalServerError("An unexpected error occurred");
  } finally {
    client.release();
  }

  return res.json("udpate sampah " + sampahId);
};

export const deleteSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("delete sampah " + sampahId);
};
