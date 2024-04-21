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
    imageUrl: {
      type: String,
      default:
        "https://ps.w.org/rdv-category-image/assets/icon-256x256.png?rev=2599260",
    },
    foodTags: {
      type: String,
    },
    category: {
      type: String,
    },
    code: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    restaurent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurent",
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
