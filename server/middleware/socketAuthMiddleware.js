import jwt from "jsonwebtoken";
import User from "../models/User.js";

const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || "";

        const cookies = Object.fromEntries(
            cookieHeader.split(";").map((cookie) => {
                const [key, ...value] = cookie.trim().split("=");
                return [key, decodeURIComponent(value.join("="))];
            })
        );

        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
            cookies.accessToken;

        if (!token) {
            return next(new Error("Authentication required."));
        }

        let decodedToken;

        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return next(new Error("Invalid or expired token."));
        }

        const user = await User.findById(decodedToken.id).select("-password");

        if (!user) {
            return next(new Error("User associated with this token was not found."));
        }

        socket.user = user;

        next();
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("Socket authentication failed."));
    }
};

export default socketAuthMiddleware;