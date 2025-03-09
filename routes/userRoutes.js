import express from "express";
import { getUsersController } from "../controllers/userController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

// get users
router.get(
  "/get-users",
  requireSignIn,
  isAdmin,
  formidable(),
  getUsersController
);

export default router;
