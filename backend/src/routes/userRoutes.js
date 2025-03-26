import userController from "../controllers/userController.js";
const { registerUser, loginUser, logoutUser, resetPassword } = userController;
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // New login endpoint
router.post("/logout", logoutUser); // New logout endpoint
router.post("/reset-password", resetPassword)

export default router;
