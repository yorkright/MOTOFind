const OFFICIAL_DOMAINS = [
  "tatamotors.com",
  "hyundai.com",
  "marutisuzuki.com",
  "mahindra.com",
  "kia.com",
  "toyotabharat.com",
  "hondacarindia.com",
  "skoda-auto.co.in",
  "volkswagen.co.in",
  "mgmotor.co.in",
  "nissan.in",
  "renault.co.in",
  "jeep-india.com",
  "citroen.in",
  "byd.com",
  "bmw.in",
  "mercedes-benz.co.in",
  "audi.in",
  "volvocars.com",
];

const ESTABLISHED_AUTO_DOMAINS = [
  "autocarindia.com",
  "cardekho.com",
  "carwale.com",
  "zigwheels.com",
  "cars24.com",
  "spinny.com",
];

function normalizeHostname(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const hostname = new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "");

    return hostname;
  } catch {
    return null;
  }
}

function domainMatches(hostname, domains) {
  if (!hostname) {
    return false;
  }

  return domains.some(
    (domain) =>
      hostname === domain ||
      hostname.endsWith(`.${domain}`)
  );
}

export function classifySource(source = {}) {
  const title =
    typeof source.title === "string"
      ? source.title.toLowerCase()
      : "";

  const hostname = normalizeHostname(source.url);

  /*
   * Google grounding may return redirect URLs such as:
   *
   * vertexaisearch.cloud.google.com/grounding-api-redirect/...
   *
   * In that situation, the original domain may be visible
   * in the source title instead.
   */

  const sourceText = `${title} ${hostname || ""}`;

  if (
    domainMatches(hostname, OFFICIAL_DOMAINS) ||
    OFFICIAL_DOMAINS.some((domain) =>
      sourceText.includes(domain)
    )
  ) {
    return {
      tier: 1,
      reliability: "official",
    };
  }

  if (
    domainMatches(hostname, ESTABLISHED_AUTO_DOMAINS) ||
    ESTABLISHED_AUTO_DOMAINS.some((domain) =>
      sourceText.includes(domain)
    )
  ) {
    return {
      tier: 2,
      reliability: "established",
    };
  }

  return {
    tier: 3,
    reliability: "other",
  };
}

export function rankSources(sources = []) {
  if (!Array.isArray(sources)) {
    return [];
  }

  return sources
    .map((source) => {
      const classification = classifySource(source);

      return {
        ...source,
        ...classification,
      };
    })
    .sort((a, b) => a.tier - b.tier);
}