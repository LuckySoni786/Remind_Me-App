import Reminder from "../models/Reminder.js";
import Medicine from "../models/Medicine.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import ReminderHistory from "../models/ReminderHistory.js";
import { checkReminderConflict } from "../utils/checkReminderConflict.js";
import {
    getNextReminderTime
} from "../utils/getNextReminderTime.js";
export const createReminder = asyncHandler(async (req, res) => {

    const {
        title,
        category,
        medicine,
        reminderType,
        scheduledAt,
        time,
        daysOfWeek,
        intervalMinutes,
        customInterval,
        customIntervalUnit,
        startTime,
        endTime,
        startDate,
        endDate,
        notificationType,
        timezone,
        description
    } = req.body;

    // Basic validation
    if (!title || !category || !reminderType) {
        throw new ApiError(
            400,
            "Title, category and reminder type are required."
        );
    }

    // Category validation
const validCategories = [
    "MEDICINE",
    "EXERCISE",
    "MEAL",
    "WATER",
    "APPOINTMENT",
    "CUSTOM"
];

if (!validCategories.includes(finalCategory)) {
    throw new ApiError(
        400,
        "Invalid reminder category."
    );
}


// Reminder type validation
const validReminderTypes = [
    "ONE_TIME",
    "DAILY",
    "HOURLY",
    "WEEKLY",
    "CUSTOM"
];

if (!validReminderTypes.includes(reminderType)) {
    throw new ApiError(
        400,
        "Invalid reminder type."
    );
}


// Notification type validation
const validNotificationTypes = [
    "BROWSER",
    "EMAIL",
    "BOTH"
];

const finalNotificationType =
    notificationType !== undefined
        ? notificationType
        : reminder.notificationType;

if (
    finalNotificationType &&
    !validNotificationTypes.includes(finalNotificationType)
) {
    throw new ApiError(
        400,
        "Invalid notification type."
    );
}

// Days of week validation
const validDays = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
];

if (finalDaysOfWeek) {

    if (!Array.isArray(finalDaysOfWeek)) {
        throw new ApiError(
            400,
            "Days of week must be an array."
        );
    }

    const hasInvalidDay = finalDaysOfWeek.some(
        (day) => !validDays.includes(day)
    );

    if (hasInvalidDay) {
        throw new ApiError(
            400,
            "Invalid day in daysOfWeek."
        );
    }
}

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ApiError(
                400,
                "Invalid start date or end date."
            );
        }

        if (start > end) {
            throw new ApiError(
                400,
                "Start date cannot be after end date."
            );
        }
    }

    // Medicine validation
    if (category === "MEDICINE") {

        if (!medicine) {
            throw new ApiError(
                400,
                "Medicine is required for medicine reminder."
            );
        }

        const existingMedicine = await Medicine.findOne({
            _id: medicine,
            user: req.user._id
        });

        if (!existingMedicine) {
            throw new ApiError(
                404,
                "Medicine not found."
            );
        }
    }

