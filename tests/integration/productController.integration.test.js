import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import productModel from "../../models/productModel";
import userModel from "../../models/userModel";
import JWT from "jsonwebtoken";
import request from "supertest";
import { expect } from "@playwright/test";

let mongoServer, adminToken, userToken;
const book_category_id = new mongoose.Types.ObjectId();
const mockProducts = [{
  _id: new mongoose.Types.ObjectId(), name: "Novel", slug: "novel", description: "A bestselling book", price: 59, category: book_category_id, quantity: 10, shipping: true,
  photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
},
{
  _id: new mongoose.Types.ObjectId(), name: "Textbook", slug: "texbook", description: "Ideal for students", price: 19, category: book_category_id, quantity: 20, shipping: true,
  photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
},
{
  _id: new mongoose.Types.ObjectId(), name: "Laptop", slug: "laptop", description: "Mobile PC", price: 49, category: new mongoose.Types.ObjectId(), quantity: 30, shipping: true,
  photo: { data: Buffer.from('/9j/4A', 'base64'), contentType: "image/jpeg" }
}];

const sampleUserData = [{
  _id: new mongoose.Types.ObjectId(),
  name: "admin",
  email: "admin@admin.com",
  password: "admin",
  phone: "12345678",
  address: "admin",
  answer: "admin",
  role: 1
}];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const conn = await mongoose.connect(mongoUri);

  // Add user access & generate JWT token
  await userModel.insertMany(sampleUserData);
  adminToken = await JWT.sign({ _id: sampleUserData[0]._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
});


afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await productModel.create(mockProducts);
});

afterEach(async () => {
  await productModel.deleteMany();
});



