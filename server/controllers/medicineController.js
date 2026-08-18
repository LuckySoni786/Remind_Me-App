import Medicine from "../models/Medicine.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
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

    if (!medicineName || !dosage || !type || !startDate) {
        throw new ApiError(400, "Please fill all required fields.");
    }

    const medicine = await Medicine.create({
        medicineName,
        dosage,
        type,
        instructions,
        notes,
        color,
        startDate,
        endDate,
        reminderEnabled,
        user: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            "Medicine created successfully",
            medicine
        )
    )

});

export const getMedicine = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({
        user: req.user._id
    }).sort({ createdAt: -1 })
    return res.status(200).json(
        new ApiResponse(200, "Medicine get successfully", medicines)
    )
})

export const getMedicineById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const medicine = await Medicine.findOne({
        _id: id,
        user: req.user._id
    })

    if (!medicine) {

        throw new ApiError(400, "Medicine not found")

    }

    return res.status(200).json(new ApiResponse(200, "Medicine fetched successfully", medicine));

})

export const updateMedicine = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
        throw new ApiError(404, "Medicine not found");

    }

 

    if (medicineName !== undefined) {
    medicine.medicineName = medicineName;
}

if (dosage !== undefined) {
    medicine.dosage = dosage;
}

if (type !== undefined) {
    medicine.type = type;
}

if (instructions !== undefined) {
    medicine.instructions = instructions;
}

if (notes !== undefined) {
    medicine.notes = notes;
}

if (color !== undefined) {
    medicine.color = color;
}

if (startDate !== undefined) {
    medicine.startDate = startDate;
}

if (endDate !== undefined) {
    medicine.endDate = endDate;
}

if (reminderEnabled !== undefined) {
    medicine.reminderEnabled = reminderEnabled;
}

if (isActive !== undefined) {
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

})

export const deleteMedicine = asyncHandler(async(req, res)=>{
    const {id} = req.params;

    const medicine = await Medicine.findOne({
        _id: id,
        user: req.user._id
    });

if(!medicine){
        throw new ApiError(404, "Medicine not found!!");
        }

await Medicine.deleteOne({
     _id: id
})
    
    
    return res.status(200).json(new ApiResponse(200, "Medicine Deleted Successfully!", null));
})