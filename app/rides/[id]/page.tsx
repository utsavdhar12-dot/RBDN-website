import Link from "next/link";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type RidePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RideDetailsPage({ params }: RidePageProps) {
  const { id } = await params;

  const rideRef = doc(db, "rides", id);
  const rideSnap = await getDoc(rideRef);

  if (!rideSnap.exists()) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-orange-500">Ride not found</h1>
          <p className="mt-4 text-white/70">
            The ride you are trying to view does not exist.
          </p>
        </div>
      </main>
    );
  }

  const ride = rideSnap.data();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#555b65] to-[#6d727b] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-center text-4xl font-bold text-white md:text-5xl">
          {ride.rideName || "Ride Details"}
        </h1>

        <div className="mt-8 flex justify-center">
          {ride.posterUrl ? (
            <img
              src={ride.posterUrl}
              alt={ride.rideName || "Ride poster"}
              className="max-h-[700px] rounded-lg border border-white/20 object-contain shadow-2xl"
            />
          ) : (
            <div className="flex h-[500px] w-[360px] items-center justify-center rounded-lg border border-white/20 bg-black/20 text-white/50">
              No Poster Uploaded
            </div>
          )}
        </div>

        <div className="mt-10 grid overflow-hidden rounded-2xl bg-white text-black lg:grid-cols-[1.4fr_0.8fr]">
          <div className="p-8">
            <h2 className="text-3xl font-bold">
              {ride.rideName || "Untitled Ride"}
            </h2>

            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-black/80">
              {ride.instructions || "Ride details will be updated soon."}
            </p>

            <div className="mt-8">
              <Link
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Register Now
              </Link>
            </div>
          </div>

          <div className="border-l border-black/10 p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold">Date And Time</h3>
                <p className="mt-3 text-lg text-black/80">
                  {ride.rideDate || "Not added"}
                  {ride.reportingTime ? ` @ ${ride.reportingTime}` : ""}
                  {ride.flagOffTime ? ` | Flag Off: ${ride.flagOffTime}` : ""}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">Location</h3>
                <p className="mt-3 text-lg text-black/80">
                  {ride.destination || "Not added"}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">Meeting Point</h3>
                <p className="mt-3 text-lg text-black/80">
                  {ride.meetingPoint || "Not added"}
                </p>
                {ride.meetingUrl && (
                  <a
                    href={ride.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-orange-600 hover:underline"
                  >
                    Open Meeting Location
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold">Ride Type</h3>
                <p className="mt-3 inline-block rounded-lg bg-black/5 px-3 py-2 text-lg text-black/80">
                  {ride.rideType || "Ride"}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">Distance</h3>
                <p className="mt-3 text-lg text-black/80">
                  {ride.distanceKm ? `${ride.distanceKm} km` : "Not added"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}