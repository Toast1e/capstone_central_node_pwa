"use client";

// React and NextJS
import { useEffect, useState } from "react";

// own components and data
import { MILDEW_THRESHOLDS as mildewThresholds } from "./mildewThresholds";
import ConditionTimeline from "../../components/ConditionTimeline/ConditionTimeline";
import ThresholdGraph from "../../components/ThresholdGraph/ThresholdGraph";

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
// TODO make page elements dynamic based on backend later

const totalNodes = 6;

// "sensor readings" one card per reading type
const metrics = [
  { title: "HUMIDITY", value: 93, unit: "%", note: "Above 90% for 3h" },
  { title: "TEMPERATURE", value: 19.4, unit: "°C", note: "not spicy" },
  { title: "LEAF WETNESS", value: 60, unit: "%", note: "Wet leaves detected" },
  { title: "WIND", value: 9.4, unit: "m/s", note: "aaahhhhh" },
];

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
const dayFiles = ["csv/mildew_2026-07-10.csv"];
const weekFileNames = [
  "csv/mildew_2026-07-13.csv",
  "csv/mildew_2026-07-08.csv",
  "csv/mildew_2026-07-10.csv",
  "csv/mildew_2026-07-09.csv",
  "csv/mildew_2026-07-11.csv",
  "csv/mildew_2026-07-12.csv",
  "csv/mildew_2026-07-07.csv",
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

// The charts and the timeline now
// work out the 7 day view from all readings themselves.

// orange for temperature
const temperatureColour = "#eb6834";

export default function Home() {
  // theme colours from themeConfig passed to the chart
  const { token } = theme.useToken();

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

      // Drop rows with an unreadable timestamp, then put all
      // readings in time order BEFORE downsampling, so the files can arrive
      // or be listed in any order
      const sorted = loaded
        .filter((r) => !Number.isNaN(toTime(r.RealTimeLog)))
        .sort((a, b) => toTime(a.RealTimeLog) - toTime(b.RealTimeLog));

      // Remove duplicates. If two files contain the same
      // Reading (same timestamp) only one is kept.
      const unique = [
        ...new Map(sorted.map((r) => [toTime(r.RealTimeLog), r])).values(),
      ];

      // All readings (duplicates removed) for BOTH ranges. The old
      // "every 30th row" thinning for 7 days left the chart with too few
      // points per slot, so the line broke into single dots.
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

  return (
    <Flex vertical gap="large">
      <Flex vertical gap="middle">
        {/* Page title */}
        <Flex vertical>
          <Typography.Title level={2}>Central Node 1 Overview</Typography.Title>
          {/* number nodes being monitored */}
          <Typography.Text type="secondary">
            {" "}
            {totalNodes} Leaf Nodes monitored
          </Typography.Text>
        </Flex>
      </Flex>

      {/* alerts banner */}
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
                suffix={metric.unit}
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

        {/* wind chart
        <ThresholdGraph
          title="Wind speed"
          data={windData}
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
        */}
      </Flex>
    </Flex>
  );
}
