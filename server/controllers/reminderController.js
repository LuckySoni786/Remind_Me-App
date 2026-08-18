import Reminder from "../models/Reminder.js";
import Medicine from "../models/Medicine.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

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
        startTime,
        endTime,
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

    // One-time validation
    if (reminderType === "ONE_TIME" && !scheduledAt) {
        throw new ApiError(
            400,
            "Scheduled date and time are required for one-time reminder."
        );
    }

    // Daily validation
    if (reminderType === "DAILY" && !time) {
        throw new ApiError(
            400,
            "Time is required for daily reminder."
        );
    }

    // Weekly validation
    if (reminderType === "WEEKLY") {

        if (!time) {
            throw new ApiError(
                400,
                "Time is required for weekly reminder."
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

        if (!intervalMinutes) {
            throw new ApiError(
                400,
                "Interval is required for hourly reminder."
            );
        }

        if (!startTime || !endTime) {
            throw new ApiError(
                400,
                "Start time and end time are required for hourly reminder."
            );
        }
    }

    const reminder = await Reminder.create({
        title,
        category,
        medicine: category === "MEDICINE" ? medicine : null,
        user: req.user._id,
        reminderType,
        scheduledAt,
        time,
        daysOfWeek,
        intervalMinutes,
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

    if(!reminder){
        throw new ApiError(404, "Reminder Not found!!");
    }

    return res.status(200).json(new ApiResponse(200, "Reminder fetched successfully", reminder));
})

export const updateReminder = asyncHandler(async(req, res)=>{
    const {id} = req.params;

    const {
        title,
        category,
        medicine,
        reminderType,
        scheduledAt,
        time,
        daysOfWeek,
        intervalMinutes,
        startTime,
        endTime,
        isActive,
        notificationType,
        timezone,
        description
    } = req.body;

    const reminder = await Reminder.findOne({
        _id: id,
        user: req.user._id
    })

    if(!reminder){
        throw new ApiError(404, "reminder not found!");
    }

    if (category === "MEDICINE") {

        if (!medicine && !reminder.medicine) {
            throw new ApiError(
                400,
                "Medicine is required for medicine reminder."
            );
        }

        if (medicine) {
            const existingMedicine = await Medicine.findOne({
                _id: medicine,
                user: req.user._id
            });

            if (!existingMedicine) {
                throw new ApiError(404, "Medicine not found");
            }

            reminder.medicine = medicine;
        }
    }

    // If category is changed from MEDICINE to something else
    if (category && category !== "MEDICINE") {
        reminder.medicine = null;
    }

    if (title !== undefined) {
        reminder.title = title;
    }

    if (category !== undefined) {
        reminder.category = category;
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

    if (intervalMinutes !== undefined) {
        reminder.intervalMinutes = intervalMinutes;
    }

    if (startTime !== undefined) {
        reminder.startTime = startTime;
    }

    if (endTime !== undefined) {
        reminder.endTime = endTime;
    }

    if (isActive !== undefined) {
        reminder.isActive = isActive;
    }

    if (notificationType !== undefined) {
        reminder.notificationType = notificationType;
    }

    if (timezone !== undefined) {
        reminder.timezone = timezone;
    }

    if (description !== undefined) {
        reminder.description = description;
    }

    await reminder.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder updated successfully",
            reminder
        )
    );

})


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
        _id: id
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder deleted successfully",
            null
        )
    );
});