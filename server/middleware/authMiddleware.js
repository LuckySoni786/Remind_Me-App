import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
const token =

    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");


    if (!token) {
        throw new ApiError(401, "Unauthorized Request");
    }
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or Expired Token");
    }

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();

});