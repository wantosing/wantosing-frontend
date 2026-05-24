import { clearProfile } from "@/app/profile/types";

// Determine API base URL. Priority:
// 1. `NEXT_PUBLIC_API_BASE` environment variable (useful for local dev overrides)
// 2. `window.location.origin` when running in the browser
// 3. empty string as a last resort (relative requests)
const DEFAULT_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
  ? window.location.origin
  : "";

const BASE = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE)
  ? process.env.NEXT_PUBLIC_API_BASE
  : DEFAULT_BASE;
  
// --- Types ---
export type User = {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type SessionParticipant = {
  userId: string;
  role: string;
  joinedAt: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type Session = {
  id: string;
  name: string | null;
  hostUserId: string | null;
  inviteCode?: string | null;
  visibility?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  participants?: SessionParticipant[];
};

export type Plan = { id: string; name: string; description?: string };
export type Venue = { id: string; name: string; address?: string; city?: string; country?: string };

export type SpotifyLoginStartResponse = {
  authorizationUrl: string;
};

export type MyLibrarySong = {
  songId: string;
  title: string;
  artist: string;
  isrc: string | null;
  imageUrl: string | null;
  durationMs: number | null;
  provider: string;
};

export type MyLibraryResponse = {
  userId: string;
  provider: string;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  songs: MyLibrarySong[];
};

// --- Auth / Session helpers ---
export async function devLogin(email: string, displayName?: string) {
  const res = await fetch(`${BASE}/auth/dev-login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, displayName }),
  });
  if (!res.ok) throw new Error("dev-login-failed");
  return res.json() as Promise<{ user: User; session: { id: string; expiresAt: string }; csrfToken?: string }>;
}

export async function fetchCsrfToken() {
  const res = await fetch(`${BASE}/auth/csrf`, { credentials: "include" });
  if (!res.ok) throw new Error("csrf-fetch-failed");
  const j = (await res.json()) as { csrfToken?: unknown };
  if (typeof j.csrfToken !== "string") {
    throw new Error("csrf-fetch-failed");
  }
  return j.csrfToken;
}

export async function getMe() {
  const res = await fetch(`${BASE}/me`, { credentials: "include" });
  if (!res.ok) throw new Error("me-fetch-failed");
  return res.json() as Promise<User>;
}

export async function getMyLibrary(page = 1) {
  const res = await fetch(`${BASE}/me/library?page=${encodeURIComponent(String(page))}`, { credentials: "include" });
  if (!res.ok) throw new Error("library-fetch-failed");
  return res.json() as Promise<MyLibraryResponse>;
}

export async function logout() {
  const res = await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("logout-failed");
  return res.json();
}

export async function logoutAndClearProfile() {
  try {
    await logout();
  } finally {
    clearProfile();
  }
}

export async function startSpotifyLogin(redirectTo = "/session/new") {
  const res = await fetch(`${BASE}/auth/spotify/start`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirectTo }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`spotify-login-start-failed ${res.status} ${body}`);
  }
  return res.json() as Promise<SpotifyLoginStartResponse>;
}

// --- Sessions ---
export async function createSession(name: string, visibility: "private" | "invite_only" = "invite_only", csrfToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrfToken) headers["x-csrf-token"] = csrfToken;
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ name, visibility }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`create-session-failed ${res.status} ${body}`);
  }
  return res.json() as Promise<Session>;
}

export async function getSession(id: string) {
  const res = await fetch(`${BASE}/sessions/${encodeURIComponent(id)}`, { credentials: "include" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`get-session-failed ${res.status} ${txt}`);
  }
  return res.json() as Promise<Session>;
}

// --- Plans & Venues ---
export async function listPlans() {
  const res = await fetch(`${BASE}/plans`);
  if (!res.ok) throw new Error("plans-fetch-failed");
  return res.json() as Promise<Plan[]>;
}

export async function getPlanById(id: string) {
  const res = await fetch(`${BASE}/plans/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("plan-fetch-failed");
  return res.json() as Promise<Plan>;
}

export async function listVenues() {
  const res = await fetch(`${BASE}/venues`);
  if (!res.ok) throw new Error("venues-fetch-failed");
  return res.json() as Promise<Venue[]>;
}

export async function getVenueById(id: string) {
  const res = await fetch(`${BASE}/venues/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("venue-fetch-failed");
  return res.json() as Promise<Venue>;
}

export async function createVenue(body: Partial<Venue> & { id: string; name: string }) {
  const res = await fetch(`${BASE}/venues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`create-venue-failed ${res.status} ${txt}`);
  }
  return res.json();
}

const api = {
  devLogin,
  fetchCsrfToken,
  getMe,
  getMyLibrary,
  logout,
  startSpotifyLogin,
  createSession,
  getSession,
  listPlans,
  getPlanById,
  listVenues,
  getVenueById,
  createVenue,
};

export default api;
