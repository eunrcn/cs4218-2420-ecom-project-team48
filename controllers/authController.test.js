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

const mockOrders = [
  {
    _id: new mongoose.Types.ObjectId(),
    products: [new mongoose.Types.ObjectId()],
    buyer: new mongoose.Types.ObjectId(),
  },
];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await userModel.deleteMany({});
  await orderModel.deleteMany({});
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

    it("should return error if email is missing", async () => {
      req.body = {
        name: mockUser.name,
        password: mockUser.password,
        phone: mockUser.phone,
        address: mockUser.address,
        answer: mockUser.answer,
        role: mockUser.user,
      };
      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
    });

    it("should return error if password is missing", async () => {
      req.body = {
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        answer: mockUser.answer,
        role: mockUser.user,
      };
      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
    });

    it("should return error if Phone no is missing", async () => {
      req.body = {
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        address: mockUser.address,
        answer: mockUser.answer,
        role: mockUser.user,
      };
      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
    });
    it("should return error if address is missing", async () => {
      req.body = {
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        phone: mockUser.phone,
        answer: mockUser.answer,
        role: mockUser.user,
      };
      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
    });

    it("should return error if answer is missing", async () => {
      req.body = {
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        phone: mockUser.phone,
        address: mockUser.address,
        role: mockUser.user,
      };
      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
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

    it("should handle errors correctly", async () => {
      // Mock console.log to track calls
      jest.spyOn(console, "log").mockImplementation(() => { });

      // Mock res.send to throw an error
      jest.spyOn(res, "send").mockImplementationOnce(() => {
        throw new Error("Unexpected Error");
      });

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Errro in Registeration",
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

    it("should fail a non registered user", async () => {
      req.body = { email: "test@example.com", password: mockUser.password };

      await loginController(req, res);

      const user = await userModel.findOne({ email: "test@example.com" });
      expect(user).not.toBeTruthy();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email is not registerd",
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

    it("should handle errors correctly", async () => {
      // Mock console.log to track calls
      jest.spyOn(console, "log").mockImplementation(() => { });

      // Mock res.send to throw an error
      jest.spyOn(res, "send").mockImplementationOnce(() => {
        throw new Error("Unexpected Error");
      });

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in login",
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

    it("should return error if email is missing", async () => {
      req.body = {
        answer: mockUser.answer,
        newPassword: "newpassword123",
      };
      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Emai is required" });
    });

    it("should return error if answer is missing", async () => {
      req.body = {
        email: mockUser.email,
        newPassword: "newpassword123",
      };
      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "answer is required" });
    });

    it("should return error if password is missing", async () => {
      req.body = {
        email: mockUser.email,
        answer: mockUser.answer,
      };
      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
    });

    it("should handle errors correctly", async () => {
      // Mock console.log to track calls
      jest.spyOn(console, "log").mockImplementation(() => { });

      // Mock res.send to throw an error
      jest.spyOn(res, "send").mockImplementationOnce(() => {
        throw new Error("Unexpected Error");
      });

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Something went wrong",
        })
      );
    });

  });

  describe("Test Protected Route", () => {
    it("should return protected route message", async () => {
      await testController(req, res);

      expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });

    it("should handle errors correctly", async () => {
      // Mock console.log to track calls
      jest.spyOn(console, "log").mockImplementation(() => { });

      // Mock res.send to throw an error
      jest.spyOn(res, "send").mockImplementationOnce(() => {
        throw new Error("Unexpected Error");
      });

      await testController(req, res);

      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) })
      );
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

    it("should return an error if password is less than 6 characters", async () => {
      req.body = {
        name: "Updated User",
        phone: "9876543210",
        password: "123",
      };
      req.user = { _id: userId };

      await updateProfileController(req, res);

      expect(res.json).toHaveBeenCalledWith({
        error: "Passsword is required and 6 character long",
      });
    });

    it("should return a 400 error when profile update fails", async () => {
      req.body = { name: "Updated User", phone: "9876543210" };
      req.user = { _id: userId };

      // Mock `findByIdAndUpdate` to throw an error
      jest.spyOn(userModel, "findByIdAndUpdate").mockRejectedValueOnce(new Error("Database error"));

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error WHile Update profile",
        })
      );
    });

  });

  describe("Get Orders Controller", () => {
    it("should return orders for a user", async () => {
      req.user = { _id: userId };
      mockOrders[0].buyer = userId;
      orderModel.populate = jest.fn().mockResolvedValueOnce(mockOrders);

      await orderModel.create(mockOrders);

      await getOrdersController(req, res);

      const returnedOrders = res.json.mock.calls[0][0];
      expect(returnedOrders.length).toBe(1);
      expect(returnedOrders[0]._id).toStrictEqual(mockOrders[0]._id);
      expect(returnedOrders[0].buyer).toStrictEqual(mockOrders[0].buyer);
      expect(returnedOrders[0].products).toStrictEqual(mockOrders[0].products);
    });


    it("should return a 500 error when orders retrieval fails", async () => {
      const mockError = new Error("Database error");
      jest.spyOn(console, "log").mockImplementation(() => {});
      orderModel.find = jest.fn().mockRejectedValueOnce(mockError);

      await getOrdersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error WHile Geting Orders",
        })
      );
      expect(console.log).toHaveBeenCalledWith(mockError);
    });


  });

  



});
