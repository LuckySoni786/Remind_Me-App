import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {

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
medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    default: null,
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
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
scheduledAt: {
    type: Date,
    default: null,
},
time: {
    type: String,
    default: null,
    trim: true,
},

daysOfWeek: {
    type: [{
        type: String,
        enum: [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
        ],
    }],
    default: [],
},
intervalMinutes: {
    type: Number,
    min: [1, "Interval must be at least 1 minute"],
    default: null,
},
startTime: {
    type: String,
    default: null,
    trim: true,
},
endTime: {
    type: String,
    default: null,
    trim: true,
},

isActive: {
    type: Boolean,
    default: true,
},
lastTriggeredAt: {
    type: Date,
    default: null,
},

notificationType: {
    type: String,
    enum: [
        "BROWSER",
        "EMAIL",
        "BOTH",
    ],
    default: "BROWSER",
},

timezone: {
    type: String,
    default: "Asia/Kolkata",
    trim: true,
},

description: {
    type: String,
    default: "",
    trim: true,
},

    },
    {
        timestamps: true,
    }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;