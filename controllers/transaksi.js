import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { InternalServerError } from "../errors/InternalServerError.js";

// spesifik transaksi 1 pengguna
export const getPenggunaTransaksi = async (req, res) => {
  return res.json("pengguna transaksi");
};

// admin only
export const getAllTransaksi = async (req, res) => {
  return res.json("get all transaksi");
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
    transaksiSampah.forEach((item) => {
      // transaksi_sampah_id, sampah_id, jumlah_sampah
      transaksiSampahText.push(`($${placeHolderIdx++}, $${placeHolderIdx++}, $${placeHolderIdx++})`);

      transaksiSampahValues.push(transaksiId, item.sampahId, item.jumlahSampah);
    });
    const transaksiSampahQuery = `INSERT INTO Transaksi_Sampah(transaksi_sampah_id, sampah_id, jumlah_sampah) VALUES ${transaksiSampahText.join(", ")}`;
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
  return res.json("update transaksi");
};
