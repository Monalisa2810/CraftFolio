import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Resume from "./models/Resume.js";
import User from "./models/User.js";
import authMiddleware from "./authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to call Gemini with System Instructions (with retry for rate limits)
async function askGemini(systemPrompt, userPrompt, retries = 3) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(userPrompt);
      return result.response.text();
    } catch (err) {
      const status = err?.status || err?.response?.status;
      console.error(`Gemini API Error (attempt ${attempt}/${retries}):`, err.message || err);

      // Retry on rate limit (429) or server errors (5xx)
      if ((status === 429 || (status >= 500 && status < 600)) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

// ── Auth: Generate JWT ────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ── Auth: Register ────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── Auth: Login ───────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── Auth: Get current user ────────────────────────────────────────────────
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// ── Save to MongoDB (protected) ──────────────────────────────────────────
app.post("/api/save-resume", authMiddleware, async (req, res) => {
  try {
    const { profileData } = req.body;
    const newResume = new Resume({ ...profileData, userId: req.userId });
    await newResume.save();
    res.json({ success: true, message: "Saved to cloud successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save to database" });
  }
});

// ── Local fallback generators (used when Gemini quota is exhausted) ────────
function generateLocalSummary(profileData) {
  const { personalInfo, skills, education, experience } = profileData;
  const name = personalInfo?.name || "A driven professional";
  const degree = education?.[0]?.degree || "Computer Science";
  const college = education?.[0]?.college || "a reputed university";
  const topSkills = (skills || []).slice(0, 4).join(", ") || "modern technologies";
  const expEntries = (experience || []).filter(e => e.company);
  const expLine = expEntries.length > 0
    ? `With hands-on experience as ${expEntries[0].role} at ${expEntries[0].company}, I bring real-world expertise to every project.`
    : `With a strong academic foundation, I am eager to apply my skills in real-world projects and contribute meaningfully from day one.`;

  return `I am ${name}, a results-driven ${degree} graduate from ${college} with a passion for building impactful solutions. Proficient in ${topSkills}, I combine technical depth with a problem-solving mindset to deliver high-quality work. ${expLine}`;
}

function generateLocalObjective(profileData) {
  const degree = profileData.education?.[0]?.degree || "Computer Science";
  const year = profileData.education?.[0]?.year || "2025";
  const topSkills = (profileData.skills || []).slice(0, 3).join(", ") || "software development";

  return `Aspiring ${degree} graduate (${year}) seeking a challenging role where I can leverage my expertise in ${topSkills} to drive innovation and deliver measurable impact. Eager to contribute to a forward-thinking team while continuously expanding my technical and professional capabilities.`;
}

function generateLocalPortfolio(resumeData, theme) {
  const pi = resumeData.personalInfo || {};
  const name = pi.name || "Your Name";
  const email = pi.email || "";
  const phone = pi.phone || "";
  const github = pi.github || "";
  const linkedin = pi.linkedin || "";
  const location = pi.location || "";
  const summary = resumeData.summary || resumeData.objective || "";
  const skills = resumeData.skills || [];
  const projects = (resumeData.projects || []).filter(p => p.title);
  const experience = (resumeData.experience || []).filter(e => e.company);
  const education = (resumeData.education || []).filter(e => e.college);

  const themes = {
    developer: { bg: "#0a0f1e", text: "#c8d8e8", accent: "#00d4ff", surface: "#111827", heading: "#e0e8f0" },
    corporate: { bg: "#ffffff", text: "#334155", accent: "#0f2d5c", surface: "#f8fafc", heading: "#0f2d5c" },
    creative: { bg: "#faf7f2", text: "#3a2a1a", accent: "#e85d3a", surface: "#fff5ee", heading: "#1a0a00" },
  };
  const t = themes[theme] || themes.developer;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} — Portfolio</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:${t.bg};color:${t.text};scroll-behavior:smooth}
.container{max-width:900px;margin:0 auto;padding:0 24px}
.hero{padding:80px 0 60px;text-align:center}
.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:${t.heading};margin-bottom:12px}
.hero .subtitle{font-size:1.1rem;opacity:0.7;max-width:600px;margin:0 auto 24px;line-height:1.7}
.hero .links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;font-size:0.9rem}
.hero .links a{color:${t.accent};text-decoration:none;transition:opacity 0.2s}
.hero .links a:hover{opacity:0.7}
section{padding:48px 0;border-top:1px solid ${t.accent}22}
section h2{font-size:1.5rem;font-weight:800;color:${t.accent};margin-bottom:24px;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85rem}
.skills-grid{display:flex;flex-wrap:wrap;gap:8px}
.skill-tag{padding:6px 16px;border-radius:999px;font-size:0.85rem;font-weight:600;background:${t.accent}18;color:${t.accent};border:1px solid ${t.accent}33}
.card{background:${t.surface};border:1px solid ${t.accent}15;border-radius:12px;padding:20px;margin-bottom:14px;transition:transform 0.2s}
.card:hover{transform:translateY(-2px)}
.card h3{font-size:1rem;font-weight:700;color:${t.heading};margin-bottom:4px}
.card .meta{font-size:0.8rem;opacity:0.6;margin-bottom:8px}
.card p{font-size:0.9rem;line-height:1.65;opacity:0.8}
.contact-links{display:flex;flex-wrap:wrap;gap:20px;font-size:0.95rem}
.contact-links a{color:${t.accent};text-decoration:none}
footer{text-align:center;padding:32px 0;font-size:0.8rem;opacity:0.4}
@media(max-width:600px){.hero{padding:48px 0 32px}section{padding:32px 0}}
</style>
</head>
<body>
<div class="container">
<div class="hero">
<h1>${name}</h1>
${summary ? `<p class="subtitle">${summary}</p>` : ""}
<div class="links">
${email ? `<a href="mailto:${email}">${email}</a>` : ""}
${phone ? `<span>${phone}</span>` : ""}
${location ? `<span>📍 ${location}</span>` : ""}
${github ? `<a href="${github}" target="_blank">GitHub</a>` : ""}
${linkedin ? `<a href="${linkedin}" target="_blank">LinkedIn</a>` : ""}
</div>
</div>
${skills.length ? `<section><h2>Skills</h2><div class="skills-grid">${skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div></section>` : ""}
${projects.length ? `<section><h2>Projects</h2>${projects.map(p => `<div class="card"><h3>${p.title}</h3>${p.tech ? `<div class="meta">${p.tech}</div>` : ""}${p.description ? `<p>${p.description}</p>` : ""}${p.github ? `<div class="meta"><a href="${p.github}" style="color:${t.accent}">View on GitHub →</a></div>` : ""}</div>`).join("")}</section>` : ""}
${experience.length ? `<section><h2>Experience</h2>${experience.map(e => `<div class="card"><h3>${e.role}</h3><div class="meta">${e.company}${e.from ? ` · ${e.from}` : ""}${e.to ? ` – ${e.to}` : ""}</div>${e.description ? `<p>${e.description}</p>` : ""}</div>`).join("")}</section>` : ""}
${education.length ? `<section><h2>Education</h2>${education.map(e => `<div class="card"><h3>${e.college}</h3><div class="meta">${e.degree || ""}${e.cgpa ? ` · CGPA: ${e.cgpa}` : ""}${e.year ? ` · ${e.year}` : ""}</div></div>`).join("")}</section>` : ""}
<section><h2>Contact</h2><div class="contact-links">
${email ? `<a href="mailto:${email}">✉ ${email}</a>` : ""}
${phone ? `<span>📞 ${phone}</span>` : ""}
${github ? `<a href="${github}" target="_blank">GitHub</a>` : ""}
${linkedin ? `<a href="${linkedin}" target="_blank">LinkedIn</a>` : ""}
</div></section>
<footer>Built with CraftFolio</footer>
</div>
</body>
</html>`;
}

// ── Generate professional summary ─────────────────────────────────────────
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { profileData } = req.body;
    const { personalInfo, skills, projects, education, experience } = profileData;

    const prompt = `Generate a compelling 3-sentence professional resume summary for:
