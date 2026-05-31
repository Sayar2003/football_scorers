const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedFetch = async (api, url, forceRefresh = false) => {
  const now = Date.now();
  
  if (!forceRefresh && cache.has(url)) {
    const { data, timestamp } = cache.get(url);
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const res = await api.get(url);
  cache.set(url, { data: res.data, timestamp: now });
  return res.data;
};

export const clearCache = () => cache.clear();