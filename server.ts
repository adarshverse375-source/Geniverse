import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const COMMON_FORMATTING_RULES = `
CRITICAL FORMATTING RULES FOR CLEAN, PROFESSIONAL PRESENTATION:
1. HEADINGS: DO NOT use markdown hashes like "###" or "##" or "#". Instead, use unique decorative heading symbols:
   - "✦ Step 1: [Title]" or "◈ Step 2: [Title]"
   - "★ Given & To Prove:"
   - "▶ Proof / Derivation:"
   - "💡 High-Yield Board Exam Tip:"
2. MATHEMATICAL FRACTIONS & FORMULAS:
   - For real-looking fractions with numerator and denominator, write: \\frac{numerator}{denominator} (e.g. \\frac{Area(ADE)}{Area(BDE)} = \\frac{AD}{DB} or \\frac{1}{2} × base × height). The system will render these with authentic mathematical vertical fraction bars!
   - Write standard math symbols: ×, ÷, ±, √, π, θ, cm², m/s², x².
   - NEVER wrap plain numbers, scores, marks, or units in dollar signs (NEVER write $2.5$, $3$, $10$, $cm$). Write "2.5 marks", "3 marks", "cm²".
   - DO NOT wrap entire sentences in dollar signs ($ or $$).
3. FIGURES, DIAGRAMS & ILLUSTRATIONS:
   - NEVER, UNDER ANY CIRCUMSTANCES, GENERATE ASCII ART, CODE-BLOCK DRAWINGS, OR TEXT-BASED SCHEMATICS (NEVER do triple-backtick text [ OPEN STOMATA ] or text approximations of cells, organs, or shapes).
   - If the student asks to draw, illustrate, visualize, or show a diagram/image of ANY concept:
     * For Stomata, Guard Cells, or Stomatal Apparatus: include [DIAGRAM:STOMATA] directly in your response!
     * For Basic Proportionality Theorem / Thales Theorem: include [DIAGRAM:BPT_TRIANGLE]
     * For Pythagoras Theorem: include [DIAGRAM:PYTHAGORAS]
     * For Circle Tangents (Theorem 10.2): include [DIAGRAM:CIRCLE_TANGENTS]
     * For Trigonometric Heights & Distances: include [DIAGRAM:TRIGONOMETRY_TRIANGLE]
     * For any other science/math/social science diagram, anatomy, chemical reaction setup, or concept the student asks to visualize, generate, or draw: include [GENERATE_IMAGE: <clear descriptive prompt of the educational diagram>] on its own line! The application will automatically invoke the AI image generation engine and embed the rendered visual diagram directly into the chat response!
4. Structure your response with clean bullet points (- or •) and bold key terms (**keyword**) for an authoritative, CBSE-marking-scheme-compliant presentation.
`;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint for Cloud Run container liveness probe
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

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

  // Shared helper for generating educational visual diagrams & illustrations
  async function generateEducationalImage(prompt: string, subject?: string, chapter?: string, aspectRatio = "1:1"): Promise<{ imageUrl?: string; svgContent?: string; type: "raster" | "svg" } | null> {
    let imageGenerated = false;
    let imageUrl: string | null = null;

    // Attempt 1: Raster generation via gemini-3.1-flash-image with swift timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Raster timeout")), 4000)
      );
      const imageRes = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: `High quality educational illustration for CBSE Class 10 syllabus: ${prompt}. Clean, textbook accurate.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || "1:1"
            }
          }
        }),
        timeoutPromise
      ]);

      if (imageRes.candidates?.[0]?.content?.parts) {
        for (const part of imageRes.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            imageGenerated = true;
            break;
          }
        }
      }
    } catch (err: any) {
      // Fallback seamlessly to high-fidelity vector diagram
    }

    if (imageGenerated && imageUrl) {
      return { imageUrl, type: "raster" };
    }

    // Attempt 2: High-fidelity educational vector SVG diagram
    try {
      const svgPrompt = `You are an expert CBSE Class 10 educational illustrator.
Create a complete, visually clean, self-contained SVG diagram for: "${prompt}" (Subject: ${subject || 'CBSE Class 10'}, Chapter: ${chapter || 'Board Exam Prep'}).

