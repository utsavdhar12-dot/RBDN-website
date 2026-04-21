"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

type GalleryItem = {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const snapshot = await getDocs(collection(db, "landingGallery"));
        const data = snapshot.docs.map((galleryDoc) => ({
          id: galleryDoc.id,
          ...galleryDoc.data(),
        })) as GalleryItem[];

        const filtered = data
          .filter((item) => item.isActive !== false)
          .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999))
          .slice(0, 50);

        setGalleryItems(filtered);
      } catch (error) {
        console.error("Error loading gallery page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
              alt="RBDN Logo"
              className="h-14 w-14 rounded-full border border-orange-500/40 object-cover shadow-lg"
            />
            <div>
              <h1 className="text-lg font-bold tracking-[0.2em] text-orange-500 md:text-xl">
                RBDN
              </h1>
              <p className="text-xs text-white/60">
                Riders Brotherhood Delhi NCR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/80 transition hover:text-orange-400"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-orange-500 px-5 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
          Ride Gallery
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Memories from the brotherhood
        </h1>
        <p className="mt-4 max-w-3xl text-white/70">
          A collection of ride moments, community captures, road stories, and
          memories built through RBDN journeys.
        </p>

        <div className="mt-10">
          {loading ? (
            <p className="text-white/60">Loading gallery...</p>
          ) : galleryItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-white/50">
              No gallery images found yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Ride image"}
                      className="h-72 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-bold">
                      {item.title || "Untitled Ride"}
                    </h3>
                    <p className="mt-2 text-sm text-white/65">
                      {item.subtitle || "Brotherhood memories"}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-orange-400">
                      Order {item.displayOrder || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}