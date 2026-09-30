import express from "express";

import {
    createReminder,
    deleteReminder,
    getReminderById,
    getReminderDashboard,
    getReminders,
    pauseReminder,
    resumeReminder,
    toggleReminderStatus,
    updateReminder,
} from "../controllers/reminderController.js";

import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyJWT, createReminder);

router.get("/", verifyJWT, getReminders);

router.get("/dashboard", verifyJWT, getReminderDashboard);

router.get("/:id", verifyJWT, getReminderById);

router.put("/:id", verifyJWT, updateReminder);

router.delete("/:id", verifyJWT, deleteReminder);

router.patch("/:id/pause", verifyJWT, pauseReminder);

router.patch("/:id/resume", verifyJWT, resumeReminder);

router.patch("/:id/toggle-status", verifyJWT, toggleReminderStatus);

export default router;