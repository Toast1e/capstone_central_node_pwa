import { API_URL } from "./api";


export async function downloadReadings({ from, to, ids, fields, format }) {
  const params = new URLSearchParams({ from, to, format });
  if (ids?.length) params.set("ids", ids.join(","));
  if (fields?.length) params.set("fields", fields.join(","));

  const response = await fetch(`${API_URL}/api/export/readings?${params}`);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // body wasn't JSON: keep the status message
    }
    throw new Error(message);
  }

  // turn the response into a file and click a hidden link to save it
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // same name the API uses; built here because the browser can't read Content-Disposition across origins
  link.download = `vitisense_${from}_to_${to}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}