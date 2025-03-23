import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import request from "supertest";
import JWT from "jsonwebtoken";

describe("Auth Controller Integration Tests", () => {
  let mongoServer;
  let registeredUser;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const hashedPassword = await hashPassword("registereduserpass123");
    registeredUser = await userModel.create({
      name: "Kim MJ",
      email: "kimmj@nj.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "123 Test St",
      answer: "test answer"
    });
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe("Registration Tests", () => {
    test("should successfully register a new user", async () => {
      const newUser = {
        name: "Kang SG",
        email: "kangsg@rv.com",
        password: "newuserpass123",
        phone: "9876543210",
        address: "456 New St",
        answer: "new answer"
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User Register Successfully");
      expect(res.body.user).toHaveProperty("name", newUser.name);
      expect(res.body.user).toHaveProperty("email", newUser.email);
      expect(res.body.user).not.toHaveProperty("password", newUser.password);
    });

    test("should prevent registration with existing email", async () => {
      const userData = {
        name: "Duplicate User",
        email: "kimmj@nj.com", // Same as registeredUser
        password: "password123",
        phone: "9876543210",
        address: "456 New St",
        answer: "new answer"
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Already registered please login");
    });

    test("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(res.body).toHaveProperty("error", "Name is required");
    });
  });

  describe("Login Tests", () => {
    test("should successfully login with correct credentials", async () => {
      const loginData = {
        email: "kimmj@nj.com",
        password: "registereduserpass123"
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Login successfully");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", loginData.email);
    });

    test("should reject login with incorrect password", async () => {
      const loginData = {
        email: "kimmj@nj.com",
        password: "wrongpassword"
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid Password");
    });

    test("should reject login with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "testpass123"
      };

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email is not registered");
    });
  });

  describe("Forgot Password Tests", () => {
    test("should successfully reset password with correct email and answer", async () => {
      const resetData = {
        email: "kimmj@nj.com",
        answer: "test answer",
        newPassword: "newpass123"
      };

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send(resetData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password Reset Successfully");

      // Verify can login with new password
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: resetData.email,
          password: resetData.newPassword
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    test("should reject password reset with wrong answer", async () => {
      const resetData = {
        email: "kimmj@nj.com",
        answer: "wrong answer",
        newPassword: "newpass123"
      };

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send(resetData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Wrong email or answer");
    });
  });

  describe("Profile Update Tests", () => {
    test("should successfully update user profile", async () => {
      const token = JWT.sign({ _id: registeredUser._id }, process.env.JWT_SECRET);
      const updateData = {
        name: "Updated Name",
        address: "New Address",
        phone: "5555555555"
      };

      const res = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Profile updated successfully");
      expect(res.body.updatedUser).toHaveProperty("name", updateData.name);
      expect(res.body.updatedUser).toHaveProperty("address", updateData.address);
      expect(res.body.updatedUser).toHaveProperty("phone", updateData.phone);
    });

    test("should reject profile update with invalid password length", async () => {
      const token = JWT.sign({ _id: registeredUser._id }, process.env.JWT_SECRET);
      const updateData = {
        password: "short"
      };

      const res = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("error", "Passsword is required and it must be 6 characters long");
    });
  });

  describe("Complete Auth Workflows", () => {
    test("should follow complete register -> login -> update profile flow", async () => {
      // 1. Register a new user
      const newUser = {
        name: "Kang SG",
        email: "kangsg@rv.com",
        password: "newuserpass123",
        phone: "9876543210",
        address: "5 RV St",
        answer: "new answer"
      };
      
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser);
      
      expect(registerRes.status).toBe(201);
      
      // 2. Login with the registered user
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: newUser.email,
          password: newUser.password
        });
      
      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
      const token = loginRes.body.token;
      
      // 3. Update profile using the auth token
      const updateRes = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", token)
        .send({
          name: "Updated User",
          address: "10 Updated St"
        });
      
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.updatedUser.name).toBe("Updated User");
      expect(updateRes.body.updatedUser.address).toBe("10 Updated St");
    });
  });
});
