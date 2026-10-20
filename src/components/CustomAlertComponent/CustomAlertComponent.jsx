import React from 'react';
import { useState } from 'react';
import { Card, Space, Flex, Typography, Button } from 'antd';
import { RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react";
import "./CustomAlertComponent.css";

const { Text } = Typography;

const metrics = [
  { title: "HUMIDITY", value: 93, unit: "%" },
  { title: "TEMPERATURE", value: 19.4, unit: "°C" },
  { title: "LEAF WETNESS", value: 60, unit: "%" },
  { title: "WIND", value: 9.4, unit: "m/s" },
];

const CustomAlertComponent = (alertInfo) => {
  const [collapseState, setCollapseState] = useState(1);

  function changeCollapseState() {
    setCollapseState(collapseState => !collapseState)
  }

  if ((alertInfo.currentAlertType == 1 && alertInfo.isAcknowledged == false) || (alertInfo.currentAlertType == 2 && alertInfo.isAcknowledged == true) || alertInfo.currentAlertType == 3) {
    return (
      <Space vertical size={16}>
        <Card
          size="small"
          style={{ backgroundColor: alertInfo.alertSeverity === 1 ? "PeachPuff" : alertInfo.alertSeverity === 2 ? "lightcoral" : "lightgreen" }}
          className="cardBorder"
          onClick={() => changeCollapseState()}>
          <Flex vertical gap={"medium"}>
            <Flex vertical gap={"small"}>
              <Flex justify='space-between'>
                <Flex justify='space-between' style={{ width: "95%" }}>
                  <Text style={{ fontSize: "large" }}><strong>{alertInfo.mildewType}</strong></Text>
                  <Text className="threatBox"
                    style={{ color: alertInfo.alertSeverity === 1 ? "orange" : alertInfo.alertSeverity === 2 ? "red" : "darkgreen" }}
                  ><strong>{alertInfo.alertSeverity === 1 ? "MODERATE RISK" : alertInfo.alertSeverity === 2 ? "HIGH RISK" : "LOW RISK"}</strong></Text>
                </Flex>
                {collapseState ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </Flex>

              <Flex gap={"10pt"}>
                <Text>{alertInfo.nodeName}</Text>
                <Text>(Received at: {alertInfo.receivedAt})</Text>
              </Flex>
            </Flex>

            {!collapseState &&
              <Flex vertical gap="small">
                <Text>{alertInfo.message}</Text>
                {metrics.map((metric) => {
                  return (<Text key={metric.title}>{metric.title}: {metric.value + metric.unit}</Text>)
                })}

                {!alertInfo.isAcknowledged &&
                  <Button
                    key={alertInfo.alertID}
                    variant="text"
                    style={{width: "30%"}}
                  >
                    Acknowledge
                  </Button>
                }
              </Flex>
            }
          </Flex>
        </Card>
      </Space>
    );
  }
};

export default CustomAlertComponent;