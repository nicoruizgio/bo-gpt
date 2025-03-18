import { Router } from "express";
const router = Router();
import saveMessageController from "../controllers/saveMessageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.post("/save-message", authMiddleware, saveMessageController);

export default router;
