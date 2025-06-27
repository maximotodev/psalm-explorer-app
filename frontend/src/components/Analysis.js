import React from "react";

// A map to assign a color to each category for better visuals
const categoryColors = {
  praise: "#2a9d8f",
  lament: "#e76f51",
  trust: "#e9c46a",
  royal: "#8e7dbe",
  wisdom: "#f4a261",
  hymn: "#264653",
  thanksgiving: "#577590",
};

function Analysis({ analysis }) {
  // The API now returns an object like { psalm_types: ["praise", "hymn"] }
  const psalmTypes = analysis?.psalm_types;

  if (!psalmTypes) {
    return <p>No analysis available.</p>;
  }

  return (
    <div className="analysis-content">
      <h3>Psalm Classification</h3>
      <div className="categories">
        <strong>Sentiment:</strong>
        <div className="category-tags">
          {psalmTypes.length > 0 ? (
            psalmTypes.map((type, i) => (
              <span
                key={i}
                className="category-tag"
                style={{ backgroundColor: categoryColors[type] || "#6c757d" }}
              >
                {type}
              </span>
            ))
          ) : (
            <span>Could not determine type.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analysis;
