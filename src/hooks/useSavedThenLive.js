"use client";

// React and NextJS
import { useEffect, useState } from "react";

// Our own API calls
import { apiFetch } from "@/lib/api";
import { readSaved } from "@/lib/savedData";

/**
 * Loads something from the central node, showing the copy saved on the phone first.
 * The saved copy is on screen straight away, also with no connection, and the
 * central node's answer replaces it when it arrives.
 *
 *   const alerts = useSavedThenLive("/api/alerts", 60_000);
 *
 * path          what to ask for, written exactly as the service worker saved it
 * refreshEvery  optional, milliseconds: ask the central node again this often
 * returns       the newest answer on hand, or undefined until there is one
 */
export function useSavedThenLive(path, refreshEvery) {
  // the newest answer, and the path it's an answer to
  const [answer, setAnswer] = useState({ path: null, data: undefined });

  useEffect(() => {
    // if the path changes or the page is left before an answer arrives, it's ignored
    let cancelled = false;
    // once the live answer is in, a saved copy that turns up late is too old to show
    let liveArrived = false;

    readSaved(path).then((saved) => {
      if (!cancelled && !liveArrived && saved !== null) setAnswer({ path, data: saved });
    });

    async function refresh() {
      try {
        const data = await apiFetch(path);
        liveArrived = true;
        if (!cancelled) setAnswer({ path, data });
      } catch (err) {
        console.error(err); // no connection: whatever is on screen stays
      }
    }

    refresh();
    const id = refreshEvery ? setInterval(refresh, refreshEvery) : undefined;
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [path, refreshEvery]);

  // an answer for another path (e.g. the previous leaf node) isn't shown as this one's
  return answer.path === path ? answer.data : undefined;
}
