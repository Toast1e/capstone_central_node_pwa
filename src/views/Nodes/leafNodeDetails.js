// Replaces ./mockNodeDetails. Fetches one leaf node's pop-up data and reshapes it
// into what LeafNodeModal reads: { readings: {temperature, humidity, leafWetness, wind},
// signal, lastReading, location: {block, row} | null }.
import { apiGet } from "@/lib/api";

// "14:56" for today, "7 Oct 14:56" for older readings (formatted in the phone's timezone)
function formatReadingTime(unixSeconds) {
    if (!unixSeconds) return "unknown";
    const date = new Date(unixSeconds * 1000);
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (date.toDateString() === new Date().toDateString()) return time;
    return `${date.toLocaleDateString([], { day: "numeric", month: "short" })} ${time}`;
}

// leafNodeID is the numeric ID from the API (node.leafNodeID), not the "LN-01" label
export async function fetchLeafNodeDetails(leafNodeID) {
    const d = await apiGet(`/api/leafnodes/${leafNodeID}/details`);
    return {
        readings: {
            temperature: d.readings.temperature,
            humidity: d.readings.humidity,
            leafWetness: d.readings.leafWetness,
            wind: d.readings.windSpeed,
        },
        signal: d.signal,                       // dBm, or null when there's no signal
        lastReading: formatReadingTime(d.lastReadingAt),
        location: d.location,                   // null until a block has been set
    };
}