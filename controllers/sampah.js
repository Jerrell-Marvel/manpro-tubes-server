import pool from "../db/db.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export const getSampah = async (req, res) => {
  return res.json("get sampah");
};

export const createSampah = async (req, res) => {
  return res.json("create sampah");
};

export const updateSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("udpate sampah " + sampahId);
};

export const deleteSampah = async (req, res) => {
  const { sampahId } = req.params;

  return res.json("delete sampah " + sampahId);
};
