"use client";

import { useSyncExternalStore } from "react";

// ------ The copy of the app saved on the phone ------
// The service worker (src/app/sw.js, started by SerwistProvider in providers.jsx)
// saves the app so it opens without a connection. This keeps track of how that
// went, so the Login and Profile pages can say so.
//
// The status is one of:
//   "checking"     not known yet (the page has only just opened)
//   "saving"       the copy is being downloaded
//   "saved"        the app opens without a connection from now on
//   "temporary"    saved, but in a private window: the copy is gone when the window closes
//   "failed"       the copy couldn't be saved, it's tried again next time the app opens
//   "unsupported"  this browser won't allow it here: it has to be HTTPS (or
//                  localhost), and not a private window

let status = "checking";
let watching = false;
const listeners = new Set();

function setStatus(next) {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  // start watching the first time a page asks
  if (!watching) {
    watching = true;
    watch();
  }
  return () => listeners.delete(listener);
}

// read the status in a component, e.g. const saved = useOfflineCopy() === "saved";
export function useOfflineCopy() {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => "checking"
  );
}

// A private window does save the app, but throws the copy away when it's
// closed, so "saved" would be a false promise there. Browsers don't say
// outright that a window is private. Safari and Firefox do refuse to open
// their file storage in one, which is what this checks. Chrome gives no sign
// at all, so an Incognito window can't be told apart.
async function isPrivateWindow() {
  if (!navigator.storage?.getDirectory) return false; // an older browser: no way to tell
  try {
    await navigator.storage.getDirectory();
    return false;
  } catch {
    return true;
  }
}

async function watch() {
  // browsers only allow service workers on HTTPS or localhost, and not in some
  // private windows. The app still works, it just can't be opened offline.
  if (!("serviceWorker" in navigator)) {
    setStatus("unsupported");
    return;
  }

  const whenSaved = (await isPrivateWindow()) ? "temporary" : "saved";

  // already answered by a saved copy: this page itself came from it
  if (navigator.serviceWorker.controller) {
    setStatus(whenSaved);
    return;
  }

  setStatus("saving");

  // a copy that fails part-way (a file went missing, the connection dropped) is thrown away by the browser
  window.serwist?.addEventListener("redundant", () => {
    if (!navigator.serviceWorker.controller) setStatus("failed");
  });

  // resolves once a complete copy is in place
  await navigator.serviceWorker.ready;
  setStatus(whenSaved);
}