// ONE TIME VALIDATION
if (reminderType === "ONE_TIME") {

    if (!scheduledAt) {
        throw new ApiError(
            400,
            "Scheduled date and time are required for one-time reminder."
        );
    }

    const scheduled = new Date(scheduledAt);


if (isNaN(scheduled.getTime())) {
    throw new ApiError(
        400,
        "Invalid scheduled date and time."
    );
}

if (scheduled <= new Date()) {
    throw new ApiError(
        400,
        "Scheduled date and time must be in the future."
    );
}

    if (isNaN(scheduled.getTime())) {
        throw new ApiError(
            400,
            "Invalid scheduled date and time."
        );
    }

    // Check scheduledAt with startDate
    if (startDate) {

        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
            throw new ApiError(
                400,
                "Invalid start date."
            );
        }

        if (scheduled < start) {
            throw new ApiError(
                400,
                "Scheduled date cannot be before start date."
            );
        }
    }

    // Check scheduledAt with endDate
    if (endDate) {

        const end = new Date(endDate);

        if (isNaN(end.getTime())) {
            throw new ApiError(
                400,
                "Invalid end date."
            );
        }

        if (scheduled > end) {
            throw new ApiError(
                400,
                "Scheduled date cannot be after end date."
            );
        }
    }
}

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Daily validation
    if (reminderType === "DAILY") {

        if (!time) {
            throw new ApiError(
                400,
                "Time is required for daily reminder."
            );
        }

        if (!timeRegex.test(time)) {
            throw new ApiError(
                400,
                "Time must be in HH:mm format."
            );
        }
    }

    // Weekly validation
    if (reminderType === "WEEKLY") {

        if (!time) {
            throw new ApiError(
                400,
                "Time is required for weekly reminder."
            );
        }

        if (!timeRegex.test(time)) {
            throw new ApiError(
                400,
                "Time must be in HH:mm format."
            );
        }

        if (!daysOfWeek || daysOfWeek.length === 0) {
            throw new ApiError(
                400,
                "At least one day is required for weekly reminder."
            );
        }
    }

    // Hourly validation
    if (reminderType === "HOURLY") {

        if (
            intervalMinutes === undefined ||
            intervalMinutes === null
        ) {
            throw new ApiError(
                400,
                "Interval is required for hourly reminder."
            );
        }

        if (
    typeof intervalMinutes !== "number" ||
    !Number.isInteger(intervalMinutes) ||
    intervalMinutes < 1
) {
    throw new ApiError(
        400,
        "Interval must be a positive integer."
    );
}

        if (!startTime || !endTime) {
            throw new ApiError(
                400,
                "Start time and end time are required for hourly reminder."
            );
        }

        if (
            !timeRegex.test(startTime) ||
            !timeRegex.test(endTime)
        ) {
            throw new ApiError(
                400,
                "Start time and end time must be in HH:mm format."
            );
        }

        if (startTime >= endTime) {
            throw new ApiError(
                400,
                "Start time must be before end time."
            );
        }
    }

    if (reminderType === "CUSTOM") {

        if (
            customInterval === undefined ||
            customInterval === null
        ) {
            throw new ApiError(
                400,
                "Custom interval is required for custom reminder."
            );
        }

      if (
    typeof finalCustomInterval !== "number" ||
    !Number.isInteger(finalCustomInterval) ||
    finalCustomInterval <= 0
) {
    throw new ApiError(
        400,
        "Custom interval must be a positive integer."
    );
}

        if (!customIntervalUnit) {
            throw new ApiError(
                400,
                "Custom interval unit is required."
            );
        }

        const validUnits = [
            "MINUTES",
            "HOURS",
            "DAYS"
        ];

        if (!validUnits.includes(customIntervalUnit)) {
            throw new ApiError(
                400,
                "Invalid custom interval unit."
            );
        }
    }

    const conflict = await checkReminderConflict({
    userId: req.user._id,
    reminderType,
    scheduledAt,
    time,
    daysOfWeek,
    intervalMinutes,
    customInterval,
    customIntervalUnit
});

if (conflict) {
    throw new ApiError(
        409,
        "A similar active reminder already exists."
    );
}

    const reminder = await Reminder.create({
        title,
        category,
        medicine: category === "MEDICINE" ? medicine : null,
        user: req.user._id,
        reminderType,
        scheduledAt,
        startDate,
        endDate,
        time,
        daysOfWeek,
        intervalMinutes,
        customInterval,
        customIntervalUnit,
        startTime,
        endTime,
        notificationType,
        timezone,
        description
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Reminder created successfully",
            reminder
        )
    );
});

