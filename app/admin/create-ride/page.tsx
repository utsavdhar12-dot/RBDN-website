"use client";

import { useState } from "react";
import Link from "next/link";
import { db, storage } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function CreateRidePage() {
  const [rideName, setRideName] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [reportingTime, setReportingTime] = useState("");
  const [flagOffTime, setFlagOffTime] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rideType, setRideType] = useState("Breakfast");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRide = async () => {
    try {
      setMessage("");

      if (!rideName || !rideDate || !meetingPoint || !destination) {
        setMessage("Please fill all required fields.");
        return;
      }

      setLoading(true);

      let finalPosterUrl = "";

      if (posterFile) {
        if (!posterFile.type.startsWith("image/")) {
          throw new Error("Please select a valid image file.");
        }

        if (posterFile.size > 10 * 1024 * 1024) {
          throw new Error("Image is too large. Please use an image smaller than 10 MB.");
        }

        setMessage("Uploading poster...");

        const safeFileName = `${Date.now()}-${posterFile.name.replace(/\s+/g, "-")}`;
        const storageRef = ref(storage, `rides/${safeFileName}`);

        await uploadBytes(storageRef, posterFile);
        finalPosterUrl = await getDownloadURL(storageRef);
      }

      setMessage("Saving ride...");

      await addDoc(collection(db, "rides"), {
        rideName,
        rideDate,
        reportingTime,
        flagOffTime,
        meetingPoint,
        meetingUrl,
        destination,
        destinationUrl,
        distanceKm: Number(distanceKm) || 0,
        instructions,
        rideType,
        posterUrl: finalPosterUrl,
        status: "upcoming",
        createdAt: serverTimestamp(),
      });

      setRideName("");
      setRideDate("");
      setReportingTime("");
      setFlagOffTime("");
      setMeetingPoint("");
      setMeetingUrl("");
      setDestination("");
      setDestinationUrl("");
      setDistanceKm("");
      setInstructions("");
      setRideType("Breakfast");
      setPosterFile(null);

      setMessage("Ride created successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to create ride.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Create Ride</h1>
            <p className="mt-3 text-white/60">
              Add a new ride with poster, timings, route and approximate total kilometers.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <input
            placeholder="Ride Name"
            value={rideName}
            onChange={(e) => setRideName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <select
            value={rideType}
            onChange={(e) => setRideType(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          >
            <option value="Breakfast" className="bg-black">Breakfast</option>
            <option value="Tour" className="bg-black">Tour</option>
            <option value="Camping" className="bg-black">Camping</option>
            <option value="Community Special" className="bg-black">Community Special</option>
          </select>

          <input
            type="date"
            value={rideDate}
            onChange={(e) => setRideDate(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Approx Total KMS"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Reporting Time"
            value={reportingTime}
            onChange={(e) => setReportingTime(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Flag Off Time"
            value={flagOffTime}
            onChange={(e) => setFlagOffTime(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Meeting Point"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Meeting Location URL"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <input
            placeholder="Destination URL"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 outline-none focus:border-orange-500"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/70">
              Ride Poster
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="inline-flex cursor-pointer items-center rounded-full bg-orange-500 px-5 py-2 font-semibold text-black transition hover:bg-orange-400">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPosterFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <span className="ml-4 text-sm text-white/70">
                {posterFile ? posterFile.name : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <textarea
              placeholder="Ride Instructions / Full Description"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleCreateRide}
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating ride..." : "Create Ride"}
            </button>
          </div>

          {message && (
            <div className="md:col-span-2">
              <p className="text-white/70">{message}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}