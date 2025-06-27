import React, { useState } from "react";

function Search({ onSearch, onRandomClick }) {
  const [query, setQuery] = useState("");

  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for themes like 'hope in darkness'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
        />
        <button onClick={handleSearchClick}>Search</button>
      </div>
      <button className="random-button" onClick={onRandomClick}>
        New Psalm
      </button>
    </div>
  );
}

export default Search;
