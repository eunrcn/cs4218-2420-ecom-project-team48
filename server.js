import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

// database config
connectDB();

// configure env
dotenv.config();

const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white
  );
});
