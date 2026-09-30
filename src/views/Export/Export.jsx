"use client";

import { useState } from 'react';
import dynamic from "next/dynamic";

import { DatePicker, Flex, Typography, Button, Checkbox, Card } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const { Title, Text } = Typography;

const onChange = (date, dateString) => {
  console.log(date, dateString);
};

// Date Formats
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

const startDate = dayjs('2026/01/01', dateFormat);
const endDate = dayjs('2026/12/31', dateFormat);

const LeafNodeOptions = ["All Leaf Nodes", "Leaf Node 1", "Leaf Node 2", "Leaf Node 3", "Leaf Node 4", "Leaf Node 5", "Leaf Node 6"];

export default function Export() {
  const [selectedNodes, setSelectedNodes] = useState(["All Leaf Nodes"]);

  const ToggleNode = (node) => {
    setSelectedNodes((prev) => {
      if (node === "All Leaf Nodes") {
        return ["All Leaf Nodes"];
      }
      const withoutAll = prev.filter((n) => n !== "All Leaf Nodes");

      return withoutAll.includes(node)
        ? withoutAll.filter((n) => n !== node)
        : [...withoutAll, node];
    }
    );

  };

  const readingsToInclude = ["Temperature & Humidity", "Leaf Wetness", "Wind Speed", "Node ID & Battery Log"];

  return (
    <Card style={{ width: '100%' }}>

      <Flex vertical gap="large" justify="flex-start" align="flex-start">

        {/* Page Title */}
        <Title level={2}>Export Vineyard Data</Title>

        {/* Date picker */}
        <Flex gap="small" vertical>
          <Title level={4}>Date Range:</Title>
          <RangePicker style={{ width: '100%' }} onChange={onChange}
            defaultValue={[startDate, endDate]}
            format={dateFormat}
          />
        </Flex>

        {/* Leaf Node Selection Section */}
        <Flex gap="small" wrap="wrap" vertical>
          <Title level={4}>Leaf Node Selection:</Title>
          <Flex gap="small" wrap="wrap">
            {LeafNodeOptions.map((node) => (
              <Button
                key={node}
                size="small"
                shape="round"
                type={selectedNodes.includes(node) ? "primary" : "default"}
                onClick={() => ToggleNode(node)}>
                {node}
              </Button>
            ))}
          </Flex>


        </Flex>
        {/* Readings to include section */}
        <Flex gap="small" vertical>
          <Title level={4}>Readings to Include:</Title>
          <Flex gap="small" vertical>
            {readingsToInclude.map((reading) => (
              <Checkbox key={reading} onChange={onChange}>{reading}</Checkbox>
            ))}
          </Flex>

        </Flex>

        {/* File Format */}
        <Flex gap="small" vertical>
          <Title level={4}>File Format:</Title>
          <Flex gap="small" wrap="wrap">
            <Button type="primary" size="large">CSV (Excel)</Button>
            <Button type="default" size="large">JSON (Raw)</Button>
          </Flex>

          <Button type="primary" style={{ marginTop: '16px' }} size="large">
            Download Log Package
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}