"use client";

// React and NextJS
import { useEffect, useState } from "react";

// own components and data
import { MILDEW_THRESHOLDS as mildewThresholds } from "./mildewThresholds";
import ConditionTimeline from "../../components/ConditionTimeline/ConditionTimeline";
import ThresholdGraph from "../../components/ThresholdGraph/ThresholdGraph";
import { useSettings } from "../../contexts/SettingsContext";

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

import Papa from "papaparse";

// ------ Placeholder data ------
// TODO replace with data from the backend
const totalNodes = 6;

// ------ Chart options ------
const diseaseOptions = [
  { label: "Powdery", value: "powdery" },
  { label: "Downy", value: "downy" },
];

const timeRangeOptions = [
  { label: "24h", value: "24h" },
  { label: "7 days", value: "7d" },
];

// ------ CSV files ------
// Constants live outside the component so they are not recreated on every render
// the last day of the week below, so 24h and 7 days both end at the same latest reading
const dayFiles = ["csv/mildew_2026-07-13.csv"];
const weekFileNames = [
  "csv/mildew_2026-07-07.csv",
  "csv/mildew_2026-07-08.csv",
  "csv/mildew_2026-07-09.csv",
  "csv/mildew_2026-07-10.csv",
  "csv/mildew_2026-07-11.csv",
  "csv/mildew_2026-07-12.csv",
  "csv/mildew_2026-07-13.csv",
];

async function loadCsv(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  const text = await response.text();
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return data.map((row) => ({
    RealTimeLog: row["timestamp"],
    Temperature: row["temp_c"],
    Humidity: row["humidity_pct"],
  }));
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

  // load the CSV files, only when the time range changes

  useEffect(() => {
    let cancelled = false;
    const files = timeRange === "24h" ? dayFiles : weekFileNames;

    async function load() {
      // Promise.allSettled keeps results in the same order as `files`,
      // and one missing file does not break the whole chart
      const results = await Promise.allSettled(files.map(loadCsv));

      // ignore the results if the user toggled away while loading
      if (cancelled) return;

      const loaded = [];
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          loaded.push(...result.value);
        } else {
          console.warn(`Skipped ${files[i]}:`, result.reason);
        }
      });

      // drop rows with an unreadable timestamp, then put the readings in time order, so the files can arrive or be listed in any order
      const sorted = loaded
        .filter((r) => !Number.isNaN(toTime(r.RealTimeLog)))
        .sort((a, b) => toTime(a.RealTimeLog) - toTime(b.RealTimeLog));

      // Remove duplicates. If two files contain the same
      // Reading (same timestamp) only one is kept.
      const unique = [
        ...new Map(sorted.map((r) => [toTime(r.RealTimeLog), r])).values(),
      ];

      // all readings, duplicates removed, for both 24h and 7 days
      setGraphReadings(unique);
    }
    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

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

  // ------ Latest reading cards ------
  // the readings are sorted by time, so the last one is the newest (undefined while still loading)
  const latest = graphReadings[graphReadings.length - 1];

  // e.g. "powdery risk zone", the same shaded zones as the charts below
  const zoneName = `${thresholds.label.toLowerCase()} risk zone`;

  // one card for each reading the leaf nodes measure, using the same rules as ConditionTimeline.
  // ?. because latest is undefined until the CSV has loaded (undefined >= 15 is just false, no crash)
  const metrics = [
    {
      title: "TEMPERATURE",
      value: latest?.Temperature,
      unit: "°C",
      // in the risk zone when it's between the disease's min and max
      atRisk: latest?.Temperature >= thresholds.temperature.min && latest?.Temperature <= thresholds.temperature.max,
    },
    {
      title: "HUMIDITY",
      value: latest?.Humidity,
      unit: "%",
      // in the risk zone when it's above the disease's min
      atRisk: latest?.Humidity > thresholds.humidity.min,
    },
  ];

  return (
    <Flex vertical gap="large">
      {/* Page title */}
      <Flex vertical gap={4}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {username} Overview
        </Typography.Title>
        {/* number nodes being monitored */}
        <Typography.Text type="secondary">
          {totalNodes} Leaf Nodes monitored
        </Typography.Text>
      </Flex>

      {/* alerts banner. TODO build it from the active alerts (same data as the Alerts page) */}
      <Alert
        type="warning"
        showIcon
        title="2 areas need attention"
        description={
          <Flex vertical gap={8}>
            {/* alert details */}
            <span>LN 2 is at high risk of downy mildew.</span>
            {/* alerts severity breakdown */}
            <Flex gap={4} wrap>
              <Tag color="red">1 High</Tag>
              <Tag color="orange">1 Moderate</Tag>
              <Tag color="green">4 Low</Tag>
            </Flex>
          </Flex>
        }
      />

      {/* Leaf nodes section */}
      <Flex vertical gap="middle">
        {/* Leaf node selector. TODO use the real leaf nodes (IDs and names) from the backend */}
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

        {/* latest reading cards: the newest reading on the charts below */}
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
              {/* loading shows a grey placeholder until the CSV arrives; precision={1} = one decimal */}
              <Statistic
                title={metric.title}
                value={metric.value}
                suffix={metric.unit}
                precision={1}
                loading={!latest}
              />
              {/* orange when the reading is inside the selected disease's risk zone */}
              <Typography.Text type={metric.atRisk ? "warning" : "secondary"}>
                {metric.atRisk ? `In the ${zoneName}` : `Outside the ${zoneName}`}
              </Typography.Text>
            </Card>
          ))}
        </div>

        {/* when the cards' reading was taken: "2026-07-13T23:55:00" -> "2026-07-13 23:55" */}
        {latest && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Latest reading: {String(latest.RealTimeLog).replace("T", " ").slice(0, 16)}
            </Typography.Text>
        )}

        {/* chart controls, one row that applies to all charts */}
        <Flex justify="space-between" align="center" wrap gap="small">
          <Segmented
            options={diseaseOptions}
            value={disease}
            onChange={setDisease}
          />
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
            // the chart needs this to know whether to show 24h or 7 days
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
            // the chart needs this to know whether to show 24h or 7 days
            timeRange={timeRange}
        />
      </Flex>
    </Flex>
  );
}
