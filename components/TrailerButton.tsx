"use client";

import { useState } from "react";
import { TrailerModal } from "./TrailerModal";

export function TrailerButton({ youtubeId }: { youtubeId: string }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Watch Trailer
      </button>

      {show && (
        <TrailerModal youtubeId={youtubeId} onClose={() => setShow(false)} />
      )}
    </>
  );
}
