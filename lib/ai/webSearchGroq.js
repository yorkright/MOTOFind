import { groq, MODEL_NAME } from "./Groq";
import { rankSources } from "./sourceReliability";
import {
  getCachedSearch,
  setCachedSearch,
} from "./webSearchCache";
import {
  normalizeWebSearchResult,
} from "./webSearchNormalizer";

// Separate cache namespace so Gemini and Groq results
// for the same prompt never overwrite each other.
const CACHE_PREFIX = "groq:";

// ----------------------------------------
// HELPERS
// ----------------------------------------

// Groq browser search puts citation markers like 【2†L6-L10】
// inside the answer text. Strip them for clean output.
function cleanCitationMarkers(text) {
  return (text || "")
    .replace(/【[^】]*】/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractUrlsFromText(text) {
  const matches =
    (text || "").match(/https?:\/\/[^\s)\]】"'<>]+/g) ||
    [];

  return matches.map((url) => ({
    title: "Unknown source",
    url: url.replace(/[.,;]+$/, ""),
  }));
}

function extractGroqSources(message) {
  if (!message) {
    return [];
  }

  const rawSources = [];

  // ----------------------------------------
  // PRIMARY: executed_tools search results
  // ----------------------------------------

  const executedTools =
    message.executed_tools || [];

  for (const tool of executedTools) {
    const results =
      tool?.search_results?.results || [];

    for (const item of results) {
      if (!item?.url) {
        continue;
      }

      rawSources.push({
        title:
          item.title ||
          "Unknown source",

        url: item.url,
      });
    }
  }

  // ----------------------------------------
  // FALLBACK: URLs found inside the answer
  // ----------------------------------------

  if (rawSources.length === 0) {
    rawSources.push(
      ...extractUrlsFromText(
        message.content
      )
    );
  }

  // ----------------------------------------
  // REMOVE DUPLICATE SOURCES
  // ----------------------------------------

  const uniqueSources =
    Array.from(
      new Map(
        rawSources.map((source) => [
          source.url,
          source,
        ])
      ).values()
    );

  // ----------------------------------------
  // RANK SOURCE RELIABILITY
  // ----------------------------------------

  const rankedSources =
    rankSources(
      uniqueSources
    );

  return rankedSources;
}

export async function searchWithGroq(
  prompt
) {
  try {
    // ----------------------------------------
    // CHECK CACHE FIRST
    // ----------------------------------------

    const cacheKey =
      `${CACHE_PREFIX}${prompt}`;

    const cachedResult =
      getCachedSearch(cacheKey);

    if (cachedResult) {
      console.log(
        "[Groq Search] Returning cached result."
      );

      return cachedResult;
    }

    // ----------------------------------------
    // GROQ BROWSER SEARCH
    // ----------------------------------------

    const response =
      await groq.chat.completions.create({
        model: MODEL_NAME,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        tools: [
          {
            type: "browser_search",
          },
        ],

        // Forces the model to actually search the web
        tool_choice: "required",

        // Recommended by Groq docs for browser search
        reasoning_effort: "low",

        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: false,
      });

    // ----------------------------------------
    // EXTRACT MESSAGE
    // ----------------------------------------

    const message =
      response.choices?.[0]?.message ||
      null;

    console.log(
      "[Groq Search] Raw message keys:",
      message
        ? Object.keys(message)
        : []
    );

    // ----------------------------------------
    // EXTRACT + RANK SOURCES
    // ----------------------------------------

    const sources =
      extractGroqSources(message);

    // ----------------------------------------
    // BUILD RAW SEARCH RESULT
    // ----------------------------------------

    const rawResult = {
      success: true,

      text: cleanCitationMarkers(
        message?.content
      ),

      sources,

      // Groq has no groundingMetadata.
      // Kept as null so the normalizer's
      // input shape matches webSearch.js.
      groundingMetadata: null,
    };

    // ----------------------------------------
    // NORMALIZE SEARCH RESULT
    // ----------------------------------------

    const result =
      normalizeWebSearchResult(
        rawResult
      );

    // ----------------------------------------
    // SAVE NORMALIZED RESULT TO CACHE
    // ----------------------------------------

    setCachedSearch(
      cacheKey,
      result
    );

    console.log(
      "[Groq Search] Search completed."
    );

    console.log(
      "[Groq Search] Sources:",
      sources
    );

    // ----------------------------------------
    // DEBUG: NORMALIZED RESULT
    // ----------------------------------------

    console.log(
      "[Groq Search] Normalized result:",
      {
        answerLength:
          result.answer?.length || 0,

        sourceCount:
          result.metadata
            ?.sourceCount || 0,

        hasOfficialSource:
          result.metadata
            ?.hasOfficialSource || false,

        hasEstablishedSource:
          result.metadata
            ?.hasEstablishedSource ||
          false,

        hasConflict:
          result.metadata
            ?.hasConflict || false,
      }
    );

    return result;
  } catch (error) {
    console.error(
      "[Groq Search] Search failed:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Groq Search failed.",
    };
  }
}