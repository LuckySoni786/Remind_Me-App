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

export const updateHistoryStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
        "TRIGGERED",
        "COMPLETED",
        "MISSED",
        "DISMISSED"
    ];

    if (!status) {
        throw new ApiError(
            400,
            "Status is required."
        );
    }

    if (!validStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid history status."
        );
    }

    const history = await ReminderHistory.findOne({
        _id: id,
        user: req.user._id
    });

    if (!history) {
        throw new ApiError(
            404,
            "Reminder history not found."
        );
    }

    history.status = status;

    await history.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder history status updated successfully.",
            history
        )
    );
});


export const getReminderStatistics = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // ==========================================
    // DATE RANGE FILTER
    // ==========================================

    const { startDate, endDate } = req.query;

    const filter = {
        user: userId
    };

    if (startDate || endDate) {
        filter.triggeredAt = {};

        if (startDate) {
            const start = new Date(startDate);

            if (isNaN(start.getTime())) {
                throw new ApiError(400, "Invalid start date.");
            }

            start.setHours(0, 0, 0, 0);

            filter.triggeredAt.$gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);

            if (isNaN(end.getTime())) {
                throw new ApiError(400, "Invalid end date.");
            }

            end.setHours(23, 59, 59, 999);

            filter.triggeredAt.$lte = end;
        }

        // Start date should not be greater than end date
        if (
            filter.triggeredAt.$gte &&
            filter.triggeredAt.$lte &&
            filter.triggeredAt.$gte > filter.triggeredAt.$lte
        ) {
            throw new ApiError(
                400,
                "Start date cannot be greater than end date."
            );
        }
    }

    // ==========================================
    // OVERALL STATISTICS
    // ==========================================

    const totalRecords =
        await ReminderHistory.countDocuments(filter);

    const triggered =
        await ReminderHistory.countDocuments({
            ...filter,
            status: "TRIGGERED"
        });

    const completed =
        await ReminderHistory.countDocuments({
            ...filter,
            status: "COMPLETED"
        });

    const missed =
        await ReminderHistory.countDocuments({
            ...filter,
            status: "MISSED"
        });

    const dismissed =
        await ReminderHistory.countDocuments({
            ...filter,
            status: "DISMISSED"
        });

    // ==========================================
    // COMPLETION RATE
    // ==========================================

    const completionRate =
        totalRecords > 0
            ? Number(
                  ((completed / totalRecords) * 100).toFixed(2)
              )
            : 0;

    // ==========================================
    // MISSED RATE
    // ==========================================

    const missedRate =
        totalRecords > 0
            ? Number(
                  ((missed / totalRecords) * 100).toFixed(2)
              )
            : 0;

    // ==========================================
    // CATEGORY-WISE STATISTICS
    // ==========================================

    const categoryStatistics =
        await ReminderHistory.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: "$category",

                    total: {
                        $sum: 1
                    },

                    triggered: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "TRIGGERED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "COMPLETED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    missed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "MISSED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    dismissed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "DISMISSED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    total: 1,
                    triggered: 1,
                    completed: 1,
                    missed: 1,
                    dismissed: 1
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ]);

    // ==========================================
    // REMINDER TYPE-WISE STATISTICS
    // ==========================================

    const reminderTypeStatistics =
        await ReminderHistory.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: "$reminderType",

                    total: {
                        $sum: 1
                    },

                    triggered: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "TRIGGERED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "COMPLETED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    missed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "MISSED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    dismissed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "DISMISSED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    reminderType: "$_id",
                    total: 1,
                    triggered: 1,
                    completed: 1,
                    missed: 1,
                    dismissed: 1
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ]);

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    const dailyTrend = await ReminderHistory.aggregate([
    {
        $match: filter
    },
    {
        $group: {
            _id: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$triggeredAt"
                }
            },

            total: {
                $sum: 1
            },

            triggered: {
                $sum: {
                    $cond: [
                        {
                            $eq: ["$status", "TRIGGERED"]
                        },
                        1,
                        0
                    ]
                }
            },

            completed: {
                $sum: {
                    $cond: [
                        {
                            $eq: ["$status", "COMPLETED"]
                        },
                        1,
                        0
                    ]
                }
            },

            missed: {
                $sum: {
                    $cond: [
                        {
                            $eq: ["$status", "MISSED"]
                        },
                        1,
                        0
                    ]
                }
            },

            dismissed: {
                $sum: {
                    $cond: [
                        {
                            $eq: ["$status", "DISMISSED"]
                        },
                        1,
                        0
                    ]
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            date: "$_id",
            total: 1,
            triggered: 1,
            completed: 1,
            missed: 1,
            dismissed: 1
        }
    },
    {
        $sort: {
            date: 1
        }
    }
]);

// ==========================================
// WEEKLY TREND
// ==========================================

const weeklyTrend = await ReminderHistory.aggregate([
    {
        $match: filter
    },
    {
        $group: {
            _id: {
                year: {
                    $isoWeekYear: "$triggeredAt"
                },
                week: {
                    $isoWeek: "$triggeredAt"
                }
            },

            total: {
                $sum: 1
            },

            triggered: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "TRIGGERED"] },
                        1,
                        0
                    ]
                }
            },

            completed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "COMPLETED"] },
                        1,
                        0
                    ]
                }
            },

            missed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "MISSED"] },
                        1,
                        0
                    ]
                }
            },

            dismissed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "DISMISSED"] },
                        1,
                        0
                    ]
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            year: "$_id.year",
            week: "$_id.week",
            total: 1,
            triggered: 1,
            completed: 1,
            missed: 1,
            dismissed: 1
        }
    },
    {
        $sort: {
            year: 1,
            week: 1
        }
    }
]);

// ==========================================
// MONTHLY TREND
// ==========================================

const monthlyTrend = await ReminderHistory.aggregate([
    {
        $match: filter
    },
    {
        $group: {
            _id: {
                year: {
                    $year: "$triggeredAt"
                },
                month: {
                    $month: "$triggeredAt"
                }
            },

            total: {
                $sum: 1
            },

            triggered: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "TRIGGERED"] },
                        1,
                        0
                    ]
                }
            },

            completed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "COMPLETED"] },
                        1,
                        0
                    ]
                }
            },

            missed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "MISSED"] },
                        1,
                        0
                    ]
                }
            },

            dismissed: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "DISMISSED"] },
                        1,
                        0
                    ]
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            total: 1,
            triggered: 1,
            completed: 1,
            missed: 1,
            dismissed: 1
        }
    },
    {
        $sort: {
            year: 1,
            month: 1
        }
    }
]);

// ==========================================
// PRODUCTIVITY SUMMARY
// ==========================================

const productivitySummary = {
    completionRate,
    missedRate,

    activeRate:
        totalRecords > 0
            ? Number(
                  ((triggered / totalRecords) * 100).toFixed(2)
              )
            : 0,

    dismissalRate:
        totalRecords > 0
            ? Number(
                  ((dismissed / totalRecords) * 100).toFixed(2)
              )
            : 0
};

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reminder statistics fetched successfully.",
            {
                totalRecords,
                triggered,
                completed,
                missed,
                dismissed,
                completionRate,
                missedRate,
                categoryStatistics,
                reminderTypeStatistics,
                dailyTrend,
                weeklyTrend,
            monthlyTrend,

            productivitySummary
            }
        )
    );
});