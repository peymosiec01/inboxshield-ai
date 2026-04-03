import { getAccessToken } from "./auth.js";

export async function getEmail(messageId) {
  const token = await getAccessToken();

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return await res.json();
}
