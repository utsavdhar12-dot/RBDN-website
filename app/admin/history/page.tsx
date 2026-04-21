"use client";

import Link from "next/link";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Historical Rides</h1>
            <p className="mt-4 text-white/70">
              This section will show all completed rides across the community.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}