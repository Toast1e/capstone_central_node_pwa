"use client";

// React and NextJS
import { useEffect, useState } from 'react';

// own components and data
import ThresholdChart from "../../components/ThresholdChart/ThresholdChart";
import { MILDEW_THRESHOLDS } from "./mildewThresholds";
import { weekOfReadings } from "./mockReadings";
import ConditionTimeline from "../../components/ConditionTimeline/ConditionTimeline";

// UI Libraries mostly Ant design libraries
import { Typography, Tag, Flex, Alert, Button, Card, Statistic, theme, Segmented } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { Line } from '@ant-design/plots';

import Papa from 'papaparse';

// ------ Placeholder data ------
// TODO make page elements dynamic based on backend later

const TOTAL_NODES = 6;

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

// orange for temperature
const TEMPERATURE_COLOUR = "#eb6834";

export default function Home() {
    // theme colours from themeConfig passed to the chart
    const { token } = theme.useToken();

    //which leaf node currently shown from 1 to TOTAL_NODES
    const [node, setNode] = useState(1);

    // which disease's risk zones the charts show, and time period shown
    const [disease, setDisease] = useState("powdery");
    const [timeRange, setTimeRange] = useState("24h");

    // thresholds for diseases
    const thresholds = MILDEW_THRESHOLDS[disease];

    // last 24 hours or the whole week 7 days
    const readings = timeRange === "24h" ? weekOfReadings.slice(-25) : weekOfReadings;

    // the chart wants one row per line per reading, so each reading becomes 2 rows here
    const temperatureData = readings.flatMap((reading) => [
        { time: reading.time, value: reading.temperature, series: "Temperature" },
        { time: reading.time, value: reading.dewPoint, series: "Dew point" },
    ]);
    const humidityData = readings.map((reading) => ({ time: reading.time, value: reading.humidity, series: "Humidity" }));
    const windData = readings.map((reading) => ({ time: reading.time, value: reading.wind, series: "Wind" }));

    const [graphReadings, setGraphReadings] = useState([]);

    useEffect(() => {
        fetch("csv/mildew_2026-07-08.csv")
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const formattedReadings = results.data.map((row) => ({
                            RealTimeLog: row['timestamp'],
                            Temperature: row['temp_c'],
                            Humidity: row['humidity_pct']
                        }));
                        setGraphReadings(formattedReadings);
                    }
                });
            })
    }, []);

    const tempConfig = {
        data: graphReadings,
        xField: 'RealTimeLog',
        yField: 'Temperature',
        point: {
            shape: 'circle',
            size: 5,
        },
        interaction: {
            tooltip: true,
        },
    };

    const humidityConfig = {
        data: graphReadings,
        xField: 'RealTimeLog',
        yField: 'Humidity',
        point: {
            shape: 'circle',
            size: 5,
        },
        interaction: {
            tooltip: true,
        },
    };

    return (
        <Flex vertical gap="large">
            <Flex vertical gap="middle">
                {/* Page title */}
                <Flex vertical>
                    <Typography.Title level={2}>Central Node 1 Overview</Typography.Title>
                    {/* number nodes being monitored */}
                    <Typography.Text type="secondary"> {TOTAL_NODES} Leaf Nodes monitored</Typography.Text>
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

                    {/* disable next button if node number === TOTAL_NODES i.e. on last LN */}
                    <Button
                        type="text"
                        aria-label="Next leaf node"
                        icon={<RiArrowRightLine size={18} />}
                        disabled={node === TOTAL_NODES}
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
                            <Statistic title={metric.title} value={metric.value} suffix={metric.unit} />
                            <Typography.Text type="secondary">{metric.note}</Typography.Text>
                        </Card>
                    ))}
                </div>

                {/* chart controls, one row that applies to all charts */}
                <Flex justify="space-between" align="center" wrap gap="small">
                    <Segmented options={diseaseOptions} value={disease} onChange={setDisease} />
                    <Segmented options={timeRangeOptions} value={timeRange} onChange={setTimeRange} />
                </Flex>

                {/* timeline of when each disease's conditions were met */}
                <ConditionTimeline
                    readings={readings}
                    thresholds={{ [disease]: MILDEW_THRESHOLDS[disease] }}
                    timeRange={timeRange} />

                {/* temperature and dew point chart */}
                <ThresholdChart
                    title="Temperature and dew point"
                    data={temperatureData}
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
                    data={humidityData}
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

                <div style={{ width: '100%', height: 400 }}>
                    <h2>Temp</h2>
                    <Line {...tempConfig} />
                </div>

                <div style={{ width: '100%', height: 400 }}>
                    <h2>Humidity</h2>
                    <Line {...humidityConfig} />
                </div>

                <div style={{ padding: "20px" }}>
                    <h1>Local CSV Data</h1>
                    <table border="1" cellPadding="5">
                        <thead>
                            <tr>
                                {graphReadings.length > 0 && Object.keys(graphReadings[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {graphReadings.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((val, i) => (
                                        <td key={i}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </Flex>
        </Flex>
    );
}
