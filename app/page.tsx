"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";

type GalleryItem = {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
};

type RideStat = {
  rideDate?: string;
  distanceKm?: number | string;
};

type Ride = {
  id: string;
  rideName?: string;
  rideDate?: string;
  destination?: string;
  distanceKm?: number | string;
  rideType?: string;
  posterUrl?: string;
  status?: string;
};

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [communityRiders, setCommunityRiders] = useState(0);
  const [completedKilometers, setCompletedKilometers] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [ridesLoading, setRidesLoading] = useState(true);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Landing gallery
        const gallerySnapshot = await getDocs(collection(db, "landingGallery"));
        const galleryData = gallerySnapshot.docs.map((galleryDoc) => ({
          id: galleryDoc.id,
          ...galleryDoc.data(),
        })) as GalleryItem[];

        const featuredGallery = galleryData
          .filter(
            (item) =>
              item.isActive !== false &&
              typeof item.displayOrder === "number" &&
              item.displayOrder >= 1 &&
              item.displayOrder <= 6
          )
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .slice(0, 6);

        setGalleryItems(featuredGallery);

        // Users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        setCommunityRiders(usersSnapshot.size);

        // Rides
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData = ridesSnapshot.docs.map((rideDoc) => ({
          id: rideDoc.id,
          ...rideDoc.data(),
        })) as Ride[];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalKm = 0;

        const upcoming = ridesData
          .filter((ride) => {
            if (!ride.rideDate) return false;
            const rideDate = new Date(ride.rideDate);
            rideDate.setHours(0, 0, 0, 0);
            return rideDate >= today;
          })
          .sort(
            (a, b) =>
              new Date(a.rideDate || "").getTime() -
              new Date(b.rideDate || "").getTime()
          );

        ridesData.forEach((ride) => {
          if (!ride.rideDate) return;

          const rideDate = new Date(ride.rideDate);
          rideDate.setHours(0, 0, 0, 0);

          if (rideDate < today) {
            const km = Number(ride.distanceKm || 0);
            if (!Number.isNaN(km)) totalKm += km;
          }
        });

        setUpcomingRides(upcoming);
        setCompletedKilometers(totalKm);
      } catch (error) {
        console.error("Error loading landing page data:", error);
      } finally {
        setRidesLoading(false);
      }
    };

    loadPageData();
  }, []);

  useEffect(() => {
    if (galleryItems.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % galleryItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [galleryItems]);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const goToPrevious = () => {
    setActiveSlide((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setActiveSlide((prev) =>
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0f0f0f] to-[#1a1a1a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
              alt="RBDN Logo"
              className="h-14 w-14 rounded-full border border-orange-500/40 object-cover shadow-lg"
            />
            <div>
              <h1 className="text-lg font-bold tracking-[0.2em] text-orange-500 md:text-xl">
                RIDERS BROTHERHOOD DELHI NCR
              </h1>
              <p className="text-xs text-white/60">
                Where passion meets discipline on every ride.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#rides"
              className="hidden text-sm text-white/80 transition hover:text-orange-400 md:inline"
            >
              Rides
            </a>
            <a
              href="#about"
              className="hidden text-sm text-white/80 transition hover:text-orange-400 md:inline"
            >
              About
            </a>
            <a
              href="#join"
              className="hidden text-sm text-white/80 transition hover:text-orange-400 md:inline"
            >
              Join Us
            </a>
            <Link
              href="/gallery"
              className="hidden text-sm text-white/80 transition hover:text-orange-400 md:inline"
            >
              Gallery
            </Link>

            <Link
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              Register
            </Link>

            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-orange-500 px-5 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <section className="relative overflow-hidden border-b border-white/10 py-8">
        <div className="mx-auto mb-6 max-w-[1800px] px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
            Ride Showcase
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Stories from the brotherhood
          </h2>
          <p className="text-lg italic text-gray-300 mt-2">
  A window into the soul of RBDN — where every ride becomes a story, every mile builds brotherhood, and every moment reflects passion, discipline, and freedom. From early morning rollouts to unforgettable journeys, this is where memories are made and the true spirit of riding comes alive.
</p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="mx-auto max-w-[1800px] px-8">
            <div className="flex h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/50">
              Landing gallery images will appear here once added by admin.
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1800px] px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-[460px] min-w-full overflow-hidden bg-black md:h-[620px]"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title || "Gallery image"}
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.28em] text-orange-400">
                          RBDN Showcase
                        </p>
                        <h3 className="mt-4 text-4xl font-extrabold leading-tight text-white md:text-6xl">
                          {item.title || "Untitled Ride"}
                        </h3>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
                          {item.subtitle || "Brotherhood. Roads. Memories."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {galleryItems.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xl text-white backdrop-blur-md transition hover:border-orange-500 hover:text-orange-400"
                  >
                    ‹
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xl text-white backdrop-blur-md transition hover:border-orange-500 hover:text-orange-400"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
                    {galleryItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-3 w-3 rounded-full transition-all ${
                          activeSlide === index
                            ? "scale-110 bg-orange-500"
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Hero + Featured Community */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,115,0,0.15),transparent_30%)]" />
        <div className="mx-auto grid max-w-[1800px] gap-10 px-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div>
              <p className="mb-4 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-sm text-orange-300">
                Delhi NCR Riding Community
              </p>

              <h2 className="text-5xl font-extrabold leading-[0.95] md:text-7xl">
                Ride Together.
                <span className="block text-orange-500">Bond Stronger.</span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                Welcome to Riders Brotherhood Delhi NCR — a community built on
                safety, discipline, adventure, and real brotherhood.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-orange-500/15 bg-white/[0.04] p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-400">
                  Community Riders
                </p>
                <p className="mt-4 text-4xl font-extrabold text-white md:text-5xl">
                  {communityRiders}+
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Approved riders in the brotherhood
                </p>
              </div>

              <div className="rounded-3xl border border-orange-500/15 bg-white/[0.04] p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-400">
                  Ride Culture
                </p>
                <p className="mt-4 text-2xl font-bold md:text-3xl">
                  Every Weekend
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Breakfast rides and disciplined runs
                </p>
              </div>

              <div className="rounded-3xl border border-orange-500/15 bg-white/[0.04] p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-400">
                  Kilometers Done
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <p className="text-4xl font-extrabold md:text-5xl">
                    {completedKilometers}+
                  </p>
                  <span className="text-sm text-white/50">km</span>
                </div>
                <p className="mt-3 text-sm text-white/60">
                  Total distance from completed rides
                </p>
              </div>

              <div className="rounded-3xl border border-orange-500/15 bg-white/[0.04] p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-400">
                  Brotherhood
                </p>
                <p className="mt-4 text-2xl font-bold md:text-3xl">
                  Strong & Growing
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Built on discipline, respect and consistency
                </p>
              </div>
            </div>
          </div>

          <div className="h-full">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex h-full flex-col rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#1b1b1b] via-black to-[#2b1408]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
                      Featured Community
                    </p>
                    <h3 className="mt-1 text-2xl font-bold">
                      Riders Brotherhood
                    </h3>
                  </div>

                  <img
                    src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
                    alt="RBDN Emblem"
                    className="h-16 w-16 rounded-full border border-orange-500/40 object-cover"
                  />
                </div>

                <div className="flex h-full flex-col p-6 space-y-7">
                  <div className="space-y-4 text-white/70">
                    <p>
                      Built for riders who value respect, discipline, proper
                      riding culture, and memorable journeys over noise and
                      chaos.
                    </p>
                    <p>
                      From breakfast rides to long-distance tours, RBDN is about
                      showing up with the right spirit, riding responsibly, and
                      building a stronger brotherhood on every road.
                    </p>
                    <p>
                      It is not just about destinations — it is about
                      consistency, community, and the kind of riding mindset
                      that stays with you beyond the ride itself.
                    </p>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div className="mt-8 grow">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Ride Types</p>
                        <p className="mt-2 text-lg font-semibold">
                          Breakfast + Tours
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Region</p>
                        <p className="mt-2 text-lg font-semibold">Delhi NCR</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Culture</p>
                        <p className="mt-2 text-lg font-semibold">
                          Brotherhood
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Focus</p>
                        <p className="mt-2 text-lg font-semibold">
                          Disciplined Riding
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Meetups</p>
                        <p className="mt-2 text-lg font-semibold">
                          Every Weekend
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-white/50">Community Type</p>
                        <p className="mt-2 text-lg font-semibold">
                          Invite-based
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Rides */}
      <section id="rides" className="px-6 py-20">
        <div className="mx-auto max-w-[1800px] px-8">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              Upcoming Rides
            </p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Adventures waiting for the next throttle twist
            </h3>
            <p className="mt-3 max-w-2xl text-white/70">
              Explore the next set of RBDN rides, tours, and weekend escapes.
            </p>
          </div>

          {ridesLoading ? (
            <p className="text-white/60">Loading upcoming rides...</p>
          ) : upcomingRides.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-white/50">
              No upcoming rides found yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingRides.map((ride) => (
                <Link
                  key={ride.id}
                  href={`/rides/${ride.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-orange-500/50"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={ride.posterUrl || "/placeholder.jpg"}
                      alt={ride.rideName || "Ride"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-black">
                      {ride.rideType || "Ride"}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-semibold leading-tight">
                      {ride.rideName || "Untitled Ride"}
                    </h3>

                    <p className="mt-1 text-xs text-white/60">
                      {ride.destination || "Destination not added"}
                    </p>

                    <p className="mt-1 text-xs text-orange-400">
                      {ride.rideDate || "Date not added"}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-white/50">
                        {Number(ride.distanceKm || 0)} km
                      </span>

                      <span className="rounded-full border border-orange-500 px-3 py-1 text-xs text-orange-400 transition hover:bg-orange-500 hover:text-black">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom 2x2 */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-[1800px] gap-8 px-8 lg:grid-cols-2">
          <div
            id="about"
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              About RBDN
            </p>
            <h3 className="mt-3 text-3xl font-bold">
              More than a group. A proper riding brotherhood.
            </h3>

            <div className="mt-6 space-y-5 text-lg leading-8 text-white/70">
              <p>
                Riders Brotherhood Delhi NCR is for riders who believe that the
                road should be ridden with discipline, safety, respect, and real
                community spirit.
              </p>
              <p>
                From breakfast rides and city escapes to outstation tours, RBDN
                is about creating memorable experiences and stronger bonds with
                every ride.
              </p>
              <p>
                It is a culture built on consistency, camaraderie, and the kind
                of road presence that reflects true brotherhood.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              Ride Gallery
            </p>
            <h3 className="mt-3 text-3xl font-bold">
              See the moments that define the brotherhood
            </h3>
            <p className="mt-4 max-w-2xl text-white/70">
              Explore ride captures, community memories, and the journeys that
              shape RBDN.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/gallery"
                className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Open Gallery
              </Link>
            </div>
          </div>

          <div
            id="join"
            className="rounded-3xl border border-orange-500/20 bg-gradient-to-r from-[#1a1a1a] to-[#251307] p-8 shadow-2xl"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              Join the Brotherhood
            </p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Ready for the next ride?
            </h3>
            <p className="mt-4 max-w-2xl text-white/70">
              Create your rider profile, track your past rides, enroll in
              upcoming adventures, and become part of a disciplined riding
              community.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Join RBDN
              </Link>

              <Link
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                Member Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              Community Spirit
            </p>
            <h3 className="mt-3 text-3xl font-bold">
              Discipline first. Brotherhood always.
            </h3>
            <p className="mt-4 max-w-2xl text-white/70">
              RBDN is built on responsible riding, respect for fellow riders,
              proper group etiquette, and a strong sense of togetherness on
              every route.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-[1800px] flex-col items-center justify-between gap-4 px-8 text-sm text-white/50 md:flex-row">
          <p>© 2026 Riders Brotherhood Delhi NCR. All rights reserved.</p>
          <p>Ride safe. Ride hard. Ride together.</p>
        </div>
      </footer>
    </main>
  );
}