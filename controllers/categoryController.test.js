import { jest } from '@jest/globals';

const categoryModel = jest.fn();
categoryModel.findOne = jest.fn();
categoryModel.findByIdAndUpdate = jest.fn();
categoryModel.findByIdAndDelete = jest.fn();
categoryModel.find = jest.fn();
categoryModel.findById = jest.fn();

// Use unstable_mockModule as it is ESM
jest.unstable_mockModule('../models/categoryModel.js', () => ({
  default: categoryModel,
}));

let createCategoryController;
let updateCategoryController;
let deleteCategoryController;
let categoryControlller;
let singleCategoryController;

beforeAll(async () => {
  const categoryControllerModule = await import("./categoryController.js");
  createCategoryController = categoryControllerModule.createCategoryController;
  updateCategoryController = categoryControllerModule.updateCategoryController;
  deleteCategoryController = categoryControllerModule.deleteCategoryCOntroller;
  categoryControlller = categoryControllerModule.categoryControlller;
  singleCategoryController = categoryControllerModule.singleCategoryController;
});

describe('createCategoryController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      body: {
        name: 'Test Category',
      }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should create a new category successfully', async () => {
    // Mock findOne to return null (no existing category)
    categoryModel.findOne.mockResolvedValueOnce(null);

    // Add spaces to test trimming
    mockReq.body.name = '  Test Category  ';

    const mockSavedCategory = {
      name: 'Test Category',
      slug: 'test-category',
    };

    categoryModel.mockImplementationOnce(() => ({
      save: jest.fn().mockResolvedValueOnce(mockSavedCategory),
    }));

    await createCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ 
      name: { $regex: new RegExp('^Test Category$', 'i') }
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'new category created',
      category: mockSavedCategory,
    });
  });

  it('should return error if name is not provided', async () => {
    mockReq.body.name = '';

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith({
      message: 'Name is required',
    });
  });

  it('should return error if category already exists (case-insensitive)', async () => {
    const existingCategory = {
      name: 'Test Category',
      slug: 'test-category',
    };
    categoryModel.findOne.mockResolvedValueOnce(existingCategory);

    // Try to create with different case
    mockReq.body.name = 'TEST CATEGORY';

    await createCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ 
      name: { $regex: new RegExp('^TEST CATEGORY$', 'i') }
    });
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'Category Already Exists',
    });
  });

  it('should handle database errors', async () => {
    const error = new Error('Database error');
    categoryModel.findOne.mockRejectedValueOnce(error);

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: 'Error in Category',
    });
  });
});

// updateCategoryController
describe('updateCategoryController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      body: {
        name: 'New Category',
      },
      params: {
        id: 'category123',
      }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should update category successfully', async () => {
    // Mock the current category
    const currentCategory = {
      _id: 'category123',
      name: 'Old Category',
      slug: 'old-category',
    };
    categoryModel.findById.mockResolvedValueOnce(currentCategory);

    // Mock that no existing category with same name exists
    const updatedCategory = {
      name: 'New Category',
      slug: 'new-category',
    };
    categoryModel.findOne.mockResolvedValueOnce(null);
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

    // Add spaces to test trimming
    mockReq.body.name = '  New Category  ';

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findById).toHaveBeenCalledWith('category123');
    expect(categoryModel.findOne).toHaveBeenCalledWith({ 
      name: { $regex: new RegExp('^New Category$', 'i') }
    });
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'category123',
      {
        name: 'New Category',
        slug: 'new-category',
      },
      { new: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Updated Successfully',
      category: updatedCategory,
    });
  });

  it('should handle database errors during update', async () => {
    const mockError = new Error('Database error');
    categoryModel.findById.mockRejectedValueOnce(mockError);

    await updateCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: 'Error while updating category',
    });
  });

  it('should handle invalid ObjectId format', async () => {
    // Mock request with invalid ObjectId
    mockReq.params.id = 'abc';

    // Mock mongoose CastError
    const castError = new Error('Cast to ObjectId failed');
    castError.name = 'CastError';
    castError.kind = 'ObjectId';
    castError.value = 'abc';
    castError.path = '_id';

    categoryModel.findById.mockRejectedValueOnce(castError);

    await updateCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: castError,
      message: 'Error while updating category',
    });
  });

  it('should allow updating a category with its own name (no change)', async () => {
    // Mock the current category
    const currentCategory = {
      _id: 'category123',
      name: 'Test Category',
      slug: 'test-category',
    };
    categoryModel.findById.mockResolvedValueOnce(currentCategory);

    // Mock the update
    const updatedCategory = {
      name: 'Test Category',
      slug: 'test-category',
    };
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

    // Try to update with the same name
    mockReq.body.name = 'Test Category';

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findById).toHaveBeenCalledWith('category123');
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'category123',
      {
        name: 'Test Category',
        slug: 'test-category',
      },
      { new: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Updated Successfully',
      category: updatedCategory,
    });
  });

  it('should allow updating a category with its own name in different case', async () => {
    // Mock the current category
    const currentCategory = {
      _id: 'category123',
      name: 'Test Category',
      slug: 'test-category',
    };
    categoryModel.findById.mockResolvedValueOnce(currentCategory);

    // Mock the update
    const updatedCategory = {
      name: 'TEST CATEGORY',
      slug: 'test-category',
    };
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

    // Try to update with the same name but different case
    mockReq.body.name = 'TEST CATEGORY';

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findById).toHaveBeenCalledWith('category123');
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'category123',
      {
        name: 'TEST CATEGORY',
        slug: 'test-category',
      },
      { new: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Updated Successfully',
      category: updatedCategory,
    });
  });

  it('should return error if category name already exists during update (case-insensitive)', async () => {
    // Mock the current category
    const currentCategory = {
      _id: 'category123',
      name: 'Old Category',
      slug: 'old-category',
    };
    categoryModel.findById.mockResolvedValueOnce(currentCategory);

    // Mock existing category with target name
    const existingCategory = {
      name: 'New Category',
      slug: 'new-category',
    };
    categoryModel.findOne.mockResolvedValueOnce(existingCategory);

    // Try to update with name that already exists
    mockReq.body.name = 'NEW CATEGORY';

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findById).toHaveBeenCalledWith('category123');
    expect(categoryModel.findOne).toHaveBeenCalledWith({ 
      name: { $regex: new RegExp('^NEW CATEGORY$', 'i') }
    });
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'Category name already exists',
    });
  });
});

