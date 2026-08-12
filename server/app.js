import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoute.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares

app.use(express.json());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

// Test Route
app.use("/api/auth", authRoutes);
app.use("/api/medicine", medicineRoutes);
app.use(errorMiddleware);
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Remind Me API is Running "
    });
});

export default app;