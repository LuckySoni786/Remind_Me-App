import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import startReminderScheduler from "./scheduler/reminderScheduler.js";


const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        await connectDB();

        const httpServer = http.createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:5173",
                credentials: true
            }
        });

        io.on("connection", (socket) => {

            console.log("User connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });

        });

        startReminderScheduler(io);

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Server startup error:", error);

    }
};

startServer();