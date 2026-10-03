const ALLOWED_MODES = ["useful", "creative", "eco-friendly", "quick-and-easy"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB per PRD §21

export function normalizeMode(mode) {
  if (!mode) return "creative";
  const m = String(mode).toLowerCase().trim();
  return ALLOWED_MODES.includes(m) ? m : null;
}

export function parseImagePayload(image) {
  if (!image || typeof image !== "string") return { error: "Image is required." };
  // Accept data URL or raw base64 + optional mime hint
  let mimeType = "image/jpeg";
  let base64 = image;
  const match = image.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/s);
  if (match) {
    mimeType = match[1];
    base64 = match[3];
  }
  if (!ALLOWED_MIME.includes(mimeType)) {
    return { error: "Unsupported image type. Use JPG, PNG or WEBP." };
  }
  let byteLen = 0;
  try {
    byteLen = Buffer.from(base64, "base64").length;
  } catch {
    return { error: "Invalid image data." };
  }
  if (byteLen === 0) return { error: "Invalid image data." };
  if (byteLen > MAX_BYTES) {
    return { error: "Image is too large. Please use an image under 10MB." };
  }
  return { mimeType, base64, byteLen };
}

export function validateAnalyzeBody(body) {
  const mode = normalizeMode(body?.mode);
  if (!mode && body?.mode) {
    return { error: "Invalid mode. Use useful, creative, eco-friendly or quick-and-easy." };
  }
  const parsed = parseImagePayload(body?.image);
  if (parsed.error) return { error: parsed.error };
  return { mode: mode || "creative", ...parsed };
}

export function validateModelOutput(data) {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.objects) || !Array.isArray(data.ideas)) return false;
  if (data.ideas.length === 0) return false;
  // Every idea must reference at least one detected object name (fuzzy)
  const names = data.objects.map((o) => String(o?.name || "").toLowerCase());
  for (const idea of data.ideas.slice(0, 5)) {
    if (!idea?.title || !Array.isArray(idea?.steps) || idea.steps.length === 0) return false;
    const used = (idea.objectsUsed || []).map((s) => String(s).toLowerCase());
    const overlaps = used.some((u) => names.some((n) => n && (u.includes(n) || n.includes(u))));
    if (!overlaps) return false;
  }
  return true;
}
