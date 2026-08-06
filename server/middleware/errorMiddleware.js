import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        data: null
    });
};

export default errorMiddleware;