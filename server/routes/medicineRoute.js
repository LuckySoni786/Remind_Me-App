import express from "express";
import { createMedicine, getMedicine, getMedicineById, updateMedicine, deleteMedicine } from "../controllers/medicineController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/medicine", verifyJWT , createMedicine);
router.get("/getMedicine", verifyJWT , getMedicine);
router.get("/:id", verifyJWT , getMedicineById);
router.put("/:id",verifyJWT, updateMedicine);
router.delete("/:id",verifyJWT, deleteMedicine);

export default router;