import UserModel from "../models/userModel.js";

// get all users
export const getUsersController = async (req, res) => {
  try {
    const users = await UserModel.find({}).select("_id name email role");
    res.status(200).send({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};
