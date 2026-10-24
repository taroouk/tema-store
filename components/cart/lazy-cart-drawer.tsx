"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useUiStore } from "@/stores/ui-store";

const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), { ssr: false });

/** The mini bag (and the animation library it uses) is only downloaded the first time it is opened. */
export function LazyCartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const [everOpened, setEverOpened] = useState(false);
  if (open && !everOpened) setEverOpened(true);
  return everOpened ? <CartDrawer /> : null;
}
