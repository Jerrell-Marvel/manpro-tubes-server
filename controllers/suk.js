import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export const getSUK = async (req, res) => {
  const queryText = `SELECT * FROM SUK WHERE is_active=TRUE`;
  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};

export const createSUK = async (req, res) => {
  const { namaSUK } = req.body;

  if (!namaSUK) {
    throw new BadRequestError("All specified field must be included");
  }

  const queryText = `INSERT INTO SUK (nama_suk) VALUES ($1) RETURNING suk_id`;
  const values = [namaSUK];

  const queryResult = await pool.query(queryText, values);

  const sukId = queryResult.rows[0].suk_id;

  return res.json({ success: true, sukId });
};

export const updateSUK = async (req, res) => {
  const { sukId } = req.params;
  const { namaSUK } = req.body;

  return res.json("update SUK " + sukId);
};

export const deleteSUK = async (req, res) => {
  const { sukId } = req.params;

  return res.json("delete SUK" + sukId);
};
