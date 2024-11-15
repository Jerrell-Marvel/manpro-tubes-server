import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export const getSUK = async (req, res) => {
  const queryText = `SELECT * FROM SUK WHERE is_active=TRUE`;
  const queryResult = await pool.query(queryText);

  return res.json(queryResult.rows);
};

export const createSUK = async (req, res) => {
  return res.json("create SUK");
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
