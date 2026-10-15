"use client";

// React
import { useState } from 'react';

// UI Libraries mostly Ant design libraries
import { DatePicker, Flex, Typography, Button, Checkbox, Card, Segmented } from 'antd';
import {RiDownload2Line} from "@remixicon/react";

//how dates are shown
const dateFormat = 'YYYY/MM/DD';

const leafNodeOptions = [
    "All Leaf Nodes",
    "Leaf Node 1",
    "Leaf Node 2",
    "Leaf Node 3",
    "Leaf Node 4",
    "Leaf Node 5",
    "Leaf Node 6"
];

const readingOptions = [
    "Temperature & Humidity",
    "Leaf Wetness",
    "Wind Speed",
    "Node ID & Battery Logs"
];

const fileFormatOptions = [
    {label: "CSV (Excel)", value: "csv"},
    {label: "JSON (Raw)", value: "json"}
]

export default function Export() {
    // export date range as [start, end], both empty to begin with
    const [dateRange, setDateRange] = useState([null, null]);

    // which nodes to export
    const [selectedNodes, setSelectedNodes] = useState(["All Leaf Nodes"]);

    //which readings to include... all to begin with
    const [readings, setReadings] = useState(readingOptions);

    //csv or json
    const [fileFormat, setFileFormat] = useState("csv");

    //All leaf nodes on its own or any mix of single nodes can be selected
    const toggleNode = (node) => {
        setSelectedNodes((previous) => {
            if (node === "All Leaf Nodes")
                return ["All Leaf Nodes"];

            const withoutAll = previous.filter((n) => n !== "All Leaf Nodes");
            const updated = withoutAll.includes(node)
                ? withoutAll.filter((n) => n !== node)
                : [...withoutAll, node];

            //if all single nodes get selected change back to all nodes
            return updated.length >0 ? updated : ["All Leaf Nodes"];
        });
  }

    // TODO send this to the backend and download the file it returns
    function handleDownload() {
        console.log({ dateRange, selectedNodes, readings, fileFormat });
    }

  return (

      <Flex vertical gap="large">
        {/* Page Title */}
          <Typography.Title level={2} style={{margin:0}}>Export Vineyard Data</Typography.Title>

       {/* date range: two single-month pickers so each calendar fits on a phone */}
          <Card size="small" title="Date Range">
              <Flex gap="small">
                  <DatePicker
                      placeholder="start"
                      format={dateFormat}
                      value={dateRange[0]}
                      onChange={(date) => setDateRange([date, dateRange[1]])}
                      // no future dates, and no start date after the end date
                      disabledDate={(day) => day.isAfter(new Date(), "day") || (dateRange[1] && day.isAfter(dateRange[1], "day"))}
                      style={{ flex: 1 }}
                      inputReadOnly
                  />
                  <DatePicker
                      placeholder="end"
                      format={dateFormat}
                      value={dateRange[1]}
                      onChange={(date) => setDateRange([dateRange[0], date])}
                      // no future dates, and no end date before the start date
                      disabledDate={(day) => day.isAfter(new Date(), "day") || (dateRange[0] && day.isBefore(dateRange[0], "day"))}
                      style={{ flex: 1 }}
                      inputReadOnly
                  />
              </Flex>
          </Card>

        {/* Leaf Node Selection Section */}
        <Card size="small" title="Leaf Nodes" >
          <Flex gap="small" wrap>
            {leafNodeOptions.map((node) => {
                const selected = selectedNodes.includes(node);
                return(
                    <Button
                        key={node}
                        shape="round"
                        color={selected ? "primary":"default"}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleNode(node)}
                    >
                        {node}
                    </Button>
                );
            })}
          </Flex>
        </Card>

        {/* Readings to include section */}
        <Card size="small" title="Reading to Include">
            <Checkbox.Group value={readings} onChange={setReadings}>
                <Flex vertical gap="small">
                    {readingOptions.map((reading) => (
                        <Checkbox key={reading} value={reading}>{reading}</Checkbox>
                    ))}
                </Flex>
            </Checkbox.Group>
        </Card>

        {/* File Format */}
        <Card size="small" title="File Format">
          <Segmented options={fileFormatOptions} value={fileFormat} onChange={setFileFormat} block/>
        </Card>

          <Button type="primary" size="large" block icon={<RiDownload2Line size={20} />} onClick={handleDownload}>
            Download Log Package
          </Button>

      </Flex>
  );
}