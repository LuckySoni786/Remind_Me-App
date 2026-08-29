import ReminderHistory from "../models/ReminderHistory.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const getReminderHistory = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        reminderId,
        status,
        category,
        reminderType
    } = req.query;


    // Convert pagination values
    const currentPage = Math.max(
        parseInt(page),
        1
    );

    const itemsPerPage = Math.min(
        Math.max(parseInt(limit), 1),
        100
    );

    const skip = (currentPage - 1) * itemsPerPage;


    // Base filter
    const filter = {
        user: req.user._id
    };


    // Filter by reminder
    if (reminderId) {
        filter.reminder = reminderId;
    }


    // Filter by status
    if (status) {
        filter.status = status;
    }


    // Filter by category
    if (category) {
        filter.category = category;
    }


    // Filter by reminder type
    if (reminderType) {
        filter.reminderType = reminderType;
    }


    // Get total records
    const totalRecords =
        await ReminderHistory.countDocuments(filter);


    // Get paginated history
    const history =
        await ReminderHistory.find(filter)
            .populate(
                "reminder",
                "title category reminderType"
            )
            .sort({
                triggeredAt: -1
            })
            .skip(skip)
            .limit(itemsPerPage);


    const totalPages = Math.ceil(
        totalRecords / itemsPerPage
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder history fetched successfully",
            {
                history,

                pagination: {
                    currentPage,
                    itemsPerPage,
                    totalRecords,
                    totalPages,

                    hasNextPage:
                        currentPage < totalPages,

                    hasPreviousPage:
                        currentPage > 1
                }
            }
        )
    );
});