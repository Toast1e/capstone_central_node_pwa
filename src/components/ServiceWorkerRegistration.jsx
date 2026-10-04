// Needed a separate component since the layout was not use client, it was instead server sided.

"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
    useEffect(() => {
        if (
            process.env.NODE_ENV === "production" &&
            "serviceWorker" in navigator
        ) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => console.log("SW registered"))
                .catch((err) => console.error("SW registration failed", err));
        }
    }
    )
}