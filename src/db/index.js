import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Database connected successfully  !!!!`);
    } catch (error) {
        console.log("Database connection failed" + error);
        throw error;
    }
}

export default connectDB;