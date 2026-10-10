"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries mostly Ant design libraries
import { Typography, Flex, Tabs, Empty, Alert, Spin } from "antd";

// Our own components
import CustomAlertComponent from "../../components/CustomAlertComponent/CustomAlertComponent";
import { apiGet, apiPatch } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";

// tabs across the top of the page
const alertTabs = [
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "history", label: "History" },
];

const REFRESH_MS = 30000;

export default function Alerts() {
  const { centralNodeName, centralNodeLoading } = useSettings();
  const centralNodeLabel = centralNodeName
    ?? (centralNodeLoading ? "Loading central node…" : "Central node unavailable");

  // which tab is showing
  const [currentTab, setCurrentTab] = useState("active");

  // alerts exactly as the backend sends them:
  // { alertID, alertSeverity, alertMessage, raisedAt, resolvedAt, isAcknowledged,
  //   readings: { temperature, humidity, leafWetness, windSpeed },
  //   leafNodes: [{ leafNodeID, leafNodeName }] }
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState(null);

  // which alert is expanded, only one at a time (null when none are)
  const [openAlertId, setOpenAlertId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      try {
        const [active, acknowledged] = await Promise.all([
          apiGet("/api/alerts"),
          apiGet("/api/alerts/acknowledged"),
        ]);
        if (cancelled) return;
        setAlerts([...(active.alerts ?? []), ...(acknowledged.alerts ?? [])]);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAlerts();
    const timer = setInterval(loadAlerts, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // sorts from highest to lowest alert severity, newest first within a severity
  const sortedAlerts = [...alerts].sort(
    (a, b) => (b.alertSeverity ?? -1) - (a.alertSeverity ?? -1) || b.raisedAt - a.raisedAt
  );

  // only the alerts that belong on the current tab
  const visibleAlerts = sortedAlerts.filter((alert) => {
    if (currentTab === "active") return !alert.isAcknowledged;
    if (currentTab === "acknowledged") return alert.isAcknowledged;
    return true; // history shows every alert
  });

  // persist the acknowledgement before moving the alert to its new tab
  async function acknowledgeAlert(alertID) {
    setAcknowledgingAlertId(alertID);
    setError(null);
    try {
      // the backend replies with the updated alert row
      const updated = await apiPatch(`/api/alerts/${alertID}/acknowledge`);
      setAlerts((current) =>
        current.map((alert) =>
          alert.alertID === alertID
            ? { ...alert, isAcknowledged: updated.isAcknowledged, resolvedAt: updated.resolvedAt }
            : alert
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setAcknowledgingAlertId(null);
    }
  }

  if (loading) return <Flex justify="center"><Spin /></Flex>;

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="small">
        {/* Page title */}
        <Typography.Title level={2} style={{ margin: 0 }}>{centralNodeLabel} Mildew Alerts</Typography.Title>
        {/* alert status tabs */}
        <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={alertTabs}
          // remove the tab bar's built-in bottom margin; the page gap handles spacing
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Flex>

      {error && <Alert type="error" showIcon title="Couldn't load or update alerts" description={error} />}

      {/* alerts list  */}
      <Flex vertical gap="small">
        {/* empty tab message */}
        {visibleAlerts.length === 0 && <Empty description="No alerts currently" />}

        {visibleAlerts.map((alert) => (
          <CustomAlertComponent
            key={alert.alertID}
            {...alert}
            // open only if this is the alert that was tapped last
            isOpen={openAlertId === alert.alertID}
            // tapping a closed alert opens it (and closes the others), tapping the open one closes it
            onToggle={() => setOpenAlertId(openAlertId === alert.alertID ? null : alert.alertID)}
            onAcknowledge={acknowledgeAlert}
            isAcknowledging={acknowledgingAlertId === alert.alertID}
          />
        ))}
      </Flex>
    </Flex>
  );
}