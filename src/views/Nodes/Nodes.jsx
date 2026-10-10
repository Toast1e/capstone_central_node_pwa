"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries--Ant design libraries
import {Flex, Tag, Typography, Card, Alert, Spin, theme} from "antd";
import { RiCpuLine, RiArrowRightSLine } from "@remixicon/react";

// Our own components
import LeafNodeModal from "./LeafNodeModal";
import { apiGet } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";

// how often the page re-fetches, in ms
const REFRESH_MS = 30000;

// ------ Connection status display ------
// tag label and colour for each connection level
const connectionStatus = {
    GOOD: { label: "OK", colour: "success", edge: "colorSuccess" },
    LOW: { label: "WEAK SIGNAL", colour: "warning", edge: "colorWarning" },
    NONE: { label: "NO SIGNAL", colour: "error", edge: "colorError" },
};

// ------ Backend -> UI shape ------
// the API sends unix seconds and numeric IDs, the cards want "LN-01" and "14:56".
// keeps the same fields the placeholder data had (id, battery, connection, lastSeen) so LeafNodeModal still works
function toLeafNode(n) {
    return {
        id: `LN-${String(n.leafNodeID).padStart(2, "0")}`,
        leafNodeID: n.leafNodeID,
        battery: n.leafNodeBattery,   // null until the leaf firmware sends "battery"
        connection: n.connection,
        lastSeen: n.lastConnectedAt
            ? new Date(n.lastConnectedAt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : null,
        rssi: n.rssi,
        snr: n.snr,
    };
}

// seconds -> "14 days" / "5 hours" / "12 minutes"
function formatUptime(seconds) {
    if (seconds == null) return "—";
    const days = Math.floor(seconds / 86400);
    if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
    return `${Math.floor(seconds / 60)} minutes`;
}

export default function Nodes() {
    // central-node information is shared from SettingsContext; leaf status is page-specific.
    const { centralNode } = useSettings();
    const [leafNodes, setLeafNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const leaves = await apiGet("/api/leafnodes/status");
                if (cancelled) return;
                setLeafNodes(leaves.leafNodes.map(toLeafNode));
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => { cancelled = true; clearInterval(timer); };
    }, []);

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

  if (loading) return <Flex justify="center"><Spin /></Flex>;

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

          {/* shown when the central node can't be reached, old data stays on screen below */}
          {error && <Alert type="error" showIcon title="Can't reach the central node" description={error} />}

          {/* central node status */}
          {centralNode && (
          <Card>
              <Flex gap="middle" align="start">
                  {/* chip icon, flexShrink: 0 stops it getting squashed on narrow screens */}
                  <RiCpuLine size={32} style={{flexShrink:0}}/>

                  <Flex vertical gap={4}>
                      {/* central node name */}
                      <Typography.Title level={4} style={{margin:0}}>{centralNode.name}</Typography.Title>
                      {/* central node basic info */}
                      <Typography.Text type="secondary">
                          Uptime: {formatUptime(centralNode.uptimeSeconds)}  Storage: {centralNode.storageFreePct}% free
                      </Typography.Text>

                      <ul style={{margin: "8px 0 0", paddingLeft: 20 }}>
                          {/* the API can't see the Pi's hotspot yet, so these only show once it sends them */}
                          {centralNode.hotspot != null && (
                              <li>
                                  WiFi Hotspot: <Typography.Text strong>{centralNode.hotspot}</Typography.Text>{" "}
                                  {centralNode.phonesConnected != null && `(${centralNode.phonesConnected} phones connected)`}
                              </li>
                          )}
                          <li>
                              LoRa receiver: <Typography.Text strong>{centralNode.serialConnected ? "Connected" : "Not connected"}</Typography.Text>
                          </li>
                          <li>
                              Database: <Typography.Text strong>{centralNode.databaseOk ? "OK" : "Error"}</Typography.Text>
                          </li>
                      </ul>
                  </Flex>
              </Flex>
          </Card>
          )}

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
                                      <Typography.Text>Battery {node.battery != null ? `${node.battery}%` : "—"}</Typography.Text>
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