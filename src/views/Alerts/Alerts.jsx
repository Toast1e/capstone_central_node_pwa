"use client";

// React and NextJS
import { useState } from 'react';

// UI Libraries mostly Ant design libraries
import { Typography, Flex, Tabs } from "antd";

import CustomAlertComponent from '../../components/CustomAlertComponent/CustomAlertComponent';

// ------ Placeholder data ------
// TODO replace with data from the backend
const { Text, Title } = Typography;

const alertDetails = [
  {
    alertID: 1, nodeName: "Node 1", mildewType: "Downy", receivedAt: "12:00", isAcknowledged: false, alertSeverity: 0, message: "yay"
  },
  {
    alertID: 2, nodeName: "Node 2", mildewType: "Powdery", receivedAt: "18:25", isAcknowledged: false, alertSeverity: 2, message: "yay"
  },
  {
    alertID: 3, nodeName: "Node 3", mildewType: "Downy", receivedAt: "09:43", isAcknowledged: true, alertSeverity: 1, message: "yay"
  }
];

//Sorts from highest to lowest alert severity
const sortedDetails = [...alertDetails].sort((a, b) => b.alertSeverity - a.alertSeverity);

// tabs across the top of the page
// keys are "1", "2", "3" to match the currentAlertType numbers CustomAlertComponent expects
const alertTabs = [
  { key: "1", label: "Active" },
  { key: "2", label: "Acknowledged" },
  { key: "3", label: "History" },
];

export default function Alerts() {
  // which tab is showing: 1 = active, 2 = acknowledged, 3 = history
  const [currentAlertType, setAlertType] = useState(1);

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
          activeKey={String(currentAlertType)}
          onChange={(key)=>setAlertType(Number(key))}
          items={alertTabs}
      />

      {/* all alerts, each card decides where it belongs */}
      {sortedDetails.map((details) => (
          <CustomAlertComponent
          key={details.alertID}
          currentAlertType={currentAlertType}
          {...details}
          />

      ))}

    </Flex>
  );
}