"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, storage } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type EditRidePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditRidePage({ params }: EditRidePageProps) {
  const [rideId, setRideId] = useState("");
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
  const [posterUrl, setPosterUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setRideId(id);

        const rideRef = doc(db, "rides", id);
        const rideSnap = await getDoc(rideRef);

        if (!rideSnap.exists()) {
          setMessage("Ride not found.");
          setLoading(false);
          return;
        }

        const ride = rideSnap.data();

        setRideName(ride.rideName || "");
        setRideDate(ride.rideDate || "");
        setReportingTime(ride.reportingTime || "");
        setFlagOffTime(ride.flagOffTime || "");
        setMeetingPoint(ride.meetingPoint || "");
        setMeetingUrl(ride.meetingUrl || "");
        setDestination(ride.destination || "");
        setDestinationUrl(ride.destinationUrl || "");
        setDistanceKm(String(ride.distanceKm || ""));
        setInstructions(ride.instructions || "");
        setRideType(ride.rideType || "Breakfast");
        setPosterUrl(ride.posterUrl || "");
      } catch (error) {
        console.error("Error loading ride:", error);
        setMessage("Failed to load ride.");
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [params]);

  const uploadPosterIfNeeded = async () => {
    if (!posterFile) {
      return posterUrl;
    }

    if (!posterFile.type.startsWith("image/")) {
      throw new Error("Please select a valid image file.");
    }

    if (posterFile.size > 10 * 1024 * 1024) {
      throw new Error("Image is too large. Please use an image smaller than 10 MB.");
    }

    try {
      setMessage("Uploading new poster...");

      const safeFileName = `${Date.now()}-${posterFile.name.replace(/\s+/g, "-")}`;
      const storageRef = ref(storage, `rides/${safeFileName}`);

      await uploadBytes(storageRef, posterFile);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error: any) {
      console.error("Poster upload failed:", error);
      throw new Error(error.message || "Poster upload failed.");
    }
  };

  const handleUpdateRide = async () => {
    try {
      setMessage("");

      if (!rideId) {
        setMessage("Ride ID missing.");
        return;
      }

      if (!rideName || !rideDate || !meetingPoint || !destination) {
        setMessage("Please fill all required fields.");
        return;
      }

      setSaving(true);

      let finalPosterUrl = posterUrl;

      if (posterFile) {
        finalPosterUrl = await uploadPosterIfNeeded();
      }

      setMessage("Saving ride updates...");

      await updateDoc(doc(db, "rides", rideId), {
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
      });

      setPosterUrl(finalPosterUrl);
      setPosterFile(null);
      setMessage("Ride updated successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to update ride.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-white/60">Loading ride...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Edit Ride</h1>
            <p className="mt-3 text-white/60">
              Update ride details without touching code.
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
              Update Ride Poster
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
                {posterFile ? posterFile.name : "No new file chosen"}
              </span>

              {posterUrl && !posterFile && (
                <p className="mt-3 text-sm text-white/50">
                  Existing poster already available
                </p>
              )}
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
              onClick={handleUpdateRide}
              disabled={saving}
              className="w-full rounded-2xl bg-orange-500 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Update Ride"}
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