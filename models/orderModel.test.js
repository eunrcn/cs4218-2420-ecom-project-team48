import mongoose from "mongoose";
import Order from "./orderModel";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Order Model Test", () => {
    let mongoServer, mockOrderData;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const conn = await mongoose.connect(mongoUri);

        mockOrderData = {
            products: [new mongoose.Types.ObjectId()],
            payment: { message: "Invalid", success: true, params: { transaction: { amount: 100, paymentMethodNonce: "1", type: "sale" } } },
            buyer: new mongoose.Types.ObjectId(),
            status: "Processing",
        };
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });


    test("should create and save an order successfully", async () => {
        const savedOrder = await Order(mockOrderData).save();

        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.products.length).toBe(1);
        expect(savedOrder.payment.message).toBe("Invalid");
        expect(savedOrder.payment.success).toBe(true);
        expect(savedOrder.payment.params.transaction.amount).toBe(100);
        expect(savedOrder.payment.params.transaction.paymentMethodNonce).toBe("1");
        expect(savedOrder.payment.params.transaction.type).toBe("sale");
        expect(savedOrder.status).toBe("Processing");
    });

    test.each([
        { field: "products", invalidValue: "invalid" },
        { field: "buyer", invalidValue: "invalid" },
        { field: "status", invalidValue: "invalid" },
    ])("should return error when $field has an invalid type", async ({ field, invalidValue }) => {
        const orderData = { ...mockOrderData, [field]: invalidValue };

        await expect(Order.create(orderData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

});