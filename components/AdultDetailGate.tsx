"use client";

import React from "react";
import Link from "next/link";
import { useAdultGate } from "./AdultGateContext";

export function AdultDetailGate({
  isAdultContent,
  children,
}: {
  isAdultContent: boolean;
  children: React.ReactNode;
}) {
  const { isAdultUnlocked, unlockAdult } = useAdultGate();

  if (!isAdultContent || isAdultUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto my-16 max-w-lg rounded-2xl border border-accent/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-xl font-black text-foreground">
        18+ Age Restricted Title
      </h2>

      <p className="mt-2 text-xs text-muted leading-relaxed">
        This title contains explicit adult content (18+) and is locked under Safe Mode.
        Please acknowledge that you are at least 18 years of age to proceed.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
        >
          Return to Safe Browsing
        </Link>
        <button
          type="button"
          onClick={unlockAdult}
          className="w-full sm:w-auto rounded-lg bg-accent px-5 py-2 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-colors cursor-pointer"
        >
          I Acknowledge & Unlock
        </button>
      </div>
    </div>
  );
}
