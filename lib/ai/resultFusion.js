
function normalizeLocalResult(result) {
  if (!result || typeof result !== "object") {
    return {
      success: false,
      cars: [],
      error: "Local inventory results are unavailable.",
    };
  }

  return {
    success: result.success === true,

    count:
      typeof result.count === "number"
        ? result.count
        : Array.isArray(result.cars)
          ? result.cars.length
          : 0,

    cars: Array.isArray(result.cars)
      ? result.cars
      : [],

    appliedFilters:
      result.appliedFilters || {},

    error: result.success === false
      ? result.error || "Local inventory search failed."
      : null,
  };
}

function normalizeWebResult(result) {
  if (!result || typeof result !== "object") {
    return {
      success: false,
      answer: "",
      sources: [],
      error: "Web search results are unavailable.",
    };
  }

  return {
    success: result.success === true,

    answer:
      typeof result.answer === "string"
        ? result.answer
        : "",

    sources: Array.isArray(result.sources)
      ? result.sources
      : [],

    conflicts:
      result.conflicts || {
        hasConflict: false,
        conflictTypes: [],
        price: {
          hasConflict: false,
          values: [],
        },
      },

    freshness:
      result.freshness || {
        requiresFreshData: false,
        intent: "general",
        detectedYear: null,
        freshnessWarning: null,
      },

    metadata: result.metadata || {},

    error: result.success === false
      ? result.error || "Web search failed."
      : null,
  };
}

export function fuseResults({
  localResult = null,
  webResult = null,
} = {}) {
  const local = normalizeLocalResult(localResult);
  const web = normalizeWebResult(webResult);

  const localAvailable =
    local.success && local.cars.length > 0;

  const webAvailable =
    web.success &&
    (web.answer.length > 0 || web.sources.length > 0);

  return {
    success: localAvailable || webAvailable,

    local,
    web,

    summary: {
      localAvailable,
      webAvailable,

      localCarCount: local.cars.length,
      webSourceCount: web.sources.length,

      hasEvidence: localAvailable || webAvailable,
    },
  };
}
