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

export const renameLeafNode = (leafNodeID, name) =>
  apiFetch(`/api/leafnodes/${leafNodeID}/name`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

export const updateLeafNodeCoordinates = (leafNodeID, latitude, longitude) =>
  apiFetch(`/api/leafnodes/${leafNodeID}/coordinates`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });

export const clearLeafNodeCoordinates = (leafNodeID) =>
  apiFetch(`/api/leafnodes/${leafNodeID}/location`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: null, longitude: null }),
  });

/**
 * What the Nodes page needs: the status of every node (incl. its connection)
 * together with its coordinates. Fetches both endpoints and joins them by leafNodeID.
 *
 * returns { serverTime, leafNodes }. serverTime is the Pi's clock in unix seconds,
 * the same clock as lastConnectedAt and the readings' receivedAt.
 */
export async function getLeafNodeCards() {
  const [all, status] = await Promise.all([getLeafNodes(), getLeafNodesStatus()]);
  const byID = new Map(all.leafNodes.map((node) => [node.leafNodeID, node]));

  const leafNodes = status.leafNodes.map((node) => {
    // drop the readings: the Nodes page doesn't use them
    const { readings, readingCount, ...row } = byID.get(node.leafNodeID) ?? {};
    return { ...row, ...node };
  });
  return { serverTime: status.serverTime, leafNodes };
}

// The backend counts a leaf node as offline after this long without a reading
// (OFFLINE_AFTER_S in the backend's ingest/app.py). A longer gap between two
// readings means the node was down, so its uptime starts again after the gap.
const OFFLINE_AFTER_S = 150 * 60;

// Uptime is worked out from the last 7 days of readings. It is the same request
// as the Home page's 7-day chart, so the service worker has usually cached it.
const UPTIME_HISTORY_HOURS = 168;

/**
 * How long a leaf node has been sending readings without a break.
 * Leaf nodes don't report their own uptime, so it comes from their readings:
 * the time since the first reading after the last gap longer than OFFLINE_AFTER_S.
 *
 * node  a leaf node from getLeafNodeCards() (uses leafNodeID and leafNodeInstalledAt)
 * now   the Pi's clock in unix seconds (serverTime), so a phone set to the wrong time can't skew it
 * returns { seconds, atLeast }, where atLeast means it has been up for longer than the
 *         7 days of readings looked at, or null when there are no readings to go on
 */
export async function getLeafNodeUptime(node, now) {
  const { reading } = await apiFetch(
    `/api/history?hours=${UPTIME_HISTORY_HOURS}&leafNodeID=${node.leafNodeID}`,
  );
  // when the Pi received each reading, oldest first
  const times = reading
    .map((r) => r.receivedAt)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (times.length === 0) return null;

  // the start of the newest unbroken run of readings
  let startIndex = 0;
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] > OFFLINE_AFTER_S) startIndex = i;
  }

  // No break in the 7 days, the first reading is right at the start of them, and the
  // node was first heard before that: it was already up before the readings begin.
  const windowStart = now - UPTIME_HISTORY_HOURS * 3600;
  const upBeforeWindow =
    startIndex === 0 &&
    times[0] - windowStart <= OFFLINE_AFTER_S &&
    node.leafNodeInstalledAt < windowStart;
  if (upBeforeWindow) return { seconds: now - windowStart, atLeast: true };

  return { seconds: Math.max(now - times[startIndex], 0), atLeast: false };
}