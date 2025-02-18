import mongoose from "mongoose";
import Product from "./productModel";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Product Model Test", () => {
    let mongoServer, mockProductData;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const conn = await mongoose.connect(mongoUri);

        mockProductData = {
            name: "Product1",
            slug: "product1",
            description: "A test product",
            price: 499.99,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            photo: {
                data: Buffer.from('/9j/4A', 'base64'),
                contentType: "image/jpeg",
            },
            shipping: true,
        };
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });


    test("should create a product successfully", async () => {

        const createdProduct = await Product.create(mockProductData);

        expect(createdProduct._id).toBeDefined();
        expect(createdProduct.name).toBe(mockProductData.name);
        expect(createdProduct.slug).toBe(mockProductData.slug);
        expect(createdProduct.description).toBe(mockProductData.description);
        expect(createdProduct.price).toBe(mockProductData.price);
        expect(createdProduct.category).toEqual(mockProductData.category);
        expect(createdProduct.quantity).toBe(mockProductData.quantity);
        expect(Buffer.compare(createdProduct.photo.data, mockProductData.photo.data)).toBe(0);
        expect(createdProduct.photo.contentType).toBe(mockProductData.photo.contentType);
        expect(createdProduct.shipping).toBe(mockProductData.shipping);
        expect(createdProduct.createdAt).toBeDefined();
        expect(createdProduct.updatedAt).toBeDefined();
    });

    test.each([
        { field: "name" },
        { field: "slug" },
        { field: "description" },
        { field: "price" },
        { field: "category" },
        { field: "quantity" },
    ])("should fail validation if $field is missing", async ({ field, expectedError }) => {
        // Create a shallow copy without the required field
        const productData = { ...mockProductData };
        delete productData[field];

        await expect(Product.create(productData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test.each([
        { field: "name", invalidValue: new Array() },
        { field: "slug", invalidValue: null },
        { field: "description", invalidValue: undefined },
        { field: "price", invalidValue: "string" },
        { field: "category", invalidValue: "string" },
        { field: "quantity", invalidValue: "string" },
        { field: "shipping", invalidValue: "string" },
    ])("should return error when $field has an invalid type", async ({ field, invalidValue }) => {

        const productData = { ...mockProductData, [field]: invalidValue };
        await expect(Product.create(productData)).rejects.toThrow(mongoose.Error.ValidationError);
    });
});