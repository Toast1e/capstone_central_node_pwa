"use client";

// React and NextJS
import { useState } from "react";

// UI Libraries--Ant design libraries
import {Flex, Tag, Typography, Card, theme} from "antd";
import { RiCpuLine, RiArrowRightSLine } from "@remixicon/react";

// Our own components
import LeafNodeModal from "./LeafNodeModal";

// ------ Placeholder data ------
// TODO replace with data from the backend
const centralNode = {
    name: "Raspberry Pi 4B (Gateway)",
    uptime: "14 days",
    storageFree: "68%",
    hotspot: "Active",
    phonesConnected: 3,
    database: "Syncing OK",
};

const leafNodes = [
    { id: "LN-01", battery: 88, connection: "GOOD", lastSeen: "14:56" },
    { id: "LN-02", battery: 91, connection: "GOOD", lastSeen: "14:56" },
    { id: "LN-03", battery: 76, connection: "LOW", lastSeen: null },
    { id: "LN-04", battery: 83, connection: "GOOD", lastSeen: "14:56" },
    { id: "LN-05", battery: 34, connection: "NONE", lastSeen: null },
    { id: "LN-06", battery: 94, connection: "GOOD", lastSeen: "14:56" },
];

// ------ Connection status display ------
// tag label and colour for each connection level
const connectionStatus = {
    GOOD: { label: "OK", colour: "success", edge: "colorSuccess" },
    LOW: { label: "WEAK SIGNAL", colour: "warning", edge: "colorWarning" },
    NONE: { label: "NO SIGNAL", colour: "error", edge: "colorError" },
};

export default function Nodes() {
    // number of leaf nodes with active connection, show in header tag
    const nodesActivelyConnected = leafNodes.filter((node) => node.connection !== "NONE").length;

    // theme colours from themeConfig.js, used for the card edges
    const { token } = theme.useToken();

    // the leaf node whose pop-up is showing, and whether it's open kept separate so the pop-up keeps its content while it animates closed
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    function openNode(node) {
        setSelectedNode(node);
        setModalOpen(true);
    }

  return (
      <Flex vertical gap="large">
          <Flex vertical gap="middle">
              {/* Page title  and active connected node count*/}
              <Flex justify="space-between" align="center" wrap gap="small">
                  <Typography.Title level={2} style={{margin:0}}>Leaf Nodes</Typography.Title>
                  {/* how many leaf nodes have active connection */}
                  <Tag color="success">{nodesActivelyConnected} OF  {leafNodes.length} REPORTING</Tag>
              </Flex>
          </Flex>

          {/* central node status */}
          <Card>
              <Flex gap="middle" align="start">
                  {/* chip icon, flexShrink: 0 stops it getting squashed on narrow screens */}
                  <RiCpuLine size={32} style={{flexShrink:0}}/>

                  <Flex vertical gap={4}>
                      {/* central node name */}
                      <Typography.Title level={4} style={{margin:0}}>{centralNode.name}</Typography.Title>
                      {/* central node basic info */}
                      <Typography.Text type="secondary">
                          Uptime: {centralNode.uptime}  Storage: {centralNode.storageFree} free
                      </Typography.Text>

                      <ul style={{margin: "8px 0 0", paddingLeft: 20 }}>
                          <li>
                              WiFi Hotspot: <Typography.Text strong>{centralNode.hotspot}</Typography.Text>{" "}
                              ({centralNode.phonesConnected} phones connected)
                          </li>
                          <li>
                              Database: <Typography.Text strong>{centralNode.database}</Typography.Text>
                          </li>
                      </ul>
                  </Flex>
              </Flex>
          </Card>

          {/* leaf nodes statuses */}
          <Flex vertical gap="small">
              <Typography.Text strong>LEAF NODES</Typography.Text>
              <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                  }}>
                  {leafNodes.map((node)=>{
                      const status = connectionStatus[node.connection];

                      return (
                          <Card
                              key={node.id}
                              size="small"
                              style={{borderLeft: `4px solid ${token[status.edge]}`, cursor: "pointer"}}
                              hoverable
                              onClick={() => {openNode(node)}}
                          >
                              <Flex justify="space-between" align="center" gap="small">
                                  <Flex vertical>
                                      <Typography.Text strong>{node.id}</Typography.Text>
                                      <Typography.Text>Battery {node.battery}%</Typography.Text>
                                      <Typography.Text type="secondary">
                                          Connection: {node.connection}
                                          {node.lastSeen && ` ${node.lastSeen}`} {/*only if time available*/}
                                      </Typography.Text>
                                  </Flex>

                                  <Flex align="center" gap={4}>
                                      <Tag color={status.colour}>{status.label}</Tag>
                                      <RiArrowRightSLine size={18} color={ token.colorTextTertiary} />
                                  </Flex>

                              </Flex>
                          </Card>
                      )
                  })}
              </div>
          </Flex>

          {/* modal for the selected leaf node, a new one for each node */}
          {selectedNode && (
              <LeafNodeModal
                  key={selectedNode.id}
                  node={selectedNode}
                  status={connectionStatus[selectedNode.connection]}
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
              />
          )}

      </Flex>
  );
}