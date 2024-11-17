import pool from "../db/db.js";

export const getKecamatan = async (req, res) => {
  const queryText = `SELECT * FROM Kecamatan`;
  const values = [];

  const queryResult = await pool.query(queryText, values);

  return res.json(queryResult.rows);
};
