import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB).then(() => {
      console.log("Connected to DB");
    });
  } catch (error) {
    console.log("Db error", error);
  }
};

export default connectDb;
