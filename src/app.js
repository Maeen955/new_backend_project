import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config({
    path: "./.env"
})
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//router define
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

// server.js বা app.js ফাইলের শেষে যোগ করুন

app.use((err, req, res, next) => {
    // 1. err আর্গুমেন্টে আপনার throw করা ApiError অবজেক্টটি আসে
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // 2. ক্লায়েন্টের কাছে JSON রেসপন্স পাঠানো
    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [], // ApiError এর errors অ্যারে
        data: null
        // আপনি চাইলে stack trace ও পাঠাতে পারেন
    });
});

export { app }