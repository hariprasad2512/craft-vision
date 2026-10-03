# CraftVision
See it. Reimagine it. Make it.

## Problem
People have unused household objects — cardboard, plastic bottles, newspapers, jars, cloth, CDs — but don't know what to make from them. Searching the web for "what can I make with X + Y" is slow and generic.

## Solution
Photograph your objects → Gemma 4 understands objects + materials + combinations → generates useful/creative projects → step-by-step build guide.

```
React UI (image + mode)
  │ POST /api/analyze
  ▼
Node/Express (validate → prompt → call AI → parse/validate)
  │ Gemini API
  ▼
Gemma 4 (multimodal understanding + creative reasoning)
  │ structured JSON
  ▼
React UI (objects → ideas → instructions)
```

## Features (MVP)
- Image upload + drag-drop + preview (JPG/PNG/WEBP, ≤10MB, client-side downscale)
- Gemma 4 object + material detection
- 4 modes: Useful, Creative, Eco-friendly, Quick & Easy
- 3–5 project cards with uses / difficulty / time
- Detail view: objects used, extra materials, steps, safety notes, copy + start over
- Loading states, graceful errors, reset flow

## Tech Stack
React, Vite, Node.js, Express, Gemini API, Gemma 4 (`gemma-4-26b-a4b-it` primary, `gemma-4-31b-it` fallback)

## Setup
```bash
git clone https://github.com/<you>/craft-vision.git
cd craft-vision
npm install
cd server && npm install && cd ..
cp .env.example .env
# edit .env and set GEMINI_API_KEY (from AI Studio)
```

`.env.example`:
```
GEMINI_API_KEY=your_api_key_here
PORT=5000
GEMMA_MODEL=gemma-4-26b-a4b-it
```

## Running
```bash
# backend (:5000)
cd server && npm start

# frontend (:5173, proxies /api → :5000)
npm run dev
```
Open http://localhost:5173 → upload photo → Discover Ideas.

API: `POST /api/analyze` with `{image: "<data-url|base64>", mode: "useful|creative|eco-friendly|quick-and-easy"}` → `{success, objects[], ideas[]}`.

## AI Usage
- Why Gemma 4: multimodal core, not a chatbot. It receives the actual image + structured instruction, identifies multiple objects/materials together, and reasons about combinations.
- Input sent: user image (inlineData) + prompt (role, materials, mode guidance, safety rules). No API key ever leaves the server.
- Output: forced `responseMimeType: application/json` matching `{objects[], ideas[{title,type,description,objectsUsed,additionalMaterials,difficulty,estimatedTime,steps[],safety[]}]}`. Backend safe-parses, retries once on malformed JSON, validates ideas actually use detected objects, returns normalized JSON.
- Fallback: tries `gemma-4-26b-a4b-it` first (reliable), falls back to `gemma-4-31b-it` on model errors.

## Safety
No weapons, explosives, harmful chemicals, unsafe electrical/battery/pressurized mods. Risky objects → reuse-without-modification or safe disposal. Tool/heat steps require adult supervision notice. Errors never expose keys, prompts, or stack traces.

## Demo (1–2 min)
1. "Most of us have random things lying around…" show bottle + cardboard + newspaper + CD + cloth.
2. Upload photo → "CraftVision uses Gemma 4 to understand this image." → chips: 5 objects.
3. Select Creative → 3–4 ideas → open Decorative Planter → materials, time, steps.
4. Close: "Don't throw it away. Show it to CraftVision."

## License
MIT — see LICENSE.
