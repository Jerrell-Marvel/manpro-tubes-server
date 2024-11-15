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

  if (!namaSUK) {
    throw new BadRequestError("All specified field must be included");
  }

  const queryText = `UPDATE SUK SET nama_SUK = $1 WHERE suk_id = $2;`;
  const values = [namaSUK, sukId];

  const queryResult = await pool.query(queryText, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`suk_id ${sukId} not found`);
  }

  return res.status(200).json({ success: true });
};

export const deleteSUK = async (req, res) => {
  const { sukId } = req.params;

  const queryText = `UPDATE SUK SET is_active = FALSE WHERE suk_id = $1`;
  const values = [sukId];

  const queryResult = await pool.query(queryText, values);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`suk_id ${sukId} not found`);
  }

  return res.status(200).json({ success: true });
};
