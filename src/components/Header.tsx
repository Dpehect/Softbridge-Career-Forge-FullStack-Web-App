"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anvil, Code2, Menu, X } from "lucide-react";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Forge", path: "/forge" },
  { name: "Jobs", path: "/jobs" },
  { name: "Paths", path: "/paths" },
  { name: "Resume", path: "/resume" },
  { name: "Coach", path: "/coach" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 p-2"
    >
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-3.5 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <div className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center bg-black/[0.02] group-hover:border-cosmic-teal/40 transition-colors">
            <Anvil className="w-3.5 h-3.5 text-cosmic-teal" />
          </div>
          <span className="font-display font-bold text-sm uppercase tracking-wider text-star-white">
            Softbridge<span className="text-cosmic-teal font-normal">//</span>CareerForge
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.name}
                href={link.path}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-wider transition-colors",
                  isActive ? "text-midnight-void" : "text-muted-steel hover:text-cosmic-teal"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-star-white rounded-xl -z-10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
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
            className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold border border-black/10 text-star-white hover:border-cosmic-teal/40 hover:text-cosmic-teal transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            Open Source on GitHub
          </a>
          <Link
            href="/forge"
            className="hidden sm:inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold bg-cosmic-teal text-midnight-void shadow-[0_8px_24px_rgba(232,93,59,0.25)] hover:bg-sunset-coral transition-colors"
          >
            Open Forge AI
          </Link>
          <button
            className="md:hidden p-2 rounded-xl border border-black/8 text-star-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
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
            className="md:hidden max-w-6xl mx-auto mt-2 glass-panel rounded-2xl p-3 flex flex-col gap-1"
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
                    : "text-muted-steel hover:bg-black/[0.04]"
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
              className="px-3 py-2.5 rounded-xl text-sm font-semibold border border-black/8 text-star-white text-center inline-flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              Open Source on GitHub
            </a>
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-xl text-sm font-semibold bg-cosmic-teal text-midnight-void text-center"
            >
              Find roles
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
