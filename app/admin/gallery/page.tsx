"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, storage } from "../../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

type GalleryItem = {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  storagePath?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export default function AdminGalleryPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadGalleryItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "landingGallery"));

      const data = snapshot.docs.map((galleryDoc) => ({
        id: galleryDoc.id,
        ...galleryDoc.data(),
      })) as GalleryItem[];

      data.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
      setItems(data);
    } catch (error) {
      console.error("Error loading gallery items:", error);
      setMessage("Failed to load gallery items.");
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const featuredCount = items.filter(
    (item) =>
      item.isActive !== false &&
      typeof item.displayOrder === "number" &&
      item.displayOrder >= 1 &&
      item.displayOrder <= 6
  ).length;

  const handleUpload = async () => {
    try {
      setMessage("");

      if (!file) {
        setMessage("Please choose an image.");
        return;
      }

      if (items.length >= 50) {
        setMessage("Maximum 50 gallery images allowed for now.");
        return;
      }

      const parsedOrder = Number(displayOrder);

      if (!parsedOrder || parsedOrder < 1) {
        setMessage("Please enter a valid display order number.");
        return;
      }

      if (parsedOrder >= 1 && parsedOrder <= 6) {
        const existingFeaturedWithSameOrder = items.find(
          (item) =>
            item.isActive !== false &&
            item.displayOrder === parsedOrder
        );

        if (existingFeaturedWithSameOrder) {
          setMessage(
            `Display order ${parsedOrder} is already being used by another featured image. Choose another number from 1 to 6.`
          );
          return;
        }
      }

      setLoading(true);
      setMessage("Uploading file to cloud storage...");

      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `landingGallery/${fileName}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      setMessage("Saving image record to database...");
      await addDoc(collection(db, "landingGallery"), {
        title: title || "",
        subtitle: subtitle || "",
        imageUrl,
        storagePath,
        displayOrder: parsedOrder,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setSubtitle("");
      setDisplayOrder("");
      setFile(null);
      setMessage("Image uploaded successfully.");

      await loadGalleryItems();
    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      setMessage(error?.message || "Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    try {
      setMessage("");

      if (item.storagePath) {
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
      }

      await deleteDoc(doc(db, "landingGallery", item.id));

      setMessage("Image deleted successfully.");
      await loadGalleryItems();
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to delete image.");
    }
  };

  const getPlacementLabel = (displayOrder?: number) => {
    if (typeof displayOrder === "number" && displayOrder >= 1 && displayOrder <= 6) {
      return "Home Page Featured";
    }
    return "Gallery Only";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#111111] to-[#1a1a1a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Manage Landing Gallery</h1>
            <p className="mt-4 text-white/70">
              Upload and manage the showcase images for the landing page and gallery.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-300">
          <p className="font-semibold">How this works:</p>
          <p className="mt-2">Display Order 1–6 = shown on the Home Page carousel.</p>
          <p>Display Order 7+ = shown only on the Gallery page.</p>
          <p>Maximum 6 featured images on home page and maximum 50 total gallery images for now.</p>
          <p className="mt-2">Currently featured on home page: {featuredCount}/6</p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            {message}
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Upload New Image</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/70">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Display Order</label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="1 to 6 = featured, 7+ = gallery only"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Choose Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Current Landing Images</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 ? (
              <p className="text-white/60">No gallery images added yet.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Gallery image"}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="mb-3 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                      {getPlacementLabel(item.displayOrder)}
                    </div>

                    <h3 className="text-xl font-bold">
                      {item.title || "Untitled"}
                    </h3>
                    <p className="mt-2 text-white/60">
                      {item.subtitle || "No subtitle"}
                    </p>
                    <p className="mt-3 text-sm text-orange-400">
                      Order: {item.displayOrder || 0}
                    </p>

                    <button
                      onClick={() => handleDelete(item)}
                      className="mt-5 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      Delete Image
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}