import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(__dirname, "../../../.env") });
}
const url = process.env.MONGO_URI || "mongodb://localhost:27017/smart-pot";

export async function connectToDatabase() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }

  mongoose.connection.on("error", (err: any) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });
}
