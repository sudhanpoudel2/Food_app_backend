import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
    },
    contact: {
      type: Number,
    },
    deliveryAddress: {
      type: String,
    },
    status: {
      type: String,
      default: "Ordered",
    },
    dateOrder: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
