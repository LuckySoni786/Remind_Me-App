import User from "../models/User.js";

export const updateNotificationPreferences = asyncHandler(
    async (req, res) => {

        const { browser, email } = req.body;

        if (
            typeof browser !== "boolean" &&
            typeof email !== "boolean"
        ) {
            throw new ApiError(
                400,
                "At least one notification preference is required."
            );
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        if (typeof browser === "boolean") {
            user.notificationPreferences.browser = browser;
        }

        if (typeof email === "boolean") {
            user.notificationPreferences.email = email;
        }

        await user.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                "Notification preferences updated successfully.",
                {
                    notificationPreferences:
                        user.notificationPreferences
                }
            )
        );
    }
);