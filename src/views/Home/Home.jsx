"use client";

// React and NextJS
import { useEffect, useState } from 'react';

// own components and data
import ThresholdChart from "../../components/ThresholdChart/ThresholdChart";
import {MILDEW_THRESHOLDS} from "./mildewThresholds";
import ConditionTimeline from "../../components/ConditionTimeline/ConditionTimeline";
import { useSettings } from "../../contexts/SettingsContext";
import { apiGet } from "@/lib/api";

// UI Libraries mostly Ant design libraries
import { Typography, Tag, Flex, Alert, Button, Card, Statistic, theme, Segmented } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';

const REFRESH_MS = 30000;

// ------ Chart options ------
const diseaseOptions = [
    { label: "Powdery", value: "powdery" },
    { label: "Downy", value: "downy" },
];

const timeRangeOptions = [
    { label: "24h", value: "24h" },
    { label: "7 days", value: "7d" },
];

// orange for temperature
const TEMPERATURE_COLOUR = "#eb6834";

// ------ Helpers: API data -> what the page and charts use ------

// unix seconds -> a Date. The charts and ConditionTimeline expect `time` to be a Date
// (ConditionTimeline calls time.getHours()), same as the mock readings had.
const toChartTime = (unixSeconds) => new Date(unixSeconds * 1000);

// average of the numbers in a list (missing values are skipped), 1 decimal place, null if there are none
function average(values) {
    const numbers = values.filter((v) => typeof v === "number");
    if (numbers.length === 0) return null;
    return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 10) / 10;
}

// Magnus formula; returns null when the inputs are not usable
function calculateDewpoint(humidity, temperature) {
    if (typeof humidity !== "number" || typeof temperature !== "number" || humidity <= 0) return null;
    const gamma = Math.log(humidity / 100) + (17.62 * temperature) / (243.12 + temperature);
    return Math.round(((243.12 * gamma) / (17.62 - gamma)) * 10) / 10;
}

// The node reports every 15 min; the charts want one point an hour, so average each hour.
// Returns [{ time, temperature, humidity, wind, leafWetness, dewPoint }], oldest first.
function toHourlyReadings(rows) {
    const hours = new Map(); // start of the hour (unix s) -> the values seen in it
    for (const row of rows) {
        const taken = row.realTimeLog ?? row.receivedAt;
        if (taken == null) continue;
        const hour = Math.floor(taken / 3600) * 3600;
        if (!hours.has(hour)) hours.set(hour, { temperature: [], humidity: [], wind: [], leafWetness: [] });
        const bucket = hours.get(hour);
        bucket.temperature.push(row.temperature);
        bucket.humidity.push(row.humidity);
        bucket.wind.push(row.windSpeed);
        bucket.leafWetness.push(row.leafWetness);
    }
    return [...hours.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([hour, bucket]) => {
            const temperature = average(bucket.temperature);
            const humidity = average(bucket.humidity);
            return {
                time: toChartTime(hour),
                temperature,
                humidity,
                wind: average(bucket.wind),
                leafWetness: average(bucket.leafWetness),
                dewPoint: calculateDewpoint(humidity, temperature),
            };
        });
}

// One chart point per reading that has a value for it
const toPoints = (readings, key, series) =>
    readings
        .filter((reading) => reading[key] != null)
        .map((reading) => ({ time: reading.time, value: reading[key], series }));

