import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const cookieToken = req.cookies?.accessToken;

    const authHeader = req.header("Authorization");

    let bearerToken = null;

    if (authHeader?.startsWith("Bearer ")) {
        bearerToken = authHeader.substring(7);
    }

    const token = cookieToken || bearerToken;

    if (!token) {
        throw new ApiError(
            401,
            "Authentication required."
        );
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired token."
        );
    }

    const user = await User.findById(decodedToken.id)
        .select("-password");

    if (!user) {
        throw new ApiError(
            401,
            "User associated with this token was not found."
        );
    }

    req.user = user;

    next();
});