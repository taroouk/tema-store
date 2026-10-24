"use client";

import { Bell, BellOff } from "lucide-react";

import { useLiveStore } from "@/stores/live-store";

/** Header chip: connection state + a switch for the new-order sound. */
export function LiveIndicator() {
  const status = useLiveStore((s) => s.status);
  const soundOn = useLiveStore((s) => s.soundOn);
  const setSound = useLiveStore((s) => s.setSound);

  const dot = status === "live" ? "bg-green-500" : status === "connecting" ? "bg-amber-500 animate-pulse" : "bg-red-500";
  const label = status === "live" ? "Live" : status === "connecting" ? "Connecting…" : "Offline";

  return (
    <div className="flex items-center gap-1">
      <span className="hidden items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 sm:inline-flex" title="Realtime updates">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        {label}
      </span>
      <button
        type="button"
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute new-order sound" : "Play a sound for new orders"}
        title={soundOn ? "Sound on — click to mute" : "Sound off — click to play a sound for new orders"}
        onClick={() => {
          const next = !soundOn;
          setSound(next);
          try {
            localStorage.setItem("admin-sound", next ? "1" : "0");
          } catch {
            /* ignore */
          }
        }}
        className="rounded-md border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100"
      >
        {soundOn ? <Bell size={16} /> : <BellOff size={16} />}
      </button>
    </div>
  );
}
