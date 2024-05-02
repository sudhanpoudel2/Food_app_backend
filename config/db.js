import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Connected to DB");

    // Assuming 'Restaurant' is your MongoDB collection
    await mongoose.connection
      .collection("restaurants")
      .createIndex({ location: "2dsphere" });
    console.log("2dsphere index created for 'address' field");
  } catch (error) {
    console.error("Db error:", error);
  }
};

export default connectDb;
