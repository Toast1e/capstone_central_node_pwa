"use client";

// React and NextJS
import dynamic from "next/dynamic";

// UI Libraries mostly Ant design libraries
import { Card, Flex, Typography, theme } from "antd";

// the chart draws on a canvas, which only exists in the browser, loaded client-side only and skipped during server rendering
const Line = dynamic(
    () => import("@ant-design/charts").then((mod) => mod.Line),
    { ssr: false }
);

// x axis labels: the hour for 24h, the day for 7 days
function formatTick(time, timeRange) {
    if (timeRange === "7d") {
        return time.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric" });
    }
    return time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

// tooltip heading: always day and time
function formatTooltipTime(time) {
    return time.toLocaleString("en-ZA", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Line chart of sensor readings with a shaded mildew risk zone.
 *
 * data       rows of { time, value, series }, one row per line per reading
 * colours     { "Series name": "#hex" } in legend order
 * unit       added after numbers, e.g. "°C"
 * yDomain    [lowest, highest] for the y axis
 * riskZone   { from, to, label } range to shade
 * timeRange  "24h" or "7d", changes the x axis labels
 */
export default function ThresholdChart({ title, data, colors, unit, yDomain, riskZone, timeRange }) {
    // theme colours from themeConfig.js
    const { token } = theme.useToken();

    const seriesNames = Object.keys(colors);

    return (
        <Card title={title} size="small">
            <Line
                data={data}
                xField="time"
                yField="value"
                colorField="series"
                height={220}
                // thin 2px lines
                style={{ lineWidth: 2 }}
                scale={{
                    y: { domain: yDomain, nice: false },
                    // each series always keeps its own colour
                    color: { domain: seriesNames, range: Object.values(colors) },
                }}
                axis={{
                    x: {
                        labelFormatter: (time) => formatTick(time, timeRange),
                        tickCount: timeRange === "7d" ? 7 : 6,
                        grid: false, // no vertical gridlines
                    },
                    y: {
                        labelFormatter: (value) => `${value}${unit}`,
                        // faint solid gridlines, so dashes only ever mean something
                        gridLineDash: [0, 0],
                        gridStroke: token.colorBorderSecondary,
                        gridStrokeOpacity: 1,
                    },
                }}
                // legend only when there's more than one line; the title names a single line
                legend={seriesNames.length > 1 ? { color: { position: "top", itemMarker: "square" } } : false}
                tooltip={{
                    title: (row) => formatTooltipTime(row.time),
                    items: [(row) => ({ name: row.series, value: `${row.value}${unit}` })],
                }}
                // shaded risk zone behind the lines
                annotations={[
                    {
                        type: "rangeY",
                        data: [riskZone],
                        yField: "from",
                        y1Field: "to",
                        style: { fill: token.colorWarning, fillOpacity: 0.15 },
                    },
                ]}
            />

            {/* key for the shaded zone */}
            <Flex align="center" gap={6}>
                <span
                    aria-hidden="true"
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        // same colour and see-through amount as the shaded zone
                        background: `color-mix(in srgb, ${token.colorWarning} 15%, transparent)`,
                        border: `1px solid ${token.colorWarningBorder}`,
                        flexShrink: 0,
                    }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {riskZone.label}
                </Typography.Text>
            </Flex>
        </Card>
    );
}