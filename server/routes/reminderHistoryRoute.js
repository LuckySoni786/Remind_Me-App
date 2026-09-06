import express from "express";
import {
    getReminderHistory,
    updateHistoryStatus,
    getReminderStatistics,
    snoozeReminderHistory
} from "../controllers/reminderHistoryController.js";
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    "/",
    verifyJWT,
    getReminderHistory
);

router.get(
    "/statistics",
    verifyJWT,
    getReminderStatistics
);

router.patch(
    "/:id/status",
    verifyJWT,
    updateHistoryStatus
);
router.patch(
    "/:id/snooze",
    verifyJWT,
    snoozeReminderHistory
);

export default router;