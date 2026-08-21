import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import startReminderScheduler from "./scheduler/reminderScheduler.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async ()=>{
try {
 
    await connectDB();
    startReminderScheduler();
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});   
} catch (error) {
   console.error(error); 
}
}

startServer();
