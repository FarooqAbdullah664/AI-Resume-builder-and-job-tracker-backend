import axios from "axios";

export const analyzeResumeAI = async (resumeText) => {
  try {
    const prompt = `Analyze this resume and return ONLY valid JSON with exactly this structure (no extra text, no markdown, no code blocks):
{
  "score": 85,
  "atsScore": 78,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "corrected": "full improved resume as plain text",
  "structured": {
    "name": "Full Name",
    "title": "Professional Title",
    "contact": {
      "email": "email@example.com",
      "phone": "+1234567890",
      "location": "City, Country",
      "linkedin": "linkedin.com/in/username",
      "github": "github.com/username"
    },
    "summary": "2-3 sentence professional summary here",
    "experience": [
      {
        "role": "Job Title",
        "company": "Company Name",
        "duration": "Jan 2021 - Present",
        "points": ["achievement or responsibility 1", "achievement or responsibility 2"]
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "University Name",
        "year": "2020"
      }
    ],
    "skills": ["Skill1", "Skill2", "Skill3"],
    "certifications": ["Certification 1", "Certification 2"]
  }
}

Rules:
- Extract real data from the resume, do not invent information
- If a field is missing in the resume, use empty string "" or empty array []
- skills must be a flat array of strings
- certifications can be empty array if none found
- Make the summary professional and impactful
- Improve bullet points to be achievement-focused with metrics where possible

Resume to analyze:
${resumeText}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000
      }
    );

    return response.data;

  } catch (error) {
    console.log("⚠️ Gemini API unavailable, using smart mock analysis");
    console.log("Error:", error.response?.data?.error?.message || error.message);

    // Smart mock fallback
    const words       = resumeText.split(/\s+/).length;
    const hasEmail    = /\S+@\S+\.\S+/.test(resumeText);
    const hasPhone    = /[\d\s\-\+]{10,}/.test(resumeText);
    const hasExp      = /experience|work|job|position|employed/i.test(resumeText);
    const hasSkills   = /skills|technologies|tools|proficient|expertise/i.test(resumeText);
    const hasEdu      = /education|degree|university|college|bachelor|master/i.test(resumeText);
    const hasSummary  = /summary|objective|profile|about/i.test(resumeText);
    const hasAchieve  = /achieved|increased|reduced|improved|managed|led|developed/i.test(resumeText);

    let score = 40;
    if (words > 100)   score += 10;
    if (words > 250)   score += 10;
    if (hasEmail)      score += 5;
    if (hasPhone)      score += 5;
    if (hasExp)        score += 10;
    if (hasSkills)     score += 5;
    if (hasEdu)        score += 5;
    if (hasSummary)    score += 5;
    if (hasAchieve)    score += 5;

    const suggestions = [];
    if (!hasEmail)   suggestions.push("Add your professional email address");
    if (!hasPhone)   suggestions.push("Include your phone number with country code");
    if (!hasSummary) suggestions.push("Add a professional summary at the top");
    if (!hasExp)     suggestions.push("Add detailed work experience with job titles and dates");
    if (!hasSkills)  suggestions.push("List your technical skills and competencies");
    if (!hasEdu)     suggestions.push("Include your educational background");
    if (!hasAchieve) suggestions.push("Use action verbs and quantify achievements");
    if (words < 150) suggestions.push("Expand your resume — aim for 300-500 words");
    suggestions.push("Tailor keywords to match job descriptions for better ATS score");
    suggestions.push("Use consistent formatting and bullet points throughout");

    // Try to extract name from first line
    const firstLine = resumeText.split('\n')[0].trim();

    return {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              score:       Math.min(score, 95),
              atsScore:    Math.min(score - 7, 88),
              suggestions: suggestions.slice(0, 6),
              corrected:   resumeText.replace(/\n{3,}/g, '\n\n').trim(),
              structured: {
                name:    firstLine.length < 50 ? firstLine : "Your Name",
                title:   "Professional",
                contact: {
                  email:    (resumeText.match(/[\w.-]+@[\w.-]+\.\w+/) || [''])[0],
                  phone:    "",
                  location: "",
                  linkedin: "",
                  github:   ""
                },
                summary:        "Experienced professional with a strong background in the field. Dedicated to delivering high-quality results and continuous improvement.",
                experience:     [],
                education:      [],
                skills:         [],
                certifications: []
              }
            })
          }]
        }
      }]
    };
  }
};
