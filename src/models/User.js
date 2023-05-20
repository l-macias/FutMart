//user Model in MongoDB Atlas
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "admin", "superAdmin"],
        default: "user",
    },
    timestamp: {
        type: Date,
        default: new Date(),
    },
    photo: String,
});

export default mongoose.model("User", userSchema);
