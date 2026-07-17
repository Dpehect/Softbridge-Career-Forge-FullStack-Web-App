import type { Metadata } from "next";
import { ProtectedWorkspace } from "@/components/auth/ProtectedWorkspace";

export const metadata: Metadata = {
  title: "Resume Editor",
  description: "Private structured resume editing with autosave, undo, section reordering, and print-ready preview.",
  robots: { index: false, follow: false },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedWorkspace nextPath="/resume">{children}</ProtectedWorkspace>;
}
