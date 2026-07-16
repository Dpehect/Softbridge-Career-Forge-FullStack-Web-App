import Link from "next/link";
import { Anvil, Code2 } from "lucide-react";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Anvil className="w-4 h-4 text-cosmic-teal" />
            <span className="font-display font-bold text-sm uppercase tracking-wider">
              Softbridge//CareerForge
            </span>
          </div>
          <p className="text-sm text-muted-steel max-w-sm leading-relaxed">
            Forge your next role with curated jobs, skill paths, resume tools, and a practical career
            coach — built by Softbridge Solutions.
          </p>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cosmic-teal/30 bg-cosmic-teal/10 px-4 py-2.5 text-sm font-semibold text-cosmic-teal hover:bg-cosmic-teal hover:text-midnight-void transition-colors"
          >
            <Code2 className="w-4 h-4" />
            Open Source on GitHub
          </a>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-3">
            Product
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/forge" className="hover:text-cosmic-teal transition-colors">
                Forge AI
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="hover:text-cosmic-teal transition-colors">
                Job board
              </Link>
            </li>
            <li>
              <Link href="/paths" className="hover:text-cosmic-teal transition-colors">
                Career paths
              </Link>
            </li>
            <li>
              <Link href="/resume" className="hover:text-cosmic-teal transition-colors">
                Resume forge
              </Link>
            </li>
            <li>
              <Link href="/coach" className="hover:text-cosmic-teal transition-colors">
                AI coach
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-3">
            Softbridge
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/dashboard" className="hover:text-cosmic-teal transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <a
                href="https://www.softbridgesolutions.com"
                className="hover:text-cosmic-teal transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                Softbridge Solutions
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11px] text-muted-steel">
        <span>© {new Date().getFullYear()} Softbridge Solutions · CareerForge</span>
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-cosmic-teal hover:underline"
        >
          <Code2 className="w-3.5 h-3.5" />
          Open Source on GitHub
        </a>
      </div>
    </footer>
  );
}
