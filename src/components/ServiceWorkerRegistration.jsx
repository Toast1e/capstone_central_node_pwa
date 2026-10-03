// Needed a separate component since the layout was not use client, it was instead server sided.

"use client";

import { useEffect } from "react";

export default function registerServiceWorker() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
        } else {
            console.log('serviceWorker not supported in this context');
        }
    }
    )
}