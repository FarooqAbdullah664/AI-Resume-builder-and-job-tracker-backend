import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  company: String,
  position: String,
  jobDescription: String,
  status: {
    type: String,
    enum: ["Applied", "Interviewing", "Rejected", "Offered"],
    default: "Applied"
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Job", jobSchema);
