"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries mostly Ant design libraries
import { Alert, Button, Card, Descriptions, Flex, Modal, Statistic, Tag, Typography } from "antd";
import { RiArrowLeftLine, RiMapPin2Line } from "@remixicon/react";

// Our own components and data
import FarmMap from "./FarmMap";
import { fetchLeafNodeDetails } from "./mockNodeDetails";

/**
 * modal pop-up with one leaf node's details and a button to a mock map of where it is.
 */
export default function LeafNodeModal({ node, status, open, onClose }) {
    // the node's full details once they've arrived
    const [details, setDetails] = useState(null);

    // true if the details couldn't be loaded
    const [failed, setFailed] = useState(false);

    // which view the pop-up shows: "readings" or "map"
    const [view, setView] = useState("readings");

    // still waiting for the details
    const loading = details === null && !failed;

    // ask for the node's details whenever the pop-up opens
    useEffect(() => {
        if (!open) return;

        // if the pop-up closes before the answer arrives, ignore the answer
        let ignore = false;

        fetchLeafNodeDetails(node.id)
            .then((result) => {
                if (ignore) return;
                setDetails(result);
                setFailed(false);
            })
            .catch(() => {
                if (!ignore) setFailed(true);
            });

        return () => {
            ignore = true;
        };
    }, [open, node.id]);

    // the button dynamically changes between readings and map view
    const footer =
        view === "readings" ? (
            <Button type="primary" icon={<RiMapPin2Line size={16} />} disabled={!details} onClick={() => setView("map")}>
                Show on farm map
            </Button>
        ) : (
            <Button icon={<RiArrowLeftLine size={16} />} onClick={() => setView("readings")}>
                Back to readings
            </Button>
        );

    return (
        <Modal
            open={open}
            onCancel={onClose}
            // back to the readings view once it has finished closing
            afterClose={() => setView("readings")}
            title={
                <Flex align="center" gap="small">
                    {node.id}
                    <Tag color={status.colour}>{status.label}</Tag>
                </Flex>
            }
            loading={loading}
            footer={footer}
            centered
        >
            {/* couldn't load the details */}
            {failed && <Alert type="error" showIcon title="Couldn't load this node's details. Close and try again." />}

            {/* readings view */}
            {details && view === "readings" && (
                <Flex vertical gap="middle">
                    {/* warn that these readings are old when the node has no signal */}
                    {node.connection === "NONE" && (
                        <Alert type="warning" showIcon title={`No signal. Showing the last readings, from ${details.lastReading}.`} />
                    )}

                    {/* this node's own sensor readings */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                        <Card size="small">
                            <Statistic title="Temperature" value={details.readings.temperature} suffix="°C" />
                        </Card>
                        <Card size="small">
                            <Statistic title="Humidity" value={details.readings.humidity} suffix="%" />
                        </Card>
                        <Card size="small">
                            <Statistic title="Leaf wetness" value={details.readings.leafWetness} suffix="%" />
                        </Card>
                        <Card size="small">
                            <Statistic title="Wind" value={details.readings.wind} suffix="m/s" />
                        </Card>
                    </div>

                    {/* device details */}
                    <Descriptions
                        size="small"
                        column={1}
                        items={[
                            { key: "battery", label: "Battery", children: `${node.battery}%` },
                            {
                                key: "signal",
                                label: "Signal",
                                children: details.signal === null ? "None" : `${details.signal} dBm`,
                            },
                            { key: "lastReading", label: "Last reading", children: details.lastReading },
                            {
                                key: "location",
                                label: "Location",
                                children: `Block ${details.location.block}, row ${details.location.row}`,
                            },
                        ]}
                    />
                </Flex>
            )}

            {/* map view */}
            {details && view === "map" && (
                <Flex vertical gap="small">
                    <FarmMap selectedId={node.id} />
                    <Typography.Text type="secondary">
                        {node.id} is in block {details.location.block}, row {details.location.row}.
                    </Typography.Text>
                </Flex>
            )}
        </Modal>
    );
}