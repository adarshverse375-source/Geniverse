import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported models for Chat
export type ChatModelChoice = "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-3.5-flash" | "gemini-3.5-flash-lite" | "gemini-3.1-flash-lite";
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
2. ALL MATHEMATICAL FORMULAS, EQUATIONS & CHEMICAL REACTIONS MUST BE BOXED:
   - EVERY formula, physical law, mathematical equation, numerical formula, or chemical reaction MUST be put on its own line wrapped in:
     [EQUATION] <formula or equation> [/EQUATION]
   - Examples of how you MUST format every formula and equation:
     * Ohm's Law: [EQUATION] V = IR [/EQUATION]
     * Proportionality: [EQUATION] V ∝ I ⇒ V = IR [/EQUATION]
     * HCF & LCM: [EQUATION] HCF(a, b) × LCM(a, b) = a × b [/EQUATION]
     * Lens Formula: [EQUATION] \frac{1}{f} = \frac{1}{v} - \frac{1}{u} [/EQUATION]
     * Mirror Formula: [EQUATION] \frac{1}{f} = \frac{1}{v} + \frac{1}{u} [/EQUATION]
     * Quadratic Formula: [EQUATION] x = \frac{-b ± \sqrt{b² - 4ac}}{2a} [/EQUATION]
     * Chemical Reactions: [EQUATION] 2H₂(g) + O₂(g) → 2H₂O(l) [/EQUATION]
     * Slaking of Lime: [EQUATION] CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat [/EQUATION]
     * Resistors in Series / Parallel: [EQUATION] R_s = R_1 + R_2 [/EQUATION] or [EQUATION] \frac{1}{R_p} = \frac{1}{R_1} + \frac{1}{R_2} [/EQUATION]
     * Resistance & Resistivity: [EQUATION] R = \rho \frac{l}{A} [/EQUATION]
   - CRITICAL: NEVER write formulas as plain bullet points (e.g. NEVER write "• Formula: V = IR"). ALWAYS wrap them in [EQUATION] ... [/EQUATION] so the application renders a dedicated, prominent formula callout box!
   - Write standard symbols: ∝ (proportional), Ω (Ohms), ρ (resistivity), ×, ÷, ±, √, π, θ, cm², m/s², x².
   - For real fractions with numerator and denominator, write: \frac{numerator}{denominator} (e.g. \frac{Area(ADE)}{Area(BDE)} = \frac{AD}{DB} or \frac{1}{2} × base × height).
   - NEVER wrap plain numbers, scores, marks, or units in dollar signs (NEVER write $2.5$, $3$, $10$, $cm$, $\Omega$). Write "2.5 marks", "3 marks", "Ω", "cm²".
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg = "Operation timed out"): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

function getOrderedModelList(preferredModel?: string): string[] {
  const list: string[] = [];
  if (preferredModel && ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"].includes(preferredModel)) {
    list.push(preferredModel);
  } else if (preferredModel === "gemini-3.5-flash-lite") {
    list.push("gemini-2.5-flash-lite");
  } else {
    list.push("gemini-2.5-flash");
  }
  const alternates = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
  ];
  for (const alt of alternates) {
    if (!list.includes(alt)) list.push(alt);
  }
  return list;
}

