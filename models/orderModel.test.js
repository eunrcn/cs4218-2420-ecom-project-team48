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
            payment: { message: "Invalid", success: false, params: { transaction: { amount: 100, paymentMethodNonce: "1", type: "sale" } } },
            buyer: new mongoose.Types.ObjectId(),
            status: "Processing",
        };
    });

    beforeEach(async () => {
        await Order.deleteMany({});
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
        expect(savedOrder.payment.success).toBe(false);
        expect(savedOrder.payment.params.transaction.amount).toBe(100);
        expect(savedOrder.payment.params.transaction.paymentMethodNonce).toBe("1");
        expect(savedOrder.payment.params.transaction.type).toBe("sale");
        expect(savedOrder.status).toBe("Processing");
    });

    test("should retrieve an order successfully", async () => {
        const savedOrder = await Order(mockOrderData).save();
        const retrievedOrder = await Order.findById(savedOrder._id);

        expect(retrievedOrder).not.toBeNull();

        expect(retrievedOrder._id.toString()).toBe(savedOrder._id.toString());
        expect(retrievedOrder.products.length).toBe(savedOrder.products.length);
        expect(retrievedOrder.payment.message).toBe(savedOrder.payment.message);
        expect(retrievedOrder.status).toBe(savedOrder.status);
    });

    test("should update an order successfully", async () => {
        const savedOrder = await Order(mockOrderData).save();

        savedOrder.status = "Shipped";
        savedOrder.payment.message = "Approved";
        savedOrder.payment.success = true;
        savedOrder.payment.params.transaction.amount = 200;
        savedOrder.payment.params.transaction.paymentMethodNonce = "2";

        const updatedOrder = await savedOrder.save();

        expect(updatedOrder.status).toBe("Shipped");
        expect(updatedOrder.payment.message).toBe("Approved");
        expect(updatedOrder.payment.success).toBe(true);
        expect(updatedOrder.payment.params.transaction.amount).toBe(200);
        expect(updatedOrder.payment.params.transaction.paymentMethodNonce).toBe("2");
        expect(updatedOrder.payment.params.transaction.type).toBe("sale");
    });


    test("should delete an order successfully", async () => {
        const savedOrder = await Order(mockOrderData).save();
        const deleteResult = await Order.findByIdAndDelete(savedOrder._id);

        expect(deleteResult).not.toBeNull();
        const deletedOrder = await Order.findById(savedOrder._id);
        expect(deletedOrder).toBeNull();
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