Name: ${personalInfo?.name || "the candidate"}
Degree: ${education?.[0]?.degree || "CS"} at ${education?.[0]?.college || "university"}
Skills: ${(skills || []).join(", ") || "software"}
Experience: ${(experience || []).filter(e => e.company).map(e => `${e.role} at ${e.company}`).join("; ")}

Write in first person. Start with a strong descriptor. Be specific. No fluff. Return ONLY the raw summary text.`;

    const text = await askGemini("You are a senior technical recruiter and resume expert. Write crisp summaries.", prompt);
    res.json({ text: text.trim() });
  } catch (err) {
    console.error("Summary Error (using local fallback):", err.status || err.message?.substring(0, 80));
    // Fallback: generate locally using profile data
    const text = generateLocalSummary(req.body.profileData || {});
    res.json({ text, fallback: true });
  }
});

// ── Generate career objective ─────────────────────────────────────────────
app.post("/api/generate-objective", async (req, res) => {
  try {
    const { profileData } = req.body;
    const prompt = `Write a 2-sentence career objective for a ${profileData.education?.[0]?.degree || "CS"} student graduating in ${profileData.education?.[0]?.year || "2025"} with skills in ${(profileData.skills || []).slice(0, 5).join(", ")}. Action-oriented, focuses on value. Return ONLY the text.`;

    const text = await askGemini("You are a career counselor. Write targeted objectives.", prompt);
    res.json({ text: text.trim() });
  } catch (err) {
    console.error("Objective Error (using local fallback):", err.status || err.message?.substring(0, 80));
    const text = generateLocalObjective(req.body.profileData || {});
    res.json({ text, fallback: true });
  }
});

// ── Suggest skills ────────────────────────────────────────────────────────
app.post("/api/suggest-skills", async (req, res) => {
  try {
    const { skills } = req.body;
    const prompt = `Given these existing skills: ${(skills || []).join(", ") || "React, Node.js"}, suggest 8 complementary skills. Return ONLY a JSON array of strings, no markdown. Example: ["Docker","Redis"]`;

    const raw = await askGemini("Return only valid JSON arrays of skill names. No markdown.", prompt);
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json({ suggestions: JSON.parse(clean) });
  } catch (err) {
    // Smart fallback based on existing skills
    const existing = (req.body.skills || []).map(s => s.toLowerCase());
    const allSuggestions = [
      "Docker", "Kubernetes", "Redis", "TypeScript", "AWS", "GraphQL",
      "Jest", "CI/CD", "Linux", "PostgreSQL", "MongoDB", "Firebase",
      "Next.js", "Tailwind CSS", "Python", "Go", "Rust", "Git",
      "REST APIs", "WebSockets", "Figma", "Nginx", "Terraform", "Jenkins",
    ];
    const filtered = allSuggestions.filter(s => !existing.includes(s.toLowerCase()));
    res.json({ suggestions: filtered.slice(0, 8), fallback: true });
  }
});

// ── ATS score analysis ────────────────────────────────────────────────────
app.post("/api/ats-score", async (req, res) => {
  try {
    const { profileData } = req.body;
    const prompt = `Analyze this resume and return an ATS score JSON object.
