import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Supported models for Chat
export type ChatModelChoice = "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-3.1-pro-preview";
export type ChatRoleChoice = "general" | "examiner" | "stem" | "speed_drill" | "humanities";

const ROLE_SYSTEM_INSTRUCTIONS: Record<ChatRoleChoice, string> = {
  general: `You are "Brights AI", a warm, highly encouraging CBSE Class 10 academic mentor. Your goal is to guide students across Mathematics, Science, Social Science, and English Literature.
Explain concepts clearly with step-by-step breakdowns, key formulas, bullet points, and high-yield board exam tips. Keep answers concise, visually well-structured, and positive.`,

  examiner: `You are a Senior CBSE Board Exam Evaluator and Paper Checker. You look at every question through the lens of the official CBSE Marking Scheme.
Always specify:
1. Exact keyword marks (the specific words that award 0.5 or 1 mark in board answer sheets).
2. Recommended answer structure (Heading, Point-wise explanation, Diagram/Formula reference).
3. Common student pitfalls and negative marking traps to avoid.
4. Estimated marks distribution for this question (1, 2, 3, or 5 marks).`,

  stem: `You are an elite STEM Specialist for CBSE Class 10 Mathematics and Science (Physics & Chemistry).
Focus on:
- Rigorous step-by-step mathematical proofs and derivations.
- Physics numerical problems with clear Givens, Formulas, Step-by-step substitution, and Final units.
- Balanced chemical equations with states (s, l, g, aq) and reaction conditions.
- Deep, intuitive conceptual clarity rather than rote memorization.`,

  speed_drill: `You are a Rapid Revision Drill Master. Your purpose is fast, active recall testing for board preparation.
Keep responses short, punchy, and fast. Immediately answer the student's question, then challenge them with 1 high-yield follow-up board question to test if they truly understood. Keep the energy snappy and motivational!`,

  humanities: `You are an expert CBSE Social Science & English Literature mentor.
Focus on:
- History: Chronological timelines, causes, and consequences of major events.
- Geography & Economics: Concept maps, key sectors, definitions, and real-world Indian examples.
- Civics: Constitutional articles, power-sharing mechanisms, and institutional roles.
- English: Literary devices (metaphor, simile, irony), theme analysis, and structured 5-mark subjective answers.`
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize GoogleGenAI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // =========================================================================
  // API 1: Multi-turn Chat with Role-based System Instructions & Model Choice
  // =========================================================================
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { 
        message, 
        history, 
        model = "gemini-3.5-flash", 
        role = "general",
        subject,
        chapter 
      } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "A valid text message is required." });
        return;
      }

      // Validate model
      const validModels: ChatModelChoice[] = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.1-pro-preview"
      ];
      const selectedModel = validModels.includes(model) ? model : "gemini-3.5-flash";

      // Build context-aware system instruction
      const baseInstruction = ROLE_SYSTEM_INSTRUCTIONS[role as ChatRoleChoice] || ROLE_SYSTEM_INSTRUCTIONS.general;
      const contextPrefix = subject && chapter
        ? `[Current Context: CBSE Class 10 | Subject: ${subject} | Current Chapter: ${chapter}]\n\n`
        : `[Context: CBSE Class 10 Board Curriculum]\n\n`;
      const systemInstruction = contextPrefix + baseInstruction;

      // Validate and clean history for multi-turn chat
      const formattedHistory = Array.isArray(history)
        ? history
            .filter((h: any) => h && (h.role === "user" || h.role === "model") && h.parts && Array.isArray(h.parts))
            .map((h: any) => ({
              role: h.role,
              parts: h.parts.map((p: any) => ({ text: String(p.text || "") }))
            }))
        : [];

      const chat = ai.chats.create({
        model: selectedModel,
        config: {
          systemInstruction,
          temperature: selectedModel === "gemini-3.1-pro-preview" ? 0.3 : 0.7,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message });
      res.json({ 
        text: response.text || "No response generated.",
        modelUsed: selectedModel,
        roleUsed: role
      });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to communicate with Gemini chatbot.",
        details: error.toString()
      });
    }
  });

  // =========================================================================
  // API 2: Dynamic Quiz Question Generator
  // =========================================================================
  app.post("/api/gemini/quiz", async (req, res) => {
    try {
      const { subject, topic, count = 3 } = req.body;
      if (!subject || !topic) {
        res.status(400).json({ error: "Subject and topic are required" });
        return;
      }

      const prompt = `Generate exactly ${count} multiple choice questions (MCQs) for CBSE Class 10, Subject: ${subject}, Chapter/Topic: ${topic}.
The questions must align perfectly with the latest CBSE syllabus and Board exam patterns. Ensure varying difficulty (easy, medium, hard). Provide 4 options for each question, specify the correct answer option index (0 to 3), and write a concise, clear educational explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert CBSE Board Exam Paper setter. Generate accurate, engaging, high-yield multiple-choice questions in the specified JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 options"
                    },
                    correctIndex: {
                      type: Type.INTEGER,
                      description: "0-based index of the correct answer (0, 1, 2, or 3)"
                    },
                    explanation: { type: Type.STRING, description: "Educational explanation of the correct answer." }
                  },
                  required: ["questionText", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Quiz Generator API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz from Gemini" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
