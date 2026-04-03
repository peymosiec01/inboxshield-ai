 
import { getEmail } from "./mail.js";
import { analyzeWithAI } from "./ai.js";

export async function processEmail(messageId) {
  const email = await getEmail(messageId);

  const subject = email.subject;
  const body = email.body?.content || "";

  const result = await analyzeWithAI(subject, body);

  console.log("Analysis result:", result);
}