export default function ObjectList({ objects }) {
  if (!objects?.length) return null;
  return (
    <section className="panel" aria-label="Detected objects">
      <h2>We found {objects.length} reusable object{objects.length > 1 ? "s" : ""}</h2>
      <div className="chips">
        {objects.map((o, i) => (
          <span className="chip" key={i} title={o.notes || o.material}>
            {o.name}
            {o.material && o.material !== "unknown" ? <em> · {o.material}</em> : null}
          </span>
        ))}
      </div>
    </section>
  );
}
