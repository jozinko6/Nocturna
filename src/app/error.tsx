"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-[#dc2626]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-[#2a1215] border border-[#5c2a2e] mb-6">
          <svg
            className="h-8 w-8 text-[#dc2626]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[#e2e8f0] mb-2">
          Niečo sa pokazilo
        </h1>
        <p className="text-sm text-[#64748b] mb-6">
          Nečakaná chyba prerušila tvoju cestu temnotou.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={reset}>
            Skúsiť znova
          </Button>
        </div>
      </div>
    </div>
  );
}
