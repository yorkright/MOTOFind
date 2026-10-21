import { searchWithGoogle } from "./webSearch";
import { searchWithGroq } from "./webSearchGroq";

// After a quota/overload failure, skip Gemini for a while
// instead of failing a request on every search.
const GEMINI_COOLDOWN_MS = 10 * 60 * 1000;

let geminiBlockedUntil = 0;

function isQuotaOrOverloadError(message = "") {
  return /429|RESOURCE_EXHAUSTED|quota|503|UNAVAILABLE|overloaded/i.test(
    message
  );
}

export async function searchWeb(prompt) {
  // ----------------------------------------
  // PRIMARY: GOOGLE SEARCH (GEMINI)
  // ----------------------------------------

  if (Date.now() >= geminiBlockedUntil) {
    const googleResult = await searchWithGoogle(prompt);

    if (googleResult?.success) {
      console.log("[Web Search] Provider: gemini");

      return googleResult;
    }

    console.warn(
      "[Web Search] Gemini search failed, trying Groq:",
      googleResult?.error?.slice?.(0, 200) || googleResult?.error
    );

    if (isQuotaOrOverloadError(googleResult?.error)) {
      geminiBlockedUntil =
        Date.now() + GEMINI_COOLDOWN_MS;

      console.warn(
        "[Web Search] Gemini search paused for 10 minutes."
      );
    }
  } else {
    console.log(
      "[Web Search] Gemini on cooldown, using Groq directly."
    );
  }

  // ----------------------------------------
  // FALLBACK: GROQ BROWSER SEARCH
  // ----------------------------------------

  const groqResult = await searchWithGroq(prompt);

  if (groqResult?.success) {
    console.log("[Web Search] Provider: groq");
  }

  return groqResult;
}