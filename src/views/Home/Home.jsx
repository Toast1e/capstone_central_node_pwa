"use client";

// React and NextJS
import { useEffect, useState } from "react";

// own components and data
import { MILDEW_THRESHOLDS as mildewThresholds } from "./mildewThresholds";
import ConditionTimeline from "../../components/ConditionTimeline/ConditionTimeline";
import ThresholdGraph from "../../components/ThresholdGraph/ThresholdGraph";
import { useSettings } from "../../contexts/SettingsContext";

import { apiFetch } from "../../../lib/api";

// UI Libraries mostly Ant design libraries
import {
  Typography,
  Tag,
  Flex,
  Alert,
  Button,
  Card,
  Statistic,
  theme,
  Segmented,
} from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

const totalNodes = 6;

// no sensors for these yet, so they stay as placeholders
const unmeasuredMetrics = [
  { title: "LEAF WETNESS", value: 60, unit: "%" },
  { title: "WIND", value: 9.4, unit: "m/s" },
];

const severityLabels = { 2: "high", 1: "moderate", 0: "low" };

async function loadHistory(hours, leafNodeID) {
  const { reading } = await apiFetch(
    `/api/history?hours=${hours}&leafNodeID=${leafNodeID}`,
  );
  return reading.map((r) => ({
    RealTimeLog: toLocalText(r.realTimeLog ?? r.receivedAt),
    Temperature: r.temperature,
    Humidity: r.humidity,
  }));
}

const loadLatest = (leafNodeID) =>
  apiFetch(`/api/leafnodes/${leafNodeID}/details`);

async function loadAlerts() {
  const { alerts } = await apiFetch("/api/alerts");
  return alerts;
}

// A node can have several open alerts (low, then moderate, then high each
// raise one), so keep only the worst severity per node.
function worstSeverityByNode(alerts) {
  const worst = new Map();
  for (const alert of alerts) {
    for (const { leafNodeID } of alert.leafNodes) {
      worst.set(
        leafNodeID,
        Math.max(worst.get(leafNodeID) ?? -1, alert.alertSeverity),
      );
    }
  }
  return worst;
}

// "Updated 14:30", or with the date when the reading isn't from today
function updatedNote(sec) {
  const d = new Date(sec * 1000);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return `Updated ${time}`;
  const day = d.toLocaleDateString([], { day: "numeric", month: "short" });
  return `Updated ${day} ${time}`;
}

// ------ Chart options ------
const diseaseOptions = [
  { label: "Powdery", value: "powdery" },
  { label: "Downy", value: "downy" },
];

const timeRangeOptions = [
  { label: "24h", value: "24h" },
  { label: "7 days", value: "7d" },
];

