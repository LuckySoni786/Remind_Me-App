import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
    console.error("ERROR:", err);

    // Custom API error
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors)
            .map((error) => error.message);

        return res.status(400).json({
            success: false,
            message: messages.join(", "),
            data: null
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path || "data"} format.`,
            data: null
        });
    }

    // Duplicate MongoDB field
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];

        return res.status(409).json({
            success: false,
            message: `${field || "Field"} already exists.`,
            data: null
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token.",
            data: null
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Authentication token has expired.",
            data: null
        });
    }

    // Unexpected error
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null
    });
};

export default errorMiddleware;