// "12 min ago", from unix seconds
function timeAgo(unixSeconds) {
    const minutes = Math.max(0, Math.round((Date.now() / 1000 - unixSeconds) / 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours} h ago`;
    return `${Math.round(hours / 24)} days ago`;
}

// Each node counts once, at its highest open alert (0 low, 1 moderate, 2 high)
function summariseAlerts(alerts) {
    const worst = {}; // leafNodeID -> highest open severity
    for (const alert of alerts) {
        for (const node of alert.leafNodes ?? []) {
            worst[node.leafNodeID] = Math.max(worst[node.leafNodeID] ?? 0, alert.alertSeverity ?? 0);
        }
    }
    const nodesAt = (severity) =>
        Object.keys(worst).filter((id) => worst[id] === severity).map((id) => `LN ${id}`);
    return { high: nodesAt(2), moderate: nodesAt(1), low: nodesAt(0) };
}

export default function Home() {
    // theme colours from themeConfig passed to the chart
    const {token} = theme.useToken();

    // the central node's name from the Profile page settings
    const { centralNodeName, centralNodeLoading } = useSettings();
    const centralNodeLabel = centralNodeName
        ?? (centralNodeLoading ? "Loading central node…" : "Central node unavailable");

    // every leaf node, and which one is showing (position in that list)
    const [leafNodes, setLeafNodes] = useState([]);
    const [nodeIndex, setNodeIndex] = useState(0);
    const currentNode = leafNodes[nodeIndex];

    // open alerts for the banner
    const [alerts, setAlerts] = useState([]);

    // the selected node's newest reading, and its readings for the charts (one point an hour)
    const [details, setDetails] = useState(null);
    const [readings, setReadings] = useState([]);

    const [error, setError] = useState(null);

    // which disease's risk zones the charts show, and time period shown
    const [disease, setDisease] = useState("powdery");
    const [timeRange, setTimeRange] = useState("24h");

    // thresholds for diseases
    const thresholds = MILDEW_THRESHOLDS[disease];

    // the node list and the alerts banner, refreshed every 30 s
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const [status, active] = await Promise.all([
                    apiGet("/api/leafnodes/status"),
                    apiGet("/api/alerts"),
                ]);
                if (cancelled) return;
                setLeafNodes(status.leafNodes ?? []);
                setAlerts(active.alerts ?? []);
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, []);

    // the selected node's cards and charts, reloaded when the node or time range changes
    const nodeId = currentNode?.leafNodeID;
    useEffect(() => {
        if (nodeId == null) return;
        let cancelled = false;
        setDetails(null);
        setReadings([]);

        async function load() {
            try {
                const [detail, history] = await Promise.all([
                    apiGet(`/api/leafnodes/${nodeId}/details`),
                    apiGet("/api/history", { hours: timeRange === "24h" ? 24 : 168, leafNodeID: nodeId }),
                ]);
                if (cancelled) return;
                setDetails(detail);
                setReadings(toHourlyReadings(history.reading ?? []));
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [nodeId, timeRange]);

    // "sensor readings" one card per reading type
    const latest = details?.readings ?? {};
    const metrics = [
        { title: "HUMIDITY", value: latest.humidity, unit: "%" },
        { title: "TEMPERATURE", value: latest.temperature, unit: "°C" },
        { title: "LEAF WETNESS", value: latest.leafWetness, unit: "%" },
        { title: "WIND", value: latest.windSpeed, unit: "m/s" },
    ];

    // alerts banner numbers
    const risk = summariseAlerts(alerts);
    const needAttention = risk.high.length + risk.moderate.length;

    return (
    <Flex vertical gap="large">
      {/* Page title */}
      <Flex vertical gap={4}>
          <Typography.Title level={2} style={{margin: 0}}>{centralNodeLabel} Overview</Typography.Title>
          {/* number nodes being monitored */}
          <Typography.Text type="secondary"> {leafNodes.length} Leaf Nodes monitored</Typography.Text>
      </Flex>

      {error && <Alert type="error" showIcon title="Couldn't load the latest data" description={error} />}

        {/* alerts banner */}
      {needAttention === 0 ? (
          <Alert type="success" showIcon title="No areas need attention" />
      ) : (
          <Alert
              type={risk.high.length > 0 ? "error" : "warning"}
              showIcon
              title={`${needAttention} ${needAttention === 1 ? "area needs" : "areas need"} attention`}
              description={
                  <Flex vertical gap={8}>
                      {/* alert details */}
                      {risk.high.length > 0 && <span>High mildew risk: {risk.high.join(", ")}.</span>}
                      {risk.moderate.length > 0 && <span>Moderate mildew risk: {risk.moderate.join(", ")}.</span>}
                      {/* alerts severity breakdown */}
                      <Flex gap={4} wrap>
                          {risk.high.length > 0 && <Tag color="red">{risk.high.length} High</Tag>}
                          {risk.moderate.length > 0 && <Tag color="orange">{risk.moderate.length} Moderate</Tag>}
                          {risk.low.length > 0 && <Tag color="green">{risk.low.length} Low</Tag>}
                      </Flex>
                  </Flex>
              }
          />
      )}

        {/* Leaf nodes section */}
        <Flex vertical gap="middle">
            {/* Leaf node selector */}
            <Flex justify="space-between" align="center">
                {/* disable previous button on the first node */}
                <Button
                    type="text"
                    aria-label="Previous leaf node"
                    icon={<RiArrowLeftLine size={18} />}
                    disabled={nodeIndex === 0}
                    onClick={() => setNodeIndex(nodeIndex - 1)}
                />

                {/* current selected node label */}
                <Typography.Text strong>
                    {currentNode ? `Leaf Node ${currentNode.leafNodeID}` : "No leaf nodes yet"}
                </Typography.Text>

                {/* disable next button on the last node */}
                <Button
                    type="text"
                    aria-label="Next leaf node"
                    icon={<RiArrowRightLine size={18} />}
                    disabled={nodeIndex >= leafNodes.length - 1}
                    onClick={() => setNodeIndex(nodeIndex + 1)}
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
                        <Statistic
                            title={metric.title}
                            value={metric.value == null ? "—" : Math.round(metric.value * 10) / 10}
                            suffix={metric.value == null ? undefined : metric.unit}
                        />
                    </Card>
                ))}
            </div>
            <Typography.Text type="secondary">
                {details?.lastReadingAt ? `Last reading ${timeAgo(details.lastReadingAt)}` : "No readings yet"}
            </Typography.Text>

            {/* chart controls, one row that applies to all charts */}
            <Flex justify="space-between" align="center" wrap gap="small">
                <Segmented options={diseaseOptions} value={disease} onChange={setDisease} />
                <Segmented options={timeRangeOptions} value={timeRange} onChange={setTimeRange} />
            </Flex>

            {/* timeline of when each disease's conditions were met */}
            <ConditionTimeline
                readings={readings}
                thresholds={{[disease]: MILDEW_THRESHOLDS[disease]}}
                timeRange={timeRange} />

            {/* temperature and dew point chart */}
            <ThresholdChart
                title="Temperature and dew point"
                data={[...toPoints(readings, "temperature", "Temperature"), ...toPoints(readings, "dewPoint", "Dew point")]}
                colors={{ Temperature: TEMPERATURE_COLOUR, "Dew point": token.colorPrimary }}
                unit="°C"
                yDomain={[0, 40]}
                riskZone={{
                    from: thresholds.temperature.min,
                    to: thresholds.temperature.max,
                    label: `${thresholds.label} risk: ${thresholds.temperature.min}–${thresholds.temperature.max} °C`,
                }}
                timeRange={timeRange}
            />

            {/* humidity chart */}
            <ThresholdChart
                title="Relative humidity"
                data={toPoints(readings, "humidity", "Humidity")}
                colors={{ Humidity: token.colorPrimary }}
                unit="%"
                yDomain={[0, 100]}
                riskZone={{
                    from: thresholds.humidity.min,
                    to: 100,
                    label: `${thresholds.label} risk: above ${thresholds.humidity.min}%`,
                }}
                timeRange={timeRange}
            />

            {/* wind chart */}
            <ThresholdChart
                title="Wind speed"
                data={toPoints(readings, "wind", "Wind")}
                colors={{ Wind: token.colorPrimary }}
                unit=" m/s"
                yDomain={[0, 12]}
                riskZone={{
                    from: thresholds.wind.min,
                    to: 12,
                    label: `${thresholds.label} risk: above ${thresholds.wind.min} m/s`,
                }}
                timeRange={timeRange}
            />

        </Flex>
    </Flex>
  );
}