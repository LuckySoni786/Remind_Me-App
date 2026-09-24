import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import Medicine from "../models/Medicine.js";
import Reminder from "../models/Reminder.js";
import ReminderHistory from "../models/ReminderHistory.js";

export const registerUser = asyncHandler(async (req, res) =>{

        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
             throw new ApiError(400, "All fields are required!!");
        }

        const existingUser = await User.findOne({email});

        if(existingUser)  throw new ApiError(409, "Email is already Exists with this email.");

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        })
const token = user.generateAccessToken();

console.log(token);
return res.status(201).cookie("accessToken", token, options).json( new ApiResponse(201, "User Registered successfully", {
            user:{
                id:user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email:user.email,
                role:user.role
            }}));

 
});

const options = {
    httpOnly: true,
    secure: false
};

export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = user.generateAccessToken();

    return res
    .status(200)
    .cookie("accessToken", token, options)
    .json(
        new ApiResponse(
            200,
            "Login Successful",
            {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            }
        )
    );

});

export const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            "Current User fetched successfully!",
            req.user
        )
    );
});

export const logout = asyncHandler(async(req, res)=>{
    
        
    return res.status(200).clearCookie("accessToken", options).json(
        new ApiResponse(
            200,
            "Current User Loged out!"
        )
    );
});

export const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Delete user's reminder histories
    await ReminderHistory.deleteMany({
        user: userId
    });

    // Delete user's reminders
    await Reminder.deleteMany({
        user: userId
    });

    // Delete user's medicines
    await Medicine.deleteMany({
        user: userId
    });

    // Delete user account
    await User.deleteOne({
        _id: userId
    });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(
                200,
                "Account deleted successfully."
            )
        );
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (firstName !== undefined) {
        if (!firstName.trim()) {
            throw new ApiError(400, "First name cannot be empty.");
        }

        user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
        if (!lastName.trim()) {
            throw new ApiError(400, "Last name cannot be empty.");
        }

        user.lastName = lastName.trim();
    }

    if (avatar !== undefined) {
        user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully.",
            {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            }
        )
    );
});

export const changePassword = asyncHandler(async (req, res) => {
    const {
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(
            400,
            "Current password, new password and confirm password are required."
        );
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "New password and confirm password do not match."
        );
    }

    if (newPassword.length < 8) {
        throw new ApiError(
            400,
            "New password must be at least 8 characters long."
        );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const isCurrentPasswordCorrect =
        await user.comparePassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
        throw new ApiError(
            401,
            "Current password is incorrect."
        );
    }

    if (currentPassword === newPassword) {
        throw new ApiError(
            400,
            "New password must be different from current password."
        );
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password changed successfully."
        )
    );
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
    const { browser, email } = req.body;

    if (browser !== undefined && typeof browser !== "boolean") {
        throw new ApiError(400, "browser must be a boolean.");
    }

    if (email !== undefined && typeof email !== "boolean") {
        throw new ApiError(400, "email must be a boolean.");
    }

    if (browser === undefined && email === undefined) {
        throw new ApiError(
            400,
            "At least one notification preference is required."
        );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (browser !== undefined) {
        user.notificationPreferences.browser = browser;
    }

    if (email !== undefined) {
        user.notificationPreferences.email = email;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notification preferences updated successfully.",
            {
                notificationPreferences: user.notificationPreferences
            }
        )
    );
});