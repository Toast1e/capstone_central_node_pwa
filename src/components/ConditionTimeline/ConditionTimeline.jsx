"use client";

// UI Libraries mostly Ant design libraries
import { Card, Flex, Tooltip, Typography, theme } from "antd";

// Our own components
//import { formatTick, formatTooltipTime } from "@/components/ThresholdGraph/ThresholdGraph";

// ------ Timeline colours ------
// full colour = all 3 conditions met, light = 2 of 3 met
// checked to be colour-blind safe and visible on the stone-coloured track
const diseaseColours = {
  powdery: { all: "#c2456f", partial: "#e8a0bd" },
  downy: { all: "#2a78d6", partial: "#86b6ef" },
};

// width of the disease name column, so the rows and time labels line up
const labelWidth = 64;

const minuteMs = 60 * 1000;
const hourMs = 60 * 60 * 1000;

// how much time the timeline always covers, even if some of it has no data
const rangeMs = { "24h": 24 * hourMs, "7d": 7 * 24 * hourMs };

// The conditions a disease can have. A condition is only used when the
// thresholds define it AND the readings actually contain that value, so
// removing wind from the readings removes it from the check automatically.
const conditions = [
  {
    limitKey: "temperature",
    field: "Temperature",
    test: (value, limits) =>
      value >= limits.temperature.min && value <= limits.temperature.max,
  },
  {
    limitKey: "humidity",
    field: "Humidity",
    test: (value, limits) => value > limits.humidity.min,
  },
  {
    limitKey: "wind",
    field: "wind",
    test: (value, limits) => value > limits.wind.min,
  },
];

// ------ Helpers ------

// timestamp (text, Date or milliseconds) -> milliseconds.
// The space is replaced with a T because Safari can't parse the space form.
function toTime(ts) {
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  return new Date(String(ts).replace(" ", "T")).getTime();
}

