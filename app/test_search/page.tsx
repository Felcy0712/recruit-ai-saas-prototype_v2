"use client";

import { useState } from "react";

export default function TestSearchPage() {
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/search-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jdText,
        }),
      });

      const data = await res.json();

      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Resume Search</h1>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste JD here..."
        rows={10}
        cols={80}
        style={{
          border: "1px solid gray",
          padding: 10,
          width: "100%",
        }}
      />

      <br />
      <br />

      <button
        onClick={handleSearch}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        {loading ? "Searching..." : "Search Resume"}
      </button>

      <br />
      <br />

      <pre>
        {result ? JSON.stringify(result, null, 2) : "No results yet"}
      </pre>
    </div>
  );
}