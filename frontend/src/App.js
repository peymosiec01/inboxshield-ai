import { useState } from "react";
import Taskpane from "./Taskpane";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

function parseJsonSafely(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function ManualAnalyser() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);

  const analyzeEmail = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/analyze-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body })
      });
      const rawResponse = await res.text();
      const data = parseJsonSafely(rawResponse);

      if (!res.ok) {
        throw new Error(data?.error || rawResponse || `Server error: ${res.status}`);
      }

      if (!data) {
        throw new Error("The server returned a non-JSON response.");
      }

      setResult(data.result ?? data);
    } catch (err) {
      console.error("Error analyzing email:", err);
    }
  };

  const highlight = (text) => text.replace(/(guaranteed|urgent|earn)/gi, "[!] $1");

  return (
    <div style={{ padding: 20 }}>
      <h2>InboxShield AI (Outlook Add-in)</h2>

      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <textarea
        placeholder="Paste email content..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: "100%", height: 150 }}
      />

      <br />
      <br />

      <button onClick={analyzeEmail}>Analyze Email</button>

      {result && (
        <>
          <div style={{ marginTop: 20, background: "#eee", padding: 10, borderRadius: 5 }}>
            <strong>Highlighted Email Content:</strong>
            <pre>{highlight(body)}</pre>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 15,
              background: "#f4f6f8",
              marginTop: 20
            }}
          >
            <h3>Risk Level: {result.risk}</h3>
            <ul>
              {(result.indicators || []).map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
            <p><strong>Explanation:</strong> {result.explanation}</p>
            <p><strong>Recommendation:</strong> {result.recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return pathname.startsWith("/taskpane") ? <Taskpane /> : <ManualAnalyser />;
}

export default App;
