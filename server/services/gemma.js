import { GoogleGenAI } from "@google/genai";
import { validateModelOutput } from "../utils/validation.js";

const PRIMARY_MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
const FALLBACK_MODEL = PRIMARY_MODEL === "gemma-4-31b-it" ? "gemma-4-26b-a4b-it" : "gemma-4-31b-it";

const MODE_GUIDANCE = {
  useful: "Prioritize practical, functional items for home, study or storage.",
  creative: "Prioritize decorative, artistic and playful builds.",
  "eco-friendly": "Prioritize reuse without new purchases, minimal waste, safe recycling.",
  "quick-and-easy": "Prioritize builds under 30 minutes with basic tools only (scissors, glue, tape).",
};

function buildPrompt(mode) {
  return `You are CraftVision, a practical creative-reuse assistant powered by Gemma 4.

Analyze the provided image.
1. Identify the visible reusable household objects (cardboard, plastic bottles, newspaper, glass jars, cloth, CDs, containers, sticks, packaging, etc).
2. Identify likely materials when visually inferable.
3. Consider the objects TOGETHER and find combinations that work well together.
4. Generate 4 practical projects that can be made using those objects. Follow the requested mode: ${mode}. ${MODE_GUIDANCE[mode] || ""}
5. Prioritize projects realistic with common household materials (glue, scissors, tape, string).
6. Do not assume an object is safe to cut, heat, open, dismantle, or electrically modify unless clearly appropriate.
7. Never recommend weapons, dangerous devices, explosive/incendiary constructions, harmful chemical mixtures, unsafe electrical modifications, battery dismantling, or pressurized-container mods. For risky objects prefer reuse-without-modification or safe disposal.
8. If children may build it and tools like scissors/cutters/glue-guns/heat are needed, require adult supervision in safety notes.

Return ONLY structured JSON matching this schema, no markdown, no extra text:
{
  "objects": [{"name": "plastic bottle", "material": "plastic", "notes": "short note"}],
  "ideas": [{
    "id": "idea-1",
    "title": "Decorative Planter",
    "type": "Creative",
    "description": "one-line summary",
    "objectsUsed": ["plastic bottle"],
    "additionalMaterials": ["glue", "scissors"],
    "difficulty": "Easy",
    "estimatedTime": "20 minutes",
    "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
    "safety": ["safety note"]
  }]
}`;
}

function extractJson(text) {
  if (!text) throw new Error("empty model response");
  // Strip code fences if present
  let t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // Try direct parse, else find first {...} block
  try {
    return JSON.parse(t);
  } catch {
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
    throw new Error("malformed JSON");
  }
}

function normalize(data) {
  const objects = (data.objects || []).slice(0, 10).map((o, i) => ({
    name: String(o?.name || `object-${i + 1}`),
    material: String(o?.material || "unknown"),
    notes: String(o?.notes || ""),
  }));
  const ideas = (data.ideas || []).slice(0, 5).map((idea, i) => ({
    id: String(idea?.id || `idea-${i + 1}`),
    title: String(idea?.title || `Project ${i + 1}`),
    type: String(idea?.type || "Creative"),
    description: String(idea?.description || ""),
    objectsUsed: Array.isArray(idea?.objectsUsed) ? idea.objectsUsed.map(String) : [],
    additionalMaterials: Array.isArray(idea?.additionalMaterials) ? idea.additionalMaterials.map(String) : [],
    difficulty: String(idea?.difficulty || "Easy"),
    estimatedTime: String(idea?.estimatedTime || "30 minutes"),
    steps: Array.isArray(idea?.steps) ? idea.steps.map(String) : [],
    safety: Array.isArray(idea?.safety) ? idea.safety.map(String) : [],
  }));
  return { objects, ideas };
}

async function callModel(ai, model, prompt, mimeType, base64) {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });
  return response.text;
}

export async function analyzeImageWithGemma({ base64, mimeType, mode }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("Server is missing GEMINI_API_KEY.");
    err.code = "CONFIG_ERROR";
    throw err;
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(mode);
  const modelsToTry = PRIMARY_MODEL === FALLBACK_MODEL ? [PRIMARY_MODEL] : [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      let text = await callModel(ai, model, prompt, mimeType, base64);
      let data;
      try {
        data = normalize(extractJson(text));
      } catch {
        // One constrained retry per PRD §9
        const retryText = await callModel(
          ai, model,
          prompt + "\n\nIMPORTANT: Your previous reply was not valid JSON. Reply with ONLY the JSON object, nothing else.",
          mimeType, base64
        );
        data = normalize(extractJson(retryText));
      }
      if (!validateModelOutput(data)) {
        const err = new Error("Model returned unusable ideas.");
        err.code = "MODEL_ERROR";
        throw err;
      }
      if (data.objects.length === 0) {
        const err = new Error("NO_OBJECTS");
        err.code = "NO_OBJECTS";
        throw err;
      }
      return { ...data, model };
    } catch (e) {
      lastError = e;
      // Don't retry config errors; do try fallback for model errors
      if (e.code === "CONFIG_ERROR") throw e;
      continue;
    }
  }
  const err = new Error(lastError?.message || "Unable to analyze the image.");
  err.code = lastError?.code || "MODEL_ERROR";
  throw err;
}
