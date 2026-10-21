import Parser from "rss-parser";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "cars OR automobiles OR electric vehicles";
  const encodedQuery = encodeURIComponent(query);

  const feedUrl = `https://news.google.com/rss/search?q=${encodedQuery}+when:7d&hl=en-US&gl=US&ceid=US:en`;

  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.slice(0, 20).map((item, index) => ({
      id: item.guid || `${index}-${item.link}`,
      title: item.title,
      link: item.link,
      publishedAt: item.pubDate,
      source:
        item.creator ||
        item.link?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] ||
        "News",
      snippet: item.contentSnippet || "",
    }));

    return Response.json({ articles });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Unable to load car news right now." },
      { status: 500 }
    );
  }
}

