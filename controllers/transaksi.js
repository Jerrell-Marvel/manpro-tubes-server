import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { groupByTransaksiId } from "../utils/groupByTransaksiId.js";

// spesifik transaksi 1 pengguna
export const getPenggunaTransaksi = async (req, res) => {
  const { penggunaId } = req.user;

  const textQuery = `SELECT * FROM Transaksi t INNER JOIN Transaksi_Sampah ts ON t.transaksi_id = ts.transaksi_id INNER JOIN Sampah s ON ts.sampah_id = s.sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id WHERE t.pengguna_id = $1`;
  const values = [penggunaId];

  const queryResult = await pool.query(textQuery, values);
  const grouped = groupByTransaksiId(queryResult.rows);
  //   return res.json(queryResult.rows);
  return res.json(grouped);
};

// admin only
export const getAllTransaksi = async (req, res) => {
  const { tipe_transaksi } = req.query;
  let textQuery = `SELECT * FROM Transaksi t INNER JOIN Transaksi_Sampah ts ON t.transaksi_id = ts.transaksi_id INNER JOIN Sampah s ON ts.sampah_id = s.sampah_id INNER JOIN SUK ON s.suk_id = SUK.suk_id`;

  const values = [];

  if (tipe_transaksi && (tipe_transaksi === "masuk" || tipe_transaksi === "keluar")) {
    textQuery += ` WHERE tipe_transaksi = $1`;
    values.push(tipe_transaksi);
  }

  const queryResult = await pool.query(textQuery, values);
  const grouped = groupByTransaksiId(queryResult.rows);

  return res.json(grouped);
};

export const createTransaksi = async (req, res) => {
  const { transaksiSampah, penggunaId, bsPusatId } = req.body;

  if (!transaksiSampah || transaksiSampah.length === 0 || !penggunaId || !bsPusatId) {
    throw new BadRequestError("All specified field must be included");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const transaksiTextQuery = `INSERT INTO transaksi (pengguna_id, bs_pusat_id) VALUES($1, $2) RETURNING transaksi_id`;
    const transaksiValues = [penggunaId, bsPusatId];
    const transaksiQueryResult = await client.query(transaksiTextQuery, transaksiValues);
    const transaksiId = transaksiQueryResult.rows[0].transaksi_id;

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

    const transaksiSampahQuery = `INSERT INTO Transaksi_Sampah(transaksi_id, sampah_id, jumlah_sampah, harga_id) VALUES ${transaksiSampahText.join(", ")}`;

    await client.query(transaksiSampahQuery, transaksiSampahValues);

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