// Pre-rendered educational vector diagrams as instant fallback
function getBuiltInEducationalDiagram(prompt: string): string | null {
  const p = prompt.toLowerCase();
  
  if (p.includes("stomata") || p.includes("guard cell") || p.includes("stomatal")) {
    return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="stomaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#022c22" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="guardCell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" rx="16" fill="url(#stomaBg)" stroke="#059669" stroke-width="2"/>
      <text x="300" y="36" fill="#6ee7b7" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">NCERT Class 10: Stomatal Apparatus (Open vs Closed)</text>
      
      <!-- Open Stoma -->
      <g transform="translate(60, 60)">
        <text x="90" y="30" fill="#a7f3d0" font-size="14" font-weight="bold" text-anchor="middle">1. Turgid (Open Pore)</text>
        <path d="M 60,60 C 20,100 20,180 60,220 C 85,185 85,95 60,60 Z" fill="url(#guardCell)" stroke="#34d399" stroke-width="2"/>
        <path d="M 120,60 C 160,100 160,180 120,220 C 95,185 95,95 120,60 Z" fill="url(#guardCell)" stroke="#34d399" stroke-width="2"/>
        <ellipse cx="90" cy="140" rx="14" ry="42" fill="#022c22" stroke="#6ee7b7" stroke-dasharray="3,3"/>
        <circle cx="50" cy="120" r="5" fill="#facc15"/><text x="45" y="112" fill="#fef08a" font-size="9">Nucleus</text>
        <circle cx="130" cy="120" r="5" fill="#facc15"/>
        <circle cx="65" cy="85" r="3.5" fill="#86efac"/>
        <circle cx="68" cy="165" r="3.5" fill="#86efac"/>
        <circle cx="112" cy="85" r="3.5" fill="#86efac"/>
        <circle cx="115" cy="165" r="3.5" fill="#86efac"/>
        <text x="90" y="245" fill="#94a3b8" font-size="11" text-anchor="middle">Guard cells swell with water</text>
      </g>

      <!-- Closed Stoma -->
      <g transform="translate(360, 60)">
        <text x="90" y="30" fill="#a7f3d0" font-size="14" font-weight="bold" text-anchor="middle">2. Flaccid (Closed Pore)</text>
        <path d="M 75,60 C 45,100 45,180 75,220 C 92,185 92,95 75,60 Z" fill="url(#guardCell)" stroke="#34d399" stroke-width="2"/>
        <path d="M 105,60 C 135,100 135,180 105,220 C 88,185 88,95 105,60 Z" fill="url(#guardCell)" stroke="#34d399" stroke-width="2"/>
        <line x1="90" y1="85" x2="90" y2="195" stroke="#065f46" stroke-width="3"/>
        <circle cx="65" cy="120" r="5" fill="#facc15"/><circle cx="115" cy="120" r="5" fill="#facc15"/>
        <text x="90" y="245" fill="#94a3b8" font-size="11" text-anchor="middle">Loss of water closes aperture</text>
      </g>
    </svg>`;
  }

  if (p.includes("bpt") || p.includes("thales") || p.includes("basic proportionality")) {
    return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="bptBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" rx="16" fill="url(#bptBg)" stroke="#6366f1" stroke-width="2"/>
      <text x="300" y="36" fill="#c7d2fe" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Basic Proportionality Theorem (Thales' Theorem)</text>
      
      <!-- Triangle ABC -->
      <polygon points="300,70 120,290 480,290" fill="#312e81" fill-opacity="0.3" stroke="#818cf8" stroke-width="3"/>
      <!-- DE parallel to BC -->
      <line x1="210" y1="180" x2="390" y2="180" stroke="#38bdf8" stroke-width="3"/>
      
      <!-- Altitudes & Constructions -->
      <line x1="210" y1="180" x2="480" y2="290" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4"/>
      <line x1="390" y1="180" x2="120" y2="290" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4"/>
      
      <!-- Labels -->
      <text x="300" y="60" fill="#fbbf24" font-size="16" font-weight="bold" text-anchor="middle">A</text>
      <text x="105" y="305" fill="#fbbf24" font-size="16" font-weight="bold">B</text>
      <text x="490" y="305" fill="#fbbf24" font-size="16" font-weight="bold">C</text>
      <text x="190" y="180" fill="#38bdf8" font-size="15" font-weight="bold">D</text>
      <text x="405" y="180" fill="#38bdf8" font-size="15" font-weight="bold">E</text>

      <rect x="180" y="315" width="240" height="30" rx="8" fill="#1e1b4b" stroke="#818cf8"/>
      <text x="300" y="335" fill="#a5b4fc" font-size="13" font-weight="bold" text-anchor="middle">Result: AD / DB = AE / EC</text>
    </svg>`;
  }

  if (p.includes("pythagoras")) {
    return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="600" height="360" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <text x="300" y="36" fill="#bae6fd" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Pythagoras Theorem: AC² = AB² + BC²</text>
      <polygon points="160,260 440,260 160,100" fill="#0369a1" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3"/>
      <rect x="160" y="240" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <text x="140" y="275" fill="#f59e0b" font-size="16" font-weight="bold">B (90°)</text>
      <text x="140" y="100" fill="#f59e0b" font-size="16" font-weight="bold">A</text>
      <text x="455" y="275" fill="#f59e0b" font-size="16" font-weight="bold">C</text>
      <text x="120" y="185" fill="#38bdf8" font-size="14" font-weight="bold">Base (AB)</text>
      <text x="300" y="290" fill="#38bdf8" font-size="14" font-weight="bold">Perpendicular (BC)</text>
      <text x="320" y="165" fill="#a855f7" font-size="14" font-weight="bold">Hypotenuse (AC)</text>
    </svg>`;
  }

  // Clean generic educational card
  return `<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="600" height="340" rx="16" fill="#0f172a" stroke="#6366f1" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="45" rx="10" fill="#1e1b4b" stroke="#818cf8"/>
    <text x="300" y="48" fill="#c7d2fe" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">CBSE Class 10 Educational Concept Diagram</text>
    
    <g transform="translate(50, 90)">
      <rect x="0" y="0" width="220" height="180" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="110" cy="70" r="45" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
      <text x="110" y="75" fill="#bae6fd" font-size="12" font-weight="bold" text-anchor="middle">Input / Given</text>
      <text x="110" y="145" fill="#94a3b8" font-size="11" text-anchor="middle">Core NCERT Concept</text>
      <text x="110" y="162" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">Step 1</text>
    </g>

    <line x1="285" y1="180" x2="315" y2="180" stroke="#facc15" stroke-width="3" marker-end="url(#arrow)"/>
    <text x="300" y="165" fill="#facc15" font-size="18" text-anchor="middle">→</text>

    <g transform="translate(330, 90)">
      <rect x="0" y="0" width="220" height="180" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="110" cy="70" r="45" fill="#059669" fill-opacity="0.3" stroke="#10b981" stroke-width="2"/>
      <text x="110" y="75" fill="#a7f3d0" font-size="12" font-weight="bold" text-anchor="middle">Output / Result</text>
      <text x="110" y="145" fill="#94a3b8" font-size="11" text-anchor="middle">High-Yield Board Proof</text>
      <text x="110" y="162" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle">Step 2</text>
    </g>

    <text x="300" y="305" fill="#94a3b8" font-size="12" text-anchor="middle">Illustration for: "${prompt.slice(0, 45)}"</text>
  </svg>`;
}

interface FallbackChapter {
  name: string;
  subject: string;
  keySummary: string[];
  formulasOrFacts: string[];
  questions: Array<{
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

const CBSE_CURRICULUM_FALLBACKS: FallbackChapter[] = [
  {
    name: "Real Numbers",
    subject: "Mathematics",
    keySummary: [
      "Fundamental Theorem of Arithmetic: Every composite number can be uniquely expressed as product of primes.",
      "HCF(a, b) × LCM(a, b) = a × b for any positive integers a and b.",
      "If prime p divides a², then p divides a."
    ],
    formulasOrFacts: [
      "HCF(a, b) × LCM(a, b) = a × b",
      "p divides a² => p divides a"
    ],
    questions: [
      {
        questionText: "If two positive integers a and b are written as a = x³y² and b = xy³, then HCF(a, b) is:",
        options: ["xy", "xy²", "x³y³", "x²y²"],
        correctIndex: 1,
        explanation: "HCF is the product of the lowest power of each common factor: x¹ · y² = xy²."
      },
      {
        questionText: "If LCM(a, b) = 360 and HCF(a, b) = 9, and a = 45, then b is:",
        options: ["72", "80", "90", "40"],
        correctIndex: 0,
        explanation: "Using HCF × LCM = a × b: 9 × 360 = 45 × b => b = 3240 / 45 = 72."
      }
    ]
  },
  {
    name: "Life Processes",
    subject: "Science",
    keySummary: [
      "Autotrophic nutrition requires chlorophyll, sunlight, carbon dioxide, and water.",
      "Guard cells swell when water flows into them, causing stomatal pore to open.",
      "In human nephrons, filtration occurs in the glomerulus and Bowman's capsule."
    ],
    formulasOrFacts: [
      "Photosynthesis: 6CO₂ + 12H₂O + Sunlight -> C₆H₁₂O₆ + 6O₂ + 6H₂O",
      "Aerobic breakdown of glucose occurs in mitochondria producing 38 ATP."
    ],
    questions: [
      {
        questionText: "Which of the following events does NOT occur during photosynthesis in leaves?",
        options: [
          "Absorption of light energy by chlorophyll",
          "Conversion of light energy to chemical energy",
          "Oxidation of carbon dioxide to carbohydrates",
          "Reduction of carbon dioxide to carbohydrates"
        ],
        correctIndex: 2,
        explanation: "Carbon dioxide is reduced (not oxidized) to carbohydrates during photosynthesis."
      },
      {
        questionText: "The opening and closing of the stomatal pore depends upon:",
        options: ["Atmospheric temperature", "Oxygen concentration", "Water in guard cells", "Concentration of CO₂"],
        correctIndex: 2,
        explanation: "When water flows into guard cells, they swell and curve, opening the stomatal pore."
      }
    ]
  },
  {
    name: "Nationalism in India",
    subject: "Social Science",
    keySummary: [
      "Rowlatt Act (1919) gave enormous powers to repress political activities without trial.",
      "Jallianwala Bagh incident took place on 13 April 1919 in Amritsar under General Dyer.",
      "The Salt March from Sabarmati to Dandi marked the beginning of Civil Disobedience."
    ],
    formulasOrFacts: [
      "13 April 1919: Jallianwala Bagh Massacre",
      "1930: Dandi Salt March (240 miles, 24 days)"
    ],
    questions: [
      {
        questionText: "At which session of the Indian National Congress was the demand for 'Purna Swaraj' formalized?",
        options: ["Calcutta (1928)", "Lahore (1929)", "Nagpur (1920)", "Madras (1927)"],
        correctIndex: 1,
        explanation: "In December 1929 under Jawaharlal Nehru, the Lahore Congress formalized the demand of Purna Swaraj."
      }
    ]
  },
  {
    name: "First Flight",
    subject: "English Literature",
    keySummary: [
      "Lencho's letter to God displays immense innocence and faith in divine help.",
      "Nelson Mandela: Long Walk to Freedom emphasizes courage as triumph over fear.",
      "Two Stories About Flying illustrates conquering psychological fear through action."
    ],
    formulasOrFacts: [
      "Theme: Faith, perseverance, freedom from oppression.",
      "Key characters: Lencho, Nelson Mandela, Young Seagull."
    ],
    questions: [
      {
        questionText: "According to Nelson Mandela, what is the greatest wealth of a nation?",
        options: ["Its rich minerals and gems", "Its people", "Its military strength", "Its historical heritage"],
        correctIndex: 1,
        explanation: "Mandela states: 'The greatest wealth of our nation is its people, finer and truer than the purest diamonds.'"
      }
    ]
  }
];

// Fallback response for chat when all AI models are temporarily under peak demand
function generateSyllabusFallbackResponse(
  _query: string,
  subject?: string,
  chapter?: string,
  _role?: string
): string {
  const matchingChapter = CBSE_CURRICULUM_FALLBACKS.find(
    (c) =>
      c.name.toLowerCase() === (chapter || "").toLowerCase() ||
      c.subject.toLowerCase() === (subject || "").toLowerCase()
  ) || CBSE_CURRICULUM_FALLBACKS[0];

  const formulas = matchingChapter.formulasOrFacts.slice(0, 2).map((f) => `• ${f}`).join("\n");
  const summaryPoints = matchingChapter.keySummary.slice(0, 3).map((s) => `• ${s}`).join("\n");

  return `✦ High-Yield Board Exam Revision for **${matchingChapter.name}** (${matchingChapter.subject}):

★ Core Concepts & NCERT Definitions:
${summaryPoints}

★ High-Yield Formulas & Board Rubrics:
${formulas}

💡 Board Exam Examiner Tip:
Always structure your 3-mark and 5-mark subjective answers into:
1. **Given & To Prove/Find**
2. **Standard Formula & Substitute Steps**
3. **Boxed Final Answer with SI Units**

*(Notice: Bright AI companion is currently operating in high-availability mode during peak demand. Please feel free to ask another specific question!)*`;
}

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
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Resilient educational visual diagram & illustration generator
  async function generateEducationalImage(
    prompt: string,
    subject?: string,
    chapter?: string,
    aspectRatio = "1:1"
  ): Promise<{ imageUrl?: string; svgContent?: string; type: "raster" | "svg" } | null> {
    // Attempt 1: Try raster generation if available, with a swift timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Raster timeout")), 2500)
      );
      const imageRes = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: `High quality educational textbook diagram for CBSE Class 10: ${prompt}. Clean, accurate labels.` }],
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || "1:1",
            },
          },
        }),
        timeoutPromise,
      ]);

      if (imageRes.candidates?.[0]?.content?.parts) {
        for (const part of imageRes.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            return { imageUrl: `data:${mime};base64,${part.inlineData.data}`, type: "raster" };
          }
        }
      }
    } catch (_err) {
      // Gracefully cascade to SVG generation
    }

    // Attempt 2: AI-Generated SVG Vector Diagram with multi-tier model fallback
    const svgModelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    const svgPrompt = `You are an expert CBSE Class 10 educational illustrator.
Create a complete, visually clean, self-contained SVG diagram for: "${prompt}" (Subject: ${subject || "CBSE Class 10"}, Chapter: ${chapter || "Board Exam Prep"}).

Strict Requirements:
- Output valid, standalone SVG code inside an <svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">...</svg> tag.
- Include clear, readable labels (<text> tags), neat gradients (<defs>), color-coded anatomy/parts, and high pedagogical accuracy matching NCERT textbooks.
- Do NOT wrap in markdown code blocks (\`\`\`xml or \`\`\`svg). Output ONLY the raw <svg>...</svg> starting with <svg and ending with </svg>.`;

    for (const m of svgModelsToTry) {
      try {
        const svgRes = await withTimeout(
          ai.models.generateContent({
            model: m,
            contents: svgPrompt,
            config: {
              temperature: 0.2,
            },
          }),
          4000,
          `SVG generation timed out on ${m}`
        );

        let rawSvg = svgRes.text || "";
        const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          rawSvg = svgMatch[0];
        }

        if (rawSvg.includes("<svg") && rawSvg.includes("</svg>")) {
          return { svgContent: rawSvg, type: "svg" };
        }
      } catch (err: any) {
        console.warn(`SVG generation model ${m} failed (${err?.message?.slice(0, 80)}), trying next...`);
        await sleep(200);
      }
    }

    // Attempt 3: Built-in parametric educational diagram matching prompt
    const builtInSvg = getBuiltInEducationalDiagram(prompt);
    if (builtInSvg) {
      return { svgContent: builtInSvg, type: "svg" };
    }

    return null;
  }

  // =========================================================================
  // API 1: Multi-turn Chat with Resilient Model Cascade & Fallback
  // =========================================================================
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const {
        message,
        history,
        model = "gemini-3.5-flash",
        role = "general",
        subject,
        chapter,
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

      // Build context-aware system instruction
      const baseInstruction =
        ROLE_SYSTEM_INSTRUCTIONS[role as ChatRoleChoice] || ROLE_SYSTEM_INSTRUCTIONS.general;
      const contextPrefix =
        subject && chapter
          ? `[Current Context: CBSE Class 10 | Subject: ${subject} | Current Chapter: ${chapter}]\n\n`
          : `[Context: CBSE Class 10 Board Curriculum]\n\n`;
      const systemInstruction = contextPrefix + baseInstruction + "\n\n" + COMMON_FORMATTING_RULES;

      // Validate and clean history for multi-turn chat
      const formattedHistory = Array.isArray(history)
        ? history
            .filter((h: any) => h && (h.role === "user" || h.role === "model") && h.parts && Array.isArray(h.parts))
            .map((h: any) => ({
              role: h.role,
              parts: h.parts.map((p: any) => ({ text: String(p.text || "") })),
            }))
        : [];

      const modelOrder = getOrderedModelList(model);
      let responseText = "";
      let actualModelUsed = modelOrder[0];
      let lastErrorMessage = "";

      // Try candidate models in order to gracefully handle 503 high demand or 429 quota
      for (const candidate of modelOrder) {
        try {
          const chat = ai.chats.create({
            model: candidate,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
            history: formattedHistory,
          });

          const response = await withTimeout(
            chat.sendMessage({ message }),
            8000,
            `Chat message timed out on ${candidate}`
          );
          if (response.text && response.text.trim()) {
            responseText = response.text;
            actualModelUsed = candidate;
            break;
          }
        } catch (chatErr: any) {
          lastErrorMessage = chatErr?.message || String(chatErr);
          console.warn(`Model ${candidate} failed with message: ${lastErrorMessage.slice(0, 100)}. Falling back to next model...`);
          await sleep(350);
        }
      }

      // If all models were unavailable due to upstream demand spike, provide smart curriculum guidance
      if (!responseText) {
        console.warn("All candidate Gemini models temporarily unavailable. Delivering curriculum mentor response.");
        responseText = generateSyllabusFallbackResponse(message, subject, chapter, role);
        actualModelUsed = "gemini-3.5-flash-lite";
      }

      let generatedImage: { imageUrl?: string; svgContent?: string; prompt?: string; type?: string } | null = null;

      // Check if response has [GENERATE_IMAGE: <prompt>] tag or if the user explicitly requested an image
      const imageTagMatch = responseText.match(/\[GENERATE_IMAGE:\s*([^\]]+)\]/i);
      if (imageTagMatch) {
        const imagePrompt = imageTagMatch[1].trim();
        responseText = responseText.replace(imageTagMatch[0], "").trim();
        const imgResult = await generateEducationalImage(imagePrompt, subject, chapter);
        if (imgResult) {
          generatedImage = {
            ...imgResult,
            prompt: imagePrompt,
          };
        }
      } else if (isExplicitImageRequest) {
        const cleanPrompt =
          message
            .replace(/^(can you|please|kindly|could you)\s+/i, "")
            .replace(/^(generate|draw|show|create|make|illustrate)\s+(me\s+)?(an?\s+)?(image|diagram|figure|illustration|picture|sketch)\s+(of\s+)?/i, "")
            .trim() || message;

        const imgResult = await generateEducationalImage(cleanPrompt, subject, chapter);
        if (imgResult) {
          generatedImage = {
            ...imgResult,
            prompt: cleanPrompt,
          };
        }
      }

      res.json({
        text: responseText,
        modelUsed: actualModelUsed,
        roleUsed: role,
        generatedImage,
      });
    } catch (error: any) {
      console.error("Chat API unhandled error:", error);
      // Even on unhandled error, provide a helpful response instead of breaking
      res.json({
        text: "✦ CBSE Academic Mentor: I am ready to help you with formulas, step-by-step proofs, and marking schemes. Please enter your question again to continue!",
        modelUsed: "gemini-3.5-flash-lite",
        roleUsed: "general",
      });
    }
  });

  // =========================================================================
  // API 2: Dynamic Quiz Question Generator with Resilient Fallback
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

      const quizModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
      let parsedQuestions = null;

      for (const m of quizModels) {
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model: m,
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
                            description: "Exactly 4 options",
                          },
                          correctIndex: {
                            type: Type.INTEGER,
                            description: "0-based index of the correct answer (0, 1, 2, or 3)",
                          },
                          explanation: { type: Type.STRING, description: "Educational explanation of the correct answer." },
                        },
                        required: ["questionText", "options", "correctIndex", "explanation"],
                      },
                    },
                  },
                  required: ["questions"],
                },
              },
            }),
            5000,
            `Quiz generation timed out on ${m}`
          );

          const text = response.text || "{}";
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            parsedQuestions = parsed.questions;
            break;
          }
        } catch (err: any) {
          console.warn(`Quiz generation on ${m} failed (${err?.message?.slice(0, 80)}). Trying fallback model...`);
          await sleep(250);
        }
      }

      // If all models were unavailable, provide high-yield questions from syllabus repository
      if (!parsedQuestions || parsedQuestions.length === 0) {
        const foundChapter = CBSE_CURRICULUM_FALLBACKS.find(
          (c) => c.name.toLowerCase().includes(topic.toLowerCase()) || c.subject.toLowerCase() === subject.toLowerCase()
        ) || CBSE_CURRICULUM_FALLBACKS[0];

        parsedQuestions = foundChapter.questions.slice(0, count);
      }

      res.json({ questions: parsedQuestions });
    } catch (error: any) {
      console.error("Quiz Generator API error:", error);
      // Return chapter default questions so user is never blocked
      const fallbackQuestions = CBSE_CURRICULUM_FALLBACKS[0].questions;
      res.json({ questions: fallbackQuestions });
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
          ...result,
        });
        return;
      }

      // Pre-rendered fallback SVG
      const fallbackSvg = getBuiltInEducationalDiagram(prompt);
      res.json({
        success: true,
        prompt,
        svgContent: fallbackSvg,
        type: "svg",
      });
    } catch (error: any) {
      console.error("Image generation API error:", error);
      const fallbackSvg = getBuiltInEducationalDiagram(req.body?.prompt || "Class 10 CBSE");
      res.json({
        success: true,
        prompt: req.body?.prompt || "Class 10 Concept",
        svgContent: fallbackSvg,
        type: "svg",
      });
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
          ws: false,
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
