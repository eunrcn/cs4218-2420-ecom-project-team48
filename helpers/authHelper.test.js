import { jest } from "@jest/globals";

import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper.js";

bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();

describe("Password Hashing Utility", () => {
    it("should hash a password and return a string", async () => {
        bcrypt.hash.mockResolvedValueOnce("mockHashedPassword");

        const hashedPassword = await hashPassword("securePassword");

        expect(hashedPassword).toBe("mockHashedPassword");
        expect(typeof hashedPassword).toBe("string");
    });

    it("should correctly compare a hashed password with the original", async () => {
        const password = "securePassword";
        const hashedPassword = "mockHashedPassword";

        bcrypt.hash.mockResolvedValueOnce(hashedPassword);
        bcrypt.compare.mockResolvedValueOnce(true);

        const generatedHash = await hashPassword(password);
        const isMatch = await comparePassword(password, generatedHash);

        expect(isMatch).toBe(true);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("should return false for an incorrect password", async () => {
        const password = "securePassword";
        const wrongPassword = "wrongPassword";
        const hashedPassword = "mockHashedPassword";

        bcrypt.hash.mockResolvedValueOnce(hashedPassword);
        bcrypt.compare.mockResolvedValueOnce(false);

        const generatedHash = await hashPassword(password);
        const isMatch = await comparePassword(wrongPassword, generatedHash);

        expect(isMatch).toBe(false);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, hashedPassword);
    });

    it("should log error when hashPassword fails", async () => {
        const mockError = new Error("Mock Error");
        bcrypt.hash.mockRejectedValueOnce(mockError);        
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {}); // Spy on console.log

        const result = await hashPassword("securePassword");

        expect(result).toBeUndefined();
        expect(console.log).toHaveBeenCalledWith(mockError);
        logSpy.mockRestore();
    });
});
