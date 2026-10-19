"use client";

// React and NextJS
import { useState } from 'react';

// UI Libraries mostly Ant design libraries
import { Typography, Flex, Tabs, Collapse, Tag, Button, Empty, theme } from "antd";
import {RiCheckLine} from "@remixicon/react";

// Our own data
import {buildAlert} from "./alertMessages";

// ------ Placeholder data ------
// TODO replace with data from the backend
// shaped like a row of the database's alert table, so swapping in real data is easy. raisedAt and resolvedAt are unix seconds (how the Pi stores time)...leafNodes comes from the leafnode_alert table: one alert can cover several leaf nodes
// (sentAt and centralNodeID are in the table too, but this page doesn't use them)

const alertDetails = [
  {
    alertID: 1,
    // adds mildewType, alertSeverity and alertMessage, made the way the Pi will make them
    ...buildAlert("downy", ["temperature", "humidity", "wind"]),
    leafNodes: ["LN-02"],
    raisedAt: 1791949200, // 14 Oct 05:40
    isAcknowledged: false,
    resolvedAt: null,
  },
  {
    alertID: 2,
    ...buildAlert("powdery", ["temperature", "humidity"]),
    leafNodes: ["LN-04", "LN-05"],
    raisedAt: 1791969300, // 14 Oct 11:15
    isAcknowledged: false,
    resolvedAt: null,
  },
  {
    alertID: 3,
    ...buildAlert("powdery", ["humidity"]),
    leafNodes: ["LN-01"],
    raisedAt: 1791901200, // Oct 13 16:20
    isAcknowledged: true,
    resolvedAt: null,
  },
  {
    alertID: 4,
    ...buildAlert("downy", ["temperature", "humidity"]),
    leafNodes: ["LN-03"],
    raisedAt: 1791835800, //12 oct 22:10
    isAcknowledged: true,
    resolvedAt: 1791873000,
  }
];

// tabs across the top of the page
const alertTabs = [
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "resolved", label: "Resolved" },
];

// ------  Alert Severity ------
// alertSeverity is 0, 1 or 2, so it can be used as the position in this array
//TODO confirm nums with backend
const severityStyles = [
  { label: "LOW RISK", colour: "success", edge: "colorSuccess" }, // 0
  { label: "MODERATE RISK", colour: "warning", edge: "colorWarning" },  // 1
  { label: "HIGH RISK", colour: "error", edge: "colorError" },  // 2
];

// mildewType as stored in the database -> what the page shows
const mildewLabels = {
  powdery: "Powdery mildew",
  downy: "Downy mildew",
};

// ------ Times ------
// Next.js draws the page twice: on the server, then again in the browser. toLocaleString can word
// dates differently in each (Safari: "14 Oct at 05:40", the server: "14 Oct, 05:40"), and React errors
// when the two don't match. Building the text by hand gives exactly the same result everywhere.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

// resolvedAt stays empty (null) while the alert is still open
function isResolved(alert) {
  return Boolean(alert.resolvedAt);
}

export default function Alerts() {
  // which tab is showing
  const [currentTab, setCurrentTab] = useState("active");

  // the alert list, in state so the page updates when an alert is acknowledged
  const [alerts, setAlerts] = useState(alertDetails);

  // which alert is expanded, only one at a time (null when none are)
  const [openAlertId, setOpenAlertId] = useState(null);

  // theme colours from themeConfig.js, used for the severity edges
  const { token } = theme.useToken();

  // sorts from highest to lowest alert severity
  // (|| only uses the time when the severity difference is 0)
  const sortedAlerts = [...alerts].sort((a, b) => b.alertSeverity - a.alertSeverity || b.raisedAt - a.raisedAt);

  // only the alerts that belong on the current tab
  const visibleAlerts = sortedAlerts.filter((alert) => {
    if (currentTab === "resolved") return isResolved(alert);  //ticked as resolved
    if (isResolved(alert)) return false;  // ...only show in Resolved tab
    if (currentTab === "acknowledged") return alert.isAcknowledged;
    return !alert.isAcknowledged; // active alerts
  });

  // marks alert as acknowledged, then moves it from Active to Acknowledged
  function acknowledgeAlert(alertID) {
    setAlerts((current) =>
        current.map((alert) =>
            alert.alertID === alertID ? { ...alert, isAcknowledged: true } : alert
        )
    );
    // TODO send the acknowledgement to the backend so it's saved
  }

  // marks alert as resolved,  then moves it from Acknowledged to Resolved
  function resolveAlert(alertID) {
    const now = Math.floor(Date.now() / 1000); // unix seconds
    setAlerts((current) =>
        current.map((alert) =>
            alert.alertID === alertID ? {...alert, resolvedAt: now} : alert
        )
    );
    // TODO send to the backend so it's saved
  }

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="small">
        {/* Page title */}
        <Typography.Title level={2} style={{margin:0}}>Mildew Alerts</Typography.Title>
      {/* alert status tabs */}
      <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={alertTabs}
          // remove the tab bar's built-in bottom margin; the page gap handles spacing
          tabBarStyle={{ marginBottom: 0 }}
      />
      </Flex>

      {/* alerts list  */}
      <Flex vertical gap="small">
        {/* empty tab message */}
        {visibleAlerts.length === 0 && <Empty description="No alerts currently"/>}

        {visibleAlerts.map((alert) => {
          const severity = severityStyles[alert.alertSeverity];

          return (
              <Collapse
                key={alert.alertID}
                expandIconPlacement="end"
                  // open only if this is the alert that was tapped last
                activeKey={openAlertId === alert.alertID ? [alert.alertID] : []}
                  // tapping a closed alert opens it (and closes the others), tapping the open one closes it
                  onChange={(openKeys)=>setOpenAlertId(openKeys.length>0? alert.alertID : null)}
                  //colour strip on left like with nodes page
                style={{borderLeft: `4px solid ${token[severity.edge]}`}}
                items={[
                  {
                    key: alert.alertID,
                    //header i.e. mildew type, leaf nodes and time raised
                    label: (
                        <Flex vertical>
                          <Typography.Text strong>{mildewLabels[alert.mildewType]}</Typography.Text>
                          <Typography.Text type="secondary">
                            {alert.leafNodes.join(", ")} ·{" "}
                            {/* nowrap: if the line is too long, the whole time moves down instead of splitting */}
                            <span style={{ whiteSpace: "nowrap" }}>{formatAlertTime(alert.raisedAt)}</span>
                          </Typography.Text>
                        </Flex>
                    ),
                    //risk tag on header
                    extra: <Tag color={severity.colour}>{severity.label}</Tag>,
                    //tag body i.e message plus acknowledge button
                    children:(
                        <Flex vertical gap="middle">
                          <Typography.Text>{alert.alertMessage}</Typography.Text>

                          {/* when it ended, only for finished alerts */}
                          {isResolved(alert) && (
                              <Typography.Text type="secondary">
                                Resolved {formatAlertTime(alert.resolvedAt)}
                              </Typography.Text>
                          )}

                          {/* only open unacknowledged alerts can be acknowledged */}
                          {!alert.isAcknowledged && !isResolved(alert) && (
                              <Button type="primary" onClick={() => acknowledgeAlert(alert.alertID)}>
                                Acknowledge
                              </Button>
                          )}


                          {/* acknowledged but still open: can be ticked as resolved */}
                          {alert.isAcknowledged && !isResolved(alert) && (
                              <Button type="primary" icon={<RiCheckLine size={18} />} onClick={() => resolveAlert(alert.alertID)}>
                                Mark as resolved
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