import { jest } from "@jest/globals";
import { getProductController, getSingleProductController, productPhotoController, productFiltersController } from './productController';
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
            _id: 1, name: "Product1", slug: "product1", description: "A high-end product", price: 999.99, category: "Cat1", quantity: 10, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 2, name: "Product2", slug: "product2", description: "A high-end product", price: 999.99, category: "Cat2", quantity: 20, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 3, name: "Product3", slug: "product3", description: "A high-end product", price: 999.99, category: "Cat3", quantity: 30, shipping: false,
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


        expect(productModel.find).toHaveBeenCalledWith({});

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
        expect(productModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });

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

describe("Product Photo Controller Test", () => {
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
        expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);

        expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(Buffer.from("image-data"));
    });

    test("Should handle errors during find photo correctly", async () => {
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

    test("should not send response if photo data is unavailable", async () => {
        productModel.findById = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ photo: {} }),
        });

        await productPhotoController(req, res);

        expect(res.send).not.toHaveBeenCalled();
        expect(res.set).not.toHaveBeenCalled();
    });
});

describe("Product Filter Controller Test", () => {
    let req, res, mockProducts;

    beforeEach(() => {
        req = {
            body: { checked: [], radio: [] }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        mockProducts = [{
            _id: 1, name: "Product1", slug: "product1", description: "A high-end product", price: 499.99, category: "Cat1", quantity: 10, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 2, name: "Product2", slug: "product2", description: "A high-end product", price: 999.99, category: "Cat2", quantity: 20, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        },
        {
            _id: 3, name: "Product3", slug: "product3", description: "A high-end product", price: 899.99, category: "Cat3", quantity: 30, shipping: false,
            photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
        }];
    });

    test("should filter product based on category successfully", async () => {
        req.body.checked = ["Cat1"];

        productModel.find = jest.fn().mockResolvedValue([mockProducts[0]]);


        await productFiltersController(req, res);
        expect(productModel.find).toHaveBeenCalledWith({ category: req.body.checked });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [mockProducts[0]],
        });
    });

    test("Should filter multiple categories successfully", async () => {
        req.body.checked = ["Cat1", "Cat3"];

        productModel.find = jest.fn().mockResolvedValue([mockProducts[0], mockProducts[2]]);


        await productFiltersController(req, res);
        expect(productModel.find).toHaveBeenCalledWith({ category: req.body.checked });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [mockProducts[0], mockProducts[2]],
        });
    });

    test("should filter products based on price range successfully", async () => {
        req.body.radio = [500, 1000];

        //Product 2 and 3
        productModel.find = jest.fn().mockResolvedValue([mockProducts[1], mockProducts[2]]);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({ price: { $gte: req.body.radio[0], $lte: req.body.radio[1] } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [mockProducts[1], mockProducts[2]],
        });
    });

    test("should filter products based on category and price successfully", async () => {
        req.body.checked = ["Cat1", "Cat2"];
        req.body.radio = [500, 1000];

        //Product 2 only
        productModel.find = jest.fn().mockResolvedValue([mockProducts[1]]);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: req.body.checked,
            price: { $gte: req.body.radio[0], $lte:req.body.radio[1] },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [mockProducts[1]], 
        });
    });

    test("should return all products when no filters are applied successfully", async () => {
        productModel.find = jest.fn().mockResolvedValue(mockProducts);

        await productFiltersController(req, res);
        expect(productModel.find).toHaveBeenCalledWith({});

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database failure");
        productModel.find = jest.fn().mockRejectedValue(dbError);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error WHile Filtering Products",
            error: dbError,
        }));
    });
});
