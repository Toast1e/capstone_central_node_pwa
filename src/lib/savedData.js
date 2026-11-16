// ------ What's saved on the phone ------
// The service worker (src/app/sw.js) saves the central node's answers as they
// pass through, and ConnectionContext tops them up every few minutes while the
// central node is in reach. This reads them back.
import { API_URL } from "./api";
import { API_CACHE_NAME } from "./offlineConfig";

// when the readings were last saved, in localStorage
const SAVED_AT_KEY = "vitisense-readings-saved-at";

/**
 * The answer to `path` saved on the phone, e.g. readSaved("/api/alerts").
 * null when none is saved, or the browser has nowhere to save (it needs HTTPS or localhost).
 * The path must be written exactly as it was asked for, parameters in the same order.
 */
export async function readSaved(path) {
  if (!("caches" in globalThis)) return null;
  try {
    // ignoreVary: the saved answer counts whatever headers the request had
    const saved = await caches.match(`${API_URL}${path}`, { cacheName: API_CACHE_NAME, ignoreVary: true });
    return saved ? await saved.json() : null;
  } catch {
    return null;
  }
}

// call when everything the offline pages show has just been saved
export function markReadingsSaved() {
  try {
    localStorage.setItem(SAVED_AT_KEY, String(Date.now()));
  } catch {
    // storage blocked (e.g. private browsing): the time just isn't shown
  }
}

// when the readings were last saved on this phone, in milliseconds, or null if they never were
export function getReadingsSavedAt() {
  try {
    const saved = Number(localStorage.getItem(SAVED_AT_KEY));
    return saved > 0 ? saved : null;
  } catch {
    return null;
  }
}
