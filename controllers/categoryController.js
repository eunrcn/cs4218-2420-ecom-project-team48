import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    
    const trimmedName = name.trim();
    const existingCategory = await categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Category Already Exists",
      });
    }

    const category = await new categoryModel({
      name: trimmedName,
      slug: slugify(trimmedName.toLowerCase()),
    }).save();

    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    });
  }
};

//update category
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const trimmedName = name.trim();
    
    // Get current category
    const currentCategory = await categoryModel.findById(id);
    if (!currentCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // If the name hasn't changed (case-insensitive compare), proceed with update
    if (currentCategory.name.toLowerCase() === trimmedName.toLowerCase()) {
      const category = await categoryModel.findByIdAndUpdate(
        id,
        { name: trimmedName, slug: slugify(trimmedName.toLowerCase()) },
        { new: true }
      );

      return res.status(200).send({
        success: true,
        message: "Category Updated Successfully",
        category,
      });
    }

    // If name is different, check if it conflicts with any other category
    const existingCategory = await categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Category name already exists",
      });
    }
    
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name: trimmedName, slug: slugify(trimmedName.toLowerCase()) },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    });
  }
};

// get all cat
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};

// single category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    });
  }
};

//delete category
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while deleting category",
      error,
    });
  }
};