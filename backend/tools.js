 
export function checkUrlReputation(url) {
  if (url.includes("crypto") || url.includes("fastmoney")) {
    return "HIGH RISK";
  }
  return "SAFE";
}

export function detectUrgency(text) {
  return text.includes("urgent") || text.includes("act now");
}