import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { orderValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";

const router = express.Router();

router.post("/", orderValidation, authMiddleware, async (req, res) => {
  const userID = req.body.id;
  try {
    const userCart = await Cart.findOne({ userID });
    if (!userCart) {
      return res.status(400).send({ message: "User cart is not found" });
    }

    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.array() });
    }

    const order = await Order.create({
      user: userID,
      cart: userCart._id,
      address: req.body.address,
      contact: req.body.contact,
      deliveryAddress: req.body.deliveryAddress,
      status: "Ordered",
      dateOrder: new Date(),
    });

    res.status(200).send({ message: "Order successfully created", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userID = req.body.id;
    console.log(userID);
    const orderDetails = await Order.findById(userID);
    console.log("order : ", orderDetails);
    if (!orderDetails) {
      return res.status(400).send({ message: "No order found for this user" });
    }
    res.status(200).send({ message: "Order found successfully", orderDetails });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in get order details API" });
  }
});

export default router;
