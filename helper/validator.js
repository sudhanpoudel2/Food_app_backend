import { check } from "express-validator";
import { User } from "../models/userModel.js";

export const registerValidation = [
  check("userName", "username is required").not().isEmpty(),
  check("email", "email is required")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
  check("email").custom(async (value) => {
    // Check if email already exists in the database
    const existingUser = await User.findOne({ email: value });
    if (existingUser) {
      throw new Error("Email already exists");
    }
    return true;
  }),
  check(
    "password",
    "password must be greater than 6 and contains at least one uppercase,lowercase,number and special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("address", "address is required").not().isEmpty(),
  check("phone", "phone number should be contains 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check("phone").custom(async (value) => {
    // Check if email already exists in the database
    const existingUser = await User.findOne({ phone: value });
    if (existingUser) {
      throw new Error("phone already exists");
    }
    return true;
  }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/jpg"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please upload an image jpge,jpg"),
];

export const shopValidation = [
  check("title", "title is required").not().isEmpty(),
  check("coords", "coords is required").not().isEmpty(),
];

export const categoryValidation = [
  check("title", "title is required").not().isEmpty(),
];

export const foodValidation = [
  check("title", "Title is required").not().isEmpty(),
  check("description", "Description is required").not().isEmpty(),
  check("price", "Price is required").not().isEmpty(),
  check("restaurant", "Restaurant is required").not().isEmpty(),
  // check("image")
  //   .custom((value, { req }) => {
  //     if (
  //       req.file.mimetype === "images/jpeg" ||
  //       req.file.mimetype === "images/jpg" ||
  //       req.file.mimetype === "images/png"
  //     ) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   })
  //   .withMessage("Please upload an image jpge,jpg and png"),
];

export const orderValidation = [
  check("address", "Address is required").not().isEmpty(),
  check("phone", "phone number should be contains 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check("deliveryAddress", "Delivery address is required").not().isEmpty(),
];
