"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  children: React.ReactNode;
  title?: string;
  hint?: string;
};

type State = { hasError: boolean; message?: string };

/**
 * Catches render crashes so users never see a blank "page couldn't load".
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error) {
    console.error("[CareerForge ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[55vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg text-center space-y-4 dark:bg-white/5 dark:border-white/10">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center dark:bg-amber-500/15">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="font-extrabold tracking-tighter text-xl text-star-white">
              {this.props.title || "Sistemsel bir aksaklık oluştu"}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {this.props.hint ||
                "Sistemimiz şu an kendini toparlıyor. Lütfen 5 saniye bekleyip sayfayı yenileyin — verileriniz cihazınızda güvende."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  if (typeof window !== "undefined") window.location.reload();
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold text-white bg-indigo-600 shadow-lg hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Sayfayı yenile
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-2xl px-5 text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Ana sayfa
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
