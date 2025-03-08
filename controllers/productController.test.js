import { jest } from "@jest/globals";
import categoryModel from "../models/categoryModel";
import { mock } from "node:test";
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const productModel = jest.fn();
const fs = {
  readFileSync: jest.fn(),
};

// Mock orderModel
const mockOrderSave = jest.fn().mockResolvedValue(true);
const mockOrderModel = jest.fn().mockImplementation((data) => ({
    products: data.products,
    payment: data.payment,
    buyer: data.buyer,
    save: mockOrderSave
}));

// Use unstable_mockModule as it is ESM
jest.unstable_mockModule("../models/productModel.js", () => ({
  default: productModel,
}));

jest.unstable_mockModule("../models/orderModel.js", () => ({
  default: mockOrderModel,
}));

jest.unstable_mockModule("fs", () => ({
  default: fs,
}));

// Mock Braintree gateway
const mockGateway = {
  clientToken: {
    generate: jest.fn()
  }
};

jest.unstable_mockModule("braintree", () => ({
  default: {
    BraintreeGateway: jest.fn(() => mockGateway),
    Environment: {
      Sandbox: "sandbox"
    }
  }
}));

let createProductController;
let deleteProductController;
let updateProductController;
let getProductController;
let getSingleProductController;
let productPhotoController;
let productFiltersController;
let productCountController;
let productListController;
let searchProductController;
let relatedProductController;
let productCategoryController;
let braintreeTokenController;
let brainTreePaymentController;

let mockProducts;
let mockCategories;

const mockError = new Error("Database Error");

beforeAll(async () => {
  const productControllerModule = await import("./productController.js");
  createProductController = productControllerModule.createProductController;
  deleteProductController = productControllerModule.deleteProductController;
  updateProductController = productControllerModule.updateProductController;
  getProductController = productControllerModule.getProductController;
  getSingleProductController = productControllerModule.getSingleProductController;
  productPhotoController = productControllerModule.productPhotoController;
  productFiltersController = productControllerModule.productFiltersController;
  productCountController = productControllerModule.productCountController;
  productListController = productControllerModule.productListController;
  searchProductController = productControllerModule.searchProductController;
  relatedProductController = productControllerModule.relatedProductController;
  productCategoryController = productControllerModule.productCategoryController;
  braintreeTokenController = productControllerModule.braintreeTokenController;
  brainTreePaymentController = productControllerModule.brainTreePaymentController;

  mockProducts = [{
    _id: "1", name: "Product1", slug: "product1", description: "Test product", price: 499.99, category: "C1", quantity: 10, shipping: false,
    photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
  },
  {
    _id: "2", name: "Product2", slug: "product2", description: "Test product", price: 999.99, category: "C2", quantity: 20, shipping: false,
    photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
  },
  {
    _id: "3", name: "Product3", slug: "product3", description: "Test product", price: 899.99, category: "C3", quantity: 30, shipping: false,
    photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
  }];

  mockCategories = [
    { _id: "C1", name: "Cat1", slug: "cat1" }, { _id: "C2", name: "Cat2", slug: "cat2" },
    { _id: "C3", name: "Cat3", slug: "cat3" }, { _id: "C4", name: "Cat4", slug: "cat4" }];

});

// createProductController
describe("createProductController", () => {
  let mockReq;
  let mockRes;
  let mockProduct;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock product instance returned when product model is instantiated
    mockProduct = {
      save: jest.fn().mockResolvedValue({}),
      photo: {
        data: Buffer.from([]),
        contentType: "",
      },
    };

    // Setup productModel mock default implementation
    productModel.mockImplementation(() => mockProduct);

    // Mock request
    mockReq = {
      fields: {
        name: "Jeans",
        description: "Blue like other jeans",
        price: 22.07,
        category: "Clothing",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: {
          path: "test/path/photo.jpg",
          type: "image/jpeg",
          size: 500000, // 500KB
        },
      },
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock fs to return a mock buffer
    fs.readFileSync.mockReturnValue(Buffer.from("mock image data"));
  });

  it("should create product successfully", async () => {
    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.any(Object),
    });
    expect(mockProduct.save).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledWith("test/path/photo.jpg");
  });

  it.each([
    { field: "name", expectedError: "Name is required" },
    { field: "description", expectedError: "Description is required" },
    { field: "price", expectedError: "Price is required" },
    { field: "category", expectedError: "Category is required" },
    { field: "quantity", expectedError: "Quantity is required" },
  ])("should return error when $field is missing", async ({ field, expectedError }) => {
    // Use this req for testing field validation
    const req = {
      ...mockReq,
      fields: {
        ...mockReq.fields,
        [field]: "",
      },
    };

    await createProductController(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: expectedError,
    });

    mockRes.status.mockClear();
    mockRes.send.mockClear();
  });

  it("should return error when photo size exceeds 1MB", async () => {
    mockReq.files.photo.size = 1500000; // 1.5MB

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Photo is required and it should be less then 1MB",
    });
  });

  it("should handle errors", async () => {
    mockProduct.save.mockRejectedValueOnce(mockError);

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error in clearing product",
    });
  });
});

