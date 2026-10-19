export const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}