// tests/integration/categoryController.integration.test.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import categoryModel from "../models/categoryModel.js";
import request from "supertest";

describe("Category Controller Integration Tests", () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await categoryModel.create([
      { name: "Electronics", slug: "electronics" },
      { name: "Books", slug: "books" },
      { name: "Clothing", slug: "clothing" }
    ]);
  });

  afterEach(async () => {
    await categoryModel.deleteMany();
  });

  describe("Get All Categories Tests", () => {
    test("should return all categories with correct properties", async () => {
      const res = await request(app).get("/api/v1/category/get-category");
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("All Categories List");
      expect(res.body.category).toHaveLength(3);

      res.body.category.forEach(category => {
        expect(category).toHaveProperty("_id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("slug");
      });
    });

    test("should handle empty category list", async () => {
      await categoryModel.deleteMany();
      
      const res = await request(app).get("/api/v1/category/get-category");
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category).toHaveLength(0);
    });
  });

  describe("Get Single Category Tests", () => {
    test("should return correct category when valid slug is provided", async () => {
      const res = await request(app).get("/api/v1/category/single-category/electronics");
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get Single Category Successfully");
      expect(res.body.category.name).toBe("Electronics");
      expect(res.body.category.slug).toBe("electronics");
    });

    test("should handle non-existent category slug", async () => {
      const res = await request(app).get("/api/v1/category/single-category/non-existent");
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Category not found");
    });

    test("should handle special characters in slug", async () => {
      await categoryModel.create({
        name: "Baby & Kids",
        slug: "baby-kids"
      });

      const res = await request(app).get("/api/v1/category/single-category/baby-kids");
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category.name).toBe("Baby & Kids");
      expect(res.body.category.slug).toBe("baby-kids");
    });

    test("should handle case-insensitive slugs correctly", async () => {
      const res = await request(app).get("/api/v1/category/single-category/ELECTRONICS");
      
      // Should return electronics category
      expect(res.status).toBe(200);
      expect(res.body.category.name).toBe("Electronics");
      expect(res.body.category.slug).toBe("electronics");
    });
  });

  describe("Category Response Performance Tests", () => {
    test("should handle large number of categories efficiently", async () => {
      const bulkCategories = Array.from({ length: 100 }, (_, i) => ({
        name: `Test Category ${i}`,
        slug: `test-category-${i}`
      }));
      await categoryModel.insertMany(bulkCategories);

      const startTime = Date.now();
      const res = await request(app).get("/api/v1/category/get-category");
      const endTime = Date.now();

      expect(res.status).toBe(200);
      expect(res.body.category.length).toBe(103); // 3 og + 100 new
      expect(endTime - startTime).toBeLessThan(1000); // Response should be under 1 second
    });
  });
});