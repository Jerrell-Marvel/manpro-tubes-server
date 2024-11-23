import { query } from "express";
import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { groupByTransaksiKeluarId } from "../utils/groupByTransaksiKeluarId.js";

export const getTransaksiKeluar = async (req, res) => {
  const { start, end } = req.query;

  let textQuery = `SELECT * FROM Transaksi_Keluar t INNER JOIN Transaksi_Keluar_Sampah ts ON t.transaksi_keluar_id = ts.transaksi_keluar_id INNER JOIN Sampah s ON ts.sampah_id = s.sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id`;

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
  const grouped = groupByTransaksiKeluarId(queryResult.rows);

  return res.json(grouped);
};

export const createTransaksiKeluar = async (req, res) => {
  const { transaksiSampah, bsPusatId } = req.body;

  if (!transaksiSampah || transaksiSampah.length === 0 || !bsPusatId) {
    throw new BadRequestError("All specified field must be included");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const transaksiTextQuery = `INSERT INTO Transaksi_Keluar (bs_pusat_id) VALUES($1) RETURNING transaksi_keluar_id`;
    const transaksiValues = [bsPusatId];
    const transaksiQueryResult = await client.query(transaksiTextQuery, transaksiValues);
    const transaksiId = transaksiQueryResult.rows[0].transaksi_keluar_id;

    const transaksiSampahText = [];
    const transaksiSampahValues = [];
    let placeHolderIdx = 1;

    for (const item of transaksiSampah) {
      // transaksi_keluar_id, sampah_id, jumlah_sampah
      transaksiSampahText.push(`($${placeHolderIdx++}, $${placeHolderIdx++}, $${placeHolderIdx++})`);

      transaksiSampahValues.push(transaksiId, item.sampahId, item.jumlahSampah);
    }

    const transaksiSampahQuery = `INSERT INTO Transaksi_Keluar_Sampah(transaksi_keluar_id, sampah_id, jumlah_sampah) VALUES ${transaksiSampahText.join(", ")}`;

    await client.query(transaksiSampahQuery, transaksiSampahValues);

    for (const item of transaksiSampah) {
      const updateTextQuery = "UPDATE Inventory_Sampah SET kuantitas=kuantitas-$1 WHERE sampah_id=$2";
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
