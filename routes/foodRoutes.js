import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { foodValidation } from "../helper/validator.js";
import { Food } from "../models/foodModel.js";

const router = express.Router();

router.post("/", foodValidation, authMiddleware, async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.array() });
    }
    const {
      title,
      description,
      price,
      imageUrl,
      foodTags,
      category,
      code,
      isAvailable,
      restaurent,
      rating,
    } = req.body;
    await Food.create({
      title,
      description,
      price,
      imageUrl,
      foodTags,
      category,
      code,
      isAvailable,
      restaurent,
      rating,
    });
    res.status(201).send({ message: "food uploades successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send({ message: "Error in create food api", error: error.message });
  }
});

router.get("/", async (req, res) => {
  res.status(200).send("Hello ! Buddy I am working");
});

export default router;
