import { useCallback, useEffect, useRef, useState } from "react";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

const RISK_COLOURS = {
  HIGH: "#c0392b",
  MEDIUM: "#e67e22",
  LOW: "#27ae60",
  UNKNOWN: "#7f8c8d"
};

function parseJsonSafely(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function Taskpane() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState("");
  const officeInitStartedRef = useRef(false);
  const itemChangedHandlerRegisteredRef = useRef(false);

  const getCurrentItem = useCallback(() => {
    const mailbox = window.Office?.context?.mailbox;
    const item = mailbox?.item;

    if (!mailbox || !item) {
      throw new Error("No Outlook email is available. Open the task pane from a message in Outlook to analyse it.");
    }

    return { mailbox, item };
  }, []);

  const analyzeCurrentEmail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { mailbox, item } = getCurrentItem();
      const restId = mailbox.convertToRestId(
        item.itemId,
        window.Office.MailboxEnums.RestVersion.v2_0
      );

      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: restId })
      });

      const rawResponse = await res.text();
      const data = parseJsonSafely(rawResponse);

      if (!res.ok) {
        throw new Error(data?.error || rawResponse || `Server error: ${res.status}`);
      }

      if (!data) {
        throw new Error(
          "The server returned a non-JSON response. Check that the backend/ngrok endpoint is serving the API routes."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getCurrentItem]);

  const refreshCurrentItem = useCallback(() => {
    try {
      const { item } = getCurrentItem();
      setSubject(item.subject || "");
      analyzeCurrentEmail();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [analyzeCurrentEmail, getCurrentItem]);

  useEffect(() => {
    if (officeInitStartedRef.current) {
      return undefined;
    }

    officeInitStartedRef.current = true;

    const initializeTaskpane = () => {
      window.Office.onReady(() => {
        refreshCurrentItem();

        if (
          !itemChangedHandlerRegisteredRef.current &&
          window.Office.context?.mailbox?.addHandlerAsync &&
          window.Office.EventType?.ItemChanged
        ) {
          window.Office.context.mailbox.addHandlerAsync(
            window.Office.EventType.ItemChanged,
            refreshCurrentItem
          );
          itemChangedHandlerRegisteredRef.current = true;
        }
      });
    };

    if (window.Office) {
      initializeTaskpane();
      return undefined;
    }

    const existingScript = document.getElementById("office-js");
    if (existingScript) {
      existingScript.addEventListener("load", initializeTaskpane, { once: true });
      return undefined;
    }

    const script = document.createElement("script");
    script.id = "office-js";
    script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
    script.onload = initializeTaskpane;
    document.head.appendChild(script);

    return undefined;
  }, [getCurrentItem, refreshCurrentItem]);

  const riskColour = result ? (RISK_COLOURS[result.risk] || RISK_COLOURS.UNKNOWN) : "#333";

  return (
    <div style={{ padding: 16, fontFamily: "Segoe UI, sans-serif", fontSize: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <strong style={{ fontSize: 16 }}>InboxShield AI</strong>
        <button
          onClick={analyzeCurrentEmail}
          disabled={loading}
          style={{
            fontSize: 12,
            padding: "4px 10px",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#f3f3f3"
          }}
        >
          {loading ? "Analysing..." : "Re-analyse"}
        </button>
      </div>

      {subject && (
        <div style={{ marginBottom: 12, color: "#555", fontStyle: "italic", fontSize: 12 }}>
          {subject}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 24, color: "#888" }}>
          Scanning email for threats...
        </div>
      )}

      {error && !loading && (
        <div style={{ color: "#c0392b", background: "#fdecea", padding: 10, borderRadius: 4 }}>
          Warning: {error}
        </div>
      )}

      {result && !loading && (
        <div>
          <div
            style={{
              background: riskColour,
              color: "#fff",
              borderRadius: 6,
              padding: "8px 12px",
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 12,
              textAlign: "center"
            }}
          >
            {result.risk} RISK
          </div>

          <p style={{ margin: "8px 0", color: "#333" }}>{result.explanation}</p>

          <div
            style={{
              background: "#f9f9f9",
              borderLeft: `4px solid ${riskColour}`,
              padding: "8px 12px",
              marginBottom: 12,
              borderRadius: 2
            }}
          >
            <strong>Recommendation</strong>
            <p style={{ margin: "4px 0" }}>{result.recommendation}</p>
          </div>

          {result.indicators?.length > 0 && (
            <div>
              <strong>Signals detected</strong>
              <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                {result.indicators.map((indicator, index) => (
                  <li key={index} style={{ marginBottom: 4, color: "#444" }}>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
