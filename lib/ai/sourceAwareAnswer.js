export function buildSourceAwareContext(result = {}) {
  if (!result || typeof result !== "object") {
    return "";
  }

  const answer =
    typeof result.answer === "string"
      ? result.answer
      : "";

  const sources =
    Array.isArray(result.sources)
      ? result.sources
      : [];

  const conflicts =
    result.conflicts || {};

  const metadata =
    result.metadata || {};

  const sourceLines = sources
    .slice(0, 10)
    .map((source, index) => {
      const tier =
        typeof source.tier === "number"
          ? source.tier
          : 3;

      const reliability =
        source.reliability || "other";

      const title =
        source.title || "Unknown source";

      return `${index + 1}. ${title} | Tier ${tier} | ${reliability}`;
    })
    .join("\n");

  const conflictStatus =
    conflicts.hasConflict ||
    metadata.hasConflict
      ? "Potential conflict detected."
      : "No detected conflict.";

  return `
WEB SEARCH RESULT

Answer:
${answer}

Source reliability:
${sourceLines || "No sources available."}

Conflict status:
${conflictStatus}

Source rules:
- Tier 1 = official manufacturer or primary source.
- Tier 2 = established automotive source.
- Tier 3 = other source.
- Prefer Tier 1 when directly relevant.
- Do not claim that different prices conflict unless they refer to the same price type, model, variant, and relevant time period.
- Clearly distinguish ex-showroom, on-road, starting price, variant price, and approximate price.
- Do not invent information that is not supported by the search result.
`;
}