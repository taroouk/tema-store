import { create } from "zustand";

export type LiveStatus = "connecting" | "live" | "offline";

interface LiveStore {
  status: LiveStatus;
  soundOn: boolean;
  unread: number;
  setStatus: (status: LiveStatus) => void;
  setSound: (on: boolean) => void;
  bump: () => void;
  clear: () => void;
}

export const useLiveStore = create<LiveStore>((set) => ({
  status: "connecting",
  soundOn: false,
  unread: 0,
  setStatus: (status) => set({ status }),
  setSound: (soundOn) => set({ soundOn }),
  bump: () => set((s) => ({ unread: s.unread + 1 })),
  clear: () => set({ unread: 0 }),
}));
