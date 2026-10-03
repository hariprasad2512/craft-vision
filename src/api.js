export async function analyzeImage(imageDataUrl, mode) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl, mode }),
  });
  const data = await res.json();
  if (!res.ok && !data.error) {
    throw new Error("CraftVision couldn't reach the AI service right now. Please try again.");
  }
  return data;
}

// Downscale very large images client-side (PRD §21) to keep payloads ~<2MB
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        const scale = Math.min(1, MAX_DIM / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        // Keep original type when possible, default JPEG
        const type = ["image/png", "image/webp"].includes(file.type) ? file.type : "image/jpeg";
        resolve({ dataUrl: canvas.toDataURL(type, 0.85), width, height });
      };
      img.onerror = () => reject(new Error("Could not read that image file."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read that image file."));
    reader.readAsDataURL(file);
  });
}