// deleteProductController
describe("deleteProductController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request and response
    mockReq = {
      params: {
        pid: "product123",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Setup productModel findByIdAndDelete chain mock
    productModel.findByIdAndDelete = jest.fn().mockReturnThis();
    productModel.select = jest.fn().mockResolvedValue({});
  });

  it("should delete product successfully", async () => {
    await deleteProductController(mockReq, mockRes);

    // Verify mongoose methods called correctly
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("product123");
    expect(productModel.select).toHaveBeenCalledWith("-photo");

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product deleted successfully",
    });
  });

  it("should handle errors when deleting product fails", async () => {
    // Mock DB error
    productModel.select.mockRejectedValueOnce(mockError);

    await deleteProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: mockError,
    });
  });

  it("should handle case when product is not found", async () => {
    // Mock DB query ok but no product found
    productModel.select.mockResolvedValueOnce(null);

    await deleteProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product deleted successfully",
    });
  });
});

// updateProductController
describe("updateProductController", () => {
  let mockReq;
  let mockRes;
  let mockProduct;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock product instance returned when product is found and updated
    mockProduct = {
      save: jest.fn().mockResolvedValue({}),
      photo: {
        data: Buffer.from([]),
        contentType: "",
      },
    };

    // Setup productModel findByIdAndUpdate mock
    productModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProduct);

    // Mock request
    mockReq = {
      params: {
        pid: "product123",
      },
      fields: {
        name: "New Jeans",
        description: "New description",
        price: 25.99,
        category: "Clothing",
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          path: "test/path/updated-photo.jpg",
          type: "image/jpeg",
          size: 500000, // 500KB
        },
      },
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock fs to return a mock buffer
    fs.readFileSync.mockReturnValue(Buffer.from("mock updated image data"));
  });

  it("should update product successfully", async () => {
    await updateProductController(mockReq, mockRes);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "product123",
      {
        ...mockReq.fields,
        slug: expect.any(String),
      },
      { new: true }
    );
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: expect.any(Object),
    });
  });

  it.each([
    { field: "name", expectedError: "Name is required" },
    { field: "description", expectedError: "Description is required" },
    { field: "price", expectedError: "Price is required" },
    { field: "category", expectedError: "Category is required" },
    { field: "quantity", expectedError: "Quantity is required" },
  ])("should return error when $field is missing", async ({ field, expectedError }) => {
    // Use this req for testing field validation
    const req = {
      ...mockReq,
      fields: {
        ...mockReq.fields,
        [field]: "",
      },
    };

    await updateProductController(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: expectedError,
    });

    mockRes.status.mockClear();
    mockRes.send.mockClear();
  });

  it("should return error when photo size exceeds 1MB", async () => {
    mockReq.files.photo.size = 1500000; // 1.5MB

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Photo is required and it should be less then 1MB",
    });
  });

  it("should handle database errors", async () => {
    productModel.findByIdAndUpdate.mockRejectedValueOnce(mockError);

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error in updating product",
    });
  });

  it("should update product without photo if no photo provided", async () => {
    mockReq.files = {};

    await updateProductController(mockReq, mockRes);

    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: expect.any(Object),
    });
  });
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
      message: "AllProducts Fetched",
      products: mockProducts,
    });
  });


  test("should handle database errors correctly", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await getProductController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in getting products",
      error: mockError,
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
    productModel.findOne = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting single product",
      error: mockError,
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
    productModel.findById = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalled();
    expect(productModel.select).toHaveBeenCalledWith("photo");

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting photo",
      error: mockError,
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
    productModel.find = jest.fn().mockRejectedValue(mockError);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Error while filtering products",
      error: mockError,
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
    productModel.find = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await productCountController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(productModel.estimatedDocumentCount).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: mockError,
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
    productModel.find = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(productModel.estimatedDocumentCount).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in per page controller",
      error: mockError,
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

  test("should handle errors correctly", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in searching products",
      error: mockError,
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

    await relatedProductController(req, res);

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

    await relatedProductController(req, res);

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
    productModel.find = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting related product",
      error: mockError,
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
    productModel.populate = jest.fn().mockResolvedValue([mockProducts[2]]);

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
    categoryModel.findOne = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error while getting products",
    });
  });
});

