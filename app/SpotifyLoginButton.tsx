"use client";

import { useState } from "react";
import { startSpotifyLogin } from "@/lib/api-client";

export default function SpotifyLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      const { authorizationUrl } = await startSpotifyLogin("/session/new");
      window.location.assign(authorizationUrl);
    } catch (err) {
      console.error(err);
      setError("Spotify login is currently unavailable.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <button
        type="button"
        className="btn btn-outline btn-success btn-lg w-full"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Opening Spotify..." : "Login with Spotify"}
      </button>
      {error ? <p className="text-sm text-error text-center">{error}</p> : null}
    </div>
  );
}
