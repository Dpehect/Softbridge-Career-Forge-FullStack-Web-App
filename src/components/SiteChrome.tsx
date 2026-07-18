"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoNotice } from "@/components/DemoNotice";

/**
 * App chrome: full Header/Footer for product pages.
 * Landing (`/`) uses its own TealHQ Navbar + Footer.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Header />
      <div className="flex-1 pt-16 pb-20 md:pt-[6.5rem] md:pb-0">
        <DemoNotice />
        {children}
      </div>
      <Footer />
    </>
  );
}
