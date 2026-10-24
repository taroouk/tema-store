"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Logo } from "@/components/icons/logo";
import { siteConfig } from "@/constants/site";

/** The slide-over itself. Loaded on demand (framer-motion stays out of the first page load). */
export default function MobileMenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const setOpen = (value: boolean) => {
    if (!value) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-screen w-[320px] max-w-[90vw] flex-col bg-surface shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
            >
              <div className="flex items-center justify-between border-b px-6 py-5">
                <Logo width={100} height={34} align="left" />

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 transition hover:bg-neutral-100"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col px-6 py-8">
                {siteConfig.navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b py-4 text-lg font-medium transition hover:opacity-60"
                  >
                    {item.title}
                  </Link>
                ))}

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="border-b py-4 text-lg font-medium transition hover:opacity-60"
                >
                  Cart
                </Link>

                <Link
                  href="/track"
                  onClick={() => setOpen(false)}
                  className="border-b py-4 text-lg font-medium transition hover:opacity-60"
                >
                  Track Order
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