const validateReminderData = (data) => {
    const {
        reminderType,
        scheduledAt,
        time,
        daysOfWeek,
        intervalMinutes,
        customInterval,
        customIntervalUnit
    } = data;

    if (!reminderType) {
        throw new ApiError(400, "Reminder type is required.");
    }

    // ONE_TIME
    if (reminderType === "ONE_TIME") {
        if (!scheduledAt) {
            throw new ApiError(
                400,
                "scheduledAt is required for one-time reminder."
            );
        }

        if (new Date(scheduledAt) <= new Date()) {
            throw new ApiError(
                400,
                "scheduledAt must be a future date and time."
            );
        }
    }

    // DAILY
    if (reminderType === "DAILY") {
        if (!time) {
            throw new ApiError(
                400,
                "time is required for daily reminder."
            );
        }
    }

    // WEEKLY
    if (reminderType === "WEEKLY") {
        if (!time) {
            throw new ApiError(
                400,
                "time is required for weekly reminder."
            );
        }

        if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
            throw new ApiError(
                400,
                "daysOfWeek is required for weekly reminder."
            );
        }
    }

    // HOURLY
    if (reminderType === "HOURLY") {
        if (!intervalMinutes) {
            throw new ApiError(
                400,
                "intervalMinutes is required for hourly reminder."
            );
        }

        if (!Number.isInteger(intervalMinutes) || intervalMinutes <= 0) {
            throw new ApiError(
                400,
                "intervalMinutes must be a positive integer."
            );
        }
    }

    // CUSTOM
    if (reminderType === "CUSTOM") {
        if (!customInterval) {
            throw new ApiError(
                400,
                "customInterval is required for custom reminder."
            );
        }

        if (!Number.isInteger(customInterval) || customInterval <= 0) {
            throw new ApiError(
                400,
                "customInterval must be a positive integer."
            );
        }

        if (!customIntervalUnit) {
            throw new ApiError(
                400,
                "customIntervalUnit is required for custom reminder."
            );
        }

        const validUnits = ["MINUTES", "HOURS", "DAYS"];

        if (!validUnits.includes(customIntervalUnit)) {
            throw new ApiError(
                400,
                "Invalid customIntervalUnit."
            );
        }
    }
};

export const getReminders = asyncHandler(async (req, res) => {

    const reminders = await Reminder.find({
        user: req.user._id
    })
        .populate("medicine", "medicineName dosage type")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminders fetched successfully",
            reminders
        )
    );
});

export const getReminderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    }).populate(
        "medicine",
        "medicine dosage type"
    );

    if (!reminder) {
        throw new ApiError(404, "Reminder Not found!!");
    }

    return res.status(200).json(new ApiResponse(200, "Reminder fetched successfully", reminder));
})

export const updateReminder = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        title,
        category,
        medicine,
        reminderType,
        scheduledAt,
        time,
        daysOfWeek,
        customInterval,
        customIntervalUnit,
        intervalMinutes,
        startTime,
        endTime,
        startDate,
        endDate,
        isActive,
        notificationType,
        timezone,
        description
    } = req.body;


    // Find reminder
    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    });

    if (!reminder) {
        throw new ApiError(
            404,
            "Reminder not found!"
        );
    }


    // Time validation regex
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;


    // Final values
    // New value aaye to new value,
    // otherwise existing value use hoga.

    const finalReminderType =
        reminderType !== undefined
            ? reminderType
            : reminder.reminderType;

    const finalStartDate =
        startDate !== undefined
            ? startDate
            : reminder.startDate;

    const finalEndDate =
        endDate !== undefined
            ? endDate
            : reminder.endDate;

    const finalTime =
        time !== undefined
            ? time
            : reminder.time;

    const finalDaysOfWeek =
        daysOfWeek !== undefined
            ? daysOfWeek
            : reminder.daysOfWeek;

    const finalCustomInterval =
        customInterval !== undefined
            ? customInterval
            : reminder.customInterval;

    const finalCustomIntervalUnit =
        customIntervalUnit !== undefined
            ? customIntervalUnit
            : reminder.customIntervalUnit;

    const finalIntervalMinutes =
        intervalMinutes !== undefined
            ? intervalMinutes
            : reminder.intervalMinutes;

    const finalStartTime =
        startTime !== undefined
            ? startTime
            : reminder.startTime;

    const finalEndTime =
        endTime !== undefined
            ? endTime
            : reminder.endTime;

    const finalScheduledAt =
        scheduledAt !== undefined
            ? scheduledAt
            : reminder.scheduledAt;