Strict Requirements:
- Output valid, standalone SVG code inside an <svg viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">...</svg> tag.
- Include clear, readable labels (<text> tags), neat gradients (<defs>), color-coded anatomy/parts, and high pedagogical accuracy matching NCERT textbooks.
- Do NOT wrap in markdown code blocks (\`\`\`xml or \`\`\`svg). Output ONLY the raw <svg>...</svg> starting with <svg and ending with </svg>.`;

      const svgRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: svgPrompt,
        config: {
          temperature: 0.2
        }
      });

      let rawSvg = svgRes.text || "";
      const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        rawSvg = svgMatch[0];
      }

      if (rawSvg.includes("<svg") && rawSvg.includes("</svg>")) {
        return { svgContent: rawSvg, type: "svg" };
      }
    } catch (svgErr: any) {
      console.error("Vector diagram generation error:", svgErr?.message || svgErr);
    }

    return null;
  }

  // =========================================================================
  // API 1: Multi-turn Chat with Role-based System Instructions & Direct Image Generation
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

      // Check if user is asking directly to draw, sketch, visualize, generate an image or diagram
      const lowerMsg = message.toLowerCase();
      const isExplicitImageRequest = 
        /\b(generate|draw|illustrate|create|make|show|render)\s+(an?\s+)?(image|diagram|figure|illustration|picture|sketch|photo)\b/i.test(message) ||
        /\b(image|diagram|figure|illustration|sketch)\s+of\b/i.test(message) ||
        lowerMsg.startsWith("draw ") ||
        lowerMsg.startsWith("sketch ") ||
        lowerMsg.startsWith("diagram of") ||
        lowerMsg.includes("generate image of stomata") ||
        lowerMsg.includes("draw stomata") ||
        lowerMsg.includes("diagram of stomata");

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
      const systemInstruction = contextPrefix + baseInstruction + "\n\n" + COMMON_FORMATTING_RULES;

      // Validate and clean history for multi-turn chat
      const formattedHistory = Array.isArray(history)
        ? history
            .filter((h: any) => h && (h.role === "user" || h.role === "model") && h.parts && Array.isArray(h.parts))
            .map((h: any) => ({
              role: h.role,
              parts: h.parts.map((p: any) => ({ text: String(p.text || "") }))
            }))
        : [];

      let responseText = "No response generated.";
      let actualModelUsed = selectedModel;

      try {
        const chat = ai.chats.create({
          model: selectedModel,
          config: {
            systemInstruction,
            temperature: selectedModel === "gemini-3.1-pro-preview" ? 0.3 : 0.7,
          },
          history: formattedHistory,
        });

        const response = await chat.sendMessage({ message });
        responseText = response.text || "No response generated.";
      } catch (chatErr: any) {
        console.warn(`Model ${selectedModel} failed (${chatErr?.message}), trying fallback to gemini-3.5-flash or gemini-3.1-flash-lite`);
        const fallbackModel = selectedModel === "gemini-3.5-flash" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
        const fallbackChat = ai.chats.create({
          model: fallbackModel,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
          history: formattedHistory,
        });
        const fallbackRes = await fallbackChat.sendMessage({ message });
        responseText = fallbackRes.text || "No response generated.";
        actualModelUsed = fallbackModel;
      }
      let generatedImage: { imageUrl?: string; svgContent?: string; prompt?: string; type?: string } | null = null;

      // Check if response has [GENERATE_IMAGE: <prompt>] tag or if the user explicitly requested an image
      const imageTagMatch = responseText.match(/\[GENERATE_IMAGE:\s*([^\]]+)\]/i);
      if (imageTagMatch) {
        const imagePrompt = imageTagMatch[1].trim();
        // Remove tag from final text presentation
        responseText = responseText.replace(imageTagMatch[0], "").trim();
        const imgResult = await generateEducationalImage(imagePrompt, subject, chapter);
        if (imgResult) {
          generatedImage = {
            ...imgResult,
            prompt: imagePrompt
          };
        }
      } else if (isExplicitImageRequest) {
        // Trigger automatic image generation for the user's requested concept
        const cleanPrompt = message
          .replace(/^(can you|please|kindly|could you)\s+/i, "")
          .replace(/^(generate|draw|show|create|make|illustrate)\s+(me\s+)?(an?\s+)?(image|diagram|figure|illustration|picture|sketch)\s+(of\s+)?/i, "")
          .trim() || message;
        
        const imgResult = await generateEducationalImage(cleanPrompt, subject, chapter);
        if (imgResult) {
          generatedImage = {
            ...imgResult,
            prompt: cleanPrompt
          };
        }
      }

      res.json({ 
        text: responseText,
        modelUsed: actualModelUsed,
        roleUsed: role,
        generatedImage
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
The questions must align perfectly with the latest CBSE syllabus and Board exam patterns. Ensure varying difficulty (easy, medium, hard). Provide 4 options for each question, specify the correct answer option index (0 to 3), and write a concise, clear educational explanation.
CRITICAL FORMATTING: Do NOT use LaTeX dollar signs ($) around equations, numbers, or units. Use clean Unicode characters (e.g. x², cm², ×, ÷, √).`;

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

  // =========================================================================
  // API 3: AI Image Generation
  // =========================================================================
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1", subject, chapter } = req.body;
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "A prompt is required for image generation." });
        return;
      }

      const result = await generateEducationalImage(prompt, subject, chapter, aspectRatio);
      if (result) {
        res.json({
          success: true,
          prompt,
          ...result
        });
        return;
      }

      res.status(500).json({ error: "Could not generate diagram for this topic. Please try with a more specific description." });
    } catch (error: any) {
      console.error("Image generation API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image." });
    }
  });

  // Vite dev server or static production files
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false,
          ws: false
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Could not start Vite dev middleware, serving static dist:", e);
      const distPath = path.resolve(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