Data: ${JSON.stringify(profileData)}
Return ONLY this JSON format (no markdown):
{"score": 78, "grade": "B+", "breakdown": {"keywords": 80, "formatting": 75, "completeness": 82, "impact": 74}, "suggestions": ["Add measurable achievements", "Add strong action verbs"]}`;

    const raw = await askGemini("You are an ATS (Applicant Tracking System) expert. Return only valid JSON.", prompt);
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    // Smart local ATS scoring based on actual data completeness
    const d = req.body.profileData || {};
    let score = 40;
    const suggestions = [];

    if (d.personalInfo?.name) score += 5; else suggestions.push("Add your full name");
    if (d.personalInfo?.email) score += 5; else suggestions.push("Add a professional email address");
    if (d.personalInfo?.phone) score += 3; else suggestions.push("Include a phone number");
    if (d.personalInfo?.linkedin) score += 4; else suggestions.push("Add your LinkedIn profile URL");
    if (d.personalInfo?.github) score += 3; else suggestions.push("Include your GitHub profile");
    if (d.summary || d.objective) score += 8; else suggestions.push("Add a professional summary — it boosts ATS matching by 20%");
    if ((d.skills || []).length >= 5) score += 8; else suggestions.push("Add at least 5 relevant skills with industry keywords");
    if ((d.skills || []).length >= 10) score += 4;
    if ((d.experience || []).some(e => e.company)) score += 8; else suggestions.push("Add work experience with action verbs and metrics");
    if ((d.projects || []).some(p => p.title)) score += 6; else suggestions.push("Include 2-3 projects with descriptions and tech stack");
    if ((d.education || []).some(e => e.college)) score += 6; else suggestions.push("Add your education details");

    score = Math.min(score, 100);
    const grade = score >= 90 ? "A+" : score >= 85 ? "A" : score >= 80 ? "A-" : score >= 75 ? "B+" : score >= 70 ? "B" : score >= 65 ? "B-" : score >= 60 ? "C+" : "C";

    if (suggestions.length === 0) suggestions.push("Great job! Consider adding measurable achievements with percentages.");

    res.json({
      score, grade,
      breakdown: {
        keywords: Math.min(((d.skills || []).length * 8) + 20, 100),
        formatting: 80,
        completeness: score,
        impact: Math.min(score - 5, 95),
      },
      suggestions: suggestions.slice(0, 5),
      fallback: true,
    });
  }
});

// ── Generate portfolio HTML ───────────────────────────────────────────────
app.post("/api/generate-portfolio", async (req, res) => {
  try {
    const { resumeData, theme } = req.body;
    const prompt = `Create a complete, deployable single-page HTML portfolio website. Return ONLY raw HTML, no markdown fences.
Data: ${JSON.stringify(resumeData)}
Theme: ${theme}
Requirements: Fully self-contained HTML (all CSS embedded). Google Fonts via @import. Sections: Hero, About, Skills, Projects, Experience, Education, Contact. Smooth scroll. Fully mobile responsive. NO external JS CDN.`;

    const html = await askGemini("You are a world-class frontend developer. Generate beautiful, complete HTML portfolio sites.", prompt);
    const clean = html.replace(/```html|```/g, "").trim();
    res.json({ html: clean });
  } catch (err) {
    console.error("Portfolio Error (using local fallback):", err.status || err.message?.substring(0, 80));
    const html = generateLocalPortfolio(req.body.resumeData || {}, req.body.theme || "developer");
    res.json({ html, fallback: true });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CraftFolio API running on http://localhost:${PORT}`));