const validReminderTypes = [
    "ONE_TIME",
    "DAILY",
    "HOURLY",
    "WEEKLY",
    "CUSTOM"
];

if (!validReminderTypes.includes(finalReminderType)) {
    throw new ApiError(
        400,
        "Invalid reminder type."
    );
}

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    if (finalStartDate && finalEndDate) {

        const start = new Date(finalStartDate);
        const end = new Date(finalEndDate);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            throw new ApiError(
                400,
                "Invalid start date or end date."
            );
        }

        if (start > end) {
            throw new ApiError(
                400,
                "Start date cannot be after end date."
            );
        }
    }



   // ==========================================
// ONE TIME VALIDATION
// ==========================================

if (finalReminderType === "ONE_TIME") {

    if (!finalScheduledAt) {
        throw new ApiError(
            400,
            "Scheduled date and time are required for one-time reminder."
        );
    }

    const scheduled = new Date(finalScheduledAt);

    if (isNaN(scheduled.getTime())) {
        throw new ApiError(
            400,
            "Invalid scheduled date and time."
        );
    }

    if (finalStartDate) {

        const start = new Date(finalStartDate);

        if (isNaN(start.getTime())) {
            throw new ApiError(
                400,
                "Invalid start date."
            );
        }

        if (scheduled < start) {
            throw new ApiError(
                400,
                "Scheduled date cannot be before start date."
            );
        }
    }

    if (finalEndDate) {

        const end = new Date(finalEndDate);

        if (isNaN(end.getTime())) {
            throw new ApiError(
                400,
                "Invalid end date."
            );
        }

        if (scheduled > end) {
            throw new ApiError(
                400,
                "Scheduled date cannot be after end date."
            );
        }
    }
}

    if (finalStartDate && finalEndDate) {

        const start = new Date(finalStartDate);
        const end = new Date(finalEndDate);
        const scheduled = new Date(finalScheduledAt);

        if (
            scheduled < start ||
            scheduled > end
        ) {
            throw new ApiError(
                400,
                "Scheduled date must be within start date and end date."
            );
        }
    }


    // ==========================================
    // DAILY VALIDATION
    // ==========================================

    if (finalReminderType === "DAILY") {

        if (!finalTime) {
            throw new ApiError(
                400,
                "Time is required for daily reminder."
            );
        }

        if (!timeRegex.test(finalTime)) {
            throw new ApiError(
                400,
                "Time must be in HH:mm format."
            );
        }
    }


    // ==========================================
    // WEEKLY VALIDATION
    // ==========================================

    if (finalReminderType === "WEEKLY") {

        if (!finalTime) {
            throw new ApiError(
                400,
                "Time is required for weekly reminder."
            );
        }

        if (!timeRegex.test(finalTime)) {
            throw new ApiError(
                400,
                "Time must be in HH:mm format."
            );
        }

        if (
            !finalDaysOfWeek ||
            finalDaysOfWeek.length === 0
        ) {
            throw new ApiError(
                400,
                "At least one day is required for weekly reminder."
            );
        }
    }


    // ==========================================
    // HOURLY VALIDATION
    // ==========================================

    if (finalReminderType === "HOURLY") {

        if (
            finalIntervalMinutes === undefined ||
            finalIntervalMinutes === null
        ) {
            throw new ApiError(
                400,
                "Interval is required for hourly reminder."
            );
        }

     if (
    typeof finalIntervalMinutes !== "number" ||
    !Number.isInteger(finalIntervalMinutes) ||
    finalIntervalMinutes < 1
) {
    throw new ApiError(
        400,
        "Interval must be a positive integer."
    );
}

        if (!finalStartTime || !finalEndTime) {
            throw new ApiError(
                400,
                "Start time and end time are required for hourly reminder."
            );
        }

        if (
            !timeRegex.test(finalStartTime) ||
            !timeRegex.test(finalEndTime)
        ) {
            throw new ApiError(
                400,
                "Start time and end time must be in HH:mm format."
            );
        }

        if (finalStartTime >= finalEndTime) {
            throw new ApiError(
                400,
                "Start time must be before end time."
            );
        }
    }


    // ==========================================
    // CUSTOM VALIDATION
    // ==========================================

    if (finalReminderType === "CUSTOM") {

        if (
            finalCustomInterval === undefined ||
            finalCustomInterval === null
        ) {
            throw new ApiError(
                400,
                "Custom interval is required for custom reminder."
            );
        }

        if (finalCustomInterval <= 0) {
            throw new ApiError(
                400,
                "Custom interval must be greater than 0."
            );
        }

        if (!finalCustomIntervalUnit) {
            throw new ApiError(
                400,
                "Custom interval unit is required."
            );
        }

        const validUnits = [
            "MINUTES",
            "HOURS",
            "DAYS"
        ];

        if (
            !validUnits.includes(
                finalCustomIntervalUnit
            )
        ) {
            throw new ApiError(
                400,
                "Invalid custom interval unit."
            );
        }
    }


    // ==========================================
    // MEDICINE VALIDATION
    // ==========================================

    const finalCategory =
        category !== undefined
            ? category
            : reminder.category;

    const finalMedicine =
        medicine !== undefined
            ? medicine
            : reminder.medicine;


    if (finalCategory === "MEDICINE") {

        if (!finalMedicine) {
            throw new ApiError(
                400,
                "Medicine is required for medicine reminder."
            );
        }

        const existingMedicine =
            await Medicine.findOne({
                _id: finalMedicine,
                user: req.user._id
            });

        if (!existingMedicine) {
            throw new ApiError(
                404,
                "Medicine not found."
            );
        }
    }

