import { jest } from "@jest/globals";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";
import express from "express";


JWT.verify = jest.fn();
userModel.findById = jest.fn();

const app = express();
app.use(express.json());

app.get("/protected", requireSignIn, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

app.get("/admin", requireSignIn, isAdmin, (req, res) => {
    res.status(200).json({ success: true });
});

describe("Auth Middleware", () => {
    let req, res, next;

    req = { headers: {} };
        res = {
            status: jest.fn(() => res),
            send: jest.fn(),
        };
        next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("requireSignIn should allow access with valid token", async () => {
        const mockUser = { _id: "123", role: 0 };
        JWT.verify.mockReturnValue(mockUser);

        req.headers.authorization = "valid-token";
        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledWith("valid-token", process.env.JWT_SECRET);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    test("requireSignIn should not call next() with invalid token", async () => {
        JWT.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        req.headers.authorization = "invalid-token";
        await requireSignIn(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    test("isAdmin should call next() for admin users", async () => {
        const mockUser = { _id: "123", role: 1 };
        req.user = mockUser;
        userModel.findById.mockResolvedValue(mockUser);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith("123");
        expect(next).toHaveBeenCalled();
    });

    test("isAdmin should send 401 error for non-admin users", async () => {
        const mockUser = { _id: "123", role: 0 };
        req.user = mockUser;
        userModel.findById.mockResolvedValue(mockUser);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "UnAuthorized Access",
        });
    });

    test("isAdmin should log error and return 401 if userModel.findById throws an error", async () => {
        const error = new Error("Database error");
        req.user = { _id: "123" };
        userModel.findById.mockRejectedValue(error);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith("123");
        expect(console.log).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error,
            message: "Error in admin middleware",
        });
    });
});

