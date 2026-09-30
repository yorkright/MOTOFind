const cache = new Map();

export function getCachedCars(key) {
    // return cached data
}

export function setCachedCars(key, data) {
    // save data
}

async function getCarData(filters) {

    const cacheKey = createCacheKey(filters);

    const cached = await getCachedCars(cacheKey);

    if (cached && !isExpired(cached)) {
        return cached;
    }

    const freshData = await webSearchCars(filters);

    await saveToCache(cacheKey, freshData);

    return freshData;
}