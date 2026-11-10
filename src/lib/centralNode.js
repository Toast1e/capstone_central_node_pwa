// All the central node API calls in one place.
// Put this file in lib/ next to api.js, then import what you need:
//   import { getCentralNodeName, renameCentralNode } from "@/lib/centralNode";
import { apiFetch } from "./api";


export const getCentralNode = () => apiFetch("/api/centralnode");


export async function getCentralNodeName() {
  const centralNode = await getCentralNode();
  return centralNode.name;
}


export const renameCentralNode = (name) =>
  apiFetch("/api/centralnode", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });