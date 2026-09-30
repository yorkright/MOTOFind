import { ai, MODEL_NAME } from "./gemini";
import { rankSources } from "./sourceReliability";
import {
  getCachedSearch,
  setCachedSearch,
} from "./webSearchCache";
import {
  normalizeWebSearchResult,
} from "./webSearchNormalizer";

function extractGroundingSources(
  groundingMetadata
) {
  if (!groundingMetadata) {
    return [];
  }

  const chunks =
    groundingMetadata.groundingChunks || [];

  const rawSources = [];

  for (const chunk of chunks) {
    const web = chunk?.web;

    if (!web?.uri) {
      continue;
    }

    rawSources.push({
      title:
        web.title ||
        "Unknown source",

      url: web.uri,
    });
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

export async function searchWithGoogle(
  prompt
) {
  try {
    // ----------------------------------------
    // CHECK CACHE FIRST
    // ----------------------------------------

    const cachedResult =
      getCachedSearch(prompt);

    if (cachedResult) {
      console.log(
        "[Google Search] Returning cached result."
      );

      return cachedResult;
    }

    // ----------------------------------------
    // GOOGLE SEARCH
    // ----------------------------------------

    const response =
      await ai.models.generateContent({
        model: MODEL_NAME,

        contents: prompt,

        config: {
          tools: [
            {
              googleSearch: {},
            },
          ],
        },
      });

    // ----------------------------------------
    // EXTRACT GROUNDING METADATA
    // ----------------------------------------

    const groundingMetadata =
      response
        .candidates?.[0]
        ?.groundingMetadata ||
      null;

    // ----------------------------------------
    // EXTRACT + RANK SOURCES
    // ----------------------------------------

    const sources =
      extractGroundingSources(
        groundingMetadata
      );

    // ----------------------------------------
    // BUILD RAW SEARCH RESULT
    // ----------------------------------------

    const rawResult = {
      success: true,

      text:
        response.text || "",

      sources,

      groundingMetadata,
    };

    // ----------------------------------------
    // NORMALIZE SEARCH RESULT
    // ----------------------------------------
    //
    // This converts:
    //
    // text
    //   ↓
    // answer
    //
    // and adds:
    //
    // conflicts
    // metadata
    //
    // This is required by Level 4.10
    // and Level 4.12.
    // ----------------------------------------

    const result =
      normalizeWebSearchResult(
        rawResult
      );

    // ----------------------------------------
    // SAVE NORMALIZED RESULT TO CACHE
    // ----------------------------------------

    setCachedSearch(
      prompt,
      result
    );

    console.log(
      "[Google Search] Search completed."
    );

    console.log(
      "[Google Search] Sources:",
      sources
    );

    // ----------------------------------------
    // DEBUG: NORMALIZED RESULT
    // ----------------------------------------

    console.log(
      "[Google Search] Normalized result:",
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
      "[Google Search] Search failed:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Google Search failed.",
    };
  }
}