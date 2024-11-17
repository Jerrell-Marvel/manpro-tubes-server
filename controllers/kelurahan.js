import pool from "../db/db.js";

export const getKelurahan = async (req, res) => {
  let queryText = `SELECT * FROM Kelurahan`;

  const { kec_id } = req.query;

  const values = [];
  if (kec_id) {
    queryText += ` WHERE kec_id = $1`;
    values.push(kec_id);
  }

  const queryResult = await pool.query(queryText, values);

  return res.json(queryResult.rows);
};