// 195 minutes -> "3 h 15 min"
function formatDuration(ms) {
  if (ms <= 0) return "0 min";
  const totalMinutes = Math.round(ms / minuteMs);
  if (totalMinutes < 1) return "under 1 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

// tooltip time: day and time
function formatTime(ms) {
  return new Date(ms).toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// readings with a usable timestamp, in time order, each with its time `t` in ms
function prepareReadings(readings) {
  return readings
    .map((reading) => ({ ...reading, t: toTime(reading.RealTimeLog) }))
    .filter((reading) => Number.isFinite(reading.t))
    .sort((a, b) => a.t - b.t);
}

// the usual time between two readings (the median)
function findSampleInterval(points) {
  const gaps = [];
  for (let i = 1; i < points.length; i++) {
    const gap = points[i].t - points[i - 1].t;
    if (gap > 0) gaps.push(gap);
  }
  if (gaps.length === 0) return 5 * minuteMs;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

// which of a disease's conditions can be checked with this data
function findActiveConditions(points, limits) {
  return conditions.filter(
    (condition) =>
      limits[condition.limitKey] &&
      points.some((point) => typeof point[condition.field] === "number"),
  );
}

// "all" = every condition met, "partial" = exactly one short (only when there
// are 3 or more conditions), null = not worth drawing.
// A missing value (sensor failed) counts as not met.
function findLevel(point, active, limits) {
  if (active.length === 0) return null;
  const met = active.filter(
    (condition) =>
      typeof point[condition.field] === "number" &&
      condition.test(point[condition.field], limits),
  ).length;
  if (met === active.length) return "all";
  if (active.length >= 3 && met === active.length - 1) return "partial";
  return null;
}

// Joins readings into stretches of time with the same result.
// Each reading covers the time from itself until the next reading. If the
// next reading is further away than maxGapMs, data is missing, so the reading
// only covers one normal interval and the stretch stops there.
// Returns [{ level, start, end }] in milliseconds, cut to the visible window.
function findBlocks(
  points,
  limits,
  active,
  intervalMs,
  maxGapMs,
  windowStart,
  windowEnd,
) {
  const blocks = [];

  points.forEach((point, index) => {
    const level = findLevel(point, active, limits);
    if (!level) return; // nothing to draw

    const next = points[index + 1];
    const end =
      next && next.t - point.t <= maxGapMs ? next.t : point.t + intervalMs;

    const previous = blocks[blocks.length - 1];
    if (previous && previous.level === level && previous.end === point.t) {
      previous.end = end; // continue the previous stretch
    } else {
      blocks.push({ level, start: point.t, end }); // start a new stretch
    }
  });

  // keep only what is inside the window
  return blocks
    .map((block) => ({
      ...block,
      start: Math.max(block.start, windowStart),
      end: Math.min(block.end, windowEnd),
    }))
    .filter((block) => block.end > block.start);
}

// total time covered by stretches of one level
function sumDuration(blocks, level) {
  return blocks
    .filter((block) => block.level === level)
    .reduce((total, block) => total + (block.end - block.start), 0);
}

// where the time labels go along the bottom, placed by real time:
// every 4 hours for 24h, at midnight for 7 days
function findTimeLabels(windowStart, windowEnd, timeRange) {
  const span = windowEnd - windowStart;
  const labels = [];
  const cursor = new Date(windowStart);

  if (timeRange === "7d") {
    cursor.setHours(0, 0, 0, 0);
    if (cursor.getTime() < windowStart) cursor.setDate(cursor.getDate() + 1);
  } else {
    cursor.setMinutes(0, 0, 0);
    while (cursor.getTime() < windowStart || cursor.getHours() % 4 !== 0) {
      cursor.setHours(cursor.getHours() + 1);
    }
  }

  while (cursor.getTime() <= windowEnd) {
    labels.push({
      key: cursor.getTime(),
      text:
        timeRange === "7d"
          ? cursor.toLocaleDateString("en-ZA", {
              weekday: "short",
              day: "numeric",
            })
          : cursor.toLocaleTimeString("en-ZA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
      position: (cursor.getTime() - windowStart) / span,
    });
    if (timeRange === "7d") cursor.setDate(cursor.getDate() + 1);
    else cursor.setHours(cursor.getHours() + 4);
  }

  // skip labels so close to the ends that they'd stick out of the card
  return labels.filter(
    (label) => label.position > 0.04 && label.position < 0.96,
  );
}

/**
 * Two rows (powdery and downy) showing for how long conditions favoured each
 * disease. Each coloured bar is one continuous stretch of time: its position
 * and width come from the real timestamps, and its length is its duration.
 *
 * readings    rows of { RealTimeLog, Temperature, Humidity, wind? }, any number
 *             of them (every 5 minutes is fine)
 * thresholds  mildew thresholds (only the diseases to show)
 * timeRange   "24h" or "7d": how much time the timeline covers
 * windowEnd   optional, milliseconds. Where the timeline ends. Defaults to the
 *             newest reading; pass Date.now() once the data is live.
 */
export default function ConditionTimeline({
  readings,
  thresholds,
  timeRange,
  windowEnd,
}) {
  // theme colours from themeConfig.js
  const { token } = theme.useToken();

  const points = prepareReadings(readings);

  if (points.length === 0) {
    return (
      <Card title="When conditions favoured mildew" size="small">
        <Typography.Text type="secondary">No readings to show.</Typography.Text>
      </Card>
    );
  }

  // the time window the timeline always covers
  const end = windowEnd ?? points[points.length - 1].t;
  const start = end - rangeMs[timeRange];
  const span = end - start;

  // missing data: readings further apart than 3 normal intervals
  const intervalMs = findSampleInterval(points);
  const maxGapMs = intervalMs * 3;

  // one row per disease, with its stretches worked out from the readings
  const rows = Object.entries(thresholds).map(([disease, limits]) => {
    const active = findActiveConditions(points, limits);
    return {
      disease,
      label: limits.label,
      colours: diseaseColours[disease],
      conditionCount: active.length,
      blocks: findBlocks(
        points,
        limits,
        active,
        intervalMs,
        maxGapMs,
        start,
        end,
      ),
    };
  });

  const timeLabels = findTimeLabels(start, end, timeRange);

  // the "all but one" level only exists when a disease has 3 or more conditions
  const hasPartial = rows.some((row) => row.conditionCount >= 3);

  return (
    <Card title="When conditions favoured mildew" size="small">
      <Flex vertical gap="small">
        {/* one row per disease */}
        {rows.map((row) => (
          <Flex key={row.disease} align="center" gap="small">
            <Typography.Text
              style={{ width: labelWidth, flexShrink: 0, fontSize: 12 }}
            >
              {row.label}
            </Typography.Text>

            {/* grey track covering the whole time window */}
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
              {/* one bar per stretch, placed by time (in %) so it stretches with the screen */}
              {row.blocks.map((block) => (
                <Tooltip
                  key={`${block.level}-${block.start}`}
                  title={
                    <>
                      {row.label}:{" "}
                      {block.level === "all"
                        ? `all ${row.conditionCount} conditions met`
                        : `${row.conditionCount - 1} of ${row.conditionCount} conditions met`}
                      <br />
                      {formatTime(block.start)} to {formatTime(block.end)}
                      <br />
                      Duration: {formatDuration(block.end - block.start)}
                    </>
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${((block.start - start) / span) * 100}%`,
                      width: `${((block.end - block.start) / span) * 100}%`,
                      minWidth: 2, // very short stretches stay visible
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
          <div style={{ width: labelWidth, flexShrink: 0 }} />
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

        {/* key: dark = all conditions, light = all but one */}
        <Flex gap="middle" wrap>
          {[
            { level: "all", text: "All conditions met" },
            ...(hasPartial
              ? [{ level: "partial", text: "All but one met" }]
              : []),
          ].map((item) => (
            <Flex key={item.level} align="center" gap={6}>
              {rows.map((row) => (
                <span
                  key={row.disease}
                  aria-hidden="true"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: row.colours[item.level],
                  }}
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
            <Typography.Text
              key={row.disease}
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {row.label}: all {row.conditionCount} conditions for{" "}
              {formatDuration(sumDuration(row.blocks, "all"))}
              {row.conditionCount >= 3 &&
                `, ${row.conditionCount - 1} of ${row.conditionCount} for ${formatDuration(
                  sumDuration(row.blocks, "partial"),
                )}`}
            </Typography.Text>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
