export default function IdeaCard({ idea, onOpen }) {
  return (
    <article className="card">
      <p className="card-type">{idea.type}</p>
      <h3>{idea.title}</h3>
      <p className="card-desc">{idea.description}</p>
      <p className="card-uses">
        Uses: {(idea.objectsUsed || []).join(" • ") || "—"}
      </p>
      <p className="card-meta">
        <span>Difficulty: {idea.difficulty}</span>
        <span>Time: {idea.estimatedTime}</span>
      </p>
      <button type="button" className="secondary" onClick={() => onOpen(idea)}>
        View Project
      </button>
    </article>
  );
}
