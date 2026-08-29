import express from "express";
import {
    getReminderHistory
} from "../controllers/reminderHistoryController.js";
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    "/",
    verifyJWT,
    getReminderHistory
);

export default router;