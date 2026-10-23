"use client";

import { useEffect } from "react";
import type { BridgeMessage } from "@/scene/world/MonitorScreen";

/**
 * When the desktop runs on the 3D monitor, tells the scene about the pointer
 * (to keep the camera zoomed in) and clicks and keys (for the desk sounds).
 */
export function ParentBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const post = (message: BridgeMessage) => window.parent.postMessage(message, window.location.origin);
    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("mousemove", (e) => post({ type: "mousemove", clientX: e.clientX, clientY: e.clientY }), { signal });
    window.addEventListener("mousedown", () => post({ type: "mousedown" }), { signal });
    window.addEventListener("mouseup", () => post({ type: "mouseup" }), { signal });
    window.addEventListener("keydown", (e) => post({ type: "keydown", key: e.key }), { signal });
    window.addEventListener("keyup", (e) => post({ type: "keyup", key: e.key }), { signal });
    return () => controller.abort();
  }, []);

  return null;
}
