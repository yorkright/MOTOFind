import { searchWithGoogle } from "@/lib/ai/webSearch";

export async function searchWebCars({ query }) {
  if (
    typeof query !== "string" ||
    query.trim().length === 0
  ) {
    return {
      success: false,
      error: "A valid search query is required.",
    };
  }

  try {
    const result = await searchWithGoogle(query.trim());

    if (!result?.success) {
      return {
        success: false,
        error:
          result?.error ||
          "Unable to retrieve current information from the web.",
      };
    }

    return {
      success: true,

      data: {
        answer: result.answer || "",

        sources: Array.isArray(result.sources)
          ? result.sources
          : [],

        conflicts: result.conflicts || {
          hasConflict: false,
          conflictTypes: [],
          price: {
            hasConflict: false,
            values: [],
          },
        },

        metadata: result.metadata || {
          sourceCount: 0,
          hasOfficialSource: false,
          hasEstablishedSource: false,
          hasConflict: false,
        },
      },
    };
  } catch (error) {
    console.error(
      "[search_web] Search failed:",
      error
    );

    return {
      success: false,
      error:
        "Unable to retrieve current information from the web.",
    };
  }
}