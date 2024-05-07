import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Category } from "../models/categoryModel.js";
import { categoryValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  categoryValidation,
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
      }
      const { title, imageUrl } = req.body;
      await Category.create({
        title,
        imageUrl,
      });
      res.status(200).send({ message: "category created successfully" });
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "error in create category api", error });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const allCategory = await Category.find();
    if (!allCategory) {
      res.status(404).send({ message: "no category found!!" });
    }
    res
      .status(200)
      .send({ totalCount: allCategory.length, allCategory, message: "" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in get category api", error });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { title, imageUrl } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title, imageUrl },
      { new: true }
    );
    if (!updateCategory) {
      return res.status(400).send({ message: "no category found!" });
    }
    res.status(200).send({ message: "category updated successfully!!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in update category api", error });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({ error: "Please provide category ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "No category found with this ID" });
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    // Return success message
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in delete category API:", error);
    res.status(500).json({ error: "Error in delete category API" });
  }
});

export default router;
