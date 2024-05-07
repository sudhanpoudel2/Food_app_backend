import mongoose, { Schema } from "mongoose";

const foodSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "food title is required"],
    },
    description: {
      type: String,
      required: [true, "food description is required"],
    },
    price: {
      type: Number,
      required: [true, "food price is  required"],
    },
    images: [
      {
        type: String,
      },
    ],
    foodTags: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    code: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    reatingCount: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Food = mongoose.model("Food", foodSchema);
