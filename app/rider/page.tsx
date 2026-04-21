"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

type RiderData = {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  city?: string;
  bikeName?: string;
  bikeCC?: string;
  photoURL?: string;
};

type Ride = {
  id?: string;
  rideName?: string;
  rideDate?: string;
  reportingTime?: string;
  flagOffTime?: string;
  meetingPoint?: string;
  meetingUrl?: string;
  destination?: string;
  destinationUrl?: string;
  instructions?: string;
  rideType?: string;
  status?: string;
};

export default function RiderDashboard() {
  const [userData, setUserData] = useState<RiderData | null>(null);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const phone = user.phoneNumber;

        // Load logged in rider details
        const userQuery = query(
          collection(db, "users"),
          where("phoneNumber", "==", phone)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          setUserData(userSnapshot.docs[0].data() as RiderData);
        }

        // Load ALL rides and split automatically by date
        const ridesSnapshot = await getDocs(collection(db, "rides"));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming: Ride[] = [];
        const completed: Ride[] = [];

        ridesSnapshot.docs.forEach((rideDoc) => {
          const data = rideDoc.data() as Omit<Ride, "id">;

          if (!data.rideDate) return;

          const rideDate = new Date(data.rideDate);
          rideDate.setHours(0, 0, 0, 0);

          const ride: Ride = {
            id: rideDoc.id,
            ...data,
          };

          if (rideDate >= today) {
            upcoming.push(ride);
          } else {
            completed.push(ride);
          }
        });

        setUpcomingRides(upcoming);
        setCompletedRides(completed);
      } catch (error) {
        console.error("Error loading rider dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const badges = ["Early Rider", "Brotherhood Spirit", "Weekend Explorer"];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-orange-500">
              RBDN
            </h1>
            <p className="text-xs text-white/60">
              Riders Brotherhood Delhi NCR
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/rider/profile"
              className="rounded-full border border-orange-500 px-5 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Edit Details
            </Link>

            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt="Profile"
                className="h-11 w-11 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-orange-400">
                {userData?.fullName?.charAt(0) || "R"}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-orange-500">
            Welcome, {userData?.fullName || "Rider"}
          </h2>
          <p className="mt-3 text-white/60">
            Your home for upcoming rides, completed rides, badges, and community updates.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Phone Number</p>
            <h3 className="mt-3 text-lg font-semibold">
              {loading ? "Loading..." : userData?.phoneNumber || "Not available"}
            </h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">City</p>
            <h3 className="mt-3 text-lg font-semibold">
              {loading ? "Loading..." : userData?.city || "Not added"}
            </h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Bike</p>
            <h3 className="mt-3 text-lg font-semibold">
              {loading
                ? "Loading..."
                : userData?.bikeName
                ? `${userData.bikeName}${userData.bikeCC ? ` • ${userData.bikeCC}cc` : ""}`
                : "Not added"}
            </h3>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
            Upcoming Rides
          </p>
          <h3 className="mt-2 text-2xl font-bold">Your next adventures</h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {upcomingRides.length === 0 ? (
              <p className="text-white/60">No upcoming rides found yet.</p>
            ) : (
              upcomingRides.map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <p className="text-sm text-orange-400">
                    {ride.rideType || "Ride"}
                  </p>
                  <h4 className="mt-2 text-2xl font-bold">
                    {ride.rideName || "Untitled Ride"}
                  </h4>
                  <p className="mt-3 text-white/70">
                    {ride.destination || "Destination not added"}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-white/60">
                    <p>Date: {ride.rideDate || "Not added"}</p>
                    <p>Reporting: {ride.reportingTime || "Not added"}</p>
                    <p>Flag Off: {ride.flagOffTime || "Not added"}</p>
                    <p>Meeting Point: {ride.meetingPoint || "Not added"}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {ride.meetingUrl && (
                      <a
                        href={ride.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-orange-500 px-4 py-2 text-sm text-orange-400 hover:bg-orange-500 hover:text-black"
                      >
                        Meeting Point
                      </a>
                    )}

                    {ride.destinationUrl && (
                      <a
                        href={ride.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-orange-500 hover:text-orange-400"
                      >
                        Destination
                      </a>
                    )}

                    <button className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-black hover:opacity-90">
                      Join Ride
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
            Completed Rides
          </p>
          <h3 className="mt-2 text-2xl font-bold">Community ride history</h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {completedRides.length === 0 ? (
              <p className="text-white/60">No completed rides found yet.</p>
            ) : (
              completedRides.map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <p className="text-sm text-orange-400">
                    {ride.rideType || "Ride"}
                  </p>
                  <h4 className="mt-2 text-2xl font-bold">
                    {ride.rideName || "Untitled Ride"}
                  </h4>
                  <p className="mt-3 text-white/70">
                    {ride.destination || "Destination not added"}
                  </p>

                  <div className="mt-4 text-sm text-white/60">
                    <p>Date: {ride.rideDate || "Not added"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Achievement Badges
            </p>
            <h3 className="mt-2 text-2xl font-bold">Your brotherhood milestones</h3>

            <div className="mt-6 flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Community
            </p>
            <h3 className="mt-2 text-2xl font-bold">About the brotherhood</h3>

            <p className="mt-4 leading-7 text-white/70">
              RBDN is built on riding discipline, brotherhood, safety, respect,
              and shared road memories. Show up with the right spirit, ride with
              responsibility, and become part of something bigger than just a ride.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}