import { jest } from '@jest/globals';

const categoryModel = jest.fn();
categoryModel.findOne = jest.fn();
categoryModel.findByIdAndUpdate = jest.fn();
categoryModel.findByIdAndDelete = jest.fn();
categoryModel.find = jest.fn();

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

    const mockSavedCategory = {
      name: 'Test Category',
      slug: 'Test-Category', // Slugs are in uppercase - mongoose converts and stores it as lowercase (for categories)
    };

    categoryModel.mockImplementationOnce(() => ({
      save: jest.fn().mockResolvedValueOnce(mockSavedCategory),
    }));

    await createCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: 'Test Category' });
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

  it('should return error if category already exists', async () => {
    const existingCategory = {
      name: 'Test Category',
      slug: 'Test-Category', // Slugs are in uppercase - mongoose converts and stores it as lowercase (for categories)
    };
    categoryModel.findOne.mockResolvedValueOnce(existingCategory);

    await createCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: 'Test Category' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
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
    const updatedCategory = {
      name: 'New Category',
      slug: 'New-Category', // Slugs are in uppercase - mongoose converts and stores it as lowercase (for categories)
    };
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'category123',
      {
        name: 'New Category',
        slug: 'New-Category',
      },
      { new: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      messsage: 'Category Updated Successfully',
      category: updatedCategory,
    });
  });

  it('should handle database errors during update', async () => {
    const mockError = new Error('Database error');
    categoryModel.findByIdAndUpdate.mockRejectedValueOnce(mockError);

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

    categoryModel.findByIdAndUpdate.mockRejectedValueOnce(castError);

    await updateCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: castError,
      message: 'Error while updating category',
    });
  });

  it("should return success true with category as null when the category does not exist", async () => {
    // Simulate no category is found
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(null);

    await updateCategoryController(mockReq, mockRes);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'category123',
      {
        name: 'New Category',
        slug: 'New-Category',
      },
      { new: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      messsage: "Category Updated Successfully",
      category: null,
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

  it('should return success true when category does not exist', async () => {
    // Simulate no category is found
    categoryModel.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteCategoryController(mockReq, mockRes);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('category123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Deleted Successfully",
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
      message: 'Get SIngle Category SUccessfully',
      category: mockCategory,
    });
  });

  it('should handle case when category does not exist', async () => {
    categoryModel.findOne.mockResolvedValueOnce(null);

    await singleCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Get SIngle Category SUccessfully',
      category: null,
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
