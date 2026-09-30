const cache = new Map();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function normalizeQuery(query) {
    if (typeof query !== "string") {
        return "";
    }

    return query
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function getCachedSearch(query) {
    const key = normalizeQuery(query);

    if (!key) {
        return null;
    }

    const cached = cache.get(key);

    if (!cached) {
        console.log("[Web Cache] MISS:", key);
        return null;
    }

    const isExpired =
        Date.now() - cached.timestamp > CACHE_TTL;

    if (isExpired) {
        console.log("[Web Cache] EXPIRED:", key);

        cache.delete(key);

        return null;
    }

    console.log("[Web Cache] HIT:", key);

    return cached.data;
}

export function setCachedSearch(query, data) {
    const key = normalizeQuery(query);

    if (!key) {
        return;
    }

    cache.set(key, {
        data,
        timestamp: Date.now(),
    });

    console.log("[Web Cache] STORED:", key);
}

export function clearSearchCache() {
    cache.clear();

    console.log("[Web Cache] CLEARED");
}