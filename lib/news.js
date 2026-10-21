import Parser from "rss-parser";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; IndiaCarMarketNews/1.0)",
  },
});

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FEEDS = [
  {
    name: "MotorBeam",
    url: "https://www.motorbeam.com/category/cars/feed/",
    priority: 3,
  },
  {
    name: "Autocar India",
    url: "https://www.autocarindia.com/rss/news",
    priority: 3,
  },
  {
    name: "Team-BHP",
    url: "https://www.team-bhp.com/rss-feed",
    priority: 2,
  },
  {
    name: "ETAuto Passenger Vehicles",
    url: "https://auto.economictimes.indiatimes.com/rss/passenger-vehicle",
    priority: 3,
  },
  {
    name: "Google News India",
    url:
      "https://news.google.com/rss/search?q=" +
      encodeURIComponent(
        '("car launch India" OR "car price India" OR "SUV India" OR "electric car India" OR "passenger vehicle sales India" OR "Maruti Suzuki" OR "Tata Motors" OR "Mahindra SUV") when:7d'
      ) +
      "&hl=en-IN&gl=IN&ceid=IN:en",
    priority: 2,
  },
];

const HIGH_PRIORITY_WORDS = [
  "india",
  "indian",
  "₹",
  "rs.",
  "rs ",
  "rupee",
  "maruti",
  "tata motors",
  "mahindra",
  "hyundai india",
  "kia india",
  "toyota kirloskar",
  "honda cars india",
  "mg motor india",
  "renault india",
  "skoda auto india",
  "volkswagen india",
  "nexa",
  "maruti arena",
  "bharat ncap",
  "global ncap",
];

const TOPIC_WORDS = [
  "launch",
  "launched",
  "price",
  "priced",
  "booking",
  "bookings",
  "sales",
  "suv",
  "hatchback",
  "sedan",
  "mpv",
  "ev",
  "electric",
  "hybrid",
  "cng",
  "mileage",
  "review",
  "facelift",
  "update",
  "recall",
  "gst",
  "market",
];

const EXCLUDE_WORDS = [
  "bike",
  "bikes",
  "motorcycle",
  "scooter",
  "scooters",
  "formul",
  "f1",
  "motogp",
  "rally",
  "truck",
  "trucks",
  "bus",
  "buses",
  "commercial vehicle",
];

function cleanTitle(title = "") {
  return title
    .replace(/ - MotorBeam$/i, "")
    .replace(/ - Autocar India$/i, "")
    .replace(/ - ET Auto$/i, "")
    .replace(/ - The Economic Times$/i, "")
    .replace(/ - Team-BHP$/i, "")
    .trim();
}

function getRelevanceScore(article, feedPriority) {
  const text = `${article.title} ${article.snippet}`.toLowerCase();

  let score = feedPriority;

  HIGH_PRIORITY_WORDS.forEach((word) => {
    if (text.includes(word)) score += 3;
  });

  TOPIC_WORDS.forEach((word) => {
    if (text.includes(word)) score += 1;
  });

  EXCLUDE_WORDS.forEach((word) => {
    if (text.includes(word)) score -= 4;
  });

  return score;
}

function isProbablyIndianCarNews(article) {
  const text = `${article.title} ${article.snippet}`.toLowerCase();

  const hasCarTopic = [
    "car",
    "suv",
    "hatchback",
    "sedan",
    "mpv",
    "ev",
    "electric",
    "hybrid",
    "cng",
    "maruti",
    "tata",
    "mahindra",
    "hyundai",
    "kia",
    "toyota",
    "honda",
    "renault",
    "skoda",
    "volkswagen",
    "mg",
    "nexa",
  ].some((word) => text.includes(word));

  const isExcluded = EXCLUDE_WORDS.some((word) => text.includes(word));

  return hasCarTopic && !isExcluded;
}

export async function getIndiaCarNews() {
  const cacheKey = "india-car-market-news-v2";
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      articles: Array.isArray(cached.data) ? cached.data : [],
      lastUpdated: new Date(cached.timestamp).toISOString(),
    };
  }

  const feedResults = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);

      return (parsed.items || []).map((item) => ({
        id: item.guid || item.link || item.title,
        title: cleanTitle(item.title),
        url: item.link,
        source: feed.name,
        publishedAt: item.isoDate || item.pubDate,
        snippet: item.contentSnippet || "",
        feedPriority: feed.priority,
      }));
    })
  );

  const allArticles = feedResults
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter(isProbablyIndianCarNews)
    .map((article) => ({
      ...article,
      relevanceScore: getRelevanceScore(article, article.feedPriority),
    }));

  const seen = new Set();

  const uniqueArticles = allArticles.filter((article) => {
    const key = (article.title || "").toLowerCase().slice(0, 80);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });

  uniqueArticles.sort((a, b) => {
    const dateDiff =
      new Date(b.publishedAt) - new Date(a.publishedAt);

    // Prioritize relevant Indian car-market stories,
    // but still keep newer articles visible.
    return b.relevanceScore * 1000 + dateDiff / 1000000000 >
      a.relevanceScore * 1000 + dateDiff / 1000000000
      ? 1
      : -1;
  });

  const articles = uniqueArticles.slice(0, 30);
  const timestamp = Date.now();

  cache.set(cacheKey, {
    timestamp,
    data: articles,
  });

  return {
    articles,
    lastUpdated: new Date(timestamp).toISOString(),
  };
}