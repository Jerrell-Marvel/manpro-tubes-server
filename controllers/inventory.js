import pool from "../db/db.js";

export const getAllInventory = async (req, res) => {
  const queryText = "SELECT * FROM Inventory_Sampah i INNER JOIN Sampah s ON i.sampah_id = s.sampah_id INNER JOIN Harga h ON  s.harga_id_sekarang = h.harga_id";

  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};
