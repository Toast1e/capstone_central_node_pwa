"use client";

// React and NextJS
import { useSyncExternalStore } from "react";

// UI Libraries mostly Ant design libraries
import { Badge, Card, Flex, Typography } from "antd";

// Our own offline helpers
import { useOfflineCopy } from "@/lib/offlineCopy";
import { getReadingsSavedAt } from "@/lib/savedData";

// what to show for each status (see offlineCopy.js)
const DISPLAY = {
    checking: { dot: "default", title: "Checking" },
    saving: {
        dot: "processing",
        title: "Saving the app to this phone",
        note: "Keep the app open for a moment while it downloads.",
    },
    saved: {
        dot: "success",
        title: "Saved on this phone",
        note: "Home and Profile open without a connection to the central node, showing the readings saved here.",
    },
    temporary: {
        dot: "warning",
        title: "Saved for this window only",
        note: "This is a private window, so the saved copy is thrown away when it's closed. Open the app in a normal window to use it without a connection.",
    },
    failed: {
        dot: "error",
        title: "Couldn't be saved",
        note: "The app will try again the next time it's opened while connected.",
    },
    unsupported: { dot: "warning", title: "Can't be saved here" },
};

// why the browser won't save the app. Only asked for in the browser, never while the page is built.
function whyUnsupported() {
    if (!window.isSecureContext) {
        return `Browsers only save an app that is opened over HTTPS. This address (${window.location.origin}) isn't, so the app needs a connection to the central node every time it's opened.`;
    }
    return "This browser window doesn't allow apps to save themselves. A private window can't, for one.";
}

// the saved time only changes while the app tops it up, so there's nothing to listen for
function subscribeToNothing() {
    return () => {};
}

// "Tue 17 Nov, 14:05"
function formatSavedAt(ms) {
    return new Date(ms).toLocaleString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Says whether the app and its readings are saved on this phone, so it's
 * clear beforehand whether the app will open without a connection.
 */
export default function OfflineCard() {
    const status = useOfflineCopy();
    const display = DISPLAY[status];
    const note = status === "unsupported" ? whyUnsupported() : display.note;

    // read from the browser; the server has no saved readings, so it assumes none
    const savedAt = useSyncExternalStore(subscribeToNothing, getReadingsSavedAt, () => null);

    return (
        <Card size="small" title="Offline use">
            <Flex vertical gap="small">
                <Badge status={display.dot} text={<Typography.Text strong>{display.title}</Typography.Text>} />

                {note && <Typography.Text type="secondary">{note}</Typography.Text>}

                <Typography.Text type="secondary">
                    {savedAt
                        ? `Readings last saved: ${formatSavedAt(savedAt)}.`
                        : "No readings are saved on this phone yet."}
                </Typography.Text>
            </Flex>
        </Card>
    );
}
