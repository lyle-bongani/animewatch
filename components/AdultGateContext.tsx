"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AdultGateContextType {
  isAdultUnlocked: boolean;
  unlockAdult: () => void;
  lockAdult: () => void;
  openModal: () => void;
  closeModal: () => void;
}

const AdultGateContext = createContext<AdultGateContextType>({
  isAdultUnlocked: false,
  unlockAdult: () => {},
  lockAdult: () => {},
  openModal: () => {},
  closeModal: () => {},
});

export function useAdultGate() {
  return useContext(AdultGateContext);
}

const COOKIE_NAME = "anime_adult_unlocked";
const STORAGE_KEY = "anime_adult_unlocked";

export function AdultGateProvider({ children }: { children: React.ReactNode }) {
  const [isAdultUnlocked, setIsAdultUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const hasCookie = typeof document !== "undefined" && document.cookie.includes(`${COOKIE_NAME}=1`);
      if (stored === "true" || hasCookie) {
        setIsAdultUnlocked(true);
      }
    } catch {
      /* ignore storage access error */
    }
  }, []);

  const unlockAdult = useCallback(() => {
    setIsAdultUnlocked(true);
    setIsModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      if (typeof document !== "undefined") {
        document.cookie = `${COOKIE_NAME}=1; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const lockAdult = useCallback(() => {
    setIsAdultUnlocked(false);
    setIsModalOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof document !== "undefined") {
        document.cookie = `${COOKIE_NAME}=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <AdultGateContext.Provider
      value={{
        isAdultUnlocked: mounted ? isAdultUnlocked : false,
        unlockAdult,
        lockAdult,
        openModal,
        closeModal,
      }}
    >
      {children}

      {/* Acknowledgment Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl text-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                <svg
                  className="h-5 w-5"
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
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Age Verification & Content Acknowledgment
                </h3>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  18+ Mature Content Gate
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              This section contains 18+ mature and adult content. Mainstream anime (including action, shounen, and normal fanservice) remains accessible at all times in Safe Mode.
            </p>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              By confirming, you acknowledge that you are at least 18 years of age and wish to unlock explicit 18+ titles. You can switch back to Safe Mode anytime from the footer.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="w-full sm:w-auto rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
              >
                Keep in Safe Mode
              </button>
              <button
                type="button"
                onClick={unlockAdult}
                className="w-full sm:w-auto rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                I Acknowledge (Unlock 18+)
              </button>
            </div>
          </div>
        </div>
      )}
    </AdultGateContext.Provider>
  );
}
