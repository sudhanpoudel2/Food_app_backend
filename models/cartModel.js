import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity can not be less then 1."],
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const cartSchema = new Schema(
  {
    cartItems: [cartItemSchema],
    subTotal: {
      default: 0,
      type: Number,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);
