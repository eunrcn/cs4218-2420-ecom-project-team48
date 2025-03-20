import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import productModel from "../../models/productModel";
import request from "supertest";
import { expect } from "@playwright/test";

let mongoServer;
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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const conn = await mongoose.connect(mongoUri);
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

  it("should return status 400 when an there is an error", async () => {
    // To simulate a db crash
    await mongoose.disconnect();

    const res = await request(app).get("/api/v1/product/search/laptop");
    expect(res.status).toBe(400);

    await mongoose.connect(mongoServer.getUri());
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

  it("should return status 400 when an there is an error", async () => {
    // To simulate a db crash
    await mongoose.disconnect();

    const res = await request(app).get("/api/v1/product/related-product/" + mockProducts[0]._id + "/" + book_category_id);
    expect(res.status).toBe(400);

    await mongoose.connect(mongoServer.getUri());
  });

});