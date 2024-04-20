import mongoose, { Schema } from "mongoose";

const foodSchema = new Schema({}, { timestamps: true });

export const Food = mongoose.model("Food", foodSchema);
