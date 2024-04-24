import express from "express";
import { Cart } from "../models/cartModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    let userID = req.body.id;
    const { foodId, quantity } = req.body;
    let cart = await Cart.findOne({ userID });
    console.log(cart);
    if (!cart) {
      cart = new Cart({ userID, items: [] });
    }

    // Check if the product already exists in the cart
    console.log(cart.items); // Add this line to check cart.items
    const existingItemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (existingItemIndex !== -1) {
      // If the product already exists, update its quantity
      cart.items[existingItemIndex].quantity = parseInt(quantity);
      cart.items[existingItemIndex].total =
        cart.items[existingItemIndex].quantity *
        cart.items[existingItemIndex].price;
    } else {
      // If the product doesn't exist, add it to the cart
      const foodDetails = await Product.findById(foodId);
      if (!foodDetails) {
        return res.status(404).json({ message: "Product not found", data: {} });
      }

      const newItem = {
        foodId: foodDetails._id,
        quantity: parseInt(quantity),
        price: foodDetails.price,
        total: parseInt(foodDetails.price * quantity),
      };

      cart.items.push(newItem);
    }

    cart.subTotal = cart.items.reduce((acc, item) => acc + item.total, 0);

    // Save the updated cart back to the database
    await cart.save();

    res
      .status(201)
      .json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error in cart api", error });
  }
});

export default router;
