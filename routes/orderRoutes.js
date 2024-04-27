import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { orderValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";
import adminMiddleware from "../middleware/adminMiddleware.js";

import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

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

router.post("/buyNow", authMiddleware, async (req, res) => {
  const userID = req.body.id;

  try {
    const order = await Order.create({
      food: req.body.food,
      user: userID,
      address: req.body.address,
      contact: req.body.contact,
      deliveryAddress: req.body.deliveryAddress,
      status: "Ordered",
      dateOrder: new Date(),
    });
    await order.populate("food");

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Could not place order", error: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const userID = req.body.id;
  try {
    const orders = await Order.find({ user: userID }).populate({
      path: "cart",
      populate: {
        path: "cartItems.foodID",
        model: "Food",
      },
    });

    if (!orders) {
      return res.status(404).send({ message: "No orders found for the user" });
    }

    res.status(200).send({ orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  const buy = await Order.findById(id);
  const uid = uuidv4();
  const message = `subTotal=${buy.populate(
    "cart.subTotal"
  )}.transaction_uuid=${uid},product_code=EPAYTEST`;
  const hash = CryptoJS.HmacSHA256(message, process.env.ESEWA_SECRET_KEY);
  const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
});

router.post("/vetify/:id", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const data = req.query.data;
  let decodedString = atob(data);
  console.log("dec_string : ", decodedString);
  console.log("ds ==", typeof decodedString);
  const obj = JSON.parse(decodedString);
  console.log("obj == ", typeof obj);
  decodedString = JSON.parse(decodedString);

  switch (decodedString.status) {
    case "complete":
      try {
        console.log(req.session.user);
        const userID = req.body.id;
        const order = await Order.findById(id);
        const uid = uuidv4();
        const message = `transaction_code=${decodedString.transaction_code},status=${decodedString.status},subTotal=${decodedString.subTotal},transaction_uuid=${decodedString.transaction_uuid},product_code=${decodedString.product_code},signed_field_names=${decodedString.signed_field_names}`;
        console.log(message);
        const hash = CryptoJS.HmacSHA256(message, process.env.ESEWA_SECRET_KEY);
        const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
        console.log(hashInBase64);
        console.log(hashInBase64 == decodedString.signature);
        const result = hashInBase64 == decodedString.signature;
        if (result == false) {
          throw "Hash value not matched";
        }
      } catch (error) {}
  }
});
export default router;
