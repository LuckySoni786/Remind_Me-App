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

        notification: {
    browser: {
        sent: {
            type: Boolean,
            default: false
        },
        sentAt: {
            type: Date,
            default: null
        }
    },

    email: {
        sent: {
            type: Boolean,
            default: false
        },
        sentAt: {
            type: Date,
            default: null
        },
        attempts: {
            type: Number,
            default: 0
        },
        lastAttemptAt: {
            type: Date,
            default: null
        },
        error: {
            type: String,
            default: null
        }
    }
},

notificationStatus: {
    browser: {
        type: String,
        enum: ["SENT", "FAILED", "NOT_SENT"],
        default: "NOT_SENT"
    },

    email: {
        type: String,
        enum: ["SENT", "FAILED", "NOT_SENT"],
        default: "NOT_SENT"
    }
},
retry: {
    emailAttempts: {
        type: Number,
        default: 0
    },

    lastEmailAttemptAt: {
        type: Date,
        default: null
    },

    emailError: {
        type: String,
        default: null
    }
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
        snoozedUntil: {
    type: Date,
    default: null
},
            status: {
            type: String,
            enum: [
                "TRIGGERED",
                "COMPLETED",
                "MISSED",
                "DISMISSED",
                "SNOOZED"
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