"use client";

// React and NextJS
import dynamic from "next/dynamic";

// UI Libraries mostly Ant design libraries
import { Card, Flex, Typography, theme } from "antd";

import { useSettings } from "../../contexts/SettingsContext";

// the chart draws on a canvas, which only exists in the browser, loaded client-side only and skipped during server rendering
const Line = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Line),
  { ssr: false },
);

// ------ Chart settings ------
const hourMs = 60 * 60 * 1000;

// how much time the x axis always covers, even if some of it has no data
const rangeMs = { "24h": 24 * hourMs, "7d": 7 * 24 * hourMs };

// How much time one point on the line stands for. All readings inside that
// time are averaged into one point. Change "7d" to 24 * hourMs for one point per day.
const bucketMsByRange = { "24h": hourMs / 2, "7d": 3 * hourMs };

// x axis labels: the hour for 24h, the day for 7 days
export function formatTick(time, timeRange) {
  if (timeRange === "7d") {
    return time.toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
    });
  }
  return time.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// tooltip heading: always day and time
export function formatTooltipTime(time) {
  return time.toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// timestamp (text, Date or milliseconds) -> milliseconds.
// The space is replaced with a T because Safari can't parse the space form.
function toTime(ts) {
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  return new Date(String(ts).replace(" ", "T")).getTime();
}

/**
 * Turns raw readings into the points the chart draws.
 *
 * - The time window is fixed: 24 h or 7 days, ending at `windowEnd` (or the
 *   newest reading), so the axis never shrinks when data is missing.
 * - The window is cut into time slots (1 h for 24h, 3 h for 7 days). The
 *   readings in a slot are averaged into one point.
 * - A slot with no readings gives a point with value null, which the chart
 *   draws as a gap in the line.
 *
 * rows         [{ time, value, series }]
 * seriesNames  the lines to draw, e.g. ["Temperature", "Dew point"]
 * returns      { points: [{ time: Date, value, series }], domain: [start, end] } or null
 */
function buildChartData(rows, seriesNames, timeRange, windowEnd) {
  const readings = rows
    .map((row) => ({
      t: toTime(row.time),
      value: row.value,
      series: row.series,
    }))
    .filter((reading) => Number.isFinite(reading.t));
  if (readings.length === 0) return null;

  const end =
    windowEnd ??
    readings.reduce((newest, r) => Math.max(newest, r.t), -Infinity);
  const start = end - rangeMs[timeRange];
  const bucketMs = bucketMsByRange[timeRange];

  // slots line up with the local clock (e.g. 14:00 to 15:00), not with UTC
  const offset = new Date(end).getTimezoneOffset() * 60 * 1000;
  const slotOf = (t) => Math.floor((t - offset) / bucketMs);

  // add up the readings in each slot, per line
  const totals = new Map(); // "series|slot" -> { sum, count }
  readings.forEach((reading) => {
    if (reading.t < start || reading.t > end) return;
    if (typeof reading.value !== "number" || Number.isNaN(reading.value))
      return; // a failed sensor
    const key = `${reading.series}|${slotOf(reading.t)}`;
    const total = totals.get(key) ?? { sum: 0, count: 0 };
    total.sum += reading.value;
    total.count += 1;
    totals.set(key, total);
  });

  // one point per slot per line, including the empty slots
  const points = [];
  for (let slot = slotOf(start); slot <= slotOf(end); slot++) {
    // plot at the START of the slot (on the hour), kept inside the window at both ends.
    // `from` and `to` keep the whole slot for the tooltip.
    const from = slot * bucketMs + offset;
    const time = new Date(Math.min(Math.max(from, start), end));
    seriesNames.forEach((series) => {
      const total = totals.get(`${series}|${slot}`);
      points.push({
        time,
        value: total ? Math.round((total.sum / total.count) * 10) / 10 : null,
        series,
        from,
        to: from + bucketMs,
      });
    });
  }

  return { points, domain: [start, end] };
}

/**
 * Line chart of sensor readings with a shaded mildew risk zone.
 *
 * data          rows of { time, value, series }, one row per line per reading
 * dewpointData  optional, same shape, drawn on the same chart (null or left out = none)
 * colours       { "Series name": "#hex" } in legend order
 * unit          added after numbers, e.g. "°C"
 * yDomain       [lowest, highest] for the y axis
 * riskZone      { from, to, label } range to shade
 * timeRange     "24h" or "7d": how much time the x axis covers
 * windowEnd     optional, milliseconds. Where the x axis ends. Defaults to the
 *               newest reading; pass Date.now() once the data is live.
 */
// timeRange defaults to "24h": without it the time window cannot be worked out and nothing is drawn
export default function ThresholdChart({
  title,
  data,
  dewpointData,
  colors,
  unit,
  yDomain,
  riskZone,
  timeRange = "24h",
  windowEnd,
}) {
  // theme colours from themeConfig.js
  const { token } = theme.useToken();

  // light or dark mode, so the chart's text, axes and tooltip match
  const { isDark } = useSettings();

  const seriesNames = Object.keys(colors);

  // `?? []` so a chart without dewpointData (undefined or null) cannot crash
  const chart = buildChartData(
    [...(data ?? []), ...(dewpointData ?? [])],
    seriesNames,
    timeRange,
    windowEnd,
  );

  return (
    <Card title={title} size="small">
      {chart === null ? (
        <Typography.Text type="secondary">No readings to show.</Typography.Text>
      ) : (
        <Line
          data={chart.points}
          xField="time"
          yField="value"
          colorField="series"
          height={320}
          // the chart's own theme: "classicDark" has light text for dark backgrounds
          theme={isDark ? "classicDark" : "classic"}
          // thin 2px lines
          style={{ lineWidth: 2 }}
          // false = a point with no value leaves a gap, the line is not drawn across it
          connectNulls={false}
          scale={{
            // real time axis with a fixed start and end
            x: {
              type: "time",
              domain: chart.domain.map((t) => new Date(t)),
              nice: false,
              tickCount: timeRange === "7d" ? 7 : 12,
            },
            y: { domain: yDomain, nice: false },
            // each series always keeps its own colour
            color: { domain: seriesNames, range: Object.values(colors) },
          }}
          axis={{
            x: {
              grid: false, // no vertical gridlines
              labelFormatter: (t) => formatTick(new Date(t), timeRange),
            },
            y: {
              // faint solid gridlines, so dashes only ever mean something
              gridLineDash: [0, 0],
              gridStroke: token.colorBorderSecondary,
              gridStrokeOpacity: 1,
              labelFormatter: (t) => `${t}${unit}`,
            },
          }}
          // legend only when there's more than one line; the title names a single line
          legend={
            seriesNames.length > 1
              ? { color: { position: "top", itemMarker: "square" } }
              : false
          }
          tooltip={{
            // each point is an average, so the heading shows the time it covers
            title: (row) =>
              `${formatTooltipTime(new Date(row.from))} to ${new Date(row.to).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`,
            items: [
              (row) => ({
                name: row.series,
                value: row.value == null ? "no data" : `${row.value}${unit}`,
              }),
            ],
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
      )}

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
