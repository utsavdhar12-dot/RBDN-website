"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

type JoinRequest = {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  bikeName?: string;
  city?: string;
  status?: string;
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

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [historicalRides, setHistoricalRides] = useState<Ride[]>([]);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [totalRiders, setTotalRiders] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Pending approvals
        const pendingQuery = query(
          collection(db, "joinRequests"),
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingData = pendingSnapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        })) as JoinRequest[];

        setPendingRequests(pendingData);

        // Total riders
        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalRiders(usersSnapshot.size);

        // Load ALL rides and split automatically by date
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        setTotalRides(ridesSnapshot.size);

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
        setHistoricalRides(completed);
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-orange-500">
              RBDN ADMIN
            </h1>
            <p className="text-xs text-white/60">
              Riders Brotherhood Delhi NCR
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/create-ride"
              className="rounded-full border border-orange-500 px-5 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              Create Ride
            </Link>

            <Link href="/admin/approvals" className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl">
                🔔
              </div>

              {pendingRequests.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-black">
                  {pendingRequests.length}
                </span>
              )}
            </Link>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              Admin
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-orange-500">Admin Dashboard</h2>
          <p className="mt-3 text-white/60">
            Manage rides, rider approvals, and the overall RBDN community from one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Overall Riders</p>
            <h3 className="mt-3 text-4xl font-bold text-orange-500">
              {loading ? "..." : totalRiders}
            </h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Pending Approvals</p>
            <h3 className="mt-3 text-4xl font-bold text-orange-500">
              {loading ? "..." : pendingRequests.length}
            </h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Upcoming Rides</p>
            <h3 className="mt-3 text-4xl font-bold text-orange-500">
              {loading ? "..." : upcomingRides.length}
            </h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Total Community Rides</p>
            <h3 className="mt-3 text-4xl font-bold text-orange-500">
              {loading ? "..." : totalRides}
            </h3>
          </div>
        </div>

        {/* Action cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Link
            href="/admin/create-ride"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/40"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Action
            </p>
            <h3 className="mt-3 text-2xl font-bold">Create Ride</h3>
            <p className="mt-3 text-white/70">
              Add a new breakfast ride, tour, or community event. It will appear
              automatically for riders.
            </p>
          </Link>

          <Link
            href="/admin/approvals"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/40"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Action
            </p>
            <h3 className="mt-3 text-2xl font-bold">Approve Riders</h3>
            <p className="mt-3 text-white/70">
              Review pending requests and approve new riders into the brotherhood.
            </p>
          </Link>

          <Link
            href="/admin/history"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/40"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Action
            </p>
            <h3 className="mt-3 text-2xl font-bold">Historical Rides</h3>
            <p className="mt-3 text-white/70">
              View the community’s completed rides and long-term ride archive.
            </p>
          </Link>

           <Link
  href="/admin/gallery"
  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/40"
>
  <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
    Action
  </p>
  <h3 className="mt-3 text-2xl font-bold">Manage Landing Gallery</h3>
  <p className="mt-3 text-white/70">
    Upload, manage, and delete the showcase images shown on the landing page.
  </p>
</Link>   

        </div>

        {/* Pending requests preview */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                Pending Approvals
              </p>
              <h3 className="mt-2 text-2xl font-bold">Riders waiting for approval</h3>
            </div>

            <Link
              href="/admin/approvals"
              className="text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-white/60">No pending approvals right now.</p>
            ) : (
              pendingRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <h4 className="text-lg font-semibold">
                    {request.fullName || "Unnamed Rider"}
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    {request.phoneNumber || "No phone"} • {request.bikeName || "Bike not added"} •{" "}
                    {request.city || "City not added"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming rides preview */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                Upcoming Rides
              </p>
              <h3 className="mt-2 text-2xl font-bold">Active community rides</h3>
            </div>

            <Link
              href="/admin/create-ride"
              className="text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              Create new
            </Link>
          </div>

          <div className="mt-6 space-y-4">
     {upcomingRides.length === 0 ? (
  <p className="text-white/60">No upcoming rides found yet.</p>
) : (
  upcomingRides.slice(0, 5).map((ride) => (
    <div
      key={ride.id}
      className="rounded-2xl border border-white/10 bg-black/30 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold">
            {ride.rideName || "Untitled Ride"}
          </h4>
          <p className="mt-1 text-sm text-white/60">
            {ride.destination || "Destination not added"} •{" "}
            {ride.rideDate || "Date not added"}
          </p>
        </div>

        <Link
          href={`/admin/edit-ride/${ride.id}`}
          className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
        >
          Edit
        </Link>
      </div>
    </div>
  ))
)}
          </div>
        </div>

        {/* Historical rides preview */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                Historical Rides
              </p>
              <h3 className="mt-2 text-2xl font-bold">Completed community rides</h3>
            </div>

            <Link
              href="/admin/history"
              className="text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {historicalRides.length === 0 ? (
              <p className="text-white/60">
                No completed rides found yet. Older rides will automatically show here based on date.
              </p>
            ) : (
              historicalRides.slice(0, 5).map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <h4 className="text-lg font-semibold">
                    {ride.rideName || "Untitled Ride"}
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    {ride.destination || "Destination not added"} • {ride.rideDate || "Date not added"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}