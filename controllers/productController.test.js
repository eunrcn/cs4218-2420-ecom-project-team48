import { jest } from "@jest/globals";
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";

let getProductController;
let getSingleProductController;
let productPhotoController;
let productFiltersController;
let productCountController;
let productListController;
let mockProducts;
let mockCategories;

beforeAll(async () => {
    const productControllerModule = await import("./productController.js");
    getProductController = productControllerModule.getProductController;
    getSingleProductController = productControllerModule.getSingleProductController;
    productPhotoController = productControllerModule.productPhotoController;
    productFiltersController = productControllerModule.productFiltersController;
    productCountController = productControllerModule.productCountController;
    productListController = productControllerModule.productListController;
    searchProductController = productControllerModule.searchProductController;
    realtedProductController = productControllerModule.realtedProductController;
    productCategoryController = productControllerModule.productCategoryController;

    mockProducts = [{
        _id: "1", name: "Product1", slug: "product1", description: "A high-end product", price: 499.99, category: "C1", quantity: 10, shipping: false,
        photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
    },
    {
        _id: "2", name: "Product2", slug: "product2", description: "A high-end product", price: 999.99, category: "C2", quantity: 20, shipping: false,
        photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
    },
    {
        _id: "3", name: "Product3", slug: "product3", description: "A high-end product", price: 899.99, category: "C3", quantity: 30, shipping: false,
        photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
    }];

    mockCategories = [
        { _id: "C1", name: "Cat1", slug: "cat1" }, { _id: "C2", name: "Cat2", slug: "cat2" },
        { _id: "C3", name: "Cat3", slug: "cat3" }, { _id: "C4", name: "Cat4", slug: "cat4" }];
});


describe("Get Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

    });

    test("should return a list of products successfully", async () => {

        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        };

        productModel.find = jest.fn().mockReturnValue(mockQuery);

        await getProductController(req, res);


        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.populate).toHaveBeenCalledWith("category");
        expect(mockQuery.limit).toHaveBeenCalledWith(12);
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: "ALlProducts ",
            products: mockProducts,
        });
    });


    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await getProductController(req, res);

        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Erorr in getting products",
            error: "Database error",
        });
    });
});

describe("Get Single Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = { params: { slug: mockProducts[1].slug } };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should find the specific product successfully", async () => {
        const mockProduct = mockProducts[1];

        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findOne = jest.fn().mockReturnValue(mockQuery);

        await getSingleProductController(req, res);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.populate).toHaveBeenCalledWith("category");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Single Product Fetched",
            product: mockProduct,
        });
    });

    test("should return null if product is not found", async () => {

        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(null)
        };

        productModel.findOne = jest.fn().mockReturnValue(mockQuery);

        await getSingleProductController(req, res);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.populate).toHaveBeenCalledWith("category");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Single Product Fetched",
            product: null,
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.findOne = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await getSingleProductController(req, res);

        expect(productModel.findOne).toHaveBeenCalled();
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
        req = { params: { pid: "1" } };
        res = {
            set: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return photo data if available", async () => {
        const mockPhoto = { data: Buffer.from("image-data"), contentType: "image/jpeg" };

        productModel.findById = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockResolvedValue({ photo: mockPhoto });

        await productPhotoController(req, res);
        expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
        expect(productModel.select).toHaveBeenCalledWith("photo");

        expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(Buffer.from("image-data"));
    });

    test("should not send response if photo data is unavailable", async () => {

        productModel.findById = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockResolvedValue({ photo: {} });

        await productPhotoController(req, res);

        expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
        expect(productModel.select).toHaveBeenCalledWith("photo");

        expect(res.send).not.toHaveBeenCalled();
        expect(res.set).not.toHaveBeenCalled();
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.findById = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await productPhotoController(req, res);

        expect(productModel.findById).toHaveBeenCalled();
        expect(productModel.select).toHaveBeenCalledWith("photo");

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Erorr while getting photo",
            error: dbError,
        });
    });
});

describe("Product Filter Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: { checked: [], radio: [] }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
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
            price: { $gte: req.body.radio[0], $lte: req.body.radio[1] },
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
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockRejectedValue(dbError);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error WHile Filtering Products",
            error: dbError,
        }));
    });
});

describe("Product Count Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return the total number of products successfully", async () => {
        const mockTotal = 100;

        productModel.find = jest.fn().mockReturnThis();
        productModel.estimatedDocumentCount = jest.fn().mockResolvedValue(mockTotal);

        await productCountController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(productModel.estimatedDocumentCount).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            total: mockTotal,
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await productCountController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(productModel.estimatedDocumentCount).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            message: "Error in product count",
            error: dbError,
            success: false,
        });
    });
});

