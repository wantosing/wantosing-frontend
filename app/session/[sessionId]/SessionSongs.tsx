"use client";

import Image from "next/image";
import type { Song, Session, TrackEntry } from "../types";
import SAMPLE_SONGS from "../sampleSongs";
import { useState } from "react";

type Props = {
    songs: Song[];
    session: Session;
    onUpdate: (updated: Session) => void;
};

export default function SessionSongs({ songs, session, onUpdate }: Props) {
    const [selected, setSelected] = useState<Song | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    // duration in the form is in seconds (we store durations internally as milliseconds)
    const [form, setForm] = useState({ title: "", artist: "", duration: "180", thumbnail: "", spotify: "", ytmusic: "", apple: "" });

    function openAdd() {
        setForm({ title: "", artist: "", duration: "180", thumbnail: "", spotify: "", ytmusic: "", apple: "" });
        setAddOpen(true);
    }

    function isValidUrl(value: string) {
        try {
            const u = new URL(value);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }

    function validatePlatformLink(platform: "spotify" | "ytmusic" | "apple", url: string) {
        if (!isValidUrl(url)) return false;
        try {
            const host = new URL(url).host.toLowerCase();
            if (platform === "spotify") return host.includes("spotify");
            if (platform === "ytmusic") return host.includes("youtube") || host.includes("youtu.be") || host.includes("music.youtube");
            if (platform === "apple") return host.includes("apple") || host.includes("music.apple");
            return false;
        } catch {
            return false;
        }
    }

    function addSongFromForm() {
        const title = form.title.trim() || "New Song";
        const artist = form.artist.trim() || "Unknown";
        // interpret duration input as seconds (UI) and convert to milliseconds for storage
        const seconds = Math.max(0, parseInt(form.duration || "180", 10) || 180);
        const duration = seconds * 1000;

        // Basic validation for any provided platform URLs
        if (form.spotify?.trim()) {
            if (!validatePlatformLink("spotify", form.spotify.trim())) {
                window.alert("Invalid Spotify URL. Please provide a valid spotify.com link.");
                return;
            }
        }
        if (form.ytmusic?.trim()) {
            if (!validatePlatformLink("ytmusic", form.ytmusic.trim())) {
                window.alert("Invalid YouTube Music URL. Please provide a valid youtube.com or music.youtube.com link.");
                return;
            }
        }
        if (form.apple?.trim()) {
            if (!validatePlatformLink("apple", form.apple.trim())) {
                window.alert("Invalid Apple Music URL. Please provide a valid music.apple.com link.");
                return;
            }
        }

        // Build minimal TrackEntry objects for each provided platform link.
        const tracks: TrackEntry[] = [];
        if (form.spotify?.trim()) {
            tracks.push({
                source: "spotify",
                data: {
                    externalId: form.spotify.trim(),
                    name: title,
                    artistNames: [artist],
                    imageUrl: form.thumbnail?.trim() || undefined,
                    duration: duration,
                    url: form.spotify.trim(),
                    previewUrl: null,
                    albumName: null,
                    isrc: null,
                },
                type: "track",
            });
        }
        if (form.ytmusic?.trim()) {
            tracks.push({
                source: "youtube",
                data: {
                    externalId: form.ytmusic.trim(),
                    name: title,
                    artistNames: [artist],
                    imageUrl: form.thumbnail?.trim() || undefined,
                    duration: duration,
                    url: form.ytmusic.trim(),
                    previewUrl: null,
                    albumName: null,
                    isrc: null,
                },
                type: "track",
            });
        }
        if (form.apple?.trim()) {
            tracks.push({
                source: "appleMusic",
                data: {
                    externalId: form.apple.trim(),
                    name: title,
                    artistNames: [artist],
                    imageUrl: form.thumbnail?.trim() || undefined,
                    duration: duration,
                    url: form.apple.trim(),
                    previewUrl: null,
                    albumName: null,
                    isrc: null,
                },
                type: "track",
            });
        }

        // If no platform links provided, create a generic track entry using form fields
        if (tracks.length === 0) {
            tracks.push({
                source: "local",
                data: {
                    externalId: String(Date.now()),
                    name: title,
                    artistNames: [artist],
                    imageUrl: form.thumbnail?.trim() || undefined,
                    duration: duration,
                    url: null,
                    previewUrl: null,
                    albumName: null,
                    isrc: null,
                },
                type: "track",
            });
        }

        const newSong: Song = {
            id: String(Date.now()),
            tracks,
            defaultName: title,
            defaultArtistName: artist,
            defaultThumbnail: form.thumbnail?.trim() || undefined,
            defaultDuration: duration,
        };

        const updated = { ...session, songs: [...(session.songs || []), newSong] };
        onUpdate(updated);
        setAddOpen(false);
    }

    // Derived values for the currently selected song (used in the details modal)
    const selectedPrimary = selected?.tracks?.[0]?.data;
    const selectedThumb = selected?.defaultThumbnail || selectedPrimary?.imageUrl || '/file.svg';
    const selectedTitle = selected?.defaultName || selectedPrimary?.name || 'Untitled';
    const selectedArtist = selected?.defaultArtistName || selectedPrimary?.artistNames?.[0] || 'Unknown';
    const selectedTracks = selected?.tracks || [];

    // SAMPLE_SONGS now imported from ../sampleSongs

    function quickAdd(index: number) {
        const sample = SAMPLE_SONGS[index];
        if (!sample) return;
        const primary = sample.tracks?.[0]?.data;
        const songToAdd: Song = {
            id: String(Date.now()) + '-' + index,
            tracks: sample.tracks.map((t) => ({ source: t.source, data: t.data, type: t.type })),
            defaultName: primary?.name,
            defaultArtistName: primary?.artistNames?.[0],
            defaultThumbnail: primary?.imageUrl || undefined,
            defaultDuration: primary?.duration ?? undefined,
        };
        const updated = { ...session, songs: [...(session.songs || []), songToAdd] };
        onUpdate(updated);
        // Close add modal when we quick-add
        setAddOpen(false);
    }

    return (
        <>
            <div className="card bg-base-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Playlist</h3>
                        <p className="text-sm text-muted">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
                    </div>
                    <div>
                        <button className="btn btn-sm btn-outline" onClick={openAdd}>
                            Add song +
                        </button>
                        {/* <button
                            className="btn btn-sm btn-outline ml-2"
                            onClick={() => {
                                // temporary: export session songs to a JSON file
                                const data = JSON.stringify(session.songs || [], null, 2);
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `wantosing-library-${session.id || Date.now()}.json`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                            }}
                            title="Save to my library"
                        >
                            Save to my library
                        </button> */}

                        {/* quick-adds removed from header; available inside Add Song modal in dev only */}
                    </div>
                </div>
                {songs.length === 0 ? (
                    <div className="text-sm text-muted">No songs added yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {songs.map((song, i) => {
                            const primary = song.tracks?.[0]?.data;
                            const thumb = song.defaultThumbnail || primary?.imageUrl || "/file.svg";
                            const title = song.defaultName || primary?.name || "Untitled";
                            const artist = song.defaultArtistName || primary?.artistNames?.[0] || "Unknown";
                            // derive duration in ms: prefer song.defaultDuration -> track data -> 0
                            const durationMs = song.defaultDuration ?? primary?.duration ?? 0;
                            const durationSec = Math.floor(durationMs / 1000);
                            return (
                                <li key={i} className="flex items-center gap-3 p-1 bg-base-100 rounded cursor-pointer" onClick={() => setSelected(song)}>
                                    <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
                                        {/* force 1:1 thumbnail */}
                                        <Image src={thumb} alt="thumb" fill style={{ objectFit: "cover" }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{title}</div>
                                        <div className="text-sm text-muted">{artist}</div>
                                    </div>
                                    <div className="text-sm text-muted">{Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}</div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Add Song Modal (sibling) */}
            {addOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setAddOpen(false)}>
                    <div className="card w-96 bg-base-100" onClick={(e) => e.stopPropagation()}>
                        <div className="card-body">
                            <h3 className="card-title">Add song</h3>
                            <input className="input input-bordered w-full mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="Duration (seconds)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="Thumbnail URL (optional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="Spotify URL (optional)" value={form.spotify} onChange={(e) => setForm({ ...form, spotify: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="YouTube Music URL (optional)" value={form.ytmusic} onChange={(e) => setForm({ ...form, ytmusic: e.target.value })} />
                            <input className="input input-bordered w-full mb-2" placeholder="Apple Music URL (optional)" value={form.apple} onChange={(e) => setForm({ ...form, apple: e.target.value })} />

                            {/* {process.env.NODE_ENV !== 'production' && ( */}
                            <div className="mt-4">
                                <details className="bg-base-200 p-2 rounded">
                                    <summary className="cursor-pointer">Quick adds (dev only)</summary>
                                    <div className="mt-2 space-y-2">
                                        {SAMPLE_SONGS.map((s, idx) => {
                                            const p = s.tracks?.[0]?.data;
                                            const thumb = p?.imageUrl || '/file.svg';
                                            const name = p?.name || 'Untitled';
                                            const artist = p?.artistNames?.[0] || '';
                                            return (
                                                <button
                                                    key={idx}
                                                    className="w-full btn btn-ghost justify-start gap-3 p-2"
                                                    onClick={() => quickAdd(idx)}
                                                    title={`Quick add: ${name}`}
                                                >
                                                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                                                        <Image src={thumb} alt={name} fill style={{ objectFit: 'cover' }} />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="font-semibold text-sm truncate">{name}</div>
                                                        <div className="text-xs text-muted truncate">{artist}</div>
                                                    </div>
                                                    <div className="text-xs text-muted">+ Add</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </details>
                            </div>
                            {/* )} */}

                            <div className="card-actions justify-end">
                                <button className="btn" onClick={() => setAddOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={addSongFromForm}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
                    <div className="card w-96 bg-base-100 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 btn btn-ghost btn-sm"
                            onClick={() => setSelected(null)}
                            aria-label="Close song details"
                            title="Close"
                        >
                            {/* X icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="card-body flex flex-col items-center">
                            <div className="w-36 h-36 relative rounded overflow-hidden">
                                <Image src={selectedThumb} alt="thumb" fill style={{ objectFit: 'cover' }} />
                            </div>
                            <h3 className="text-lg font-semibold mt-4 text-center">{selectedTitle}</h3>
                            <div className="text-sm text-muted mt-1 text-center">{selectedArtist}</div>

                            <div className="flex gap-3 mt-4">
                                {selectedTracks.map((t) => {
                                    const url = t.data?.url;
                                    if (!url) return null;
                                    if (t.source === 'spotify') {
                                        return (
                                            <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in Spotify" title="Open in Spotify">
                                                {/* Spotify */}
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168" className="h-5 w-5" aria-hidden="true">
                                                    <path fill="#1ED760" d="M84 0a84 84 0 1 0 0 168A84 84 0 0 0 84 0z" />
                                                    <path fill="#fff" d="M123.9 118.6c-1.9 2.8-5.6 3.6-8.3 1.7-22.6-15-51-18.4-84.3-10-3.2.8-6.6-1.1-7.4-4.3-.8-3.2 1.1-6.6 4.3-7.4 36.6-9 67.6-5.1 93.4 11.5 2.8 1.8 3.6 5.6 1.7 8.5zM128.5 88.6c-2.3 3.4-7 4.4-10.4 2.1-26-17-65.8-21.9-96.5-12-3.9 1.2-8.1-.9-9.3-4.8-1.2-3.9.9-8.1 4.8-9.3 34.8-11 78.2-5.7 109.4 13 3.4 2.2 4.4 7 2 10.9zM129.4 58.9c-31.8-17.8-81.1-19.4-108.6-10.6-4.6 1.6-9.5-.8-11.1-5.4-1.6-4.6.8-9.5 5.4-11.1 32.8-11.3 87.3-9.3 124.1 11 4 2.3 5.5 7.5 3.2 11.5-2.3 4-7.5 5.5-11.5 3.6z" />
                                                </svg>
                                            </a>
                                        );
                                    }
                                    if (t.source === 'youtube' || t.source === 'ytmusic') {
                                        return (
                                            <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in YouTube Music" title="Open in YouTube Music">
                                                {/* YouTube Music */}
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                                                    <path fill="#FF0000" d="M43.6 11.2c-.4-1.6-1.6-2.8-3.2-3.2C36.4 7 24 7 24 7s-12.4 0-16.4.9c-1.6.4-2.8 1.6-3.2 3.2C3 15.3 3 24 3 24s0 8.7 1.4 12.8c.4 1.6 1.6 2.8 3.2 3.2C11.6 41 24 41 24 41s12.4 0 16.4-.9c1.6-.4 2.8-1.6 3.2-3.2C45 32.7 45 24 45 24s0-8.7-1.4-12.8z" />
                                                    <path fill="#fff" d="M20 17l12 7-12 7z" />
                                                </svg>
                                            </a>
                                        );
                                    }
                                    if (t.source === 'appleMusic' || t.source === 'apple') {
                                        return (
                                            <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in Apple Music" title="Open in Apple Music">
                                                {/* Apple Music */}
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                                    <path fill="#000" d="M16.365 1.43c.06.11.12.22.18.33.2.39.36.82.45 1.28.14.7.08 1.47-.16 2.22-.28.86-.81 1.65-1.5 2.02-.24.13-.5.22-.77.27-.28.05-.56.07-.84.07-.26 0-.53-.02-.8-.07-.27-.06-.52-.15-.76-.27C11.36 6.4 10.9 5.61 10.62 4.75c-.25-.75-.32-1.52-.17-2.22.09-.46.25-.89.45-1.28.06-.11.12-.22.18-.33C11.39.2 11.69 0 12 0c.3 0 .6.2.77.43z" />
                                                    <path fill="#000" d="M19.6 12.1c-.17-.42-.3-.86-.3-1.32 0-2.3 1.3-4.3 3.2-5.4-.9-1.1-2.2-1.8-3.6-1.9-1.4-.1-2.9.4-4 1.4-.9.9-1.7 2.3-1.7 3.8 0 .4.03.8.12 1.2-3.1.4-5.8 1.9-7.6 4.2-1.9 2.4-2.9 5.6-2.5 8.9.2 1.8.8 3.6 1.6 5.1 1 .2 2.1.3 3.3.1 1.7-.3 3.5-.9 5-1.8 2.6-1.5 4.5-3.6 6-6.1 1.1-1.8 1.9-3.9 2.2-6.1-.4-.1-.9-.2-1.4-.2-.2 0-.4 0-.5.01z" />
                                                </svg>
                                            </a>
                                        );
                                    }
                                    // fallback icon for unknown sources
                                    return (
                                        <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square">
                                            🔗
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
