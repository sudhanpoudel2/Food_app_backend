import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source: { type: String, required: true, enum: [esewa], default: "esewa" },
    sourcePayentId: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