describe("Braintree Token Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };

    mockGateway.clientToken.generate.mockReset();
  });

  test("should generate and send client token successfully", async () => {
    const mockResponse = { clientToken: "mock-client-token-220722" };
    mockGateway.clientToken.generate.mockImplementation((options, callback) => {
      callback(null, mockResponse);
    });

    await braintreeTokenController(req, res);

    expect(mockGateway.clientToken.generate).toHaveBeenCalledWith({}, expect.any(Function));
    expect(res.send).toHaveBeenCalledWith(mockResponse);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should handle error when token generation fails", async () => {
    const mockError = new Error("Token generation failed");
    mockGateway.clientToken.generate.mockImplementation((options, callback) => {
      callback(mockError, null);
    });

    await braintreeTokenController(req, res);

    expect(mockGateway.clientToken.generate).toHaveBeenCalledWith({}, expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  test("should handle incorrect gateway response", async () => {
    const incorrectResponse = { /* missing clientToken */ };
    mockGateway.clientToken.generate.mockImplementation((options, callback) => {
      callback(null, incorrectResponse);
    });

    await braintreeTokenController(req, res);

    expect(mockGateway.clientToken.generate).toHaveBeenCalledWith({}, expect.any(Function));
    expect(res.send).toHaveBeenCalledWith(incorrectResponse);
  });

  test("should handle case where both error and response are null", async () => {
    mockGateway.clientToken.generate.mockImplementation((options, callback) => {
      callback(null, null);
    });

    await braintreeTokenController(req, res);

    expect(mockGateway.clientToken.generate).toHaveBeenCalledWith({}, expect.any(Function));
    expect(res.send).toHaveBeenCalledWith(null);
  });
});

describe("Braintree Payment Controller Test", () => {
  let req, res;
  const mockUserId = new ObjectId();
  const mockProductIds = [new ObjectId(), new ObjectId(), new ObjectId()];

  const mockCart = [
    { _id: mockProductIds[0], price: 100 },
    { _id: mockProductIds[1], price: 200 },
    { _id: mockProductIds[2], price: 300 },
  ];
  const mockNonce = "mock-payment-nonce";

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        nonce: mockNonce,
        cart: mockCart,
      },
      user: { _id: mockUserId },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    mockGateway.transaction = {
      sale: jest.fn(),
    };
    mockOrderModel.mockClear();
    mockOrderSave.mockClear();
  });

  test("should process payment and create order successfully", async () => {
    const mockResult = {
      success: true,
      transaction: { id: "tx123" },
    };

    mockGateway.transaction.sale.mockImplementation((options, callback) => {
      callback(null, mockResult);
    });

    await brainTreePaymentController(req, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 600,
        paymentMethodNonce: mockNonce,
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );

    expect(mockOrderModel).toHaveBeenCalledWith({
      products: mockCart,
      payment: mockResult,
      buyer: mockUserId,
    });

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("should handle payment failure", async () => {
    const mockError = new Error("Payment failed");

    mockGateway.transaction.sale.mockImplementation((options, callback) => {
      callback(mockError, null);
    });

    await brainTreePaymentController(req, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  test("should calculate total price correctly for empty cart", async () => {
    req.body.cart = [];
    const mockResult = { success: true };

    mockGateway.transaction.sale.mockImplementation((options, callback) => {
      callback(null, mockResult);
    });

    await brainTreePaymentController(req, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 0,
        paymentMethodNonce: mockNonce,
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );
  });

  test("should handle missing cart in request", async () => {
    const originalReq = {
      body: {
        nonce: "mock-payment-nonce",
        cart: undefined,
      },
      user: { _id: mockUserId },
    };

    await brainTreePaymentController(originalReq, res);

    // Current implementation will throw error when trying to map undefined cart but only console.log it
    expect(mockGateway.transaction.sale).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should handle missing nonce in request", async () => {
    const reqWithoutNonce = {
      body: {
        cart: mockCart,
      },
      user: { _id: mockUserId },
    };

    await brainTreePaymentController(reqWithoutNonce, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 600,
        paymentMethodNonce: undefined,
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  test("should handle empty string nonce", async () => {
    const reqWithEmptyNonce = {
      body: {
        nonce: "",
        cart: mockCart
      },
      user: { _id: mockUserId }
    };

    mockGateway.transaction.sale.mockImplementation((options, callback) => {
      callback(new Error("Invalid payment method nonce"), null);
    });

    await brainTreePaymentController(reqWithEmptyNonce, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 600,
        paymentMethodNonce: "",
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });

  test("should handle missing user in request", async () => {
    const reqWithoutUser = {
      body: {
        nonce: mockNonce,
        cart: mockCart
      }
      // missing user
    };

    await brainTreePaymentController(reqWithoutUser, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 600,
        paymentMethodNonce: mockNonce,
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );
    expect(mockOrderModel).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should handle cart with zero price items", async () => {
    const zeroPriceCart = [
      { _id: mockProductIds[0], price: 0 }
    ];

    const reqWithZeroPriceCart = {
      body: {
        nonce: mockNonce,
        cart: zeroPriceCart
      },
      user: { _id: mockUserId }
    };

    const mockResult = {
      success: true,
      transaction: { id: "tx123" },
    };

    mockGateway.transaction.sale.mockImplementation((options, callback) => {
      callback(null, mockResult);
    });

    await brainTreePaymentController(reqWithZeroPriceCart, res);

    expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
      {
        amount: 0,
        paymentMethodNonce: mockNonce,
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );
    expect(mockOrderModel).toHaveBeenCalledWith({
      products: zeroPriceCart,
      payment: mockResult,
      buyer: mockUserId,
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
