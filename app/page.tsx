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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      try {
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

        const usersSnapshot = await getDocs(collection(db, "users"));
        setCommunityRiders(usersSnapshot.size);

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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0f0f0f] to-[#1a1a1a] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-8">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
              alt="RBDN Logo"
              className="h-10 w-10 rounded-full border border-orange-500/40 object-cover shadow-lg sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
            <div>
              <h1 className="text-xs font-bold tracking-[0.1em] text-orange-500 sm:text-sm sm:tracking-[0.15em] lg:text-lg lg:tracking-[0.2em]">
                RIDERS BROTHERHOOD DELHI NCR
              </h1>
              <p className="hidden text-xs text-white/60 sm:block">
                Where passion meets discipline on every ride.
              </p>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-4 md:flex lg:gap-6">
            <a href="#rides" className="text-sm text-white/80 transition hover:text-orange-400">Rides</a>
            <a href="#about" className="text-sm text-white/80 transition hover:text-orange-400">About</a>
            <a href="#join" className="text-sm text-white/80 transition hover:text-orange-400">Join Us</a>
            <Link href="/gallery" className="text-sm text-white/80 transition hover:text-orange-400">Gallery</Link>
            <Link
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              Register
            </Link>
            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Login
            </Link>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5"
            >
              <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 px-4 py-3 md:hidden">
            <div className="flex flex-col">
              <a href="#rides" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-orange-400">Rides</a>
              <a href="#about" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-orange-400">About</a>
              <a href="#join" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-orange-400">Join Us</a>
              <Link href="/gallery" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-orange-400">Gallery</Link>
              <div className="mt-2 border-t border-white/10 pt-3">
                <Link
                  href="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="block rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Carousel */}
      <section className="relative overflow-hidden border-b border-white/10 pt-4">
        <div className="mx-auto mb-4 max-w-[1800px] px-4 sm:mb-6 sm:px-6 md:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">Ride Showcase</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">Stories from the brotherhood</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7 md:text-lg">
            A window into the soul of RBDN — where every ride becomes a story, every mile builds brotherhood, and every moment reflects passion, discipline, and freedom.
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8">
            <div className="flex h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/50 sm:h-[360px] md:h-[420px]">
              Landing gallery images will appear here once added by admin.
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl md:rounded-[2rem]">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative min-w-full overflow-hidden bg-black"
                    style={{ height: "clamp(240px, 48vw, 620px)" }}
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
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                      <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.28em] text-orange-400 sm:text-sm">RBDN Showcase</p>
                        <h3 className="mt-2 text-xl font-extrabold leading-tight text-white sm:mt-4 sm:text-3xl md:text-5xl lg:text-6xl">
                          {item.title || "Untitled Ride"}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 sm:mt-4 sm:text-base md:text-lg md:leading-7">
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
                    onClick={() => setActiveSlide((prev) => prev === 0 ? galleryItems.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg text-white backdrop-blur-md transition hover:border-orange-500 hover:text-orange-400 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveSlide((prev) => prev === galleryItems.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg text-white backdrop-blur-md transition hover:border-orange-500 hover:text-orange-400 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:gap-3">
                    {galleryItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`rounded-full transition-all ${activeSlide === index ? "h-2.5 w-2.5 scale-110 bg-orange-500" : "h-2 w-2 bg-white/50 hover:bg-white/80"}`}
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
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,115,0,0.15),transparent_30%)]" />
        <div className="mx-auto grid max-w-[1800px] gap-8 lg:grid-cols-2 lg:gap-10">

          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <p className="mb-4 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs text-orange-300 sm:text-sm">
                Delhi NCR Riding Community
              </p>
              <h2 className="text-4xl font-extrabold leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl">
                Ride Together.
                <span className="block text-orange-500">Bond Stronger.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
                Welcome to Riders Brotherhood Delhi NCR — a community built on
                safety, discipline, adventure, and real brotherhood.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[
                {
                  label: "Community Riders",
                  value: `${communityRiders}+`,
                  sub: "Approved riders in the brotherhood",
                  big: true,
                },
                {
                  label: "Ride Culture",
                  value: "Every Weekend",
                  sub: "Breakfast rides and disciplined runs",
                  big: false,
                },
                {
                  label: "Kilometers Done",
                  value: `${completedKilometers}+`,
                  sub: "Total distance from completed rides",
                  big: true,
                  suffix: "km",
                },
                {
                  label: "Brotherhood",
                  value: "Strong & Growing",
                  sub: "Built on discipline, respect and consistency",
                  big: false,
                },
              ].map(({ label, value, sub, big, suffix }) => (
                <div key={label} className="rounded-2xl border border-orange-500/15 bg-white/[0.04] p-4 backdrop-blur-md sm:rounded-3xl sm:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-400">{label}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <p className={`font-extrabold text-white ${big ? "text-3xl sm:text-4xl md:text-5xl" : "text-xl sm:text-2xl md:text-3xl font-bold"}`}>
                      {value}
                    </p>
                    {suffix && <span className="mb-1 text-xs text-white/50 sm:text-sm">{suffix}</span>}
                  </div>
                  <p className="mt-2 text-xs text-white/60 sm:mt-3 sm:text-sm">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-full">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-md sm:p-4">
              <div className="flex flex-col rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#1b1b1b] via-black to-[#2b1408]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-orange-400">Featured Community</p>
                    <h3 className="mt-1 text-xl font-bold sm:text-2xl">Riders Brotherhood</h3>
                  </div>
                  <img
                    src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
                    alt="RBDN Emblem"
                    className="h-12 w-12 rounded-full border border-orange-500/40 object-cover sm:h-16 sm:w-16"
                  />
                </div>

                <div className="flex flex-col gap-5 p-5 sm:gap-7 sm:p-6">
                  <div className="space-y-3 text-sm leading-7 text-white/70 sm:text-base">
                    <p>Built for riders who value respect, discipline, proper riding culture, and memorable journeys over noise and chaos.</p>
                    <p>From breakfast rides to long-distance tours, RBDN is about showing up with the right spirit, riding responsibly, and building a stronger brotherhood on every road.</p>
                    <p>It is not just about destinations — it is about consistency, community, and the kind of riding mindset that stays with you beyond the ride itself.</p>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Ride Types", value: "Breakfast + Tours" },
                      { label: "Region", value: "Delhi NCR" },
                      { label: "Culture", value: "Brotherhood" },
                      { label: "Focus", value: "Disciplined Riding" },
                      { label: "Meetups", value: "Every Weekend" },
                      { label: "Community Type", value: "Invite-based" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4">
                        <p className="text-xs text-white/50">{label}</p>
                        <p className="mt-1.5 text-sm font-semibold sm:mt-2 sm:text-lg">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Rides */}
      <section id="rides" className="px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-[1800px] md:px-8">
          <div className="mb-8 sm:mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">Upcoming Rides</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Adventures waiting for the next throttle twist</h3>
            <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
              Explore the next set of RBDN rides, tours, and weekend escapes.
            </p>
          </div>

          {ridesLoading ? (
            <p className="text-white/60">Loading upcoming rides...</p>
          ) : upcomingRides.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/50 sm:p-10">No upcoming rides found yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingRides.map((ride) => (
                <Link
                  key={ride.id}
                  href={`/rides/${ride.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-orange-500/50"
                >
                  <div className="relative h-28 w-full overflow-hidden sm:h-36 md:h-44">
                    <img
                      src={ride.posterUrl || "/placeholder.jpg"}
                      alt={ride.rideName || "Ride"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-black sm:left-3 sm:top-3 sm:px-2 sm:py-1">
                      {ride.rideType || "Ride"}
                    </span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs font-semibold leading-tight sm:text-sm">{ride.rideName || "Untitled Ride"}</h3>
                    <p className="mt-1 text-xs text-white/60">{ride.destination || "Destination not added"}</p>
                    <p className="mt-1 text-xs text-orange-400">{ride.rideDate || "Date not added"}</p>
                    <div className="mt-2 flex items-center justify-between sm:mt-3">
                      <span className="text-xs text-white/50">{Number(ride.distanceKm || 0)} km</span>
                      <span className="rounded-full border border-orange-500 px-2 py-0.5 text-xs text-orange-400 transition hover:bg-orange-500 hover:text-black sm:px-3 sm:py-1">
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
      <section className="px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-[1800px] gap-4 sm:gap-6 md:px-8 lg:grid-cols-2 lg:gap-8">
          <div id="about" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">About RBDN</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl">More than a group. A proper riding brotherhood.</h3>
            <div className="mt-4 space-y-4 text-sm leading-7 text-white/70 sm:mt-6 sm:space-y-5 sm:text-lg sm:leading-8">
              <p>Riders Brotherhood Delhi NCR is for riders who believe that the road should be ridden with discipline, safety, respect, and real community spirit.</p>
              <p>From breakfast rides and city escapes to outstation tours, RBDN is about creating memorable experiences and stronger bonds with every ride.</p>
              <p>It is a culture built on consistency, camaraderie, and the kind of road presence that reflects true brotherhood.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">Ride Gallery</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl">See the moments that define the brotherhood</h3>
            <p className="mt-4 text-sm text-white/70 sm:text-base">
              Explore ride captures, community memories, and the journeys that shape RBDN.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link href="/gallery" className="inline-block rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 sm:px-6 sm:py-3">
                Open Gallery
              </Link>
            </div>
          </div>

          <div id="join" className="rounded-3xl border border-orange-500/20 bg-gradient-to-r from-[#1a1a1a] to-[#251307] p-6 shadow-2xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">Join the Brotherhood</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Ready for the next ride?</h3>
            <p className="mt-4 text-sm text-white/70 sm:text-base">
              Create your rider profile, track your past rides, enroll in upcoming adventures, and become part of a disciplined riding community.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <Link
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 sm:px-6 sm:py-3"
              >
                Join RBDN
              </Link>
              <Link
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400 sm:px-6 sm:py-3"
              >
                Member Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 sm:text-sm">Community Spirit</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl">Discipline first. Brotherhood always.</h3>
            <p className="mt-4 text-sm text-white/70 sm:text-base">
              RBDN is built on responsible riding, respect for fellow riders, proper group etiquette, and a strong sense of togetherness on every route.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-[1800px] flex-col items-center gap-2 text-center text-xs text-white/50 sm:flex-row sm:justify-between sm:px-8 sm:text-sm">
          <p>© 2026 Riders Brotherhood Delhi NCR. All rights reserved.</p>
          <p>Ride safe. Ride hard. Ride together.</p>
        </div>
      </footer>
    </main>
  );
}
