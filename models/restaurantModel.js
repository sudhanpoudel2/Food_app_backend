import mongoose, { Schema } from "mongoose";

const restaurantSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Shop title is required"],
    },
    images: {
      type: String,
    },
    time: {
      type: String,
    },
    pickup: {
      type: Boolean,
      default: true,
    },
    delivery: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: String,
    },
    code: {
      type: String,
    },
    // address: {
    //   type: String,
    // },
    location: {
      type: {
        type: String,
      },
      coordinates: {
        type: [Number],
        default: [0.0, 0.0],
      },
      address: String,
      // type: [[[Number]]], // Array of arrays of coordinates [ [ [lon1, lat1], [lon2, lat2], ... ] ]
      // required: true,
    },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
