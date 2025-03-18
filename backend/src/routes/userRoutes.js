import userController from "../controllers/userController.js";
const { registerUser, loginUser, logoutUser } = userController;
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // New login endpoint
router.post("/logout", logoutUser); // New logout endpoint

export default router;