// unix seconds -> "YYYY-MM-DD HH:MM:SS" (same text format your CSVs used)
function toLocalText(sec) {
  const d = new Date(sec * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Magnus formula; returns null when the inputs are not usable
function calculateDewpoint(humidity, temperature) {
  if (
    typeof humidity !== "number" ||
    typeof temperature !== "number" ||
    humidity <= 0
  ) {
    return null;
  }
  const gamma =
    Math.log(humidity / 100) + (17.62 * temperature) / (243.12 + temperature);
  return Math.round(((243.12 * gamma) / (17.62 - gamma)) * 10) / 10; // 1 decimal place
}

// timestamp -> milliseconds, used for sorting.
function toTime(ts) {
  return new Date(String(ts).replace(" ", "T")).getTime();
}

// orange for temperature
const temperatureColour = "#eb6834";

export default function Home() {
  // theme colours from themeConfig passed to the chart
  const { token } = theme.useToken();

  // the central node's name from the Profile page settings
  const { username } = useSettings();

  //which leaf node currently shown from 1 to totalNodes
  const [node, setNode] = useState(1);

  // which disease's risk zones the charts show, and time period shown
  const [disease, setDisease] = useState("powdery");
  const [timeRange, setTimeRange] = useState("24h");

  // readings shown on the temperature and humidity charts
  const [graphReadings, setGraphReadings] = useState([]);

  // thresholds for diseases
  const thresholds = mildewThresholds[disease];

  // newest reading for the selected node (null while loading)
  const [latest, setLatest] = useState(null);

  // for graphs
  useEffect(() => {
    let cancelled = false;
    const hours = timeRange === "24h" ? 24 : 168;

    loadHistory(hours, node)
      .then((rows) => {
        if (!cancelled) setGraphReadings(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setGraphReadings([]);
      });

    return () => {
      cancelled = true;
    };
  }, [timeRange, node]);

  // For temp and humidity card values
  useEffect(() => {
    let cancelled = false;
    setLatest(null); // don't show the previous node's values while loading

    async function refresh() {
      try {
        const data = await loadLatest(node);
        if (!cancelled) setLatest(data);
      } catch (err) {
        console.error(err);
      }
    }

    refresh();
    const id = setInterval(refresh, 60_000); // pick up new readings every minute
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [node]);

  const [alerts, setAlerts] = useState([]);

  /// for alerts
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const data = await loadAlerts();
        if (!cancelled) setAlerts(data);
      } catch (err) {
        console.error(err);
      }
    }

    refresh();
    const id = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []); // not node-specific, the banner covers every node

  // [leafNodeID, worst open severity], worst first
  const nodeRisks = [...worstSeverityByNode(alerts).entries()].sort(
    (a, b) => b[1] - a[1] || a[0] - b[0],
  );
  const needAttention = nodeRisks.filter(([, severity]) => severity >= 1);
  const countAt = (severity) =>
    nodeRisks.filter(([, s]) => s === severity).length;

  const lastReadingNote = !latest
    ? "Loading…"
    : latest.lastReadingAt == null
      ? "No readings yet"
      : updatedNote(latest.lastReadingAt);

  const metrics = [
    {
      title: "HUMIDITY",
      value: latest?.readings.humidity ?? "–",
      unit: "%",
      note: lastReadingNote,
    },
    {
      title: "TEMPERATURE",
      value: latest?.readings.temperature ?? "–",
      unit: "°C",
      note: lastReadingNote,
    },
    ...unmeasuredMetrics,
  ];
  const graphHumidity = graphReadings.map((reading) => ({
    time: reading.RealTimeLog,
    value: reading.Humidity,
    series: "Humidity",
  }));

  const graphTemp = graphReadings.flatMap((reading) => {
    const points = [
      {
        time: reading.RealTimeLog,
        value: reading.Temperature,
        series: "Temperature",
      },
    ];
    const dewpoint = calculateDewpoint(reading.Humidity, reading.Temperature);
    if (dewpoint !== null) {
      points.push({
        time: reading.RealTimeLog,
        value: dewpoint,
        series: "Dew point",
      });
    }
    return points;
  });

  return (
    <Flex vertical gap="large">
      {/* Page title */}
      <Flex vertical gap={4}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {username} Overview
        </Typography.Title>
        {/* number nodes being monitored */}
        <Typography.Text type="secondary">
          {" "}
          {totalNodes} Leaf Nodes monitored
        </Typography.Text>
      </Flex>

      {/* alerts banner */}
      <Alert
        type={needAttention.length > 0 ? "warning" : "success"}
        showIcon
        title={
          needAttention.length > 0
            ? `${needAttention.length} ${needAttention.length === 1 ? "area needs" : "areas need"} attention`
            : "No areas need attention"
        }
        description={
          needAttention.length > 0 ? (
            <Flex vertical gap={8}>
              {/* one line per node at moderate or high risk */}
              {needAttention.map(([id, severity]) => (
                <span key={id}>
                  LN {id} is at {severityLabels[severity]} risk of mildew.
                </span>
              ))}
              {/* severity breakdown */}
              <Flex gap={4} wrap>
                <Tag color="red">{countAt(2)} High</Tag>
                <Tag color="orange">{countAt(1)} Moderate</Tag>
                <Tag color="green">{countAt(0)} Low</Tag>
              </Flex>
            </Flex>
          ) : undefined
        }
      />

      {/* Leaf nodes section */}
      <Flex vertical gap="middle">
        {/* Leaf node selector */}
        <Flex justify="space-between" align="center">
          {/* disable previous button when node number === 1 */}
          <Button
            type="text"
            aria-label="Previous leaf node"
            icon={<RiArrowLeftLine size={18} />}
            disabled={node === 1}
            onClick={() => setNode(node - 1)}
          />

          {/* current selected node label */}
          <Typography.Text strong>Leaf Node {node}</Typography.Text>

          {/* disable next button if node number === totalNodes i.e. on last LN */}
          <Button
            type="text"
            aria-label="Next leaf node"
            icon={<RiArrowRightLine size={18} />}
            disabled={node === totalNodes}
            onClick={() => setNode(node + 1)}
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
                value={metric.value}
                suffix={
                  typeof metric.value === "number" ? metric.unit : undefined
                }
              />
              <Typography.Text type="secondary">{metric.note}</Typography.Text>
            </Card>
          ))}
        </div>

        {/* chart controls, one row that applies to all charts */}
        <Flex justify="space-between" align="center" wrap gap="small">
          <Segmented
            options={diseaseOptions}
            value={disease}
            onChange={setDisease}
          />
          {/* <Segmented options={fileOptions} value={fileName} onChange={setFileName} /> */}
          <Segmented
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
          />
        </Flex>

        {/* timeline of when each disease's conditions were met */}
        <ConditionTimeline
          readings={graphReadings}
          thresholds={{ [disease]: mildewThresholds[disease] }}
          timeRange={timeRange}
        />

        {/* temperature and dew point chart */}
        <ThresholdGraph
          title="Temperature and dew point"
          data={graphTemp}
          colors={{
            Temperature: temperatureColour,
            "Dew point": token.colorPrimary,
          }}
          unit="°C"
          yDomain={[0, 40]}
          riskZone={{
            from: thresholds.temperature.min,
            to: thresholds.temperature.max,
            label: `${thresholds.label} risk: ${thresholds.temperature.min}–${thresholds.temperature.max} °C`,
          }}
          // CHANGE 4: the chart needs this to know whether to show 24h or 7 days
          timeRange={timeRange}
        />

        {/* humidity chart */}
        <ThresholdGraph
          title="Relative humidity"
          data={graphHumidity}
          colors={{ Humidity: token.colorPrimary }}
          unit="%"
          yDomain={[0, 100]}
          riskZone={{
            from: thresholds.humidity.min,
            to: 100,
            label: `${thresholds.label} risk: above ${thresholds.humidity.min}%`,
          }}
          // CHANGE 4: the chart needs this to know whether to show 24h or 7 days
          timeRange={timeRange}
        />
      </Flex>
    </Flex>
  );
}
