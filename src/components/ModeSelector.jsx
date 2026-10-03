const MODES = [
  { id: "useful", label: "Useful", hint: "Functional home & study builds" },
  { id: "creative", label: "Creative", hint: "Decorative & playful builds" },
  { id: "eco-friendly", label: "Eco-friendly", hint: "Minimal waste reuse" },
  { id: "quick-and-easy", label: "Quick & Easy", hint: "Under ~30 min" },
];

export default function ModeSelector({ mode, onChange, onAnalyze, analyzing, disabled }) {
  return (
    <section className="panel" aria-label="Choose project type">
      <h2>What do you want to make?</h2>
      <div className="modes" role="radiogroup" aria-label="Project mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            className={`mode${mode === m.id ? " active" : ""}`}
            onClick={() => onChange(m.id)}
            disabled={analyzing}
            title={m.hint}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="primary"
        onClick={onAnalyze}
        disabled={disabled || analyzing}
      >
        {analyzing ? "Analyzing with Gemma 4…" : "Discover Ideas"}
      </button>
    </section>
  );
}
