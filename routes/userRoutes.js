import express from "express";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generation";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../middleware/authMiddleware.js";

//.env config
dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
    console.log("hello");
  } else {
    console.log("Ready for message");
    console.log(success);
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.body.id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.password = undefined;
    res.status(200).send({ message: "user found successfully", user });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in Get user API",
      error,
    });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { id, userName, address, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { userName, address, phone },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ message: "User updated successfully!", user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in updating user", error });
  }
});

router.put("/updatePassword", authMiddleware, async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    );

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .send({ message: "Please provide old and new password" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).send({ message: "Invalid old password" });
    }
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error in password API", error });
  }
});

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { token: otpGenerator.generate(4, { digits: true }) },
      { new: true }
    );
    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP for password reset is: ${updatedUser.token}`,
    };

    console.time("sendMail");
    transporter.sendMail(mailOptions, (error, info) => {
      console.timeEnd("sendMail");
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ message: "OTP sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error updating token or sending email:", error);
    return res
      .status(400)
      .json({ message: "Error updating token or sending email" });
  }
});

const tokenToEmailMap = new Map();
router.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.token !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const token = uuidv4();

    tokenToEmailMap.set(token, email);

    await User.findOneAndUpdate(
      { email },
      { $unset: { token: "" } },
      { new: true }
    );

    res.status(200).json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(400).json({ message: "Error verifying OTP" });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { token, password, password2 } = req.body;

  try {
    // if (!token) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    const email = tokenToEmailMap.get(token);

    if (!email) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (password !== password2) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    tokenToEmailMap.delete(token);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Error resetting password" });
  }
});

router.delete("/deleteUser/:id", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "profile delete successfully!!" });
  } catch (error) {
    console.log(error);
    res.status(400).send("Erroi in delete user api", error);
  }
});

export default router;
