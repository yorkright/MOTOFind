export function normalizeWebSearchResult(result = {}) {
  const text =
    typeof result.text === "string"
      ? result.text.trim()
      : "";

  const sources =
    Array.isArray(result.sources)
      ? result.sources
      : [];

  const normalizedSources = sources
    .filter(
      (source) =>
        source &&
        typeof source.url === "string"
    )
    .map((source) => ({
      title:
        typeof source.title === "string"
          ? source.title
          : "Unknown source",

      url: source.url,

      tier:
        typeof source.tier === "number"
          ? source.tier
          : 3,

      reliability:
        typeof source.reliability === "string"
          ? source.reliability
          : "other",
    }));

  const hasOfficialSource =
    normalizedSources.some(
      (source) => source.tier === 1
    );

  const hasEstablishedSource =
    normalizedSources.some(
      (source) => source.tier === 2
    );

  return {
    success:
      result.success === true,

    answer: text,

    sources: normalizedSources,

    metadata: {
      sourceCount:
        normalizedSources.length,

      hasOfficialSource,

      hasEstablishedSource,
    },
  };
}