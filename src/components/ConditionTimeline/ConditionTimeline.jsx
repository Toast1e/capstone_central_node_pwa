"use client";

// UI Libraries mostly Ant design libraries
import { Card, Flex, Tooltip, Typography, theme } from "antd";

// Our own components
//import { formatTick, formatTooltipTime } from "@/components/ThresholdGraph/ThresholdGraph";

// ------ Timeline colours ------
// full colour = all 3 conditions met, light = 2 of 3 met
// checked to be colour-blind safe and visible on the stone-coloured track
const DISEASE_COLOURS = {
    powdery: { all: "#c2456f", partial: "#e8a0bd" },
    downy: { all: "#2a78d6", partial: "#86b6ef" },
};

// width of the disease name column, so the rows and time labels line up
const LABEL_WIDTH = 64;

const ONE_HOUR = 60 * 60 * 1000;

// how many of a disease's 3 conditions (Temperature, Humidity, wind) one reading meets
function countConditionsMet(reading, limits) {
    const checks = [
        reading.Temperature >= limits.temperature.min && reading.Temperature <= limits.temperature.max,
        reading.Humidity > limits.humidity.min,
        reading.wind > limits.wind.min,
    ];
    return checks.filter(Boolean).length; // counts the trues
}

// joins neighbouring hours with the same result into one block,
// e.g. 4 hours in a row with all conditions met become 1 block
function findBlocks(readings, limits) {
    const blocks = [];

    readings.forEach((reading, index) => {
        const met = countConditionsMet(reading, limits);
        const level = met === 3 ? "all" : met === 2 ? "partial" : null;
        if (!level) return; // fewer than 2 conditions, nothing to draw

        const previous = blocks[blocks.length - 1];
        if (previous && previous.level === level && previous.end === index) {
            previous.end = index + 1; // continue the previous block
        } else {
            blocks.push({ level, start: index, end: index + 1 }); // start a new block
        }
    });

    return blocks;
}

// total hours covered by blocks of one level
function countHours(blocks, level) {
    return blocks
        .filter((block) => block.level === level)
        .reduce((total, block) => total + (block.end - block.start), 0);
}

// where the time labels go along the bottom
function findTimeLabels(readings, timeRange) {
    const total = readings.length;
    const hourTimeline = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0") + ':00'
    );

    return readings
        .map((reading, index) => ({ reading, index }))
        .filter(({ reading, index }) =>
            timeRange === "7d"
                ? index % 24 === 0 // start of each full day
                : index % 6 === 0 // every 6 hours
        )
        .map(({ reading, index }) => ({
            key: index,
            text: timeRange === "7d" ? new Date(reading.RealTimeLog).toLocaleDateString('en-ZA') : hourTimeline.filter(( _, i ) => i % 3 === 0),
            // 7 days: middle of the day, 24h: middle of the hour
            position: (index + 0.5) / total,
        }))
        // skip labels so close to the ends that they'd stick out of the card
        .filter((label) => label.position > 0.08 && label.position < 0.92);
}

/**
 * Two rows (powdery and downy) showing which hours had conditions that favour each disease.
 *
 * readings    hourly readings of { time, Temperature, Humidity, wind }
 * thresholds  MILDEW_THRESHOLDS
 * timeRange   "24h" or "7d", changes the time labels
 */
export default function ConditionTimeline({ readings, thresholds, timeRange }) {
    // theme colours from themeConfig.js
    const { token } = theme.useToken();

    const total = readings.length;

    // one row per disease, with its blocks worked out from the readings
    const rows = Object.entries(thresholds).map(([disease, limits]) => ({
        disease,
        label: limits.label,
        colours: DISEASE_COLOURS[disease],
        blocks: findBlocks(readings, limits),
    }));

    const timeLabels = findTimeLabels(readings, timeRange);

    return (
        <Card title="When conditions favoured mildew" size="small">
            <Flex vertical gap="small">
                {/* one row per disease */}
                {rows.map((row) => (
                    <Flex key={row.disease} align="center" gap="small">
                        <Typography.Text style={{ width: LABEL_WIDTH, flexShrink: 0, fontSize: 12 }}>
                            {row.label}
                        </Typography.Text>

                        {/* grey track covering the whole time range */}
                        <div
                            style={{
                                position: "relative",
                                flex: 1,
                                height: 20,
                                background: token.colorBgLayout,
                                borderRadius: 4,
                                overflow: "hidden",
                            }}
                        >
                            {/* coloured blocks, placed by % so they stretch with the screen */}
                            {row.blocks.map((block) => (
                                <Tooltip
                                    key={block.start}
                                    title={
                                        <>
                                            {row.label}: {block.level === "all" ? "all 3" : "2 of 3"} conditions met
                                            <br />
                                            {/* {formatTooltipTime(readings[block.start].time)} to{" "}
                                            {formatTooltipTime(new Date(readings[block.end - 1].time.getTime() + ONE_HOUR))} */}
                                        </>
                                    }
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            bottom: 0,
                                            left: `${(block.start / total) * 100}%`,
                                            width: `${((block.end - block.start) / total) * 100}%`,
                                            background: row.colours[block.level],
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                    </Flex>
                ))}

                {/* time labels, lined up under the tracks */}
                <Flex gap="small">
                    <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
                    <div style={{ position: "relative", flex: 1, height: 18 }}>
                        {timeLabels.map((label) => (
                            <Typography.Text
                                key={label.key}
                                type="secondary"
                                style={{
                                    position: "absolute",
                                    left: `${label.position * 100}%`,
                                    transform: "translateX(-50%)",
                                    fontSize: 12,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {label.text}
                            </Typography.Text>
                        ))}
                    </div>
                </Flex>

                {/* key: dark = all 3 conditions, light = 2 of 3 */}
                <Flex gap="middle" wrap>
                    {[
                        { level: "all", text: "All 3 conditions met" },
                        { level: "partial", text: "2 of 3 met" },
                    ].map((item) => (
                        <Flex key={item.level} align="center" gap={6}>
                            {rows.map((row) => (
                                <span
                                    key={row.disease}
                                    aria-hidden="true"
                                    style={{ width: 12, height: 12, borderRadius: 3, background: row.colours[item.level] }}
                                />
                            ))}
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {item.text}
                            </Typography.Text>
                        </Flex>
                    ))}
                </Flex>

                {/* the same information in words, so it doesn't depend on hovering */}
                <Flex vertical>
                    {rows.map((row) => (
                        <Typography.Text key={row.disease} type="secondary" style={{ fontSize: 12 }}>
                            {row.label}: all 3 for {countHours(row.blocks, "all")} h, 2 of 3 for{" "}
                            {countHours(row.blocks, "partial")} h
                        </Typography.Text>
                    ))}
                </Flex>
            </Flex>
        </Card>
    );
}