import express from "express";
import { registerUser, loginUser, getCurrentUser, logout } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);

export default router;