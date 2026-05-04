import express from "express";
import { analyzeResume, getResumeHistory } from "../Controllers/resumeController.js";
import { auth } from "../Middleware/authMiddle.js";

const router = express.Router();

router.post("/analyze", auth, analyzeResume);
router.get("/", auth, getResumeHistory);

export default router;
