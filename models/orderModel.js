import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    food: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["preparing", "prepared", "on the way", "deliverd"],
      default: "preparing",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
