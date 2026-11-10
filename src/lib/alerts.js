import { apiFetch } from "./api";

export const getAlerts = async () => (await apiFetch("/api/alerts")).alerts;

export const getAcknowledgedAlerts = async () =>
  (await apiFetch("/api/alerts/acknowledged")).alerts;

export const acknowledgeAlert = (alertID) =>
  apiFetch(`/api/alerts/${alertID}/acknowledge`, { method: "PATCH" });
