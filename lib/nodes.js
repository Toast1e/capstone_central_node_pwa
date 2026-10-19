// All the leaf node API calls in one place.
// Put this file in lib/ next to api.js, then import what you need:
//   import { getLeafNodeCards } from "@/lib/nodes";
import { apiFetch } from "./api";

/**
 * GET /api/leafnodes  (or ?ids=1,2 for just those nodes)
 * { count, leafNodes: [ { ...leafnode row incl. leafNodeLatitude / leafNodeLongitude,
 *                         readingCount, readings: [ 50 newest ] } ] }
 */
export const getLeafNodes = (ids) =>
  apiFetch(ids?.length ? `/api/leafnodes?ids=${ids.join(",")}` : "/api/leafnodes");

/**
 * GET /api/leafnodes/status
 * { count, serverTime, leafNodes: [ { leafNodeID, leafNodeName, leafNodeBattery,
 *   lastConnectedAt, blockID, leafNodeRow, rssi, snr, connection: "GOOD" | "LOW" | "NONE" } ] }
 */
export const getLeafNodesStatus = () => apiFetch("/api/leafnodes/status");

/**
 * What the Nodes page needs: the status of every node (incl. its connection)
 * together with its coordinates. Fetches both endpoints and joins them by leafNodeID.
 */
export async function getLeafNodeCards() {
  const [all, status] = await Promise.all([getLeafNodes(), getLeafNodesStatus()]);
  const byID = new Map(all.leafNodes.map((node) => [node.leafNodeID, node]));

  return status.leafNodes.map((node) => {
    // drop the readings: the Nodes page doesn't use them
    const { readings, readingCount, ...row } = byID.get(node.leafNodeID) ?? {};
    return { ...row, ...node };
  });
}