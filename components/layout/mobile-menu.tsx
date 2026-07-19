"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Logo } from "@/components/icons/logo";
import { siteConfig } from "@/constants/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-100 lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

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
              className="fixed right-0 top-0 z-50 flex h-screen w-[320px] max-w-[90vw] flex-col bg-white shadow-2xl lg:hidden"
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
                <Logo width={100} height={34} />

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
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="border-b py-4 text-lg font-medium transition hover:opacity-60"
                >
                  Account
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}