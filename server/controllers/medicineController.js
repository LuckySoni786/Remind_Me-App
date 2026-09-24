import Medicine from "../models/Medicine.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Reminder from "../models/Reminder.js";
export const createMedicine = asyncHandler(async (req, res) => {
    const {
        medicineName,
        dosage,
        type,
        instructions,
        notes,
        color,
        startDate,
        endDate,
        reminderEnabled
    } = req.body;

    // Required fields
    if (
        !medicineName?.trim() ||
        !dosage?.trim() ||
        !type ||
        !startDate
    ) {
        throw new ApiError(
            400,
            "Medicine name, dosage, type and start date are required."
        );
    }

    // Validate medicine type
    const validTypes = [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Drops",
        "Cream",
        "Spray",
        "Other"
    ];

    if (!validTypes.includes(type)) {
        throw new ApiError(400, "Invalid medicine type.");
    }

    // Validate instructions
    const validInstructions = [
        "Before Food",
        "After Food",
        "With Food",
        "Empty Stomach",
        "Anytime"
    ];

    if (
        instructions !== undefined &&
        !validInstructions.includes(instructions)
    ) {
        throw new ApiError(400, "Invalid medicine instructions.");
    }

    // Validate dates
    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
        throw new ApiError(400, "Invalid start date.");
    }

    let parsedEndDate;

    if (endDate) {
        parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
            throw new ApiError(400, "Invalid end date.");
        }

        if (parsedEndDate < parsedStartDate) {
            throw new ApiError(
                400,
                "End date cannot be before start date."
            );
        }
    }

    // Validate reminderEnabled
    if (
        reminderEnabled !== undefined &&
        typeof reminderEnabled !== "boolean"
    ) {
        throw new ApiError(
            400,
            "reminderEnabled must be a boolean."
        );
    }

    const medicine = await Medicine.create({
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        type,
        instructions: instructions ?? "Anytime",
        notes: notes?.trim() ?? "",
        color,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        reminderEnabled: reminderEnabled ?? true,
        user: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Medicine created successfully",
            medicine
        )
    );
});

export const getMedicine = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({
        user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Medicines fetched successfully",
            medicines
        )
    );
});

export const getMedicineById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid medicine ID.");
    }

    const medicine = await Medicine.findOne({
        _id: id,
        user: req.user._id
    });

    if (!medicine) {
        throw new ApiError(404, "Medicine not found.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Medicine fetched successfully",
            medicine
        )
    );
});


export const updateMedicine = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid medicine ID.");
    }

    const {
        medicineName,
        dosage,
        type,
        instructions,
        notes,
        color,
        startDate,
        endDate,
        reminderEnabled,
        isActive
    } = req.body;

    const medicine = await Medicine.findOne({
        _id: id,
        user: req.user._id
    });

    if (!medicine) {
        throw new ApiError(404, "Medicine not found.");
    }

    // Medicine name
    if (medicineName !== undefined) {
        if (!medicineName.trim()) {
            throw new ApiError(400, "Medicine name cannot be empty.");
        }

        medicine.medicineName = medicineName.trim();
    }

    // Dosage
    if (dosage !== undefined) {
        if (!dosage.trim()) {
            throw new ApiError(400, "Dosage cannot be empty.");
        }

        medicine.dosage = dosage.trim();
    }

    // Medicine type
    if (type !== undefined) {
        const validTypes = [
            "Tablet",
            "Capsule",
            "Syrup",
            "Injection",
            "Drops",
            "Cream",
            "Spray",
            "Other"
        ];

        if (!validTypes.includes(type)) {
            throw new ApiError(400, "Invalid medicine type.");
        }

        medicine.type = type;
    }

    // Instructions
    if (instructions !== undefined) {
        const validInstructions = [
            "Before Food",
            "After Food",
            "With Food",
            "Empty Stomach",
            "Anytime"
        ];

        if (!validInstructions.includes(instructions)) {
            throw new ApiError(400, "Invalid medicine instructions.");
        }

        medicine.instructions = instructions;
    }

    // Notes
    if (notes !== undefined) {
        medicine.notes = notes.trim();
    }

    // Color
    if (color !== undefined) {
        medicine.color = color;
    }

    // Start date
    if (startDate !== undefined) {
        const parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
            throw new ApiError(400, "Invalid start date.");
        }

        medicine.startDate = parsedStartDate;
    }

    // End date
    if (endDate !== undefined) {
        if (endDate === null || endDate === "") {
            medicine.endDate = undefined;
        } else {
            const parsedEndDate = new Date(endDate);

            if (Number.isNaN(parsedEndDate.getTime())) {
                throw new ApiError(400, "Invalid end date.");
            }

            medicine.endDate = parsedEndDate;
        }
    }

    // Validate date relationship using final values
    if (medicine.endDate && medicine.startDate) {
        if (medicine.endDate < medicine.startDate) {
            throw new ApiError(
                400,
                "End date cannot be before start date."
            );
        }
    }

    // Reminder enabled
    if (reminderEnabled !== undefined) {
        if (typeof reminderEnabled !== "boolean") {
            throw new ApiError(
                400,
                "reminderEnabled must be a boolean."
            );
        }

        medicine.reminderEnabled = reminderEnabled;
    }

    // Active status
    if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
            throw new ApiError(
                400,
                "isActive must be a boolean."
            );
        }

        medicine.isActive = isActive;
    }

    await medicine.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Medicine updated successfully",
            medicine
        )
    );
});

export const deleteMedicine = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid medicine ID.");
    }

    const medicine = await Medicine.findOne({
        _id: id,
        user: req.user._id
    });

    if (!medicine) {
        throw new ApiError(404, "Medicine not found.");
    }

    await Medicine.deleteOne({
        _id: id,
        user: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Medicine deleted successfully.",
            null
        )
    );
});