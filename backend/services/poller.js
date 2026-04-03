import { getAccessToken } from "./auth.js";

const POLL_INTERVAL_MS = 30_000;

let lastCheckedAt = new Date().toISOString();
let pollTimer = null;

export function startPolling(onNewMessage) {
  if (pollTimer) return;

  console.log(
    `Polling for new mail every ${POLL_INTERVAL_MS / 1000}s (personal MSA account; webhooks not supported).`
  );

  pollTimer = setInterval(async () => {
    try {
      const messages = await fetchNewMessages(lastCheckedAt);
      if (messages.length) {
        console.log(`Found ${messages.length} new message(s).`);
        lastCheckedAt = new Date().toISOString();

        for (const msg of messages) {
          await onNewMessage(msg.id);
        }
      }
    } catch (err) {
      console.error("Polling error:", err.message);
    }
  }, POLL_INTERVAL_MS);
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log("Polling stopped.");
  }
}

async function fetchNewMessages(since) {
  const token = await getAccessToken();
  const filter = encodeURIComponent(`receivedDateTime gt ${since}`);
  const url = `https://graph.microsoft.com/v1.0/me/messages?$filter=${filter}&$select=id,subject,receivedDateTime&$top=20&$orderby=receivedDateTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  const data = await res.json();
  return data.value ?? [];
}
