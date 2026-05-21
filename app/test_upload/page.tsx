"use client";

import { useState } from "react";

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    setResponse(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Resume</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload}>Upload</button>

      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}