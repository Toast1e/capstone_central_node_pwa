"use client";

// React and NextJS
import { useState } from 'react';
import dynamic from "next/dynamic";

// UI Libraries mostly Ant design libraries
import { Typography, Tag, Flex, Alert, Button, Card, Statistic } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';

//draws a line chart
const Line = dynamic(
    () => import("@ant-design/charts").then((mod) => mod.Line),
    {ssr: false}
);

// ------ Placeholder data ------
// TODO make page elements dynamic based on backend later

const TOTAL_NODES = 6;

// "sensor readings" one card per reading type
const metrics = [
    { title: "HUMIDITY", value: 93, unit: "%", note: "Above 90% for 3h" },
    { title: "TEMPERATURE", value: 19.4, unit: "°C", note: "not spicy" },
    { title: "LEAF WETNESS", value: 60, unit: "%", note: "Wet leaves detected" },
    { title: "WIND", value: 9.4, unit: "m/s", note: "aaahhhhh" },
];

// mock readings over time data in this case humidity, used by line graph
const humidityHistory = [
    { time: "12:00", value: 78 },
    { time: "13:00", value: 85 },
    { time: "14:00", value: 91 },
    { time: "15:00", value: 94 },
    { time: "16:00", value: 93 },
];

export default function Home() {
    //which leaf node currently shown from 1 to TOTAL_NODES
    const [node, setNode] = useState(1);

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="middle">
          {/* Page title */}
          <Flex vertical>
              <Typography.Title level={2}>Central Node 1 Overview</Typography.Title>
              {/* number nodes being monitored */}
              <Typography.Text type="secondary"> {TOTAL_NODES} Leaf Nodes monitored</Typography.Text>
          </Flex>
      </Flex>

        {/* alerts banner */}
      <Alert
          type="warning"
          showIcon
          title="2 areas need attention"
          description={
              <Flex vertical gap={8}>
                  {/* alert details */}
                  <span>LN 2 is at high risk of downy mildew.</span>
                  {/* alerts severity breakdown */}
                  <Flex gap={4} wrap>
                      <Tag color="red">1 High</Tag>
                      <Tag color="orange">1 Moderate</Tag>
                      <Tag color="green">4 Low</Tag>
                  </Flex>
              </Flex>
          }
      />

        {/* Leaf nodes section */}
        <Flex vertical gap="middle">
            {/* Leaf node selector */}
            <Flex justify="space-between" align="center">
                {/* disable previous button when node number === 1 */}
                <Button
                    type="text"
                    aria-label="Previous leaf node"
                    icon={<RiArrowLeftLine size={18} />}
                    disabled={node === 1}
                    onClick={() => setNode(node - 1)}
                />

                {/* current selected node label */}
                <Typography.Text strong>Leaf Node {node}</Typography.Text>

                {/* disable next button if node number === TOTAL_NODES i.e. on last LN */}
                <Button
                    type="text"
                    aria-label="Next leaf node"
                    icon={<RiArrowRightLine size={18} />}
                    disabled={node === TOTAL_NODES}
                    onClick={() => setNode(node + 1)}
                />
            </Flex>

            {/* 4 sensor readings card grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridAutoRows: "1fr",
                    gap: 8,
                }}
            >
                {metrics.map((metric) => (
                    <Card key={metric.title}>
                        <Statistic title={metric.title} value={metric.value} suffix={metric.unit} />
                        <Typography.Text type="secondary">{metric.note}</Typography.Text>
                    </Card>
                ))}
            </div>

                {/* humidity line graph */}
                <Card title="Humidity (last 5h)">
                    <Line data={humidityHistory} xField="time" yField="value" height={200} />
                </Card>

        </Flex>
    </Flex>
  );
}
