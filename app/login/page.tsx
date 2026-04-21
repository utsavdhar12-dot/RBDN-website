"use client";

import { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [message, setMessage] = useState("");

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            setMessage("reCAPTCHA verified");
          },
        }
      );
    }
  };

  const handleSendOtp = async () => {
    try {
      setMessage("");

      if (!phoneNumber) {
        setMessage("Please enter your mobile number.");
        return;
      }

      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier!;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

      setConfirmationResult(result);
      setMessage("OTP sent successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setMessage("");

      if (!confirmationResult) {
        setMessage("Please send OTP first.");
        return;
      }

      if (!otp) {
        setMessage("Please enter the OTP.");
        return;
      }

      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      const verifiedPhone = user.phoneNumber || phoneNumber;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phoneNumber", "==", verifiedPhone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage(
          "Your account is not approved yet. Please register first or wait for admin approval."
        );
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.role === "admin") {
        setMessage("Admin login successful. Redirecting...");
        router.push("/admin");
      } else {
        setMessage("Rider login successful. Redirecting...");
        router.push("/rider");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Invalid OTP.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md md:grid-cols-2">
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
              Welcome back to the brotherhood.
            </h1>

            <p className="mt-4 max-w-md text-white/70">
              Existing approved riders and admins can log in here using mobile OTP.
            </p>
          </div>

          <div className="p-10">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold">Login</h2>
              <p className="mt-2 text-white/60">
                Use your mobile number to continue
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400"
                >
                  Send OTP
                </button>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full rounded-2xl border border-orange-500 px-5 py-3 font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
                >
                  Verify & Login
                </button>

                <div id="recaptcha-container" className="pt-2"></div>

                {message && <p className="text-sm text-white/70">{message}</p>}

                <div className="border-t border-white/10 pt-4 text-sm text-white/60">
                  New rider?{" "}
                  <a
                    href="/register"
                    className="font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Register now
                  </a>
                </div>
              </div>

              <p className="mt-6 text-sm text-white/50">
                Only approved riders and admins can log in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}