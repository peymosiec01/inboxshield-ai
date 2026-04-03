import fs from "fs/promises";
const TOKEN_FILE = "./tokens.json";

export async function saveTokens(tokens) {
  await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens), "utf8");
}

export async function loadTokens() {
  try {
    const content = await fs.readFile(TOKEN_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}