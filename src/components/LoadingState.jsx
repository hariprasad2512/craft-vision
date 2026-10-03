import { useEffect, useState } from "react";

const STEPS = [
  "Looking at your objects…",
  "Identifying materials…",
  "Thinking of possibilities…",
  "Preparing your projects…",
];

export default function LoadingState() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % STEPS.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="loading-title">CraftVision is looking at your objects…</p>
      <p className="loading-step">{STEPS[idx]}</p>
      <p className="loading-note">Gemma 4 is understanding objects, materials and combinations.</p>
    </div>
  );
}
