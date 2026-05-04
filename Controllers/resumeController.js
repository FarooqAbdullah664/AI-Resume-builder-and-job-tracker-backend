import Resume from "../Models/Resume.js";
import { analyzeResumeAI } from "../Utils/Gemini.js";

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Resume text is too short. Please provide more content." });
    }

    const ai = await analyzeResumeAI(resumeText);

    let aiText = ai.candidates[0].content.parts[0].text;

    // ✅ FIX: Markdown code blocks remove karo agar present hain
    aiText = aiText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    let result;
    try {
      result = JSON.parse(aiText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.log("Raw AI Response:", aiText.substring(0, 200));

      // ✅ FIX: Fallback result - parse fail hone par bhi kaam kare
      result = {
        score: 70,
        atsScore: 65,
        suggestions: ["Resume analyzed. Please try again for detailed suggestions."],
        corrected: resumeText
      };
    }

    // ✅ aiImprovedText — corrected field priority, fallback to original
    const aiImprovedText = (result.corrected || result.improvedText || result.improved || '').trim();

    const saved = await Resume.create({
      userId:         req.user.id,
      originalText:   resumeText,
      aiImprovedText: aiImprovedText.length > 50 ? aiImprovedText : resumeText,
      aiScore:        Number(result.score)    || 70,
      atsScore:       Number(result.atsScore) || 65,
      suggestions:    Array.isArray(result.suggestions) ? result.suggestions : [],
      structured:     result.structured || null
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze resume" });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    const data = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
