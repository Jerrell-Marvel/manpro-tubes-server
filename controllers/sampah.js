import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { query } from "express";

export const getSampah = async (req, res) => {
  const { jenis_sampah } = req.query;

  let queryText = `SELECT * FROM Sampah s INNER JOIN Jenis_Sampah js ON s.jenis_sampah_id = js.jenis_sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id INNER JOIN Harga h on s.harga_id_sekarang = h.harga_id WHERE s.is_active=TRUE`;

  const values = [];
  if (jenis_sampah) {
    queryText += ` AND s.jenis_sampah_id = $1`;
    values.push(jenis_sampah);
  }

  const queryResult = await pool.query(queryText, values);
  return res.json(queryResult.rows);
};

export const getSingleSampah = async (req, res) => {
  const { sampahId } = req.params;

  const queryText = `SELECT * FROM Sampah s INNER JOIN Jenis_Sampah js ON s.jenis_sampah_id = js.jenis_sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id INNER JOIN Harga h on s.harga_id_sekarang = h.harga_id WHERE s.is_active=TRUE AND s.sampah_id=$1`;

  const values = [sampahId];

  const queryResult = await pool.query(queryText, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError("No sampah found");
  }

  return res.json(queryResult.rows[0]);
};

export const createSampah = async (req, res) => {
  const { namaSampah, jenisSampahId, harga, sukId } = req.body;

  if (!req.file || !namaSampah || !jenisSampahId || !harga || !sukId) {
    throw new BadRequestError("All specified field must be included");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const queryTextSampah = `INSERT INTO Sampah (nama_sampah, jenis_sampah_id, url_gambar, suk_id) VALUES ($1, $2, $3, $4) RETURNING sampah_id`;
    const sampahValues = [namaSampah, jenisSampahId, req.file.filename, sukId];
    const queryResultSampah = await client.query(queryTextSampah, sampahValues);
    const sampahId = queryResultSampah.rows[0].sampah_id;

    const queryTextHarga = `INSERT INTO Harga (harga_sampah, sampah_id) VALUES ($1, $2) RETURNING harga_id`;
    const queryTextValues = [harga, sampahId];
    const queryResultHarga = await client.query(queryTextHarga, queryTextValues);
    const hargaId = queryResultHarga.rows[0].harga_id;

    const queryTextUpdateSampah = `UPDATE Sampah SET harga_id_sekarang = $1 WHERE sampah_id = $2`;
    const updateSampahValues = [hargaId, sampahId];
    await client.query(queryTextUpdateSampah, updateSampahValues);

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
      const queryTextAddHarga = `INSERT INTO Harga (sampah_id, harga_sampah) VALUES ($1, $2) RETURNING harga_id`;
      const addHargaValues = [sampahId, harga];
      const addHargaQueryResult = await client.query(queryTextAddHarga, addHargaValues);

      const hargaId = addHargaQueryResult.rows[0].harga_id;

      sampahField.push(`harga_id_sekarang = $${placeHolderIdx++}`);
      sampahValues.push(hargaId);
    }
    if (req.file) {
      sampahField.push(`url_gambar = $${placeHolderIdx++}`);
      sampahValues.push(req.file.filename);
    }

    const queryTextSampah = `UPDATE Sampah SET ${sampahField.join(", ")} WHERE sampah_id = $${placeHolderIdx++}`;
    sampahValues.push(sampahId);

    const querySampahResult = await client.query(queryTextSampah, sampahValues);

    if (querySampahResult.rowCount === 0) {
      next(new NotFoundError(`sampah_id ${sampahId} not found`));
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
};

export const deleteSampah = async (req, res) => {
  const { sampahId } = req.params;

  const queryText = `UPDATE Sampah SET is_active = FALSE WHERE sampah_id = $1`;
  const values = [sampahId];

  const queryResult = await pool.query(queryText, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`sampah_id ${sampahId} not found`);
  }

  return res.status(200).json({ success: true });
};
