import mongoose, { Schema } from "mongoose";

const categoryScheme = new Schema(
  {
    title: {
      type: String,
      required: [true, "category title is required"],
    },
    imageUrl: {
      type: String,
      default:
        "https://ps.w.org/rdv-category-image/assets/icon-256x256.png?rev=2599260",
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categoryScheme);
