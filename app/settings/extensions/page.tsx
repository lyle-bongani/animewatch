import type { Metadata } from "next";
import { ExtensionRepoManager } from "@/components/ExtensionRepoManager";

export const metadata: Metadata = {
  title: "Extension Repositories & Sources - Mihon Engine",
  description: "Configure Mihon & Tachiyomi extension repository URLs (index.pb) to auto-install, discover, and read manga across Webtoon, Asura, LhScan, Flame Comics, and more.",
};

export default function ExtensionSettingsPage() {
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ExtensionRepoManager />
      </div>
    </div>
  );
}
