"use client";

// React and NextJS
import { useCallback, useEffect, useState } from "react";

// UI Libraries mostly Ant design libraries
import {
  Typography,
  Flex,
  Tabs,
  Collapse,
  Tag,
  Button,
  Empty,
  Alert,
  theme,
} from "antd";

// API calls for alerts (lib/alerts.js)
import {
  getAlerts,
  getAcknowledgedAlerts,
  acknowledgeAlert,
} from "../../../lib/alerts";

// ------ Tabs ------
// tabs across the top of the page. The backend sets resolvedAt when an alert is
// acknowledged, so there is no separate "Resolved" state to show yet
const alertTabs = [
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
];

// ------ Alert severity ------
// alertSeverity from the API is 0, 1 or 2, so it can be used as the position in this array
// (matches the backend's calculate_risk: 0 = low, 1 = moderate, 2 = high)
const severityStyles = [
  { label: "LOW RISK", colour: "success", edge: "colorSuccess" }, // 0
  { label: "MODERATE RISK", colour: "warning", edge: "colorWarning" }, // 1
  { label: "HIGH RISK", colour: "error", edge: "colorError" }, // 2
];

// ------ Times ------
// Next.js draws the page twice: on the server, then again in the browser. toLocaleString can word
// dates differently in each (Safari: "14 Oct at 05:40", the server: "14 Oct, 05:40"), and React errors
// when the two don't match. Building the text by hand gives exactly the same result everywhere.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SAST_OFFSET = 2 * 60 * 60; // South Africa is UTC+2 all year (no daylight saving), in seconds

// unix seconds -> "14 Oct, 05:40" in South African time
function formatAlertTime(unixSeconds) {
  // move the time 2 hours on, then read it as UTC: that gives the South African clock time.
  // getUTC... ignores the device's own time zone, so the server and the phone get the same numbers
  const time = new Date((unixSeconds + SAST_OFFSET) * 1000);
  const hours = String(time.getUTCHours()).padStart(2, "0"); // 5 -> "05"
  const minutes = String(time.getUTCMinutes()).padStart(2, "0");
  return `${time.getUTCDate()} ${MONTHS[time.getUTCMonth()]}, ${hours}:${minutes}`;
}

// the API sends leafNodes as {leafNodeID, leafNodeName}; the page shows them as "LN-02"
const withNodeLabels = (alert) => ({
  ...alert,
  leafNodes: alert.leafNodes.map(
    (node) => `LN-${String(node.leafNodeID).padStart(2, "0")}`,
  ),
});

export default function Alerts() {
  // which tab is showing
  const [currentTab, setCurrentTab] = useState("active");

  // all alerts from the API (active and acknowledged together)
  const [alerts, setAlerts] = useState([]);

  // true until the first load finishes, so "No alerts" isn't flashed while loading
  const [loading, setLoading] = useState(true);

  // true when the last request to the API failed
  const [loadError, setLoadError] = useState(false);

  // which alert is expanded, only one at a time (null when none are)
  const [openAlertId, setOpenAlertId] = useState(null);

  // theme colours from themeConfig.js, used for the severity edges
  const { token } = theme.useToken();

  // fetches both lists and replaces the page's alerts with them
  const refresh = useCallback(async () => {
    try {
      const [active, acknowledged] = await Promise.all([
        getAlerts(),
        getAcknowledgedAlerts(),
      ]);
      setAlerts(
        [...active, ...acknowledged]
          .filter((alert) => alert.alertSeverity >= 1) // hide low-risk alerts
          .map(withNodeLabels),
      );
      setLoadError(false);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // load when the page opens, then check for new alerts every minute
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id); // stop checking when the page closes
  }, [refresh]);

  // sorts from highest to lowest alert severity
  // (|| only uses the time when the severity difference is 0)
  const sortedAlerts = [...alerts].sort(
    (a, b) => b.alertSeverity - a.alertSeverity || b.raisedAt - a.raisedAt,
  );

  // only the alerts that belong on the current tab
  const visibleAlerts = sortedAlerts.filter((alert) =>
    currentTab === "acknowledged"
      ? alert.isAcknowledged
      : !alert.isAcknowledged,
  );

  // tells the backend the alert is acknowledged, then reloads so it moves to the Acknowledged tab
  async function handleAcknowledge(alertID) {
    try {
      await acknowledgeAlert(alertID);
      await refresh(); // the server stamps the time, so reload instead of editing state by hand
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="small">
        {/* Page title */}
        <Typography.Title level={2} style={{ margin: 0 }}>
          Mildew Alerts
        </Typography.Title>
        {/* alert status tabs */}
        <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={alertTabs}
          // remove the tab bar's built-in bottom margin; the page gap handles spacing
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Flex>

      {/* shown when the API can't be reached */}
      {loadError && (
        <Alert type="error" showIcon title="Couldn't reach the server" />
      )}

      {/* alerts list  */}
      <Flex vertical gap="small">
        {/* empty tab message, only once loading has finished */}
        {!loading && visibleAlerts.length === 0 && (
          <Empty description="No alerts currently" />
        )}

        {visibleAlerts.map((alert) => {
          const severity = severityStyles[alert.alertSeverity];

          return (
            <Collapse
              key={alert.alertID}
              expandIconPlacement="end"
              // open only if this is the alert that was tapped last
              activeKey={openAlertId === alert.alertID ? [alert.alertID] : []}
              // tapping a closed alert opens it (and closes the others), tapping the open one closes it
              onChange={(openKeys) =>
                setOpenAlertId(openKeys.length > 0 ? alert.alertID : null)
              }
              //colour strip on left like with nodes page
              style={{ borderLeft: `4px solid ${token[severity.edge]}` }}
              items={[
                {
                  key: alert.alertID,
                  // header: title, leaf nodes and time raised
                  label: (
                    <Flex vertical>
                      <Typography.Text strong>Mildew risk</Typography.Text>
                      <Typography.Text type="secondary">
                        {alert.leafNodes.join(", ")} ·{" "}
                        {/* nowrap: if the line is too long, the whole time moves down instead of splitting */}
                        <span style={{ whiteSpace: "nowrap" }}>
                          {formatAlertTime(alert.raisedAt)}
                        </span>
                      </Typography.Text>
                    </Flex>
                  ),
                  // risk tag on header
                  extra: <Tag color={severity.colour}>{severity.label}</Tag>,
                  // body: the message, then either the acknowledged time or the Acknowledge button
                  children: (
                    <Flex vertical gap="middle">
                      <Typography.Text>{alert.alertMessage}</Typography.Text>

                      {alert.isAcknowledged ? (
                        // resolvedAt is stamped by the backend at the moment of acknowledging
                        alert.resolvedAt ? (
                          <Typography.Text type="secondary">
                            Acknowledged {formatAlertTime(alert.resolvedAt)}
                          </Typography.Text>
                        ) : null
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleAcknowledge(alert.alertID)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </Flex>
                  ),
                },
              ]}
            />
          );
        })}
      </Flex>
    </Flex>
  );
}
