import express from "express";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerValidation } from "../helper/validator.js";
import { validationResult } from "express-validator";
const router = express.Router();

router.post("/register", registerValidation, async (req, res) => {
  try {
    const { userName, email, password, address, phone } = req.body;
    // if (!userName || !email || !password || !address || !phone) {
    //   return res.status(400).send({ message: "Please provide all fields" });
    // }
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.array() });
    }

    // const existing = await User.findOne({ email });
    // if (existing) {
    //   return res.status(400).send({ message: "Email already exists!" });
    // }

    // Hash Password
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      address,
      phone,
    });
    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error on register api", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Please provide email or password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid credentials!" });
    }
    user.password = undefined;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.status(200).send({ message: "Login Successfully", token, user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error on login api", error });
  }
});
export default router;
