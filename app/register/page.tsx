"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [bikeName, setBikeName] = useState("");
  const [bikeCC, setBikeCC] = useState("");
  const [ridingExperience, setRidingExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setMessage("");

      if (
        !fullName ||
        !phoneNumber ||
        !city ||
        !bikeName ||
        !bikeCC ||
        !ridingExperience ||
        !whyJoin
      ) {
        setMessage("Please fill all fields.");
        return;
      }

      setLoading(true);

      await addDoc(collection(db, "joinRequests"), {
        fullName,
        phoneNumber,
        city,
        bikeName,
        bikeCC,
        ridingExperience,
        whyJoin,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage("Registration request submitted successfully.");

      setFullName("");
      setPhoneNumber("");
      setCity("");
      setBikeName("");
      setBikeCC("");
      setRidingExperience("");
      setWhyJoin("");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to submit registration request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md md:grid-cols-2">
          <div className="flex flex-col justify-center bg-gradient-to-br from-black via-[#111111] to-[#2a1408] p-10">
            <img
              src="https://res.cloudinary.com/ddx2xuahn/image/upload/q_auto/f_auto/v1776750605/WhatsApp_Image_2026-04-21_at_11.13.41_xahv2g.jpg"
              alt="RBDN Logo"
              className="mb-6 h-20 w-20 rounded-full border border-orange-500/40 object-cover shadow-lg"
            />

            <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
              Riders Brotherhood Delhi NCR
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Join the brotherhood.
            </h1>

            <p className="mt-4 max-w-md text-white/70">
              Submit your details to request entry into RBDN. Once approved by the
              admin, you will be able to log in using the normal member login flow.
            </p>
          </div>

          <div className="p-10">
            <div className="mx-auto max-w-md space-y-5">
              <h2 className="text-3xl font-bold">Register Now</h2>
              <p className="text-white/60">
                Fill in your details to request joining RBDN
              </p>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Bike Name
                </label>
                <input
                  type="text"
                  value={bikeName}
                  onChange={(e) => setBikeName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Bike CC
                </label>
                <input
                  type="text"
                  value={bikeCC}
                  onChange={(e) => setBikeCC(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Riding Experience
                </label>
                <input
                  type="text"
                  placeholder="Example: 2 years"
                  value={ridingExperience}
                  onChange={(e) => setRidingExperience(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Why do you want to join RBDN?
                </label>
                <textarea
                  rows={4}
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

              {message && <p className="text-sm text-white/70">{message}</p>}

              <div className="text-sm text-white/60">
                Already approved?{" "}
                <a
                  href="/login"
                  className="font-semibold text-orange-400 hover:text-orange-300"
                >
                  Go to login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}