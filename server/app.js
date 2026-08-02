import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middlewares

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

// Test Route

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Remind Me API is Running "
    });
});

export default app;