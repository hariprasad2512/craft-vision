import { useRef, useState } from "react";
import { fileToDataUrl } from "../api.js";

const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export default function ImageUploader({ onImage, compact }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleFile(file) {
    setLocalError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLocalError("Please use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalError("Image is too large. Please use one under 10MB.");
      return;
    }
    try {
      const { dataUrl } = await fileToDataUrl(file);
      onImage(dataUrl, file.name);
    } catch {
      setLocalError("Could not read that image. Try another file.");
    }
  }

  return (
    <div>
      <div
        className={`dropzone${dragOver ? " dragging" : ""}${compact ? " compact" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Upload an image of reusable objects"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="drop-icon" aria-hidden="true">📸</div>
        <p className="drop-title">Drop a photo here, or click to upload</p>
        <p className="drop-sub">JPG · PNG · WEBP — everyday objects, well lit, separated</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {localError && <p className="error" role="alert">{localError}</p>}
    </div>
  );
}
