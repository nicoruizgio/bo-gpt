import { Router } from "express";
const router = Router();
import saveQuestionnaireResponse from "../controllers/questionnaireController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.post("/questionnaire", authMiddleware, saveQuestionnaireResponse);

export default router;
