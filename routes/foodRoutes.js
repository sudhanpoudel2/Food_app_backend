import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { foodValidation } from "../helper/validator.js";
import { Food } from "../models/foodModel.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/orderModel.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

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
      restaurant,
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
      restaurant,
      rating,
    });
    res.status(200).send({ message: "food uploades successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send({ message: "Error in create food api", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const food = await Food.find({});
    if (!food) {
      res.status(404).send({ message: "no food found!" });
    }
    res.status(200).send({
      totalCount: food.length,
      food,
      message: "food found successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in get food api", error });
  }
});

//Get Single Food
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    if (!foodID) {
      return res.status(404).send({ message: "please provide foodID" });
    }
    console.log("Hello");
    if (!mongoose.Types.ObjectId.isValid(foodID)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }
    const food = await Food.findById(foodID);
    if (!food) {
      res.status(400).send({ message: "No food found with this ID" });
    }
    res.status(200).send({ food, message: "Item found successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in get food by id api", error });
  }
});

//Get Food By Restaurent
router.get("/restaurant/:id", async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(400).send({ message: "Please provide restaurant ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantID)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const foods = await Food.find({ restaurant: restaurantID });
    if (!foods || foods.length === 0) {
      return res
        .status(404)
        .send({ message: "No food found for this restaurant ID" });
    }
    res.status(200).send({ foods, message: "Items found successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error in restaurant food API", error: error.message });
  }
});

// Update food by id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    const {
      title,
      description,
      price,
      imageUrl,
      foodTags,
      category,
      code,
      isAvailable,
      restaurant,
      rating,
    } = req.body;
    const food = await Food.findByIdAndUpdate(
      foodID,
      {
        title,
        description,
        price,
        imageUrl,
        foodTags,
        category,
        code,
        isAvailable,
        restaurant,
        rating,
      },
      { new: true }
    );
    if (!food) {
      res.status(404).send({ message: "food not found" });
    }
    res.status(200).send({ message: "Food updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in food update api" });
  }
});

//Delete food by id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodID)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }
    const food = await Food.findByIdAndDelete(foodID);
    if (!food) {
      return res.status(404).send({ message: "no food found" });
    }
    res.status(200).send({ message: "food deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in deleted food api", error });
  }
});

router.post("/place-order", authMiddleware, async (req, res) => {
  try {
    const { cart } = req.body;
    let total = 0;

    cart.map((i) => {
      total += i.price;
    });

    const newOrder = new Order({
      food: cart,
      payment: total,
      buyer: req.body.id,
    });

    const saveOrder = newOrder.save();

    res
      .status(200)
      .send({ saveOrder: saveOrder, message: "order place successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in place order api", error });
  }
});

// Order Status
router.post(
  "/order-status/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orderID = req.params.id;
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        orderID,
        { status },
        { new: true }
      );
      res.status(200).send({ message: "order status updated", order });
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error in order status api", error });
    }
  }
);

export default router;
