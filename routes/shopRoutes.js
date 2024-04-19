import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Shop } from "../models/shopModel.js";
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
    const newShop = await Shop.create({
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
    const shop = await Shop.find({});
    if (!shop) {
      res.status(404).send({ message: "no shop available!!" });
    }
    res.status(200).send({
      totalCount: shop.length,
      shop,
      message: "",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("error in get shop api", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) {
      return res.status(400).send({ message: "please provide valid Id" });
    }
    const getShop = await Shop.findById(shopId);

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
    const shopId = req.params.id;
    if (!shopId) {
      return res.status(404).send({ message: "please provide shopID" });
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }
    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(400).send({ message: "No shop found with this ID" });
    }
    await Shop.findByIdAndDelete(shopId);

    res.status(200).send({ message: "Shop deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in delete shop api" });
  }
});

export default router;
