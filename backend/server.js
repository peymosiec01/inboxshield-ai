import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getAuthUrl, exchangeCodeForToken } from "./services/auth.js";
import { startPolling } from "./services/poller.js";
import { processEmail } from "./services/processEmail.js";
import { getEmail } from "./services/mail.js";
import { analyzeWithAI } from "./services/ai.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildDir = path.resolve(__dirname, "../frontend/build");
const frontendIndexPath = path.join(frontendBuildDir, "index.html");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "inboxshield-backend" });
});

app.get("/auth/signin", (req, res) => res.redirect(getAuthUrl()));

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    await exchangeCodeForToken(code);

    // Personal MSA accounts don't support Graph webhooks — use polling instead.
    startPolling(processEmail);

    res.send("Authentication successful. Polling for new mail started.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication failed. Check logs.");
  }
});

// Add-in calls this with the message ID from Office.js
app.post("/analyze", async (req, res) => {
  const { messageId } = req.body;
  if (!messageId) return res.status(400).json({ error: "Missing messageId" });

  try {
    const email = await getEmail(messageId);
    const result = await analyzeWithAI(
      email.subject,
      email.body?.content || ""
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/analyze-email", async (req, res) => {
  const { subject = "", body = "" } = req.body || {};

  if (!subject && !body) {
    return res.status(400).json({ error: "Missing email content" });
  }

  try {
    const result = await analyzeWithAI(subject, body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// Serve the built React task pane from the same host as the backend/ngrok URL.
app.use(express.static(frontendBuildDir));

app.get(["/", "/taskpane", "/taskpane/*"], (req, res) => {
  res.sendFile(frontendIndexPath);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(3001, () => {
  console.log("Server running on 3001");
  console.log("Visit http://localhost:3001/auth/signin to authenticate.");
});
