import { useState } from "react";

export default function MedicalIndexer() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const indexRecord = async () => {
    setStatus("Indexing...");

    const res = await fetch("http://localhost:8000/api/index-medical/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        metadata: { source: "frontend", user: "doctor" }
      }),
    });

    const data = await res.json();

    if (data.id) {
      setStatus(`Indexed Successfully! ID: ${data.id}`);
    } else {
      setStatus("❌ Error: " + JSON.stringify(data));
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">📥 Index Medical Record</h2>

      <textarea
        className="w-full border p-3 rounded"
        rows="6"
        placeholder="Paste medical note or summary..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <button
        onClick={indexRecord}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded"
      >
        Index Document
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-700">{status}</p>
      )}
    </div>
  );
}
