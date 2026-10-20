// Our own data
import { MILDEW_THRESHOLDS } from "@/data/mildewThresholds";

// ------ Standard alert messages ------
// The database only stores the finished text (alertMessage), so the Pi writes it when it raises an alert.
// This file is the agreed wording: the mock alerts use it now, and the backend should produce the same text.
// TODO share this wording and the severity rule below with the backend

// one entry per alertSeverity, so it can be used as the position in this array
// TODO backend: severity comes from how many conditions are met
//   1 met = low (0), 2 met = moderate (1), all 3 met = high (2)
const severityText = [
    { risk: "Low", met: "One of three conditions is met", advice: "No action needed yet." },    // 0
    { risk: "Moderate", met: "Two of three conditions are met", advice: "Keep a close eye on these vines." },   // 1
    { risk: "High", met: "All three conditions are met", advice: "Inspect these vines and consider treatment." },   // 2
];

// one condition in words, using that disease's limits
function describeCondition(condition, limits) {
    if (condition === "temperature") {
        return `temperature is in the optimal range (${limits.temperature.min}–${limits.temperature.max} °C)`;
    }
    if (condition === "humidity") {
        return `relative humidity is above ${limits.humidity.min}%`;
    }
    return `wind speed is above ${limits.wind.min} m/s`;
}

// ["a", "b", "c"] -> "a, b and c"
// everything except the last item gets commas, then "and" before the last one
function joinWithAnd(parts) {
    if (parts.length === 1) return parts[0];
    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * The 3 alert fields the Pi works out when it raises an alert.
 *
 * mildewType     "powdery" or "downy"
 * conditionsMet  the conditions that were met, at least 1, e.g. ["temperature", "humidity"]
 */
export function buildAlert(mildewType, conditionsMet) {
    // 1 condition -> 0 (low), 2 -> 1 (moderate), 3 -> 2 (high)
    const alertSeverity = conditionsMet.length - 1;
    const text = severityText[alertSeverity];
    const limits = MILDEW_THRESHOLDS[mildewType];

    // each condition in words, joined into one sentence
    const reasons = joinWithAnd(conditionsMet.map((condition) => describeCondition(condition, limits)));

    return {
        mildewType,
        alertSeverity,
        // e.g. "Moderate risk of powdery mildew. Two of three conditions are met: ... Keep a close eye on these vines."
        alertMessage: `${text.risk} risk of ${mildewType} mildew. ${text.met}: ${reasons}. ${text.advice}`,
    };
}