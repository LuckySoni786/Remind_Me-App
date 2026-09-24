import express from "express";
import { registerUser, loginUser, getCurrentUser, logout, updateProfile, changePassword, updateNotificationPreferences, deleteAccount } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {authRateLimiter} from "../middleware/rateLimitMiddleware.js";
const router = express.Router();

router.post("/register",authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);
router.post("/logout",verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-profile", verifyJWT, updateProfile);
router.patch(
    "/change-password",
    verifyJWT,
    authRateLimiter,
    changePassword
);

router.patch(
    "/notification-preferences",
    verifyJWT,
    updateNotificationPreferences
);
router.delete(
    "/delete-account",
    verifyJWT,
    deleteAccount
);


export default router;