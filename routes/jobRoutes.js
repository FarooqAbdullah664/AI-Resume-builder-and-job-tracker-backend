import express from "express";
import { addJob, getJobs, updateJob, deleteJob } from "../Controllers/jobController.js";
import { auth } from "../Middleware/authMiddle.js";

const router = express.Router();

router.post("/", auth, addJob);
router.get("/", auth, getJobs);
router.put("/:id", auth, updateJob);
router.delete("/:id", auth, deleteJob);

export default router;
