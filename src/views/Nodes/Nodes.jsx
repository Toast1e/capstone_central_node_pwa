"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries--Ant design libraries
import {Alert, Flex, Spin, Tag, Typography, Card, theme} from "antd";
import { RiCpuLine, RiArrowRightSLine } from "@remixicon/react";

// Our own components and API calls
import LeafNodeModal from "./LeafNodeModal";
import { getCentralNode } from "../../../lib/centralNode";
import {
    clearLeafNodeCoordinates,
    getLeafNodeCards,
    renameLeafNode,
    updateLeafNodeCoordinates,
} from "../../../lib/nodes";

// ------ Connection status display ------
// tag label and colour for each connection level
const connectionStatus = {
    GOOD: { label: "OK", colour: "success", edge: "colorSuccess" },
    LOW: { label: "WEAK SIGNAL", colour: "warning", edge: "colorWarning" },
    NONE: { label: "NO SIGNAL", colour: "error", edge: "colorError" },
};

// unix seconds -> "14:56" on this device, or null if the node has never been heard
function formatTime(unixSeconds) {
    if (!unixSeconds) return null;
    return new Date(unixSeconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// seconds -> "14 days", "5 hours" or "12 min"
function formatUptime(seconds) {
    if (seconds == null) return "Unknown";
    const days = Math.floor(seconds / 86400);
    if (days >= 1) return `${days} ${days === 1 ? "day" : "days"}`;
    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    return `${Math.floor(seconds / 60)} min`;
}

export default function Nodes() {

    // the central node and the leaf nodes, loaded from the backend
    const [centralNode, setCentralNode] = useState(null);
    // in state so an edit shows straight away
    const [leafNodes, setLeafNodes] = useState([]);

    // true if the backend couldn't be reached
    const [failed, setFailed] = useState(false);

    // still waiting for the backend
    const loading = centralNode === null && !failed;

    // load both when the page opens
    useEffect(() => {
        // if the page closes before the answer arrives, ignore the answer
        let ignore = false;

        Promise.all([getCentralNode(), getLeafNodeCards()])
            .then(([central, cards]) => {
                if (ignore) return;
                setCentralNode(central);
                // lastSeen is the time text the cards show
                setLeafNodes(cards.map((node) => ({ ...node, lastSeen: formatTime(node.lastConnectedAt) })));
            })
            .catch(() => {
                if (!ignore) setFailed(true);
            });

        return () => {
            ignore = true;
        };
    }, []);

    // number of leaf nodes with active connection, show in header tag
    const nodesActivelyConnected = leafNodes.filter((node) => node.connection !== "NONE").length;

    // theme colours from themeConfig.js, used for the card edges
    const { token } = theme.useToken();

    // the leaf node whose pop-up is showing, and whether it's open kept separate so the pop-up keeps its content while it animates closed
    // only the ID is stored, and the node is looked up from the list every time, so the pop-up always shows the latest name and location after an edit
    const [selectedNodeID, setSelectedNodeID] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const selectedNode = leafNodes.find((node) => node.leafNodeID === selectedNodeID);

    function openNode(node) {
        setSelectedNodeID(node.leafNodeID);
        setModalOpen(true);
    }

    // copies in the edited fields (name, latitude, longitude) for one leaf node
    async function saveNode(leafNodeID, changes) {
        const node = leafNodes.find((item) => item.leafNodeID === leafNodeID);
        if (!node) throw new Error("Leaf node not found");

        function applyChanges(savedChanges) {
            setLeafNodes((current) =>
                current.map((item) =>
                    item.leafNodeID === leafNodeID ? { ...item, ...savedChanges } : item
                )
            );
        }

        if (changes.leafNodeName !== node.leafNodeName) {
            await renameLeafNode(leafNodeID, changes.leafNodeName);
            applyChanges({ leafNodeName: changes.leafNodeName });
        }

        const coordinatesChanged =
            changes.leafNodeLatitude !== node.leafNodeLatitude ||
            changes.leafNodeLongitude !== node.leafNodeLongitude;
        if (coordinatesChanged) {
            if (changes.leafNodeLatitude == null && changes.leafNodeLongitude == null) {
                await clearLeafNodeCoordinates(leafNodeID);
            } else {
                await updateLeafNodeCoordinates(
                    leafNodeID,
                    changes.leafNodeLatitude,
                    changes.leafNodeLongitude
                );
            }
            applyChanges({
                leafNodeLatitude: changes.leafNodeLatitude,
                leafNodeLongitude: changes.leafNodeLongitude,
            });
        }
    }

    if (failed) {
        return <Alert type="error" showIcon title="Couldn't load the nodes. Check your connection and try again." />;
    }

    if (loading) {
        return (
            <Flex justify="center">
                <Spin />
            </Flex>
        );
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
                          Description: {centralNode.description} 
                      </Typography.Text>

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
                              key={node.leafNodeID}
                              size="small"
                              style={{borderLeft: `4px solid ${token[status.edge]}`, cursor: "pointer"}}
                              hoverable
                              onClick={() => {openNode(node)}}
                          >
                              <Flex justify="space-between" align="center" gap="small">
                                  <Flex vertical>
                                      <Typography.Text strong>{node.leafNodeName}</Typography.Text>
                                      <Typography.Text>Battery {node.leafNodeBattery}%</Typography.Text>
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
                  key={selectedNode.leafNodeID}
                  node={selectedNode}
                  status={connectionStatus[selectedNode.connection]}
                  leafNodes={leafNodes}
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onSave={(changes)=> saveNode(selectedNode.leafNodeID, changes)}
              />
          )}

      </Flex>
  );
}