const conflict = await checkReminderConflict({
    userId: req.user._id,
    reminderType: finalReminderType,
    scheduledAt: finalScheduledAt,
    time: finalTime,
    daysOfWeek: finalDaysOfWeek,
    intervalMinutes: finalIntervalMinutes,
    customInterval: finalCustomInterval,
    customIntervalUnit: finalCustomIntervalUnit,
    excludeReminderId: id
});

if (conflict) {
    throw new ApiError(
        409,
        "A similar active reminder already exists."
    );
}

    // ==========================================
    // UPDATE FIELDS
    // ==========================================

    if (title !== undefined) {
        reminder.title = title;
    }

    if (category !== undefined) {
        reminder.category = category;
    }

    // If category is MEDICINE
    if (finalCategory === "MEDICINE") {
        reminder.medicine = finalMedicine;
    }

    // If category changes from MEDICINE
    // to another category
    if (
        category !== undefined &&
        category !== "MEDICINE"
    ) {
        reminder.medicine = null;
    }

    if (reminderType !== undefined) {
        reminder.reminderType = reminderType;
    }

    if (scheduledAt !== undefined) {
        reminder.scheduledAt = scheduledAt;
    }

    if (time !== undefined) {
        reminder.time = time;
    }

    if (daysOfWeek !== undefined) {
        reminder.daysOfWeek = daysOfWeek;
    }

    if (customInterval !== undefined) {
        reminder.customInterval = customInterval;
    }

    if (customIntervalUnit !== undefined) {
        reminder.customIntervalUnit =
            customIntervalUnit;
    }

    if (intervalMinutes !== undefined) {
        reminder.intervalMinutes = intervalMinutes;
    }

    if (startTime !== undefined) {
        reminder.startTime = startTime;
    }

    if (endTime !== undefined) {
        reminder.endTime = endTime;
    }

    if (startDate !== undefined) {
        reminder.startDate = startDate;
    }

    if (endDate !== undefined) {
        reminder.endDate = endDate;
    }

    if (isActive !== undefined) {
        reminder.isActive = isActive;
    }

    if (notificationType !== undefined) {
        reminder.notificationType =
            notificationType;
    }

    if (timezone !== undefined) {
        reminder.timezone = timezone;
    }

    if (description !== undefined) {
        reminder.description = description;
    }


    // Save
    await reminder.save();


    // Response
    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder updated successfully",
            reminder
        )
    );
});

