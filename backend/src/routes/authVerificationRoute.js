import { Router } from "express";
import checkAuth from "../controllers/authVerificationController.js";

const router = Router();

router.get("/check-auth", checkAuth);

export default router;
