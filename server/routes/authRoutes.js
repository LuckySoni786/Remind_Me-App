import express from "express";
import { registerUser, loginUser, getCurrentUser, logout, updateProfile, changePassword, updateNotificationPreferences } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-profile", verifyJWT, updateProfile);
router.patch(
    "/change-password",
    verifyJWT,
    changePassword
);

router.patch(
    "/notification-preferences",
    verifyJWT,
    updateNotificationPreferences
);


export default router;