export const getReminderDashboard = asyncHandler(
    async (req, res) => {

        const userId = req.user._id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [
    totalReminders,
    activeReminders,
    completedToday,
    missedToday,
    snoozedReminders,
    pendingToday
] = await Promise.all([

            Reminder.countDocuments({
                user: userId
            }),

            Reminder.countDocuments({
                user: userId,
                isActive: true
            }),

            ReminderHistory.countDocuments({
                user: userId,
                status: "COMPLETED",
                triggeredAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }),

            ReminderHistory.countDocuments({
                user: userId,
                status: "MISSED",
                triggeredAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }),

            ReminderHistory.countDocuments({
                user: userId,
                status: "SNOOZED"
            }),

            ReminderHistory.countDocuments({
                user: userId,
                status: "TRIGGERED",
                triggeredAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }),

            
        ]);

        const activeReminderList = await Reminder.find({
    user: userId,
    isActive: true
}).select(
    "title category reminderType scheduledAt time daysOfWeek"
);

let upcomingReminder = null;
let nextReminderTime = null;

for (const reminder of activeReminderList) {

    const nextTime = getNextReminderTime(
        reminder,
        new Date()
    );

    if (!nextTime) {
        continue;
    }

    if (
        !nextReminderTime ||
        nextTime < nextReminderTime
    ) {
        nextReminderTime = nextTime;

        upcomingReminder = {
            reminderId: reminder._id,
            title: reminder.title,
            category: reminder.category,
            reminderType: reminder.reminderType,
            scheduledAt: nextTime
        };
    }
}

        const totalToday =
            completedToday +
            missedToday +
            pendingToday;

        const completionRate =
            totalToday > 0
                ? Number(
                    (
                        (completedToday / totalToday) *
                        100
                    ).toFixed(2)
                )
                : 0;

        return res.status(200).json(
            new ApiResponse(
                200,
                "Reminder dashboard fetched successfully.",
                {
                    summary: {
                        totalReminders,
                        activeReminders,
                        completedToday,
                        pendingToday,
                        missedToday,
                        snoozedReminders,
                        completionRate
                    },

                    upcomingReminder
                }
            )
        );
    }
);

export const deleteReminder = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    });

    if (!reminder) {
        throw new ApiError(404, "Reminder not found");
    }

    await Reminder.deleteOne({
        _id: id,
        user: req.user._id

    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder deleted successfully",
            null
        )
    );
});

export const pauseReminder = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    });

    if (!reminder) {
        throw new ApiError(
            404,
            "Reminder not found."
        );
    }

    if (!reminder.isActive) {
        throw new ApiError(
            400,
            "Reminder is already paused."
        );
    }

    reminder.isActive = false;

    await reminder.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder paused successfully.",
            reminder
        )
    );
});


export const resumeReminder = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    });

    if (!reminder) {
        throw new ApiError(
            404,
            "Reminder not found."
        );
    }

    if (reminder.isActive) {
        throw new ApiError(
            400,
            "Reminder is already active."
        );
    }

    // Check if reminder has expired
    if (
        reminder.endDate &&
        new Date() > new Date(reminder.endDate)
    ) {
        throw new ApiError(
            400,
            "Reminder has already expired."
        );
    }

    reminder.isActive = true;

    await reminder.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder resumed successfully.",
            reminder
        )
    );
});

export const toggleReminderStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    });

    if (!reminder) {
        throw new ApiError(
            404,
            "Reminder not found"
        );
    }

    reminder.isActive = !reminder.isActive;

    await reminder.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            `Reminder ${
                reminder.isActive
                    ? "activated"
                    : "deactivated"
            } successfully`,
            reminder
        )
    );
});