import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import productModel from "../models/productModel";
import userModel from "../models/userModel";
import JWT from "jsonwebtoken";
import request from "supertest";
import { expect } from "@playwright/test";
import { describe } from "node:test";

let mongoServer, adminToken, userToken;

const sampleUserData = [{
    _id: new mongoose.Types.ObjectId(),
    name: "admin",
    email: "admin@admin.com",
    password: "admin",
    phone: "12345678",
    address: "admin",
    answer: "admin",
    role: 1
}, {
    _id: new mongoose.Types.ObjectId(),
    name: "user",
    email: "user@user.com",
    password: "user",
    phone: "12345678",
    address: "user",
    answer: "user",
    role: 0
}];

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri); 

    // Add user access & generate JWT token
    await userModel.insertMany(sampleUserData);
    adminToken = await JWT.sign({ _id: sampleUserData[0]._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    userToken = await JWT.sign({ _id: sampleUserData[1]._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
});


afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("User Controller Tests", () => {
    it("should get all users", async () => {
        const res = await request(app)
            .get("/api/v1/user/get-users")
            .set("Authorization", adminToken)
            .expect(200);
    
        expect(res.body.users).toHaveLength(2);
        expect(res.body.users[0]._id).toBe(sampleUserData[0]._id.toString());
        expect(res.body.users[0].name).toBe(sampleUserData[0].name);
        expect(res.body.users[0].email).toBe(sampleUserData[0].email);
        expect(res.body.users[0].role).toBe(sampleUserData[0].role);

        expect(res.body.users[1]._id).toBe(sampleUserData[1]._id.toString());
        expect(res.body.users[1].name).toBe(sampleUserData[1].name);
        expect(res.body.users[1].email).toBe(sampleUserData[1].email);
        expect(res.body.users[1].role).toBe(sampleUserData[1].role);
    });

    it("should not return any data using user token", async () => {
        const res = await request(app)
            .get("/api/v1/user/get-users")
            .set("Authorization", userToken)
            .expect(401);    
        
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Unauthorized Access');
    });
    
});


