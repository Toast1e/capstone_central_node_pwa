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

    // export date range as [start, end], both empty to begin with
    const [dateRange, setDateRange] = useState([null, null]);

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

      <Flex vertical>

        {/* Page Title */}
          <Typography.Title level={2}>Export Vineyard Data</Typography.Title>

       {/* date range: two single-month pickers so each calendar fits on a phone */}
          <Flex gap="small" vertical>
              <Typography.Text strong>DATE RANGE</Typography.Text>
              <Flex gap="small">
                  <DatePicker
                      placeholder="start"
                      value={dateRange[0]}
                      onChange={(date) => setDateRange([date, dateRange[1]])}
                      // no future dates, and no start date after the end date
                      disabledDate={(day) => day.isAfter(new Date(), "day") || (dateRange[1] && day.isAfter(dateRange[1], "day"))}
                      style={{ flex: 1 }}
                      inputReadOnly
                  />
                  <DatePicker
                      placeholder="end"
                      value={dateRange[1]}
                      onChange={(date) => setDateRange([dateRange[0], date])}
                      // no future dates, and no end date before the start date
                      disabledDate={(day) => day.isAfter(new Date(), "day") || (dateRange[0] && day.isBefore(dateRange[0], "day"))}
                      style={{ flex: 1 }}
                      inputReadOnly
                  />
              </Flex>
          </Flex>

        {/* Leaf Node Selection Section */}
        <Flex gap="small" wrap="wrap" vertical>
          <Typography.Text strong>LEAF NODE SELECTION</Typography.Text>
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
          <Typography.Text strong>READINGS TO INCLUDE</Typography.Text>
          <Flex gap="small" vertical>
            {readingsToInclude.map((reading) => (
              <Checkbox key={reading} onChange={onChange}>{reading}</Checkbox>
            ))}
          </Flex>

        </Flex>

        {/* File Format */}
        <Flex gap="small" vertical>
          <Typography.Text strong>FILE FORMAT</Typography.Text>
          <Flex gap="small" wrap="wrap">
            <Button type="primary" size="large">CSV (Excel)</Button>
            <Button type="default" size="large">JSON (Raw)</Button>
          </Flex>

          <Button type="primary" style={{ marginTop: '16px' }} size="large">
            Download Log Package
          </Button>
        </Flex>
      </Flex>
  );
}