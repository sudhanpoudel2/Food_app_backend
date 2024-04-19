import express from "express";
import Color from "color";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";

//.env config
dotenv.config();

//DB call
connectDb();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/shop", shopRouter);
app.use("/api/v1/category", categoryRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running at PORT ${port}`);
});
