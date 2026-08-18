import express from 'express';
import { createReminder, deleteReminder, getReminderById, getReminders, updateReminder } from '../controllers/reminderController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", verifyJWT, createReminder);
router.get("/", verifyJWT, getReminders);
router.get("/:id", verifyJWT, getReminderById);
router.put("/:id", verifyJWT, updateReminder);
router.delete("/:id", verifyJWT, deleteReminder);

export default router;