import express from "express";
import morgan from "morgan";
import authRoutes from "../routes/authRoute.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { fileURLToPath } from "url";
import categoryModel from "../models/categoryModel.js";
import setupTestDB from "./setupTestDB.js";

// database config
setupTestDB();


const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/user", userRoutes);

// rest api

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

dotenv.config();

const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.DEV_MODE} mode on ${PORT}`
  );
});