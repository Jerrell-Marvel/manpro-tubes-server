import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { groupByTransaksiId } from "../utils/groupByTransaksiId.js";
import { text } from "express";

// spesifik transaksi 1 pengguna
export const getPenggunaTransaksi = async (req, res) => {
  const { penggunaId } = req.user;
  const { start, end } = req.query;

  let textQuery = `SELECT * FROM Transaksi_Masuk t INNER JOIN Transaksi_Masuk_Sampah ts ON t.transaksi_masuk_id = ts.transaksi_masuk_id INNER JOIN Sampah s ON ts.sampah_id = s.sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id INNER JOIN Harga h ON h.harga_id = ts.harga_id WHERE `;

  let placeHolderCtr = 1;
  const whereClause = [`t.pengguna_id = $${placeHolderCtr++}`];
  const values = [penggunaId];

  if (start) {
    whereClause.push(`t.tanggal::DATE >= $${placeHolderCtr++}`);
    values.push(`'${start}'`);
  }

  if (end) {
    whereClause.push(`t.tanggal::DATE <= $${placeHolderCtr++}`);
    values.push(`'${end}'`);
  }

  const whereClauseStr = whereClause.join(" AND ");
  textQuery += whereClauseStr;

  console.log(textQuery);

  const queryResult = await pool.query(textQuery, values);
  const grouped = groupByTransaksiId(queryResult.rows);
  //   return res.json(queryResult.rows);
  return res.json(grouped);
};

// admin only
export const getAllTransaksi = async (req, res) => {
  const { start, end } = req.query;
  console.log(start, end);

  let textQuery = `SELECT * FROM Transaksi_Masuk t INNER JOIN Transaksi_Masuk_Sampah ts ON t.transaksi_masuk_id = ts.transaksi_masuk_id INNER JOIN Sampah s ON ts.sampah_id = s.sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id INNER JOIN Harga h ON h.harga_id = ts.harga_id`;

  const values = [];
  const whereClause = [];
  let placeHolderCtr = 1;

  if (start) {
    whereClause.push(`t.tanggal::DATE >= $${placeHolderCtr++}`);
    values.push(`'${start}'`);
  }

  if (end) {
    whereClause.push(`t.tanggal::DATE <= $${placeHolderCtr++}`);
    values.push(`'${end}'`);
  }

  if (values.length !== 0) {
    textQuery += " WHERE ";
    const whereClauseStr = whereClause.join(" AND ");
    textQuery += whereClauseStr;
  }

  const queryResult = await pool.query(textQuery, values);
  const grouped = groupByTransaksiId(queryResult.rows);

  return res.json(grouped);
};

export const createTransaksi = async (req, res, next) => {
  const { transaksiSampah, penggunaId, bsPusatId } = req.body;

  if (!transaksiSampah || transaksiSampah.length === 0 || !penggunaId || !bsPusatId) {
    throw new BadRequestError("All specified field must be included");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const transaksiTextQuery = `INSERT INTO Transaksi_Masuk (pengguna_id, bs_pusat_id) VALUES($1, $2) RETURNING transaksi_masuk_id`;
    const transaksiValues = [penggunaId, bsPusatId];
    const transaksiQueryResult = await client.query(transaksiTextQuery, transaksiValues);
    const transaksiId = transaksiQueryResult.rows[0].transaksi_masuk_id;

    const transaksiSampahText = [];
    const transaksiSampahValues = [];
    let placeHolderIdx = 1;

    for (const item of transaksiSampah) {
      // get dlu harga_id_sekarangnya
      const textQueryGetSampah = `SELECT sampah_id, harga_id_sekarang FROM Sampah WHERE sampah_id = $1`;
      const getSampahValues = [item.sampahId];
      const getSampahQueryResult = await client.query(textQueryGetSampah, getSampahValues);
      if (getSampahQueryResult.rowCount === 0) {
        next(new BadRequestError(`sampah_id ${item.sampahId} doesn't exist`));
      }

      const hargaIdSekarang = getSampahQueryResult.rows[0].harga_id_sekarang;

      // transaksi_id, sampah_id, jumlah_sampah, harga_id
      transaksiSampahText.push(`($${placeHolderIdx++}, $${placeHolderIdx++}, $${placeHolderIdx++}, $${placeHolderIdx++})`);

      transaksiSampahValues.push(transaksiId, item.sampahId, item.jumlahSampah, hargaIdSekarang);
    }

    const transaksiSampahQuery = `INSERT INTO Transaksi_Masuk_Sampah(transaksi_masuk_id, sampah_id, jumlah_sampah, harga_id) VALUES ${transaksiSampahText.join(", ")}`;

    await client.query(transaksiSampahQuery, transaksiSampahValues);

    for (const item of transaksiSampah) {
      const updateTextQuery = "UPDATE Inventory_Sampah SET kuantitas=kuantitas+$1 WHERE sampah_id=$2";
      const updateTextValues = [item.jumlahSampah, item.sampahId];

      await client.query(updateTextQuery, updateTextValues);
    }

    await client.query("COMMIT");
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");

    throw new InternalServerError("An unexpected error occurred");
  } finally {
    client.release();
  }
};

export const updateTransaksi = async (req, res) => {
  const { tipeTransaksi } = req.body;
  const { transaksiId } = req.params;

  if (!tipeTransaksi || (tipeTransaksi !== "keluar" && tipeTransaksi !== "masuk")) {
    throw new BadRequestError("status is required and has to be valid");
  }

  const textQuery = `UPDATE Transaksi SET tipe_transaksi = $1 WHERE transaksi_id = $2`;
  const values = [tipeTransaksi, transaksiId];

  const queryResult = await pool.query(textQuery, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`transaksi_id ${transaksiId} not found`);
  }

  return res.json({ success: true });
};
