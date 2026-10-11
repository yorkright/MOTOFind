function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildEvidenceSummary(
  result = {}
) {
  const answer =
    cleanText(result.answer);

  const sources =
    Array.isArray(result.sources)
      ? result.sources
      : [];

  const sourceCount =
    sources.length;

  const hasOfficialSource =
    sources.some(
      (source) =>
        source?.tier === 1
    );

  const hasEstablishedSource =
    sources.some(
      (source) =>
        source?.tier === 2
    );

  return {
    hasAnswer:
      answer.length > 0,

    answerLength:
      answer.length,

    sourceCount,

    hasOfficialSource,

    hasEstablishedSource,

    hasEvidence:
      answer.length > 0 ||
      sourceCount > 0,
  };
}

export function buildEvidenceContext(
  result = {}
) {
  const answer =
    cleanText(result.answer);

  const conflicts =
    result.conflicts || {};

  const freshness =
    result.freshness || {};

  const evidence =
    buildEvidenceSummary(result);

  return `
EVIDENCE CONTROL

Retrieved evidence:
${answer || "No textual evidence was returned."}

Evidence summary:
- Evidence available: ${evidence.hasEvidence}
- Source count: ${evidence.sourceCount}
- Official source available: ${evidence.hasOfficialSource}
- Established automotive source available: ${evidence.hasEstablishedSource}
- Answer length: ${evidence.answerLength}

Conflict detected:
${
  conflicts.hasConflict
    ? "Yes"
    : "No"
}

Fresh information requested:
${
  freshness.requiresFreshData
    ? "Yes"
    : "No"
}

Evidence rules:

1. Treat retrieved tool results as the factual evidence for this request.

2. Do not invent vehicle prices, specifications, features, mileage, availability, launch dates, variants, or other factual claims that are not supported by the retrieved evidence.

3. If the evidence does not contain an answer to the user's question, clearly say that the requested information could not be verified.

4. Do not fill missing information using general model knowledge when the user is asking for current or real-world vehicle information.

5. If only part of the user's question is supported, answer the supported part and clearly identify what could not be verified.

6. Never convert an inference into a confirmed fact.

7. If sources disagree, acknowledge the disagreement rather than silently inventing a resolution.

8. If the evidence contains a price, preserve its price context:
   - ex-showroom
   - on-road
   - starting price
   - variant price
   - approximate price

9. If freshness is required but the evidence does not establish that the information is current, communicate that limitation.

10. Never claim that you checked a source unless that source appears in the retrieved evidence.
`;
}