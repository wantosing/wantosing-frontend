"use client";

import { useState } from "react";
import Link from "next/link";
import { startSpotifyLogin } from "@/lib/api-client";

export default function Home() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSpotifyLogin() {
    setError(null);
    setIsSpotifyLoading(true);
    try {
      const { authorizationUrl } = await startSpotifyLogin("/session/new");
      window.location.assign(authorizationUrl);
    } catch (err) {
      console.error(err);
      setError("Spotify login is currently unavailable.");
      setIsSpotifyLoading(false);
    }
  }

  return (
    <main>
      <div className="hero min-h-screen bg-base-100">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Wantosing</h1>
            <p className="py-6 text-lg">Choosing the song for karaoke🎤</p>
            <div className="flex flex-col items-center gap-3 justify-center">
              <button
                type="button"
                className="btn btn-outline btn-success btn-lg w-full max-w-md"
                onClick={() => setIsPickerOpen(true)}
              >
                Login with ur music platform
              </button>
              <Link href={'/session'} className="link link-primary text-sm">
                Continue without login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl">
            <div className="card-body gap-4">
              <div>
                <h2 className="card-title text-2xl">Choose platform</h2>
                <p className="text-sm opacity-70">Spotify is available now. YT Music and Apple Music are coming soon.</p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  className="btn btn-success btn-outline w-full"
                  onClick={handleSpotifyLogin}
                  disabled={isSpotifyLoading}
                >
                  {isSpotifyLoading ? "Opening Spotify..." : "Spotify"}
                </button>

                <button type="button" className="btn btn-disabled w-full" disabled title="Not available yet">
                  YT Music - not available yet
                </button>

                <button type="button" className="btn btn-disabled w-full" disabled title="Not available yet">
                  Apple Music - not available yet
                </button>
              </div>

              {error ? <p className="text-sm text-error">{error}</p> : null}

              <div className="card-actions justify-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsPickerOpen(false);
                    setError(null);
                    setIsSpotifyLoading(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
