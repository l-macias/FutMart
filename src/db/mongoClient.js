import mongoose from "mongoose";
import Config from "../config/config.js";
const mongoURI = Config.mongoDB.URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Atlas connection SUCCESS");
    } catch (error) {
        console.error("MongoDB Atlas connection FAIL", error);
        process.exit(1);
    }
};

export default connectDB;