// deleteCategoryController
describe('deleteCategoryController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      params: {
        id: 'category123',
      }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should delete category successfully', async () => {
    categoryModel.findByIdAndDelete.mockResolvedValueOnce({});

    await deleteCategoryController(mockReq, mockRes);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('category123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Deleted Successfully',
    });
  });

  it('should handle database errors during delete', async () => {
    const mockError = new Error('Database error');
    categoryModel.findByIdAndDelete.mockRejectedValueOnce(mockError);

    await deleteCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'error while deleting category',
      error: mockError,
    });
  });

  it('should handle invalid ObjectId format', async () => {
    // Mock request with invalid ObjectId
    mockReq.params.id = 'abc';

    // Mock mongoose CastError
    const castError = new Error('Cast to ObjectId failed');
    castError.name = 'CastError';
    castError.kind = 'ObjectId';
    castError.value = 'abc';
    castError.path = '_id';

    categoryModel.findByIdAndDelete.mockRejectedValueOnce(castError);

    await deleteCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'error while deleting category',
      error: castError,
    });
  });

  it('should return 404 when category does not exist', async () => {
    // Simulate no category is found
    categoryModel.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteCategoryController(mockReq, mockRes);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('category123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'Category not found',
    });
  });
});

// categoryControlller (get all categories)
describe('categoryControlller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockReq = {};

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should get all categories successfully', async () => {
    const mockCategories = [
      { name: 'Category 1', slug: 'category-1' },
      { name: 'Category 2', slug: 'category-2' }
    ];
    
    categoryModel.find.mockResolvedValueOnce(mockCategories);

    await categoryControlller(mockReq, mockRes);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'All Categories List',
      category: mockCategories,
    });
  });

  it('should handle database errors when fetching all categories', async () => {
    const mockError = new Error('Database error');
    categoryModel.find.mockRejectedValueOnce(mockError);

    await categoryControlller(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: 'Error while getting all categories',
    });
  });

  it('should return an empty array when no categories exist', async () => {
    categoryModel.find.mockResolvedValueOnce([]);

    await categoryControlller(mockReq, mockRes);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'All Categories List',
      category: [],
    });
  });
});

// singleCategoryController
describe('singleCategoryController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      params: {
        slug: 'test-category',
      }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should get a single category successfully', async () => {
    const mockCategory = {
      name: 'Test Category',
      slug: 'test-category',
    };
    
    categoryModel.findOne.mockResolvedValueOnce(mockCategory);

    await singleCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Get Single Category Successfully',
      category: mockCategory,
    });
  });

  it('should handle case when category does not exist', async () => {
    categoryModel.findOne.mockResolvedValueOnce(null);

    await singleCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: 'Category not found',
    });
  });

  it('should handle database errors when fetching a single category', async () => {
    const mockError = new Error('Database error');
    categoryModel.findOne.mockRejectedValueOnce(mockError);

    await singleCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: 'Error While getting Single Category',
    });
  });
});
