import { useState } from "react";
import ImageUploader from "./components/ImageUploader.jsx";
import ObjectList from "./components/ObjectList.jsx";
import ModeSelector from "./components/ModeSelector.jsx";
import IdeaCard from "./components/IdeaCard.jsx";
import ProjectDetails from "./components/ProjectDetails.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { analyzeImage } from "./api.js";
import "./App.css";

export default function App() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState("creative");
  const [analyzing, setAnalyzing] = useState(false);
  const [objects, setObjects] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [model, setModel] = useState("");

  function handleImage(dataUrl, name) {
    setImage(dataUrl);
    setFileName(name || "");
    setObjects([]);
    setIdeas([]);
    setSelected(null);
    setError("");
  }

  function reset() {
    setImage(null);
    setFileName("");
    setObjects([]);
    setIdeas([]);
    setSelected(null);
    setError("");
    setModel("");
  }

  async function runAnalyze() {
    if (!image || analyzing) return;
    setAnalyzing(true);
    setError("");
    setSelected(null);
    try {
      const data = await analyzeImage(image, mode);
      if (data.success) {
        setObjects(data.objects || []);
        setIdeas(data.ideas || []);
        setModel(data.model || "");
      } else {
        setObjects([]);
        setIdeas([]);
        setError(data.error?.message || "We couldn't generate reliable ideas from this image. Please try another photo.");
      }
    } catch {
      setError("CraftVision couldn't reach the AI service right now. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">CraftVision · See it. Reimagine it. Make it.</p>
        <h1>Turn everyday objects into ideas.</h1>
        <p className="sub">
          Take a picture of the things around you. Gemma 4 will discover what you can create from them.
        </p>
        <p className="gemma-badge">Powered by Gemma 4 multimodal understanding</p>
      </header>

      <main className="flow">
        {!image && (
          <section className="panel">
            <ImageUploader onImage={handleImage} />
          </section>
        )}

        {image && !selected && (
          <section className="panel preview-panel">
            <div className="preview-row">
              <img src={image} alt="Uploaded objects for reuse ideas" className="preview" />
              <div className="preview-info">
                <p className="file-name">{fileName || "Your photo"}</p>
                <div className="preview-actions">
                  <button type="button" className="ghost" onClick={reset} disabled={analyzing}>
                    Remove
                  </button>
                  <button
                    type="button"
                    className="link"
                    onClick={() => document.querySelector(".flow")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Change photo? Remove and upload again.
                  </button>
                </div>
              </div>
            </div>
            <ImageUploader onImage={handleImage} compact />
          </section>
        )}

        {analyzing && <LoadingState />}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {image && !selected && !analyzing && (
          <>
            {objects.length > 0 && <ObjectList objects={objects} />}
            <ModeSelector
              mode={mode}
              onChange={setMode}
              onAnalyze={runAnalyze}
              analyzing={analyzing}
              disabled={!image}
            />
          </>
        )}

        {!selected && ideas.length > 0 && !analyzing && (
          <section aria-label="Project ideas">
            <h2>Ideas for you {model ? <span className="model-tag">via {model}</span> : null}</h2>
            <div className="cards">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onOpen={setSelected} />
              ))}
            </div>
            <div className="actions">
              <button type="button" className="ghost" onClick={runAnalyze}>
                Give me different ideas
              </button>
              <button type="button" className="ghost" onClick={reset}>
                Start Over
              </button>
            </div>
          </section>
        )}

        {selected && (
          <ProjectDetails
            idea={selected}
            onBack={() => setSelected(null)}
            onReset={reset}
          />
        )}
      </main>

      <footer className="footer">
        <p>Don&apos;t throw it away. Show it to CraftVision. · Reuse safely with adult supervision.</p>
      </footer>
    </div>
  );
}
