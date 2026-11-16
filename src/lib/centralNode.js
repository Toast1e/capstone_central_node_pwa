// All the central node API calls in one place.
// Put this file in lib/ next to api.js, then import what you need:
//   import { getCentralNodeName, renameCentralNode } from "@/lib/centralNode";
import { apiFetch } from "./api";


export const getCentralNode = () => apiFetch("/api/centralnode");


export async function getCentralNodeName() {
  const centralNode = await getCentralNode();
  return centralNode.name;
}


// The LoRa receiver plugged into the Pi sends a heartbeat once a minute. One
// older than this means it has stopped, or its wire to the Pi is loose
// (gateway_heartbeat_age_s in the backend's README).
const HEARTBEAT_LOST_AFTER_S = 120;

/**
 * GET /api/status
 * How long the LoRa receiver has been running, from its last heartbeat (uptime_s).
 *
 * returns { uptimeSeconds, stoppedFor }
 *   uptimeSeconds  null until the Pi has heard a heartbeat
 *   stoppedFor     seconds since the last heartbeat, only set once it's too old to trust
 */
export async function getReceiverUptime() {
  const status = await apiFetch("/api/status");
  const uptime = status.gateway_heartbeat?.uptime_s;
  const age = status.gateway_heartbeat_age_s;

  if (uptime == null || age == null) return { uptimeSeconds: null, stoppedFor: null };
  if (age > HEARTBEAT_LOST_AFTER_S) return { uptimeSeconds: null, stoppedFor: age };
  // the heartbeat can be up to a minute old: add on the time since it arrived
  return { uptimeSeconds: uptime + age, stoppedFor: null };
}


export const renameCentralNode = (name) =>
  apiFetch("/api/centralnode", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });