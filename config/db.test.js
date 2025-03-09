import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import connectDB from "./db.js";
import { jest } from "@jest/globals";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongoServer.getUri();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

test("should connect to MongoDB sucessfully", async () => {
    await expect(connectDB()).resolves.not.toThrow();
});

test("should log an error when MongoDB connection fails", async () => {
    const error = new Error("Connection Failed");
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(mongoose, "connect").mockRejectedValue(error);
    await connectDB(); 

    expect(logSpy).toHaveBeenCalledWith(`Error in Mongodb ${error}`.bgRed.white);
    logSpy.mockRestore();
    mongoose.connect.mockRestore();
});