import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

import Search from "./components/Search";
import PsalmDisplay from "./components/PsalmDisplay";
import { Loader } from "./components/Loader";

// const API_BASE_URL = "http://127.0.0.1:5000/api";
// NEW
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000/api";

function App() {
  const [view, setView] = useState("loading"); // 'loading', 'displayingPsalm', 'displayingSearch'
  const [psalmData, setPsalmData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // --- Data Fetching Functions ---

  const processAndDisplayPsalm = useCallback((data) => {
    setPsalmData(data);
    setView("displayingPsalm");
  }, []);

  const fetchPsalm = useCallback(
    (chapterNum = null) => {
      setView("loading");
      const endpoint = chapterNum ? `/psalm/${chapterNum}` : "/random-psalm";

      fetch(`${API_BASE_URL}${endpoint}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          processAndDisplayPsalm(data);
        })
        .catch((error) => {
          console.error("Error fetching psalm:", error);
          // In a real app, you'd set an error view here
          // For now, let's just try fetching a random one again
          if (chapterNum) fetchPsalm();
        });
    },
    [processAndDisplayPsalm]
  );

  const handleSearch = useCallback((query) => {
    setView("loading");
    fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
        setView("displayingSearch");
      })
      .catch((error) => console.error("Search failed:", error));
  }, []);

  // Fetch initial random psalm on component mount
  useEffect(() => {
    fetchPsalm();
  }, [fetchPsalm]);

  // --- Render Logic ---

  const renderContent = () => {
    switch (view) {
      case "loading":
        return <Loader />;
      case "displayingPsalm":
        return (
          psalmData && (
            <PsalmDisplay
              psalm={psalmData}
              onPsalmSelect={fetchPsalm}
              apiBaseUrl={API_BASE_URL}
            />
          )
        );
      case "displayingSearch":
        return (
          <div className="search-results-view">
            <h2>Search Results</h2>
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((r) => (
                  <li key={r.chapter} onClick={() => fetchPsalm(r.chapter)}>
                    <strong>Psalm {r.chapter}</strong> (Similarity:{" "}
                    {r.similarity_score})<p>{r.preview}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results found for your query.</p>
            )}
          </div>
        );
      default:
        return <p>An unexpected error occurred.</p>;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Psalm Explorer</h1>
        <p className="subtitle">
          Discover the Psalms with ML-Powered Analysis and Search
        </p>
      </header>

      <main className="app-main">
        <Search onSearch={handleSearch} onRandomClick={() => fetchPsalm()} />
        <div className="content-area">{renderContent()}</div>
      </main>

      <footer className="app-footer">
        <p> Vibe coded with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
