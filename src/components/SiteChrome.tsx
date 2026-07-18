"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoNotice } from "@/components/DemoNotice";
import { CommandPalette } from "@/components/CommandPalette";

/**
 * App chrome: full Header/Footer for product pages.
 * Landing (`/`) uses its own TealHQ Navbar + Footer.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <>
        <a href="#main-content" className="skip-link">Ana içeriğe geç</a>
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Ana içeriğe geç</a>
      <Header />
      <CommandPalette />
      <div id="main-content" tabIndex={-1} className="flex-1 pt-16 pb-20 outline-none md:pt-[6.5rem] md:pb-0">
        <DemoNotice />
        <div key={pathname} className="workspace-route-enter">{children}</div>
      </div>
      <Footer />
    </>
  );
}
