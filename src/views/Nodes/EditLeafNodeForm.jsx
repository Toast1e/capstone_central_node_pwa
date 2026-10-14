"use client";

// React and NextJS
import { useEffect, useState } from "react";

// UI Libraries mostly Ant design libraries
import { Alert, Button, Flex, Form, Input, InputNumber, Typography } from "antd";
import { RiMapPinLine } from "@remixicon/react";

// 6 decimal places is about 10 cm, more exact than a phone's GPS anyway
function roundCoordinate(value) {
    return Number(value.toFixed(6));
}

/**
 * Form to change a leaf node's name and location (leafNodeName, leafNodeLatitude, leafNodeLongitude).
 */
export default function EditLeafNodeForm({ node, takenNames, onSave, onCancel }) {
    // lets the "Use my location" button fill in the latitude and longitude boxes
    const [form] = Form.useForm();

    // is the browser allowed to give us the phone's location?
    // only on https (or localhost), so it won't work if the Pi serves the app over plain http
    const [canLocate, setCanLocate] = useState(false);
    useEffect(() => {
        setCanLocate(window.isSecureContext && "geolocation" in navigator);
    }, []);

    // while waiting for the phone's GPS, and what happened
    const [locating, setLocating] = useState(false);
    const [accuracy, setAccuracy] = useState(null); // metres
    const [locationError, setLocationError] = useState(null);

    // asks the phone where it is and puts the answer in the boxes
    function fillMyLocation() {
        setLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            // it worked
            (position) => {
                form.setFieldsValue({
                    leafNodeLatitude: roundCoordinate(position.coords.latitude),
                    leafNodeLongitude: roundCoordinate(position.coords.longitude),
                });
                setAccuracy(Math.round(position.coords.accuracy));
                setLocating(false);
            },
            // it didn't: usually the user said no to the permission pop-up
            (error) => {
                setLocationError(
                    error.code === error.PERMISSION_DENIED
                        ? "Location permission was refused. Allow it in your browser settings, or type the coordinates below."
                        : "Couldn't find your location. Try again outside, or type the coordinates below."
                );
                setLocating(false);
            },
            // ask for GPS accuracy, give up after 15 seconds, and don't reuse an old position
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }

    // runs when Save is pressed and every rule below passes
    function handleFinish(values) {
        onSave({
            leafNodeName: values.leafNodeName.trim(),
            // ?? null: an empty box is saved as "no location yet"
            leafNodeLatitude: values.leafNodeLatitude ?? null,
            leafNodeLongitude: values.leafNodeLongitude ?? null,
        });
    }

    // latitude and longitude only make sense together, so if one is filled in the other is needed too
    function neededWith(otherField, otherLabel) {
        return ({ getFieldValue }) => ({
            validator(_, value) {
                const otherFilled = getFieldValue(otherField) != null; // != null: not null and not undefined
                return otherFilled && value == null
                    ? Promise.reject(new Error(`Needed when ${otherLabel} is filled in`))
                    : Promise.resolve();
            },
        });
    }

    return (
        <Form
            form={form}
            layout="vertical"
            // the boxes start with the node's current values
            initialValues={{
                leafNodeName: node.leafNodeName,
                leafNodeLatitude: node.leafNodeLatitude,
                leafNodeLongitude: node.leafNodeLongitude,
            }}
            onFinish={handleFinish}
        >
            {/* name: required, max 30 characters, and not already used by another leaf node */}
            <Form.Item
                label="Name"
                name="leafNodeName"
                rules={[
                    { required: true, whitespace: true, message: "Give the leaf node a name" },
                    { max: 30, message: "Keep it to 30 characters" },
                    {
                        validator(_, value) {
                            const name = (value ?? "").trim().toLowerCase();
                            const taken = takenNames.some((other) => other.toLowerCase() === name);
                            return taken
                                ? Promise.reject(new Error("Another leaf node already has this name"))
                                : Promise.resolve();
                        },
                    },
                ]}
            >
                <Input maxLength={30} />
            </Form.Item>

            {/* location: the button fills in the boxes, or the farmer types them */}
            <Flex vertical gap="small" style={{ marginBottom: 16 }}>
                <Typography.Text strong>Location</Typography.Text>
                <Button
                    icon={<RiMapPinLine size={18} />}
                    onClick={fillMyLocation}
                    loading={locating}
                    disabled={!canLocate}
                    block
                >
                    Use my location
                </Button>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {canLocate
                        ? "Stand next to the leaf node, then tap the button."
                        : "Location isn't available on this connection. Type the coordinates instead."}
                    {/* \u00a0 is a space that never breaks, so "m" can't end up alone on the next line */}
                    {accuracy !== null && ` Accurate to about ${accuracy}\u00a0m.`}
                </Typography.Text>
                {locationError && <Alert type="warning" showIcon title={locationError} />}
            </Flex>

            {/* latitude and longitude side by side; they can also be typed or corrected by hand */}
            <Flex gap="small">
                <Form.Item
                    label="Latitude"
                    name="leafNodeLatitude"
                    style={{ flex: 1 }}
                    extra="Negative in South Africa, e.g. -33.93"
                    // check this box again whenever longitude changes
                    dependencies={["leafNodeLongitude"]}
                    rules={[
                        { type: "number", min: -90, max: 90, message: "Must be between -90 and 90" },
                        neededWith("leafNodeLongitude", "longitude"),
                    ]}
                >
                    {/* controls={false} hides the up/down arrows, which are no use for coordinates */}
                    <InputNumber controls={false} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Longitude"
                    name="leafNodeLongitude"
                    style={{ flex: 1 }}
                    extra="e.g. 18.86"
                    dependencies={["leafNodeLatitude"]}
                    rules={[
                        { type: "number", min: -180, max: 180, message: "Must be between -180 and 180" },
                        neededWith("leafNodeLatitude", "latitude"),
                    ]}
                >
                    <InputNumber controls={false} style={{ width: "100%" }} />
                </Form.Item>
            </Flex>

            {/* Cancel goes back without saving; Save checks the rules first */}
            <Flex gap="small" justify="end">
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save</Button>
            </Flex>
        </Form>
    );
}