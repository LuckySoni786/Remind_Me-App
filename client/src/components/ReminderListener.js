import { useEffect } from "react";
import socket from "../services/socket";
import playReminderSound from "../utils/reminderSound";

const ReminderListener = () => {

    useEffect(() => {

        const handleReminder = (reminder) => {
            console.log("Reminder received:", reminder);
            playReminderSound();
        };

        socket.on("reminder-due", handleReminder);

        return () => {
            socket.off("reminder-due", handleReminder);
        };

    }, []);

    return null;
};

export default ReminderListener;