import Link from "next/link";
import { Anvil, Code2 } from "lucide-react";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-panel-elevated/40">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-cosmic-teal text-midnight-void flex items-center justify-center">
                <Anvil className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">SoftBridge CareerForge</p>
                <p className="text-[11px] text-muted-steel">Professional career workspace</p>
              </div>
            </div>
            <p className="text-sm text-muted-steel max-w-sm leading-relaxed">
              CV analysis, job matching, ATS optimization, PDF export, and interview prep — private
              in your browser.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-3">
              Product
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                ["/forge", "Forge"],
                ["/resume", "Resume"],
                ["/jobs", "Jobs"],
                ["/paths", "Paths"],
                ["/coach", "Coach"],
                ["/dashboard", "Dashboard"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-cosmic-teal transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-3">
              SoftBridge
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.softbridgesolutions.com"
                  className="hover:text-cosmic-teal transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  SoftBridge Solutions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-steel">
          <span>© {new Date().getFullYear()} SoftBridge Solutions · CareerForge</span>
        </div>
      </div>
    </footer>
  );
}
