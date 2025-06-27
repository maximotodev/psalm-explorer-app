import React, { useState, useEffect } from "react";
import Analysis from "./Analysis";
import { Loader } from "./Loader";

function SimilarPsalms({ chapter, onPsalmSelect, apiBaseUrl }) {
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chapter) return;
    setIsLoading(true);
    fetch(`${apiBaseUrl}/similar/${chapter}`)
      .then((res) => res.json())
      .then((data) => setSimilar(data))
      .catch((err) => console.error("Error fetching similar psalms", err))
      .finally(() => setIsLoading(false));
  }, [chapter, apiBaseUrl]);

  if (isLoading || similar.length === 0) return null;

  return (
    <div className="similar-psalms">
      <h4>See Also:</h4>
      {similar.map((p) => (
        <button
          key={p.chapter}
          className="similar-tag"
          onClick={() => onPsalmSelect(p.chapter)}
        >
          Psalm {p.chapter}
        </button>
      ))}
    </div>
  );
}

function PsalmDisplay({ psalm, onPsalmSelect, apiBaseUrl }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!psalm) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    const fullText = psalm.verses.map((v) => v.text).join(" ");

    fetch(`${apiBaseUrl}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fullText }),
    })
      .then((res) => res.json())
      .then((data) => setAnalysis(data))
      .catch((error) => console.error("Error analyzing psalm:", error))
      .finally(() => setIsAnalyzing(false));
  }, [psalm, apiBaseUrl]);

  return (
    <div className="psalm-view fadeIn">
      <div className="psalm-card">
        <header className="psalm-header">
          <h2>Psalm {psalm.chapter}</h2>
          <SimilarPsalms
            chapter={psalm.chapter}
            onPsalmSelect={onPsalmSelect}
            apiBaseUrl={apiBaseUrl}
          />
        </header>
        <div className="psalm-content">
          {psalm.verses.map((verse) => (
            <p key={verse.verse}>
              <sup>{verse.verse}</sup> {verse.text}
            </p>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        {isAnalyzing ? <Loader /> : <Analysis analysis={analysis} />}
      </div>
    </div>
  );
}

export default PsalmDisplay;
