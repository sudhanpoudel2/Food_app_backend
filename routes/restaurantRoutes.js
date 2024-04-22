import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Restaurant } from "../models/restaurantModel.js";
import { shopValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", shopValidation, authMiddleware, async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.array() });
    }
    const {
      title,
      imageUrl,
      foods,
      time,
      pickup,
      delivery,
      isOpen,
      rating,
      ratingCount,
      code,
      coords,
    } = req.body;
    const newShop = await Restaurant.create({
      title,
      imageUrl,
      foods,
      time,
      pickup,
      delivery,
      isOpen,
      rating,
      ratingCount,
      code,
      coords,
    });
    res.status(200).send({ message: "shop register successfully!!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in create shop api", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const restaurant = await Restaurant.find({});
    if (!restaurant) {
      res.status(404).send({ message: "no restaurent available!!" });
    }
    res.status(200).send({
      totalCount: restaurant.length,
      restaurant,
      message: "",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("error in get restaurant api", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(400).send({ message: "please provide valid Id" });
    }
    const getShop = await Restaurant.findById(restaurantID);

    res.status(200).send({
      getShop,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in get single shop api" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(404).send({ message: "please provide restaurantID" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantID)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const shop = await Restaurant.findById(restaurantID);
    if (!shop) {
      res.status(400).send({ message: "No shop found with this ID" });
    }
    await Restaurant.findByIdAndDelete(restaurantID);

    res.status(200).send({ message: "Shop deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in delete shop api" });
  }
});

export default router;
