import { Router } from "express";
import { validateAnalyzeBody } from "../utils/validation.js";
import { analyzeImageWithGemma } from "../services/gemma.js";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = validateAnalyzeBody(req.body);
  if (parsed.error) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_INPUT", message: parsed.error },
    });
  }
  try {
    const { objects, ideas, model } = await analyzeImageWithGemma({
      base64: parsed.base64,
      mimeType: parsed.mimeType,
      mode: parsed.mode,
    });
    return res.json({ success: true, objects, ideas, model, mode: parsed.mode });
  } catch (e) {
    if (e.code === "CONFIG_ERROR") {
      console.error("Config error:", e.message);
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "CraftVision couldn't reach the AI service right now. Please try again." },
      });
    }
    if (e.code === "NO_OBJECTS") {
      return res.status(200).json({
        success: false,
        error: {
          code: "NO_OBJECTS",
          message: "We couldn't identify enough reusable objects in this image. Try a clearer photo with the objects separated or more visible.",
        },
      });
    }
    console.error("Analyze error:", e.message);
    return res.status(502).json({
      success: false,
      error: { code: "MODEL_ERROR", message: "We couldn't generate reliable ideas from this image. Please try another photo." },
    });
  }
});

export default router;
