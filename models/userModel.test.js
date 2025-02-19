import mongoose from "mongoose";
import User from "./userModel";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterEach, beforeEach } from "node:test";

describe("User Model Test", () => {
    let mongoServer, mockUserData;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const conn = await mongoose.connect(mongoUri);

        mockUserData = {
            name: "test",
            email: "test@test",
            password: "test",
            phone: "1234567890",
            address: "test",
            answer: "test",
            role: 1
        };
    });



    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test("should create a user successfully", async () => {

        const createdUser = await User.create(mockUserData);

        expect(createdUser._id).toBeDefined();
        expect(createdUser.name).toBe(mockUserData.name);
        expect(createdUser.email).toBe(mockUserData.email);
        expect(createdUser.password).toBe(mockUserData.password);
        expect(createdUser.phone).toBe(mockUserData.phone);
        expect(createdUser.address).toEqual(mockUserData.address);
        expect(createdUser.answer).toBe(mockUserData.answer);
        expect(createdUser.role).toBe(mockUserData.role);
        expect(createdUser.createdAt).toBeDefined();
        expect(createdUser.updatedAt).toBeDefined();
    });


    test.each([
        { field: "name" },
        { field: "email" },
        { field: "password" },
        { field: "phone" },
        { field: "address" },
        { field: "answer" },
    ])("should fail validation if $field is missing", async ({ field, expectedError }) => {
        // Create a shallow copy without the required field
        const userData = { ...mockUserData };
        delete userData[field];

        await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test.each([
        { field: "name", invalidValue: new Array() },
        { field: "email", invalidValue: new Array() },
        { field: "password", invalidValue: new Array() },
        { field: "phone", invalidValue: new Array() },
        { field: "address", invalidValue: undefined },
        { field: "answer", invalidValue: new Array() },
        { field: "role", invalidValue: "string" },
    ])("should return error when $field has an invalid type", async ({ field, invalidValue }) => {

        const userData = { ...mockUserData, [field]: invalidValue };
        await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
    });


    test("should return error when email is not unique", async () => {
        await User.deleteMany({});
        await User.create(mockUserData);
        await expect(User.create(mockUserData)).rejects.toThrow(mongoose.Error.MongoServerError);
    });


    test("should populate role as 0 by default", async () => {
        await User.deleteMany({});
        const userData = { ...mockUserData };
        delete userData["role"];

        const user = await User.create(userData);
        expect(user.role).toBe(0);
    });


    test("should trim whitespace in name", async () => {
        await User.deleteMany({});
        const userData = { ...mockUserData };
        userData["name"] = "  test  ";

        const user = await User.create(userData);
        expect(user.name).toBe("test");
    });
});