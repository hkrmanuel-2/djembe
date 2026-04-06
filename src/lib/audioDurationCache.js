// Cache of audio URL -> duration in seconds
// Preloaded when loops are fetched, so drops are instant
const durationCache = new Map();

export function getCachedDuration(url) {
  return durationCache.get(url) ?? null;
}

export function setCachedDuration(url, duration) {
  durationCache.set(url, duration);
}

export async function preloadDuration(url) {
  if (!url || durationCache.has(url)) return;
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      durationCache.set(url, audio.duration);
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      resolve(null);
    });
    audio.load();
  });
}

export async function preloadDurations(urls) {
  await Promise.all(urls.map(preloadDuration));
}
