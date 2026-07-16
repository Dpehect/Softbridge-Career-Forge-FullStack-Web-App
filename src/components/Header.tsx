"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anvil, Code2, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

const links = [
  { name: "Forge", path: "/forge" },
  { name: "Resume", path: "/resume" },
  { name: "Jobs", path: "/jobs" },
  { name: "Paths", path: "/paths" },
  { name: "Coach", path: "/coach" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4"
    >
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-3.5 md:px-4 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-cosmic-teal text-midnight-void flex items-center justify-center shadow-[0_8px_20px_rgba(217,72,32,0.28)]">
            <Anvil className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[13px] tracking-tight">CareerForge</p>
            <p className="text-[10px] text-muted-steel hidden sm:block">by SoftBridge</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.name}
                href={link.path}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors",
                  isActive ? "text-midnight-void" : "text-muted-steel hover:text-star-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-star-white rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold border border-black/8 hover:border-cosmic-teal/35 hover:text-cosmic-teal transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            GitHub
          </a>
          <Link
            href="/forge"
            className="hidden sm:inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold bg-cosmic-teal text-midnight-void hover:bg-sunset-coral transition-colors shadow-[0_8px_22px_rgba(217,72,32,0.28)]"
          >
            Open Forge
          </Link>
          <button
            className="lg:hidden p-2 rounded-xl border border-black/8"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="lg:hidden max-w-6xl mx-auto mt-2 glass-panel rounded-2xl p-2 flex flex-col"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-semibold",
                  pathname.startsWith(link.path)
                    ? "bg-star-white text-midnight-void"
                    : "text-muted-steel"
                )}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-xl text-sm font-semibold border border-black/8 inline-flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" /> Open Source on GitHub
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
