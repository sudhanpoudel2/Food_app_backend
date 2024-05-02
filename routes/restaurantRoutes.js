import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { Restaurant } from "../models/restaurantModel.js";
import { shopValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

import multer from "multer";
import path from "path";
import fs from "fs";
import adminMiddleware from "../middleware/adminMiddleware.js";

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
  shopValidation,
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    console.log(`rest ${req}`);
    const user = req.body.id;

    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
      }
      const basePath = `http://localhost:8080/public/image/`;
      const images = req.files
        .map((file) => `${basePath}${file.filename}`)
        .join(",");
      // const {
      //   title,
      //   time,
      //   pickup,
      //   delivery,
      //   isOpen,
      //   rating,
      //   ratingCount,
      //   code,
      //   latitude,
      //   longitude,
      // } = req.body;
      const newShop = await Restaurant.create({
        user: user,
        title: req.body.title,
        images,
        time: req.body.time,
        pickup: req.body.pickup,
        delivery: req.body.delivery,
        isOpen: req.body.isOpen,
        rating: req.body.rating,
        ratingCount: req.body.ratingCount,
        code: req.body.code,
        address: req.body.address,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(req.body.longitude),
            parseFloat(req.body.latitude),
          ],
        },
      });
      // console.log(`longitude ${coordinates}`);
      res
        .status(200)
        .send({ message: "shop register successfully!!", newShop });
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error in create shop api", error });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const restaurant = await Restaurant.find({});
    if (!restaurant) {
      res.status(404).send({ message: "no restaurent available!!" });
    }
    res.status(200).send({
      totalCount: restaurant.length,
      restaurant,
      message: "",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("error in get restaurant api", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(400).send({ message: "please provide valid Id" });
    }
    const getShop = await Restaurant.findById(restaurantID);

    res.status(200).send({
      getShop,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in get single shop api" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const restaurantID = req.params.id;
    if (!restaurantID) {
      return res.status(404).send({ message: "please provide restaurantID" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantID)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const shop = await Restaurant.findById(restaurantID);
    if (!shop) {
      res.status(400).send({ message: "No shop found with this ID" });
    }
    await Restaurant.findByIdAndDelete(restaurantID);

    res.status(200).send({ message: "Shop deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in delete shop api" });
  }
});

router.post("/near-restaurent", authMiddleware, async (req, res) => {
  try {
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude values" });
    }

    const restaurent = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "dist.calculated",
          spherical: true,
        },
      },
      {
        $match: {
          "dist.calculated": { $lte: 1609000 },
        },
      },
    ]);

    res.status(200).send({ message: "resturent found", restaurent });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in near me restaurent api", error });
  }
});

export default router;
