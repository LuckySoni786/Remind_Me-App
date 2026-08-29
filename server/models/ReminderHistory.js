import mongoose from "mongoose";

const reminderHistorySchema = new mongoose.Schema(
    {
        reminder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reminder",
            required: [true, "Reminder is required"],
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        title: {
            type: String,
            required: [true, "Reminder title is required"],
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "MEDICINE",
                "EXERCISE",
                "MEAL",
                "WATER",
                "APPOINTMENT",
                "CUSTOM",
            ],
            required: [true, "Reminder category is required"],
        },

        reminderType: {
            type: String,
            enum: [
                "ONE_TIME",
                "DAILY",
                "HOURLY",
                "WEEKLY",
                "CUSTOM",
            ],
            required: [true, "Reminder type is required"],
        },
            status: {
            type: String,
            enum: [
                "TRIGGERED",
                "COMPLETED",
                "MISSED",
                "DISMISSED",
            ],
            default: "TRIGGERED",
        },

        triggeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const ReminderHistory = mongoose.model(
    "ReminderHistory",
    reminderHistorySchema
);

export default ReminderHistory;