import { useState } from "react";

export default function MedicalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchRecords = async () => {
    const res = await fetch("http://localhost:8000/api/search-medical/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: 5 }),
    });

    const data = await res.json();
    setResults(data.results || []);
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">🔍 Search Medical Database</h2>

      <input
        type="text"
        className="w-full border p-3 rounded"
        placeholder="Search: fever, cough, dengue..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={searchRecords}
        className="mt-4 px-6 py-3 bg-green-600 text-white rounded"
      >
        Search
      </button>

      <div className="mt-4">
        {results.length > 0 ? (
          results.map((r, idx) => (
            <div
              key={idx}
              className="p-4 border rounded mb-3 bg-gray-50"
            >
              <p className="font-semibold">Score: {r.distances?.[0]?.toFixed(4)}</p>
              <p>{r.documents?.[0]}</p>
            </div>
          ))
        ) : (
          <p>No results yet.</p>
        )}
      </div>
    </div>
  );
}
