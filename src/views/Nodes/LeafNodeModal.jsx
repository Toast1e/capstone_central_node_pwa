"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries mostly Ant design libraries
import { Alert, Button, Descriptions, Flex, Modal, Tag, Typography } from "antd";
import { RiArrowLeftLine, RiMapPin2Line, RiPencilLine} from "@remixicon/react";

// Our own components and data
import FarmMap from "./FarmMap";
import EditLeafNodeForm from "./EditLeafNodeForm";
import { fetchLeafNodeDetails } from "./mockNodeDetails";

/**
 * modal pop-up with one leaf node's details and a button to a mock map of where it is.
 */
export default function LeafNodeModal({ node, status, leafNodes, open, onClose, onSave }) {
    // the node's full details once they've arrived
    const [details, setDetails] = useState(null);

    // true if the details couldn't be loaded
    const [failed, setFailed] = useState(false);

    // which view the pop-up shows: "readings" or "map" or "edit"
    const [view, setView] = useState("readings");

    // still waiting for the details
    const loading = details === null && !failed;

    // the other leaf nodes' names: the edited name can't be any of these
    const takenNames = leafNodes
        .filter((other) => other.leafNodeID !== node.leafNodeID)
        .map((other) => other.leafNodeName);

    // ask for the node's details whenever the pop-up opens
    useEffect(() => {
        if (!open) return;

        // if the pop-up closes before the answer arrives, ignore the answer
        let ignore = false;

        fetchLeafNodeDetails(node.leafNodeID)
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
    }, [open, node.leafNodeID]);

    // save the changes, then go back to the readings
    function handleSave(changes) {
        onSave(changes);
        setView("readings");
    }

    // the buttons at the bottom change with the view; the edit form has its own Save and Cancel
    // (short labels so both buttons fit on one line on a phone)
    let footer =null;
    if (view === "readings") {
        footer = (
            <Flex gap="small" justify="end" wrap>
                <Button icon={<RiPencilLine size={16}/>} onClick={() => setView("edit")}>
                    Edit
                </Button>
                <Button type="primary" icon={<RiMapPin2Line size={16}/>} disabled={!details} onClick={()=>{setView("map")}}>
                    Show on map
                </Button>
            </Flex>
        );
    } else if (view === "map") {
        footer = (
            <Button icon={<RiArrowLeftLine size={16}/>} onClick={() => setView("readings")}>
                Back to readings
            </Button>
        )
    }

    // "-33.934123, 18.861235", or a note when there's no location yet
    const coordinates =
        node.leafNodeLatitude == null
            ? "Not set yet"
            : `${node.leafNodeLatitude}, ${node.leafNodeLongitude}`;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            // back to the readings view once it has finished closing
            afterClose={() => setView("readings")}
            title={
                <Flex align="center" gap="small">
                    {node.leafNodeName}
                    <Tag color={status.colour}>{status.label}</Tag>
                </Flex>
            }
            // edit form doesn't need deatails so won't wait for them to load
            loading={loading && view !== "edit"}
            footer={footer}
            centered
        >
            {/* couldn't load the details */}
            {failed && view !== "edit" &&(
                <Alert type="error" showIcon title="Couldn't load this node's details. Close and try again." />
            )}

            {/* readings view */}
            {details && view === "readings" && (
                <Flex vertical gap="middle">
                    {/* warn when the node has no signal */}
                    {node.connection === "NONE" && (
                        <Alert type="warning" showIcon title={`No signal since ${details.lastReading}.`} />
                    )}

                    {/* device details */}
                    <Descriptions
                        size="small"
                        column={1}
                        items={[
                            { key: "battery", label: "Battery", children: `${node.leafNodeBattery}%` },
                            {
                                key: "signal",
                                label: "Signal",
                                children: details.signal === null ? "None" : `${details.signal} dBm`,
                            },
                            { key: "lastReading",
                                label: "Last reading",
                                children: details.lastReading
                            },
                            {
                                key: "coordinates",
                                label: "Coordinates",
                                children: coordinates,
                            },
                        ]}
                    />
                </Flex>
            )}

            {/* map view */}
            {details && view === "map" && (
                <Flex vertical gap="small">
                    <FarmMap selectedId={node.leafNodeID} leafNodes={leafNodes} />
                    <Typography.Text type="secondary">
                        {node.leafNodeName} is in block {details.location.block}, row {details.location.row}.
                    </Typography.Text>
                </Flex>
            )}

            {/* edit view */}
            {view === "edit" && (
                <EditLeafNodeForm
                    node={node}
                    takenNames={takenNames}
                    onSave={handleSave}
                    onCancel={() => setView("readings")}
                />
            )}

        </Modal>
    );
}