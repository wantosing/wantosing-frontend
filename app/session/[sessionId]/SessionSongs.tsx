"use client";

import Image from "next/image";
import type { Song, Session, TrackEntry } from "../types";
import SAMPLE_SONGS from "../sampleSongs";
import { useState } from "react";
import type { Profile } from '../../profile/types';
import SessionSongInfoModal from './SessionSongInfoModal';

type Props = {
    songs: Song[];
    session: Session;
    onUpdate: (updated: Session) => void;
    totalTime: string;
};

function normalizeSongKey(value?: string | null) {
    return (value || "").trim().toLowerCase();
}

function getSongMatchKeys(song: Song) {
    const keys = new Set<string>();
    const primary = song.tracks?.[0]?.data;

    if (song.id) keys.add(`songId:${normalizeSongKey(song.id)}`);
    if (song.isrc) keys.add(`isrc:${normalizeSongKey(song.isrc)}`);
    if (primary?.isrc) keys.add(`isrc:${normalizeSongKey(primary.isrc)}`);
    if (primary?.externalId) keys.add(`track:${normalizeSongKey(primary.externalId)}`);

    for (const track of song.tracks || []) {
        if (track.data?.externalId) keys.add(`track:${normalizeSongKey(track.data.externalId)}`);
        if (track.data?.isrc) keys.add(`isrc:${normalizeSongKey(track.data.isrc)}`);
    }

    const title = song.defaultName || primary?.name;
    const artist = song.defaultArtistName || primary?.artistNames?.[0];
    if (title && artist) {
        keys.add(`titleartist:${normalizeSongKey(title)}|${normalizeSongKey(artist)}`);
    }

    return Array.from(keys);
}

type MatchEntry = {
    person: Profile;
    song: Song;
};

function getSongMatchStats(song: Song, sessionPeople: Profile[]) {
    const songKeys = getSongMatchKeys(song);
    let matchCount = 0;
    const matchingPeople: Profile[] = [];
    const matchingEntries: MatchEntry[] = [];

    for (const person of sessionPeople) {
        const librarySongs = person.librarySongs || [];
        let personMatched = false;

        for (const librarySong of librarySongs) {
            const libraryKeys = getSongMatchKeys(librarySong);
            const normalizedLibrary = new Set(libraryKeys.map(normalizeSongKey));
            if (songKeys.some((key) => normalizedLibrary.has(normalizeSongKey(key)))) {
                matchingEntries.push({ person, song: librarySong });
                personMatched = true;
            }
        }

        if (personMatched) {
            matchCount += 1;
            matchingPeople.push(person);
        }
    }

    const totalPeople = sessionPeople.length;
    const matchPercentage = totalPeople > 0 ? Math.round((matchCount / totalPeople) * 100) : 0;

    const uniqueMatchingEntries = matchingEntries.filter((entry, index, arr) => {
        const identity = `${entry.person.integrationUserId || entry.person.name || 'person'}:${entry.song.id}`;
        return arr.findIndex((candidate) => `${candidate.person.integrationUserId || candidate.person.name || 'person'}:${candidate.song.id}` === identity) === index;
    });

    return { matchCount, matchPercentage, totalPeople, matchingPeople, matchingEntries: uniqueMatchingEntries };
}

export default function SessionSongs({ songs, session, onUpdate, totalTime }: Props) {
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
    const selectedMatchStats = selected ? getSongMatchStats(selected, session.people ?? []) : null;

    // Prepare songs with match stats and sort by matchPercentage (high -> low)
    const songsWithStats = songs.map((s) => ({ song: s, stats: getSongMatchStats(s, session.people ?? []) }));
    const sortedSongsWithStats = songsWithStats.sort((a, b) => b.stats.matchPercentage - a.stats.matchPercentage);

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
                        <p className="text-sm text-muted">
                            {songs.length} {songs.length === 1 ? 'song' : 'songs'} · Total: {totalTime}
                        </p>
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
                        {sortedSongsWithStats.map((entry, i) => {
                            const song = entry.song;
                            const primary = song.tracks?.[0]?.data;
                            const thumb = song.defaultThumbnail || primary?.imageUrl || "/file.svg";
                            const title = song.defaultName || primary?.name || "Untitled";
                            const artist = song.defaultArtistName || primary?.artistNames?.[0] || "Unknown";
                            // derive duration in ms: prefer song.defaultDuration -> track data -> 0
                            const durationMs = song.defaultDuration ?? primary?.duration ?? 0;
                            const durationSec = Math.floor(durationMs / 1000);
                            const { matchPercentage } = entry.stats;
                            return (
                                <li key={song.id || i} className="flex items-center gap-3 p-1 bg-base-100 rounded cursor-pointer" onClick={() => setSelected(song)}>
                                    <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
                                        {/* force 1:1 thumbnail */}
                                        <Image src={thumb} alt="thumb" fill style={{ objectFit: "cover" }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{title}</div>
                                        <div className="text-sm text-muted">{artist}</div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-sm text-muted">
                                        <span>{Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}</span>
                                        <span className="badge badge-outline badge-sm">
                                            {matchPercentage}%
                                        </span>
                                    </div>
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

            {selected && selectedMatchStats && (
                <SessionSongInfoModal
                    song={selected}
                    session={session}
                    selectedThumb={selectedThumb}
                    selectedTitle={selectedTitle}
                    selectedArtist={selectedArtist}
                    selectedTracks={selectedTracks}
                    matchCount={selectedMatchStats.matchCount}
                    matchPercentage={selectedMatchStats.matchPercentage}
                    totalPeople={selectedMatchStats.totalPeople}
                    matchingEntries={selectedMatchStats.matchingEntries}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}
