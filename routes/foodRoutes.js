import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { foodValidation } from "../helper/validator.js";
import { Food } from "../models/foodModel.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/orderModel.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const allowedExtensions = [".jpg", ".jpeg", ".png"];

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Destination directory for storing uploaded images
    const destinationDirectory = "public/image";
    ensureDirectoryExists(destinationDirectory);
    cb(null, destinationDirectory);
  },
  filename: (req, file, cb) => {
    // Validate file extension
    const isAllowedExtension = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase()
    );
    if (!isAllowedExtension) {
      return cb(new Error("INVALID_FILE_TYPE"));
    }

    // Generate unique filename
    const fileName = file.originalname.replace(/\s+/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${fileName}-${uniqueSuffix}${fileExtension}`;

    // Callback with the generated filename
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 1 MB file size limit
    files: 4, // Maximum of 4 files allowed
  },
});

const handleMulterErrors = (err, req, res, next) => {
  console.log("Error:", err.code);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).send({
      message:
        "The file size exceeded the limit. Please select a smaller file.",
    });
  } else if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).send({
      message: "You can only upload a maximum of 4 files at a time.",
    });
  } else if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).send({
      message: "The file type is not allowed. Only png, jpg, jpeg are allowed.",
    });
  } else {
    return res.status(400).send({
      message: "An error occurred while uploading files.",
    });
  }
};

router.post(
  "/",
  upload.array("images", 4),
  handleMulterErrors,
  foodValidation,
  authMiddleware,
  async (req, res) => {
    let images = [];
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
      }

      const basePath = `http://localhost:8080/public/image/`;
      images = req.files.map((file) => `${basePath}${file.filename}`);
      const {
        title,
        description,
        price,
        foodTags,
        category,
        code,
        isAvailable,
        restaurant,
        rating,
      } = req.body;

      await Food.create({
        title,
        description,
        price,
        images,
        foodTags,
        category,
        code,
        isAvailable,
        restaurant,
        rating,
      });

      res.status(200).send({ message: "Food uploaded successfully" });
    } catch (error) {
      console.error(error);
      images.forEach((image) => {
        const filePath = image.split("/").pop();
        fs.unlinkSync(`path/to/your/uploaded/images/${filePath}`);
      });
      res
        .status(400)
        .send({ message: "Error in create food api", error: error.message });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const food = await Food.find({});
    if (!food) {
      res.status(404).send({ message: "no food found!" });
    }
    res.status(200).send({
      totalCount: food.length,
      food,
      message: "food found successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in get food api", error });
  }
});

//Get Single Food
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    if (!foodID) {
      return res.status(404).send({ message: "please provide foodID" });
    }
    console.log("Hello");
    if (!mongoose.Types.ObjectId.isValid(foodID)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }
    const food = await Food.findById(foodID);
    if (!food) {
      res.status(400).send({ message: "No food found with this ID" });
    }
    res.status(200).send({ food, message: "Item found successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in get food by id api", error });
  }
});

//Get Food By Restaurent
router.get("/restaurant/:id", async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(400).send({ message: "Please provide restaurant ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantID)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const foods = await Food.find({ restaurant: restaurantID });
    if (!foods || foods.length === 0) {
      return res
        .status(404)
        .send({ message: "No food found for this restaurant ID" });
    }
    res.status(200).send({ foods, message: "Items found successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error in restaurant food API", error: error.message });
  }
});

// Update food by id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    const {
      title,
      description,
      price,
      imageUrl,
      foodTags,
      category,
      code,
      isAvailable,
      restaurant,
      rating,
    } = req.body;
    const food = await Food.findByIdAndUpdate(
      foodID,
      {
        title,
        description,
        price,
        imageUrl,
        foodTags,
        category,
        code,
        isAvailable,
        restaurant,
        rating,
      },
      { new: true }
    );
    if (!food) {
      res.status(404).send({ message: "food not found" });
    }
    res.status(200).send({ message: "Food updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in food update api" });
  }
});

//Delete food by id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodID)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }
    const food = await Food.findByIdAndDelete(foodID);
    if (!food) {
      return res.status(404).send({ message: "no food found" });
    }
    res.status(200).send({ message: "food deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in deleted food api", error });
  }
});

// Order Status
// router.post(
//   "/order-status/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const orderID = req.params.id;
//       const { status } = req.body;
//       const order = await Order.findByIdAndUpdate(
//         orderID,
//         { status },
//         { new: true }
//       );
//       res.status(200).send({ message: "order status updated", order });
//     } catch (error) {
//       console.log(error);
//       res.status(400).send({ message: "Error in order status api", error });
//     }
//   }
// );

export default router;
