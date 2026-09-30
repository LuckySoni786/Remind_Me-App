import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import startReminderScheduler from "./scheduler/reminderScheduler.js";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";

const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        // Connect MongoDB
        await connectDB();

        // Create HTTP server
        const httpServer = http.createServer(app);
        
        // Initialize Socket.IO
        const io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL,
                credentials: true,
            },
        });

            io.use(socketAuthMiddleware);
            
        // Socket.IO connection
        io.on("connection", (socket) => {
            console.log(
                `User connected: ${socket.user._id} | Socket: ${socket.id}`
            );

            socket.on("disconnect", (reason) => {
                console.log(
                    `User disconnected: ${socket.user._id} | Reason: ${reason}`
                );
            });
        });

        // Start reminder scheduler
        startReminderScheduler(io);

        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1);
    }
};

startServer();