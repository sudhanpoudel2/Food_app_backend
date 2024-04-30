import express from "express";
import { Payment } from "../models/paymentModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import FormData from "form-data";
import fetch from "node-fetch";
import { Order } from "../models/orderModel.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    req.body.user = req.order.user;
    req.body.source_payment_id = req.body.refId;
    req.body.amount = req.body.amt;
    req.body.order = req.order._id;
    const product = new Payment.create(req.body);

    res.json({ message: "Payment Created Sucessfully", product: product });
  } catch (err) {
    return res.status(400).json({ error: err?.message || "No Payments found" });
  }
});

router.post("/verifyPayment", authMiddleware, async (req, res) => {
  try {
    const { amt, refId, orderId } = req.body;
    var form = new FormData();
    form.append("amt", amt);
    form.append("rid", refId);
    form.append("pid", orderId);
    form.append("scd", process.env.ESEWA_MERCHANT_CODE);

    const response = await fetch(process.env.ESEWA_URL + "/epay/transrec", {
      method: "POST",
      body: form,
    });

    const body = await response.text();

    console.log(body);

    if (body.includes("Success")) {
      next();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

router.get("getOrderForPayment", authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) {
      return res.status(400).json({ error: "No order found" });
    }
    order.status = "paid and processing";
    const updatedOrder = await order.save();
    req.order = updatedOrder;
    next();
  } catch (err) {
    return res.status(400).json({ error: err?.message || "No Order found" });
  }
});
export default router;
