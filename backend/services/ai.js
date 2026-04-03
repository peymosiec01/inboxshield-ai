import dotenv from "dotenv";
import OpenAI from "openai";
import { checkUrlReputation, detectUrgency } from "../tools.js";
import { knowledgeBase } from "../knowledge.js";

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deploymentName = "gpt-4.1-mini";
const apiKey = process.env.AZURE_OPENAI_KEY;

const client = new OpenAI({
  baseURL: endpoint,
  apiKey
});

export async function analyzeWithAI(subject, body) {
  const parsed = parserAgent(subject, body);
  const scamResult = await scamAgent(parsed.combined);
  return advisorAgent(scamResult);
}

function parserAgent(subject, body) {
  return {
    subject,
    body,
    combined: `${subject}\n${body}`
  };
}

async function scamAgent(parsedText) {
  const urlRisk = checkUrlReputation(parsedText);
  const urgency = detectUrgency(parsedText);

  const toolContext = `URL Risk: ${urlRisk}\nUrgency Detected: ${urgency}`;
  const knowledge = retrieveKnowledge(parsedText);

  try {
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        {
          role: "system",
          content: `You are a financial scam detection AI.
            Use:
            - External tool results
            - Knowledge base

            Tool Results:
            ${toolContext}

            Knowledge:
            ${knowledge}

            Return output strictly as JSON:
            {
            "risk": "LOW | MEDIUM | HIGH",
            "indicators": ["list of detected signals"],
            "explanation": "short explanation",
            "recommendation": "actionable advice"
            }`
        },
        {
          role: "user",
          content: parsedText
        }
      ],
      response_format: { type: "json_object" }
    });

    const raw = response.choices?.[0]?.message?.content;
    return normalizeAIResponse(raw);

  } catch (err) {
    // Azure OpenAI content filters block emails with harmful/suspicious content.
    // For a scam detector this is expected — treat it as a HIGH risk signal.
    const isContentFilter =
      err?.status === 400 &&
      err?.message?.toLowerCase().includes("content management policy");

    if (isContentFilter) {
      console.warn("Content filter triggered — email flagged as HIGH risk automatically.");
      return {
        risk: "HIGH",
        indicators: [
          "Azure OpenAI content filter triggered",
          `URL reputation: ${urlRisk}`,
          `Urgency signals detected: ${urgency}`
        ],
        explanation: "The email content triggered Azure OpenAI's content management policy, which is a strong indicator of malicious or highly suspicious content.",
        recommendation: "Do not interact with this email. Mark as spam or delete it."
      };
    }

    // Unexpected error — rethrow so the caller can handle it
    throw err;
  }
}

function normalizeAIResponse(raw) {
  if (typeof raw === "object" && raw !== null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return { raw };
    }
  }
  return { raw: String(raw) };
}

async function advisorAgent(analysis) {
  if (analysis && typeof analysis === "object") return analysis;

  return {
    risk: "UNKNOWN",
    indicators: [],
    explanation: "Unable to parse analysis output.",
    recommendation: `Raw response: ${JSON.stringify(analysis)}`
  };
}

function retrieveKnowledge(input) {
  const normalized = input.toLowerCase();
  return knowledgeBase
    .filter(() =>
      normalized.includes("earn") ||
      normalized.includes("urgent") ||
      normalized.includes("investment")
    )
    .map(item => item.text)
    .join("\n");
}