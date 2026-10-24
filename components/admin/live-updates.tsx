"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { AdminEvent } from "@/lib/realtime";
import { createClient } from "@/lib/supabase/client";
import { useLiveStore } from "@/stores/live-store";

// Pages where a background refresh could disturb something being typed.
const NO_REFRESH = ["/admin/products/", "/admin/settings", "/admin/pages/"];

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const tone = (freq: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.3);
    };
    tone(880, 0);
    tone(1175, 0.18);
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio blocked until the page has been interacted with: silently skip */
  }
}

/**
 * Subscribes to the private "admin-events" channel and turns events into toasts, a sound, a tab-title
 * counter and a refresh of the server-rendered data. Mounted once in the admin layout.
 */
export function LiveUpdates({ scopes }: { scopes: AdminEvent["scope"][] }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seen = useRef(new Set<string>());
  const { setStatus, setSound, bump, clear } = useLiveStore.getState();

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    try {
      setSound(localStorage.getItem("admin-sound") === "1");
    } catch {
      /* storage unavailable */
    }
  }, [setSound]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let hadConnection = false;

    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (!NO_REFRESH.some((p) => pathRef.current.startsWith(p))) router.refresh();
      }, 400);
    };

    const channel = supabase.channel("admin-events", { config: { private: true } });
    channel.on("broadcast", { event: "admin" }, ({ payload }) => {
      const e = payload as AdminEvent;
      if (!e || !scopes.includes(e.scope)) return;
      const key = `${e.type}|${e.at}|${e.title}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);

      refresh();
      if (e.type === "order.updated") return; // quiet: keeps other open tabs in sync

      if (document.hidden) bump();
      if (useLiveStore.getState().soundOn) beep();
      toast(e.title, {
        description: e.body,
        duration: 9000,
        action: e.href ? { label: "Open", onClick: () => router.push(e.href!) } : undefined,
      });
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("live");
          if (hadConnection) refresh(); // catch up on anything missed while offline
          hadConnection = true;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setStatus("offline");
        }
      });
    })();

    const onFocus = () => {
      clear();
      if (hadConnection) refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => !document.hidden && clear());

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
    // scopes is stable per session (derived from the admin's role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "(3) Orders | Tema Label Admin" while the tab is in the background
  useEffect(() => {
    const unsub = useLiveStore.subscribe((s, prev) => {
      if (s.unread === prev.unread) return;
      const base = document.title.replace(/^\(\d+\)\s*/, "");
      document.title = s.unread > 0 ? `(${s.unread}) ${base}` : base;
    });
    return unsub;
  }, []);

  return null;
}
