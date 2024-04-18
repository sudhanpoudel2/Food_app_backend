import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Shop } from "../models/shopModel.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in create shop api", error });
  }
});

router.get("/", (req, res) => {
  res.status(200).send({ message: "I am working buddy!!" });
});

export default router;
