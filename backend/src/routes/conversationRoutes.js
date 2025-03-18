import { Router } from "express";
const router = Router();
import createConversation from "../controllers/createConversationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.post("/create-conversation", authMiddleware, createConversation);

export default router;
