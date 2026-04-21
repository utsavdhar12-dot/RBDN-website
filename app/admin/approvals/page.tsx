"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

type JoinRequest = {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  city?: string;
  bikeName?: string;
  bikeCC?: string;
  ridingExperience?: string;
  whyJoin?: string;
  status?: string;
};

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "joinRequests"));
      const data = snapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data(),
      })) as JoinRequest[];

      setRequests(data.filter((item) => item.status === "pending"));
    } catch (error) {
      console.error("Error loading join requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (request: JoinRequest) => {
    try {
      setMessage("");

      await addDoc(collection(db, "users"), {
        fullName: request.fullName || "",
        phoneNumber: request.phoneNumber || "",
        city: request.city || "",
        bikeName: request.bikeName || "",
        bikeCC: request.bikeCC || "",
        role: "rider",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "joinRequests", request.id), {
        status: "approved",
      });

      setMessage(`Approved ${request.fullName || "rider"} successfully.`);
      await loadRequests();
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to approve rider.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setMessage("");

      await updateDoc(doc(db, "joinRequests", requestId), {
        status: "rejected",
      });

      setMessage("Request rejected.");
      await loadRequests();
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to reject request.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Approve Riders</h1>
            <p className="mt-4 text-white/70">
              Review pending rider registration requests and approve them into the brotherhood.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            {message}
          </div>
        )}

        <div className="mt-10 space-y-6">
          {loading ? (
            <p className="text-white/60">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              No pending requests right now.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                      Pending Rider
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {request.fullName || "Unnamed Rider"}
                    </h2>

                    <div className="mt-4 space-y-2 text-white/70">
                      <p>
                        <span className="text-white/50">Phone:</span>{" "}
                        {request.phoneNumber || "Not added"}
                      </p>
                      <p>
                        <span className="text-white/50">City:</span>{" "}
                        {request.city || "Not added"}
                      </p>
                      <p>
                        <span className="text-white/50">Bike:</span>{" "}
                        {request.bikeName || "Not added"}
                        {request.bikeCC ? ` • ${request.bikeCC}cc` : ""}
                      </p>
                      <p>
                        <span className="text-white/50">Experience:</span>{" "}
                        {request.ridingExperience || "Not added"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                      Why Join
                    </p>
                    <p className="mt-3 leading-7 text-white/70">
                      {request.whyJoin || "No reason provided."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleApprove(request)}
                        className="rounded-full bg-orange-500 px-5 py-2 font-semibold text-black hover:bg-orange-400"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(request.id)}
                        className="rounded-full border border-white/15 px-5 py-2 font-semibold text-white hover:border-red-500 hover:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}