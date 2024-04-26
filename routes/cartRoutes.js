import express from "express";
import { Cart } from "../models/cartModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { Food } from "../models/foodModel.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { foodID, quantity } = req.body;
    const userID = req.body.id;
    if (!userID) {
      return res.status(400).send({ message: "User not found" });
    }

    const foodDetails = await Food.findById(foodID);

    if (!foodDetails) {
      return res.status(400).send({ message: "Food not found" });
    }

    if (!foodDetails.isAvailable) {
      return res
        .status(400)
        .send({ message: "Sorry, this item is currently not available." });
    }
    const cart = await Cart.findOne({ userID }).populate("cartItems.foodID");

    if (!cart) {
      await Cart.create({ userID, cartItems: [] });
    }

    const existingItem = cart.cartItems.findIndex(
      (item) => item.foodID.toString() === foodID
    );

    if (existingItem !== -1) {
      cart.cartItems[existingItem].quantity += parseInt(quantity);
      cart.cartItems[existingItem].total =
        cart.cartItems[existingItem].quantity *
        cart.cartItems[existingItem].price;
    } else {
      const foodDetails = await Food.findById(foodID);
      if (!foodDetails) {
        return res.status(400).send({ message: "food not found" });
      }

      const newItem = {
        foodID: foodDetails._id,
        food: foodDetails.title,
        quantity: parseInt(quantity),
        price: foodDetails.price,
        total: parseInt(foodDetails.price * quantity),
      };

      cart.cartItems.push(newItem);
    }
    cart.subTotal = cart.cartItems.reduce((acc, item) => acc + item.total, 0);

    await cart.save();

    res.status(200).send({ message: "Food added to cart successfully!", cart });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error is add to cart api", error });
  }
});

router.delete("/:foodID", authMiddleware, async (req, res) => {
  try {
    const foodID = req.params.foodID;
    const userID = req.body.id;
    let cart = await Cart.findOne({ userID });

    if (!cart) {
      return res.status(400).send({ message: "cart not found for this user!" });
    }

    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.foodID.toString() === foodID
    );
    if (existingItemIndex === -1) {
      return res.status(400).send({ message: "food not found in cart" });
    }

    cart.cartItems.splice(existingItemIndex, 1);

    cart.subTotal = cart.cartItems.reduce((acc, item) => acc + item.total, 0);

    await cart.save();
    res.status(400).send({ message: "food remove from cart successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ message: "error in delete food from cart api", error });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userID = req.body.id;
    const cart = await Cart.findOne({ userID }).populate("cartItems.foodID");
    if (!cart) {
      return res.status(400).send({ message: "cart not found for this user!" });
    }

    res.status(200).send({ message: "Cart found successfully", cart });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error is get cart api", error });
  }
});

export default router;
