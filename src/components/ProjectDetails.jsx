import { useState } from "react";

export default function ProjectDetails({ idea, onBack, onReset }) {
  const [copied, setCopied] = useState(false);

  async function copyInstructions() {
    const text = `${idea.title}\n\nUses: ${(idea.objectsUsed || []).join(", ")}\nAlso need: ${(idea.additionalMaterials || []).join(", ")}\nDifficulty: ${idea.difficulty} · Time: ${idea.estimatedTime}\n\nSteps:\n${(idea.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSafety:\n${(idea.safety || []).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="panel detail" aria-label="Project details">
      <button type="button" className="link" onClick={onBack}>← Back to ideas</button>
      <p className="card-type">{idea.type}</p>
      <h2>{idea.title}</h2>
      <p>{idea.description}</p>
      <div className="detail-grid">
        <div>
          <h3>Uses</h3>
          <ul>{(idea.objectsUsed || []).map((o, i) => <li key={i}>✓ {o}</li>)}</ul>
        </div>
        <div>
          <h3>You also need</h3>
          <ul>{(idea.additionalMaterials || []).map((o, i) => <li key={i}>• {o}</li>)}</ul>
        </div>
        <div>
          <h3>Difficulty</h3>
          <p>{idea.difficulty}</p>
        </div>
        <div>
          <h3>Time</h3>
          <p>{idea.estimatedTime}</p>
        </div>
      </div>
      <h3>Steps</h3>
      <ol className="steps">
        {(idea.steps || []).map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      {(idea.safety?.length > 0) && (
        <>
          <h3>Safety</h3>
          <ul className="safety">
            {idea.safety.map((s, i) => <li key={i}>⚠ {s}</li>)}
          </ul>
          <p className="supervision">Children should build with adult supervision when tools, cutters or heat are involved.</p>
        </>
      )}
      <div className="actions">
        <button type="button" className="secondary" onClick={copyInstructions}>
          {copied ? "Copied!" : "Copy Instructions"}
        </button>
        <button type="button" className="ghost" onClick={onReset}>Start Over</button>
      </div>
    </section>
  );
}
