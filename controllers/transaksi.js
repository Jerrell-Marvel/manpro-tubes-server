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
  return res.json("create transaksi");
};

export const updateTransaksi = async (req, res) => {
  return res.json("update transaksi");
};
