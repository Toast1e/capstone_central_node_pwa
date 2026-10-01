"use client";

// React and NextJS
import { useState } from 'react';

// UI Libraries mostly Ant design libraries
import { Typography, Flex, Tabs, Collapse, Tag, Button, Descriptions, Empty, theme } from "antd";

// ------ Placeholder data ------
// TODO replace with data from the backend
const alertDetails = [
  {
    alertID: 1, nodeName: "Node 1", mildewType: "Downy", receivedAt: "12:00",
    isAcknowledged: false, alertSeverity: 0, message: "yay",
    readings: { humidity: "93%", temperature: "19.4°C", leafWetness: "60%", wind: "9.4 m/s" },
  },
  {
    alertID: 2, nodeName: "Node 2", mildewType: "Powdery", receivedAt: "18:25",
    isAcknowledged: false, alertSeverity: 2, message: "yay",
    readings: { humidity: "88%", temperature: "24.1°C", leafWetness: "35%", wind: "3.2 m/s" },
  },
  {
    alertID: 3, nodeName: "Node 3", mildewType: "Downy", receivedAt: "09:43",
    isAcknowledged: true, alertSeverity: 1, message: "yay",
    readings: { humidity: "91%", temperature: "17.8°C", leafWetness: "72%", wind: "5.0 m/s" },
  },
];

// tabs across the top of the page
const alertTabs = [
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "history", label: "History" },
];

// ------  Alert Severity ------
// alertSeverity is 0, 1 or 2, so it can be used as the position in this array
const severityStyles = [
  { label: "LOW RISK", colour: "success", edge: "colorSuccess" },      // 0
  { label: "MODERATE RISK", colour: "warning", edge: "colorWarning" }, // 1
  { label: "HIGH RISK", colour: "error", edge: "colorError" },         // 2
];

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
  const sortedAlerts = [...alerts].sort((a, b) => b.alertSeverity - a.alertSeverity);

  // only the alerts that belong on the current tab
  const visibleAlerts = sortedAlerts.filter((alert) => {
    if (currentTab === "active") return !alert.isAcknowledged;
    if (currentTab === "acknowledged") return alert.isAcknowledged;
    return true; // history shows every alert
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

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="middle">
        {/* Page title */}
        <Flex vertical>
          <Typography.Title level={2}>Mildew Alerts</Typography.Title>
        </Flex>
      </Flex>

      {/* alert status tabs */}
      <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={alertTabs}
      />

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
                    //header i.e. mildew type node and time
                    label: (
                        <Flex vertical>
                          <Typography.Text strong>{alert.mildewType} mildew</Typography.Text>
                          <Typography.Text type="secondary">{alert.nodeName} - {alert.receivedAt}</Typography.Text>
                        </Flex>
                    ),
                    //risk tag on header
                    extra: <Tag color={severity.colour}>{severity.label}</Tag>,
                    //tag body i.e message plus acknowledge button
                    children:(
                        <Flex vertical gap="middle">
                          <Typography.Text>{alert.message}</Typography.Text>
                          {/* sensor reading when alert was created*/}
                          <Descriptions
                            size="small"
                            column={2}
                            items={[
                              {key: "humidity", label: "Humidity", children: alert.readings.humidity},
                              {key: "temperature", label: "Temperature", children: alert.readings.temperature},
                              {key: "leafWetness", label: "Leaf Wetness", children: alert.readings.leafWetness},
                              {key: "wind", label: "Wind", children: alert.readings.wind},
                            ]}
                          />

                          {/* only unacknowledged alerts can be acknowledged */}
                          {!alert.isAcknowledged && (
                              <Button type="primary" onClick={() => acknowledgeAlert(alert.alertID)}>
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