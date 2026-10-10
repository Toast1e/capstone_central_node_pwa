import React from 'react';
import { Card, Flex, Typography, Tag, Button, Descriptions, Divider, theme } from 'antd';
import { RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react";

// ------  Alert Severity ------
// alertSeverity is 0, 1 or 2, so it can be used as the position in this array
const severityStyles = [
  { label: "LOW RISK",      colour: "success", edge: "colorSuccess" }, // 0
  { label: "MODERATE RISK", colour: "warning", edge: "colorWarning" }, // 1
  { label: "HIGH RISK",     colour: "error",   edge: "colorError" },   // 2
];

// ------  Formatting helpers (the backend sends raw values) ------

// raisedAt is unix seconds -> "9 Oct, 14:05"
const formatRaisedAt = (raisedAt) =>
  raisedAt
    ? new Date(raisedAt * 1000).toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown time";

// leafNodes is [{ leafNodeID, leafNodeName }] -> "leaf-5, leaf-6"
const formatLeafNodes = (leafNodes) =>
  (leafNodes ?? []).map((node) => node.leafNodeName).join(", ") || "Unknown node";

// null/undefined -> "—", otherwise round to 1 decimal and add the unit
const formatReading = (value, unit = "") =>
  value == null ? "—" : `${Math.round(value * 10) / 10}${unit}`;

/**
 * One alert card. The page decides which alerts to show (tab, sorting) and which
 * card is open, so this component only draws one alert.
 *
 * Props use the same names as the backend (/api/alerts):
 *   alertID, alertSeverity (0/1/2), alertMessage, raisedAt (unix seconds),
 *   isAcknowledged,
 *   leafNodes [{ leafNodeID, leafNodeName }],
 *   readings { temperature, humidity, leafWetness, windSpeed },
 * plus page-controlled props:
 *   isOpen (is the card expanded), onToggle (header tapped),
 *   onAcknowledge(alertID), isAcknowledging
 */
const CustomAlertComponent = (alertInfo) => {
  // theme colours from themeConfig.js
  const { token } = theme.useToken();
  const severity = severityStyles[alertInfo.alertSeverity] ?? severityStyles[0];
  const readings = alertInfo.readings ?? {};

  return (
    <Card
      size="small"
      // colour strip on the left, same as the nodes page
      style={{ borderLeft: `4px solid ${token[severity.edge]}` }}
    >
      <Flex vertical gap="middle">
        {/* header: tap to open or close */}
        <Flex
          justify="space-between"
          align="center"
          gap="small"
          role="button"
          tabIndex={0}
          aria-expanded={alertInfo.isOpen}
          style={{ cursor: "pointer" }}
          onClick={alertInfo.onToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              alertInfo.onToggle?.();
            }
          }}
        >
          <Flex vertical>
            <Typography.Text strong>Mildew risk</Typography.Text>
            <Typography.Text type="secondary">
              {formatLeafNodes(alertInfo.leafNodes)} - {formatRaisedAt(alertInfo.raisedAt)}
            </Typography.Text>
          </Flex>

          <Flex align="center" gap={4}>
            <Tag color={severity.colour} style={{ marginInlineEnd: 0 }}>{severity.label}</Tag>
            {alertInfo.isOpen
              ? <RiArrowDownSLine size={18} color={token.colorTextTertiary} />
              : <RiArrowRightSLine size={18} color={token.colorTextTertiary} />}
          </Flex>
        </Flex>

        {/* details */}
        {alertInfo.isOpen && (
          <>
            <Divider style={{ margin: 0 }} />
            <Flex vertical gap="middle">
              <Typography.Text>{alertInfo.alertMessage ?? "Mildew risk detected."}</Typography.Text>

              {/* sensor readings from the reading that raised the alert */}
              <Descriptions
                size="small"
                column={2}
                items={[
                  { key: "humidity",    label: "Humidity",     children: formatReading(readings.humidity, " %") },
                  { key: "temperature", label: "Temperature",  children: formatReading(readings.temperature, " °C") },
                  { key: "leafWetness", label: "Leaf Wetness", children: formatReading(readings.leafWetness, " %") },
                  { key: "windSpeed",   label: "Wind",         children: formatReading(readings.windSpeed, " m/s") },
                ]}
              />

              {/* only unacknowledged alerts can be acknowledged */}
              {!alertInfo.isAcknowledged && (
                <Button
                  type="primary"
                  loading={alertInfo.isAcknowledging}
                  onClick={() => alertInfo.onAcknowledge(alertInfo.alertID)}
                >
                  Acknowledge
                </Button>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default CustomAlertComponent;