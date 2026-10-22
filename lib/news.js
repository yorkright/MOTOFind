

import Parser from "rss-parser";

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; IndiaCarMarketNews/1.0)",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
});

const cache = new Map();
const imageCache = new Map();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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

function extractRssImage(item) {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  if (item["media:content"]?.$?.url) {
    return item["media:content"].$.url;
  }

  if (item["media:thumbnail"]?.$?.url) {
    return item["media:thumbnail"].$.url;
  }

  const content =
    item["content:encoded"] || item.content || item.contentSnippet || "";

  const imageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);

  return imageMatch ? imageMatch[1] : null;
}

async function extractImageFromArticlePage(url) {
  const cachedImage = imageCache.get(url);

  if (
    cachedImage &&
    Date.now() - cachedImage.timestamp < IMAGE_CACHE_TTL
  ) {
    return cachedImage.image;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IndiaCarMarketNews/1.0)",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      imageCache.set(url, {
        timestamp: Date.now(),
        image: null,
      });

      return null;
    }

    const html = await res.text();

    const ogImage =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );

    const twitterImage =
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
      );

    const image = ogImage?.[1] || twitterImage?.[1] || null;

    imageCache.set(url, {
      timestamp: Date.now(),
      image,
    });

    return image;
  } catch {
    imageCache.set(url, {
      timestamp: Date.now(),
      image: null,
    });

    return null;
  }
}

async function enrichTopArticlesWithImages(articles, limit = 12) {
  const articlesToEnrich = articles
    .slice(0, limit)
    .filter((article) => !article.image);

  const batchSize = 4;

  for (let i = 0; i < articlesToEnrich.length; i += batchSize) {
    const batch = articlesToEnrich.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (article) => {
        const image = await extractImageFromArticlePage(article.url);

        if (image) {
          article.image = image;
        }
      })
    );
  }

  return articles;
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
  const cacheKey = "india-car-market-news-v5";
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      articles: Array.isArray(cached.data) ? cached.data : [],
      topStories: Array.isArray(cached.topStories)
        ? cached.topStories
        : [],
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
        image: extractRssImage(item),
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
    const scoreDifference = b.relevanceScore - a.relevanceScore;

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  const articles = uniqueArticles.slice(0, 30);

  const articlesWithTopImages = await enrichTopArticlesWithImages(
    articles,
    12
  );

  const topStories = articlesWithTopImages.slice(0, 5);
  const timestamp = Date.now();

  cache.set(cacheKey, {
    timestamp,
    data: articlesWithTopImages,
    topStories,
  });

  return {
    articles: articlesWithTopImages,
    topStories,
    lastUpdated: new Date(timestamp).toISOString(),
  };
}

export async function getArticleImage(articleUrl) {
  return extractImageFromArticlePage(articleUrl);
}