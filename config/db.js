import mongoose from "mongoose";
import colors from "colors";
import setupTestDB from "../tests/utils/setupTestDB.js";
const connectDB = async () => {
    try {
        if (process.env.DEV_MODE === "test") {
            await setupTestDB();
        }
        else {
            const conn = await mongoose.connect(process.env.MONGO_URL);
            console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
        }
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;