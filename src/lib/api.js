// Where the central node's API is.
//
// On the Pi the app and the API share one address: NGINX serves the app and
// passes /api/ on to the ingest service. The Pi's build sets no
// NEXT_PUBLIC_API_URL, so the address is empty and every request is relative
// (fetch("/api/alerts")).
//
// `npm run dev` has no NGINX in front of it. There, set the address in
// .env.local (see the README), e.g. NEXT_PUBLIC_API_URL=http://localhost:8000
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiFetch(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}
