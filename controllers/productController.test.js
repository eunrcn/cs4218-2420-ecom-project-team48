import { jest } from "@jest/globals";
import { getProductController, getSingleProductController, productPhotoController } from './productController';
import productModel from "../models/productModel";


describe("Get Product Controller Test", () => {
    let req, res, mockProducts;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        mockProducts = [{
            _id: 1, name: "Product1", slug: "product1", description: "A high-end product", price: 999.99, category: 2, quantity: 50, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 2, name: "Product2", slug: "product2", description: "A high-end product", price: 999.99, category: 2, quantity: 50, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        }];
    });

    test("Should return a list of products successfully", async () => {

        productModel.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        });

        await getProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: "ALlProducts ",
            products: mockProducts,
        });
    });


    test("Should handle errors during get list of products successfully", async () => {
        productModel.find = jest.fn().mockImplementation(() => {
            throw new Error("Database error");
        });

        await getProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Erorr in getting products",
            error: "Database error",
        });
    });
});

describe("Get Single Product Controller Test", () => {
    let req, res, mockProducts;

    beforeEach(() => {
        jest.clearAllMocks();
        mockProducts = [{
            _id: 1, name: "Product1", slug: "product1", description: "Good product", price: 999.99, category: 2, quantity: 50, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 2, name: "Product2", slug: "product2", description: "Better product", price: 999.99, category: 2, quantity: 50, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        }];

        req = { params: { slug: mockProducts[1].slug } };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

    });

    test("Should find the specific product successfully", async () => {
        const mockTargetProduct = mockProducts[1];

        productModel.findOne = jest.fn().mockImplementation(({ slug }) => ({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(
                mockProducts.find(p => p.slug === slug) || null
            ),
        }));

        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Single Product Fetched",
            product: mockTargetProduct,
        });
    });

    test("Should return null if product is not found", async () => {

        req.params.slug = "null slug";

        productModel.findOne = jest.fn().mockImplementation(({ slug }) => ({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(
                mockProducts.find(p => p.slug === slug) || null
            ),
        }));

        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Single Product Fetched",
            product: null,
        });
    });

    test("Should handle errors during get single product successfully", async () => {
        const dbError = new Error("Database error");
        productModel.findOne = jest.fn().mockImplementation(() => {
            throw dbError;
        });


        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Eror while getitng single product",
            error: dbError,
        });
    });

});

describe("productPhotoController", () => {
    let req, res;

    beforeEach(() => {
        req = { params: { pid: "123" } };
        res = {
            set: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return photo data if available", async () => {
        const mockPhoto = { data: Buffer.from("image-data"), contentType: "image/jpeg" };

        productModel.findById = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ photo: mockPhoto }),
        });

        await productPhotoController(req, res);

        expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(Buffer.from("image-data"));
    });

    test("Should handle errors during find photo successfully", async () => {
        const dbError = new Error("Database error");
        productModel.findById = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await productPhotoController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Erorr while getting photo",
            error: dbError,
        }));
    });

    test("should not send response if photo data is missing", async () => {
        productModel.findById = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ photo: {} }),
        });

        await productPhotoController(req, res);

        expect(res.send).not.toHaveBeenCalled();
        expect(res.set).not.toHaveBeenCalled();
    });
});
