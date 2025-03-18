import { Router } from "express";
import getCompletion from "../controllers/completionController.js";
import saveRatingSummary from "../controllers/saveRatingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/completion", authMiddleware, getCompletion);
router.post("/rating-summary", authMiddleware, saveRatingSummary);
router.get("/get-ratings", authMiddleware);

export default router;
