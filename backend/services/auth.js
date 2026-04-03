import dotenv from "dotenv";
import { loadTokens, saveTokens } from "./tokenStore.js";

dotenv.config();

const tenant = process.env.TENANT_ID || "common";
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.AUTH_REDIRECT_URI || "http://localhost:3001/auth/callback";
const authorizeEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;
const tokenEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
const scopes = [
  "openid",
  "offline_access",
  "Mail.Read",
  "Mail.ReadWrite"
].join(" ");

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: scopes
  });
  return `${authorizeEndpoint}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope: scopes
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  const tokens = buildTokenStore(data);
  await saveTokens(tokens);
  return tokens;
}

export async function getAuthStatus() {
  const tokens = await loadTokens();
  return {
    hasTokens: Boolean(tokens.access_token),
    expiresAt: tokens.expires_at,
    refreshTokenExists: Boolean(tokens.refresh_token)
  };
}

export async function getAccessToken() {
  const tokens = await loadTokens();
  if (!tokens.refresh_token) {
    throw new Error("No refresh token available. Sign in first.");
  }

  if (!tokens.access_token || Date.now() >= tokens.expires_at) {
    return await refreshAccessToken(tokens.refresh_token);
  }

  return tokens.access_token;
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    redirect_uri: redirectUri,
    scope: scopes
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  const tokens = buildTokenStore(data, refreshToken);
  await saveTokens(tokens);

  return tokens.access_token;
}

function buildTokenStore(data, fallbackRefreshToken) {
  const expiresIn = parseInt(data.expires_in, 10);
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || fallbackRefreshToken,
    expires_at: Date.now() + expiresIn * 1000
  };
}
