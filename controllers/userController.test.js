import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";
import UserModel from "../models/userModel.js";
import { getUsersController } from "../controllers/userController.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

const mockUsers = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Ben",
    email: "ben@gmail.com",
    role: 1,
    password: "securePassword123",
    phone: "91234567",
    address: "123 Orchard Road",
    answer: "blue",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Alex",
    email: "alex@gmail.com",
    role: 0,
    password: "anotherSecurePassword456",
    phone: "98765432",
    address: "456 Marina Bay",
    answer: "i love pizza",
  },
];

describe("User Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  describe("getUsersController", () => {
    test("should fetch all users successfully", async () => {
      await UserModel.insertMany(mockUsers);

      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Users retrieved successfully",

        // only need these 4 fields
        users: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(mongoose.Types.ObjectId),
            name: "Ben",
            email: "ben@gmail.com",
            role: 1,
          }),
          expect.objectContaining({
            _id: expect.any(mongoose.Types.ObjectId),
            name: "Alex",
            email: "alex@gmail.com",
            role: 0,
          }),
        ]),
      });
    });

    test("should not return sensitive fields like password, phone, address, and answer", async () => {
      await UserModel.insertMany(mockUsers);

      await getUsersController(req, res);

      const responseUsers = res.send.mock.calls[0][0].users;

      responseUsers.forEach((user) => {
        expect(user.password).toBeUndefined();
        expect(user.phone).toBeUndefined();
        expect(user.address).toBeUndefined();
        expect(user.answer).toBeUndefined();
      });
    });

    test("should handle empty users list", async () => {
      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Users retrieved successfully",
        users: [],
      });
    });

    test("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      jest.spyOn(UserModel, "find").mockImplementationOnce(() => {
        throw mockError;
      });

      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving users",
        error: mockError.message,
      });
    });

    test("should handle unexpected errors", async () => {
      const mockError = new Error("Unexpected error");
      jest.spyOn(res, "send").mockImplementationOnce(() => {
        throw mockError;
      });

      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving users",
        error: mockError.message,
      });
    });
  });
});
