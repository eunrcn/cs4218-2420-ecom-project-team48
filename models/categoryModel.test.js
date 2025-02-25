import mongoose from "mongoose";
import Category from "./categoryModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Category Model Test", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Category.deleteMany({});
  });

  test("should create a category successfully", async () => {
    const categoryData = {
      name: "Electronics",
      slug: "ELECTRONICS",
    };

    const createdCategory = await Category.create(categoryData);

    expect(createdCategory._id).toBeDefined();
    expect(createdCategory.name).toBe(categoryData.name);
    expect(createdCategory.slug).toBe("electronics"); // Should be lowercase
  });

  test("should create a category with only name field", async () => {
    const categoryData = {
      name: "Books",
    };

    const createdCategory = await Category.create(categoryData);

    expect(createdCategory._id).toBeDefined();
    expect(createdCategory.name).toBe(categoryData.name);
    expect(createdCategory.slug).toBeUndefined();
  });

  test("should convert slug to lowercase when provided in uppercase", async () => {
    const categoryData = {
      name: "Clothing",
      slug: "CLOTHING-AND-ACCESSORIES",
    };

    const createdCategory = await Category.create(categoryData);
    expect(createdCategory.slug).toBe("clothing-and-accessories");
  });

  test("should update a category successfully", async () => {
    const categoryData = {
      name: "Initial Name",
      slug: "initial-slug",
    };

    const createdCategory = await Category.create(categoryData);
    
    createdCategory.name = "Updated Name";
    createdCategory.slug = "UPDATED-SLUG";
    await createdCategory.save();

    // Fetch the updated category
    const updatedCategory = await Category.findById(createdCategory._id);
    
    expect(updatedCategory.name).toBe("Updated Name");
    expect(updatedCategory.slug).toBe("updated-slug"); // Should be lowercase
  });

  test("should delete a category successfully", async () => {
    const categoryData = {
      name: "To Be Deleted",
      slug: "to-be-deleted",
    };

    const createdCategory = await Category.create(categoryData);

    await Category.findByIdAndDelete(createdCategory._id);
    
    // Try to fetch the deleted category
    const deletedCategory = await Category.findById(createdCategory._id);
    
    expect(deletedCategory).toBeNull();
  });
}); 
