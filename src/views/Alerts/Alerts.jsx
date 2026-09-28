"use client";

// React and NextJS
import { useState } from 'react';
import dynamic from "next/dynamic";

// UI Libraries mostly Ant design libraries
import { Typography, Tag, Flex, Alert, Button, Card, Statistic, Collapse, Layout } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { Color } from 'antd/es/color-picker';

const { Text, Title } = Typography;

const metrics = [
  { title: "HUMIDITY", value: 93, unit: "%" },
  { title: "TEMPERATURE", value: 19.4, unit: "°C" },
  { title: "LEAF WETNESS", value: 60, unit: "%" },
  { title: "WIND", value: 9.4, unit: "m/s" },
];

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

export default function Alerts() {
  const [currentAlertType, setAlertType] = useState(1);

  function changeAlertType(newType) {
    setAlertType(currentAlertType => newType)
  }

  function allAlerts() {
    let alerts = [];

    alertDetails.map((details) => {
      if ((currentAlertType == 0 && details.isAcknowledged == false) || (currentAlertType == 1 && details.isAcknowledged == true) || currentAlertType == 2) {
        alerts.push(
          {
            key: details.alertID,
            label:
              <Flex justify='space-between'>
                <Text style={{ fontSize: "large" }}>{details.mildewType + " | " + details.nodeName}</Text>
                <Text style={{ fontSize: "large" }}>{details.alertSeverity === 1 ? "Moderate" : details.alertSeverity === 2 ? "High" : "Low"}</Text>
              </Flex>,
            children:
              <Flex vertical gap="middle">
                <Flex justify='space-between'>
                  <Text>Thresholds met</Text>
                  <Text>Received at: {details.receivedAt}</Text>
                </Flex>

                <Flex vertical gap="small">
                  {metrics.map((metric) => {
                    return (<Text key={metric.title}>{metric.title}: {metric.value + metric.unit}</Text>)
                  })}
                </Flex>

                {!details.isAcknowledged &&
                  <Button
                    key={details.alertID}
                    variant="text"
                  >
                    Acknowledge
                  </Button>
                }
              </Flex>,
            style: { backgroundColor: details.alertSeverity === 1 ? "PeachPuff" : details.alertSeverity === 2 ? "lightcoral" : "lightgreen" }
          }
        );
      }
    });

    return (alerts);
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
          color={currentAlertType === 0 ? "primary" : "default"}
          onClick={() => changeAlertType(0)}
        >
          Active
        </Button>

        <Button
          key="acknowledged"
          variant="text"
          color={currentAlertType === 1 ? "primary" : "default"}
          onClick={() => changeAlertType(1)}
        >
          Acknowledged
        </Button>

        <Button
          key="history"
          variant="text"
          color={currentAlertType === 2 ? "primary" : "default"}
          onClick={() => changeAlertType(2)}
        >
          History
        </Button>
      </Flex>

      <Collapse bordered={false} items={
        allAlerts()
      }>
      </Collapse>
    </Flex>
  );
}