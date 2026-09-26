"use client";

// React and NextJS
import { useState } from 'react';

// UI Libraries mostly Ant design libraries
import { Typography, Flex, Button, Collapse } from "antd";

import CustomComponent from "@/components/CustomComponent/CustomComponent";
import AlertComponent from "@/components/CustomAlertComponent/CustomAlertComponent";
import CustomAlertComponent from '../../components/CustomAlertComponent/CustomAlertComponent';

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

{/* Sorts from highest to lowest alert severity */}
const sortedDetails = [...alertDetails].sort((a, b) => b.alertSeverity - a.alertSeverity);

export default function Alerts() {
  const [currentAlertType, setAlertType] = useState(1);

  function changeAlertType(newType) {
    setAlertType(currentAlertType => newType)
  }

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="middle">
        {/* Page title */}
        <Flex vertical>
          <Typography.Title level={2}>Mildew Alerts</Typography.Title>
        </Flex>
      </Flex>

      <Flex>
        <Button
          key="active"
          variant="text"
          color={currentAlertType === 1 ? "primary" : "default"}
          onClick={() => changeAlertType(1)}
        >
          Active
        </Button>

        <Button
          key="acknowledged"
          variant="text"
          color={currentAlertType === 2 ? "primary" : "default"}
          onClick={() => changeAlertType(2)}
        >
          Acknowledged
        </Button>

        <Button
          key="history"
          variant="text"
          color={currentAlertType === 3 ? "primary" : "default"}
          onClick={() => changeAlertType(3)}
        >
          History
        </Button>
      </Flex>

      {/* Displays all alerts */}
      {
        sortedDetails.map((details) => (
          <CustomAlertComponent key={details.alertID} currentAlertType={currentAlertType} alertID={details.alertID} nodeName={details.nodeName} mildewType={details.mildewType} receivedAt={details.receivedAt} isAcknowledged={details.isAcknowledged} alertSeverity={details.alertSeverity} message={details.message} />
        ))
      }
    </Flex>
  );
}