describe("Product List Controller Test", () => {
    let req, res;
    const perPage = 6;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: { page: 2 } };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return the list of products successfully", async () => {
        const page = req.params.page ? req.params.page : 1;
        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        };

        productModel.find = jest.fn().mockReturnValue(mockQuery);

        await productListController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.skip).toHaveBeenCalledWith((page - 1) * perPage);
        expect(mockQuery.limit).toHaveBeenCalledWith(perPage);
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });


        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await productListController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(productModel.estimatedDocumentCount).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "error in per page ctrl",
            error: dbError,
        });
    });
});

describe("Search Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: { keyword: "1" } };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return matching products successfully", async () => {

        productModel.find = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockResolvedValue([mockProducts[0]]);

        await searchProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            $or: [
                { name: { $regex: req.params.keyword, $options: "i" } },
                { description: { $regex: req.params.keyword, $options: "i" } },
            ]
        });
        expect(productModel.select).toHaveBeenCalledWith("-photo");
        expect(res.json).toHaveBeenCalledWith([mockProducts[0]]);
    });

    test("should return empty array if no matching product found", async () => {
        req.params.keyword = "null";
        productModel.find = jest.fn().mockReturnThis();
        productModel.select = jest.fn().mockResolvedValue([]);

        await searchProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            $or: [
                { name: { $regex: req.params.keyword, $options: "i" } },
                { description: { $regex: req.params.keyword, $options: "i" } },
            ]
        });
        expect(productModel.select).toHaveBeenCalledWith("-photo");
        expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await searchProductController(req, res);

        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error In Search Product API",
            error: dbError,
        });
    });
});

describe("Related Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: { pid: "2", cid: "C1" } };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return related products successfully", async () => {

        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([mockProducts[0]])
        };

        productModel.find = jest.fn().mockReturnValue(mockQuery);

        await realtedProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: req.params.cid,
            _id: { $ne: req.params.pid }
        });

        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.limit).toHaveBeenCalledWith(3);
        expect(mockQuery.populate).toHaveBeenCalledWith("category");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [mockProducts[0]],
        });
    });

    test("should return empty array if no related product found", async () => {
        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([])
        };

        productModel.find = jest.fn().mockReturnValue(mockQuery);

        await realtedProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: req.params.cid,
            _id: { $ne: req.params.pid }
        });

        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.limit).toHaveBeenCalledWith(3);
        expect(mockQuery.populate).toHaveBeenCalledWith("category");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [],
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        productModel.find = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await realtedProductController(req, res);

        expect(productModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "error while geting related product",
            error: dbError,
        });
    });
});

describe("Product Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: { slug: "cat3" } };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test("should return category and related products successfully", async () => {

        categoryModel.findOne = jest.fn().mockResolvedValue(mockCategories[2]);
        productModel.find = jest.fn().mockReturnThis();
        productModel.populate = jest.fn().mockResolvedValue([mockProducts[2]]),

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
        expect(productModel.find).toHaveBeenCalledWith({ category: mockCategories[2] });
        expect(productModel.populate).toHaveBeenCalledWith("category");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            category: mockCategories[2],
            products: [mockProducts[2]],
        });
    });

    test("should return empty products array if no products found", async () => {

        categoryModel.findOne = jest.fn().mockResolvedValue(mockCategories[2]);
        productModel.find = jest.fn().mockReturnThis();
        productModel.populate = jest.fn().mockResolvedValue([]);

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
        expect(productModel.find).toHaveBeenCalledWith({ category: mockCategories[2] });
        expect(productModel.populate).toHaveBeenCalledWith("category");
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            category: mockCategories[2],
            products: [],
        });
    });

    test("should return error if category is not found", async () => {
        req.params.slug = "cat4";

        categoryModel.findOne.mockResolvedValue(null);
        productModel.find = jest.fn().mockReturnThis();
        productModel.populate = jest.fn().mockResolvedValue([]);

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
        expect(productModel.find).toHaveBeenCalledWith({ category: null });
        expect(productModel.populate).toHaveBeenCalledWith("category");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            category: null,
            products: [],
        });
    });

    test("should handle database errors correctly", async () => {
        const dbError = new Error("Database error");
        categoryModel.findOne = jest.fn().mockImplementation(() => {
            throw dbError;
        });

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: dbError,
            message: "Error While Getting products",
        });
    });
});