describe("Search Product Integration Test", () => {
  it("should return matching products when searching by name", async () => {
    const res = await request(app).get("/api/v1/product/search/laptop");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe(mockProducts[2].name);
    expect(res.body[0].description).toBe(mockProducts[2].description);
    expect(res.body[0].price).toEqual(mockProducts[2].price);
    expect(res.body[0].category.toString()).toEqual(mockProducts[2].category.toString());
    expect(res.body[0].quantity).toEqual(mockProducts[2].quantity);
    expect(res.body[0].shipping).toEqual(mockProducts[2].shipping);
  });

  it("should return matching products when searching by description", async () => {
    // This should return the textbook
    const res = await request(app).get("/api/v1/product/search/students");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe(mockProducts[1].name);
    expect(res.body[0].description).toBe(mockProducts[1].description);
    expect(res.body[0].price).toEqual(mockProducts[1].price);
    expect(res.body[0].category.toString()).toEqual(book_category_id.toString());
    expect(res.body[0].quantity).toEqual(mockProducts[1].quantity);
    expect(res.body[0].shipping).toEqual(mockProducts[1].shipping);
  });

  it("should return matching products when searching by name or description", async () => {
    // This should return the novel & textbook
    const res = await request(app).get("/api/v1/product/search/book");

    // Sort req.body by name to ensure consistency
    res.body.sort((a, b) => a.name.localeCompare(b.name));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe(mockProducts[0].name);
    expect(res.body[0].description).toBe(mockProducts[0].description);
    expect(res.body[0].price).toEqual(mockProducts[0].price);
    expect(res.body[0].category.toString()).toEqual(book_category_id.toString());
    expect(res.body[0].quantity).toEqual(mockProducts[0].quantity);
    expect(res.body[0].shipping).toEqual(mockProducts[0].shipping);

    expect(res.body[1].name).toBe(mockProducts[1].name);
    expect(res.body[1].description).toBe(mockProducts[1].description);
    expect(res.body[1].price).toEqual(mockProducts[1].price);
    expect(res.body[1].category.toString()).toEqual(book_category_id.toString());
    expect(res.body[1].quantity).toEqual(mockProducts[1].quantity);
    expect(res.body[1].shipping).toEqual(mockProducts[1].shipping);
  });

  it("should return empty list when no matching products are found", async () => {
    const res = await request(app).get("/api/v1/product/search/vacuum");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("should create a product and find it via search", async () => {
    //Create product
    await request(app).post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field('name', "Milo drink")
      .field('description', "A delicious drink")
      .field('price', "10")
      .field('category', new mongoose.Types.ObjectId().toString())
      .field('quantity', "10")
      .field('shipping', "true")
      .expect(201);

    //Search for product
    const res = await request(app).get("/api/v1/product/search/Milo");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    // Search results should match the created product
    expect(res.body[0].name).toBe("Milo drink");
    expect(res.body[0].description).toBe("A delicious drink");
    expect(res.body[0].price).toBe(10);
    expect(res.body[0].quantity).toBe(10);
    expect(res.body[0].shipping).toBe(true);
  });

  it("should update a product and find it via search", async () => {
    //Update product
    await request(app).put("/api/v1/product/update-product/" + mockProducts[2]._id)
      .set("Authorization", adminToken)
      .field('name', "Test Laptop")
      .field('description', "A test laptop")
      .field('price', mockProducts[2].price)
      .field('category', mockProducts[2].category.toString())
      .field('quantity', mockProducts[2].quantity)
      .field('shipping', mockProducts[2].shipping)
      .expect(201);

    //Search for product
    const res = await request(app).get("/api/v1/product/search/Test");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    // Search results should match the updated product
    expect(res.body[0].name).toBe("Test Laptop");
    expect(res.body[0].description).toBe("A test laptop");
  });

  it("should delete a product and not find it via search", async () => {
    //Delete product
    await request(app).delete("/api/v1/product/delete-product/" + mockProducts[2]._id)
      .set("Authorization", adminToken);

    //Should not find any matching products
    const res = await request(app).get("/api/v1/product/search/Laptop");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});



describe("Related Product Integration Test", () => {

  it("should return related products of the same category", async () => {
    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[0]._id + "/" + book_category_id);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe(mockProducts[1].name);
    expect(res.body.products[0].description).toBe(mockProducts[1].description);
    expect(res.body.products[0].price).toEqual(mockProducts[1].price);
    expect(res.body.products[0].quantity).toEqual(mockProducts[1].quantity);
    expect(res.body.products[0].shipping).toEqual(mockProducts[1].shipping);
    expect(res.body.products[0].slug).toEqual(mockProducts[1].slug);
  });

  it("should return empty list when no related products are found", async () => {
    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[2]._id + "/" + mockProducts[2].category);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  it("should create a product and verify it appears as a related product", async () => {
    //Create product with the same category as laptop
    await request(app).post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field('name', "Samsung Galaxy S25+")
      .field('description', "A great phone")
      .field('price', "1000")
      .field('category', mockProducts[2].category.toString())
      .field('quantity', "10")
      .field('shipping', "true")
      .expect(201);

    //Search for product
    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[2]._id + "/" + mockProducts[2].category);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);

    // Search results should match the created product
    expect(res.body.products[0].name).toBe("Samsung Galaxy S25+");
    expect(res.body.products[0].description).toBe("A great phone");
    expect(res.body.products[0].price).toBe(1000);
    expect(res.body.products[0].quantity).toBe(10);
    expect(res.body.products[0].shipping).toBe(true);
  });

  it("should update a product and ensure it still appears as another product's related product", async () => {
    //Update product category of novel to match laptop
    await request(app).put("/api/v1/product/update-product/" + mockProducts[0]._id)
      .set("Authorization", adminToken)
      .field('name', mockProducts[0].name)
      .field('description', mockProducts[0].description)
      .field('price', mockProducts[0].price)
      .field('category', mockProducts[2].category.toString()) // Updated Category
      .field('quantity', mockProducts[0].quantity)
      .field('shipping', mockProducts[0].shipping)
      .expect(201);

    //Search for product
    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[2]._id + "/" + mockProducts[2].category);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);

    // Search results should match the created product
    expect(res.body.products[0].name).toBe(mockProducts[0].name);
    expect(res.body.products[0].description).toBe(mockProducts[0].description);
    expect(res.body.products[0].price).toBe(mockProducts[0].price);
    expect(res.body.products[0].quantity).toBe(mockProducts[0].quantity);
    expect(res.body.products[0].shipping).toBe(mockProducts[0].shipping);
  });

  it("should delete a product and ensure it no longer appears as a related product", async () => {
    //Delete novel
    await request(app).delete("/api/v1/product/delete-product/" + mockProducts[1]._id)
      .set("Authorization", adminToken);

    //Should not find any related products
    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[0]._id + "/" + mockProducts[0].category);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });
});


describe("Product Count Integration Test", () => {

  it("should return total count of all the products", async () => {
    const res = await request(app).get("/api/v1/product/product-count");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(mockProducts.length);
  });

  it("should create a product and increase the product count", async () => {
    //Create product
    await request(app).post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field('name', "Milo drink")
      .field('description', "A delicious drink")
      .field('price', "10")
      .field('category', new mongoose.Types.ObjectId().toString())
      .field('quantity', "10")
      .field('shipping', "true")
      .expect(201);

    //Verify that the product count has increased
    const res = await request(app).get("/api/v1/product/product-count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(mockProducts.length + 1);
  });

  it("should update a product and verify that product count is unchanged", async () => {
    //Update product
    await request(app).put("/api/v1/product/update-product/" + mockProducts[2]._id)
      .set("Authorization", adminToken)
      .field('name', "Test Laptop")
      .field('description', "A test laptop")
      .field('price', mockProducts[2].price)
      .field('category', mockProducts[2].category.toString())
      .field('quantity', mockProducts[2].quantity)
      .field('shipping', mockProducts[2].shipping)
      .expect(201);

    //Verify that the product count has increased
    const res = await request(app).get("/api/v1/product/product-count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(mockProducts.length);
  });

  it("should delete a product and not decrease the product count", async () => {
    //Delete product
    await request(app).delete("/api/v1/product/delete-product/" + mockProducts[2]._id)
      .set("Authorization", adminToken);

    //Should not find any matching products
    const res = await request(app).get("/api/v1/product/product-count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(mockProducts.length - 1);
  });
});