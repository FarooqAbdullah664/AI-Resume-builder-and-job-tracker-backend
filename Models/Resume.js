import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId:        mongoose.Schema.Types.ObjectId,
  originalText:  String,
  aiImprovedText: String,
  aiScore:       Number,
  atsScore:      Number,
  suggestions:   Array,
  structured:    mongoose.Schema.Types.Mixed,   // Gemini structured CV data
  createdAt:     { type: Date, default: Date.now },
});

export default mongoose.model("Resume", resumeSchema);
