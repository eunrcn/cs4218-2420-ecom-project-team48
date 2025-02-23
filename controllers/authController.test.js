import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController, 
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let token, userId;

const mockUser = {
  name: "Saber",
  email: "saber@example.com",
  password: "password123",
  phone: "1234567890",
  address: "123 Saber St",
  answer: "blue",
  role: "user",
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await userModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("User Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  describe("Register Controller", () => {
    it("should register a new user", async () => {
      req.body = mockUser;
      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User Register Successfully",
        })
      );

      const user = await userModel.findOne({ email: mockUser.email });
      expect(user).toBeTruthy();
      userId = user._id;
    });

    it("should not register an existing user", async () => {
      req.body = mockUser;
      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Already Register please login",
        })
      );
    });
  });

  describe("Login Controller", () => {
    it("should login a registered user", async () => {
      req.body = { email: mockUser.email, password: mockUser.password };
      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "login successfully",
        })
      );

      token = res.send.mock.calls[0][0].token;
    });

    it("should fail with incorrect password", async () => {
      req.body = { email: mockUser.email, password: "wrongpassword" };
      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid Password",
        })
      );
    });
  });

  describe("Forgot Password Controller", () => {
    it("should reset password successfully", async () => {
      req.body = {
        email: mockUser.email,
        answer: mockUser.answer,
        newPassword: "newpassword123",
      };
      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Password Reset Successfully",
        })
      );
    });

    it("should return error for incorrect answer", async () => {
      req.body = {
        email: mockUser.email,
        answer: "wronganswer",
        newPassword: "newpassword123",
      };
      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Wrong Email Or Answer",
        })
      );
    });
  });

  describe("Test Protected Route", () => {
    it("should return protected route message", async () => {
      await testController(req, res);

      expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });
  });

  describe("Update Profile Controller", () => {
    it("should update user profile", async () => {
      req.body = { name: "Updated User", phone: "9876543210" };
      req.user = { _id: userId };

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile Updated SUccessfully",
        })
      );

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.name).toBe("Updated User");
    });
  });
});