// Express
import express from "express";
const app = express();

// import multer from "multer";
// const upload = multer();
// app.use(upload.array("product-images"));

// Serve static from public folder
app.use(express.static("public"));

// Express async errors
import "express-async-errors";

//axios
import axios from "axios";

// Error handler
import { errorHandler } from "./middleware/errorHandler.js";

// dotenv
import dotenv from "dotenv";
dotenv.config();

// Cors
import cors from "cors";

// Model import (Use .js file extension!!!)
import cookieParser from "cookie-parser";

// Cookie parse
app.use(cookieParser());

// Parse json
app.use(express.json());

//Setting up cors
app.use(cors());

// Middleware import
import { authMiddleware } from "./middleware/auth.js";

// Routes import

import userRoute from "./routes/user.js";
import jenisSampahRoute from "./routes/jenisSampah.js";
import sukRoute from "./routes/suk.js";
import sampahRoute from "./routes/sampah.js";
import transaksiRoute from "./routes/transaksi.js";

// Routes
app.use("/api", userRoute);
app.use("/api/jenis-sampah", jenisSampahRoute);
app.use("/api/SUK", sukRoute);
app.use("/api/sampah", sampahRoute);
app.use("/api/transaksi", transaksiRoute);

app.use("/test", authMiddleware("pengguna"), (req, res) => {
  return res.json("success");
});

//Error handling
app.use(errorHandler);

// Run the server
const PORT = 5000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.log("Failed");
  }
});
