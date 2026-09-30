import jwt from "jsonwebtoken";
import User from "../models/User.js";

const socketAuthMiddleware = async (socket, next) => {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace(
                "Bearer ",
                ""
            );

        if (!token) {
            return next(
                new Error("Authentication required.")
            );
        }

        let decodedToken;

        try {
            decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return next(
                new Error("Invalid or expired token.")
            );
        }

        const user = await User.findById(decodedToken.id)
            .select("-password");

        if (!user) {
            return next(
                new Error(
                    "User associated with this token was not found."
                )
            );
        }

        // Attach authenticated user to socket
        socket.user = user;

        // Join user's private room
        socket.join(`user:${user._id}`);

        next();

    } catch (error) {
        console.error(
            "Socket authentication error:",
            error.message
        );

        next(
            new Error("Socket authentication failed.")
        );
    }
};

export default socketAuthMiddleware;