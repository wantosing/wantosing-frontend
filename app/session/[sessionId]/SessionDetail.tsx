"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import SessionInfo from "./SessionInfo";
import SessionSongs from "./SessionSongs";
import type { Session } from "../types";
import { STORAGE_KEY } from "../types";
import Image from 'next/image';

function formatGMT7(iso?: string) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(d);
    } catch {
        return new Date(iso).toLocaleString();
    }
}

function formatDuration(totalSeconds: number) {
    if (!totalSeconds) return "0:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const mmss = `${minutes}:${String(seconds).padStart(2, '0')}`;
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : mmss;
}


function SpotifyIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <circle cx="84" cy="84" r="84" fill="#1ED760" />
            <path d="M122.1 118.2c-1.6 2.6-4.9 3.5-7.6 1.9-20.8-12.9-47-15.9-77.6-8.9-3 0.7-6-1.1-6.6-4.1s1.1-6 4.1-6.6c33.8-7.9 63.7-4.2 87.8 10.1 2.6 1.6 3.5 4.9 1.9 7.6z" fill="#fff" />
        </svg>
    );
}

function AppleIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <rect width="24" height="24" rx="4" fill="#FA2" />
            <path d="M12 7c.8-1 1.8-2 3-2s2 1 2 2c0 1-1 2-2 2s-2-.5-3-2zM8 13c0-2 1-4 3-4s3 2 3 4-1 4-3 4-3-2-3-4z" fill="#fff" />
        </svg>
    );
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <rect width="24" height="24" rx="4" fill="#FF0000" />
            <path d="M9 8l6 4-6 4V8z" fill="#fff" />
        </svg>
    );
}

function ConnectedIcon({ service, size = 16 }: { service?: string; size?: number }) {
    if (!service) return null;
    if (service === 'spotify') return <SpotifyIcon size={size} />;
    if (service === 'appleMusic' || service === 'apple') return <AppleIcon size={size} />;
    if (service === 'youtube') return <YouTubeIcon size={size} />;
    return null;
}

export default function SessionDetail({ id }: { id: string }) {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [editing, setEditing] = useState(false);
    const [nameValue, setNameValue] = useState("");
    const [showPeople, setShowPeople] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const arr: Session[] = JSON.parse(raw);
                const found = arr.find((s) => s.id === id) || null;
                setSession(found);
                if (found) setNameValue(found.name);
            }
        } catch (e) {
            console.error(e);
        }
    }, [id]);

    function persistSession(updated: Session) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const arr: Session[] = JSON.parse(raw);
            const idx = arr.findIndex((s) => s.id === updated.id);
            if (idx >= 0) arr[idx] = updated;
            else arr.unshift(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            setSession(updated);
        } catch (e) {
            console.error(e);
        }
    }

    function onUpdate(updated: Session) {
        persistSession(updated);
    }

    // saveName and addPerson moved to SessionInfo component; updates are handled via onUpdate

    // addSong moved to SessionSongs component; updates are handled via onUpdate

    function removeSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const arr: Session[] = JSON.parse(raw);
            const filtered = arr.filter((s) => s.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            // redirect to history after deletion
            try { router.push('/session/history'); } catch {
                // fallback to history.back
                try { window.history.back(); } catch { }
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (!session) return <div className="text-center">Session not found.</div>;

    const people = session.people ?? [];
    const songs = session.songs ?? [];
    // total duration: sum durations in milliseconds from each song (prefer primary track duration or defaultDuration)
    const totalMs = songs.reduce((acc, s) => {
        const primaryMs = s.tracks?.[0]?.data?.duration ?? s.defaultDuration ?? 0;
        return acc + (primaryMs || 0);
    }, 0);
    const totalSeconds = Math.floor(totalMs / 1000);

    return (
        <div className="space-y-6">
            <SessionInfo
                session={{ id: session.id, name: session.name }}
                editing={editing}
                nameValue={nameValue}
                setNameValue={setNameValue}
                setEditing={setEditing}
                onUpdate={onUpdate}
                people={people}
                setShowPeople={setShowPeople}
                formattedCreated={formatGMT7(session.createdAt)}
                totalTime={formatDuration(totalSeconds)}
                onBack={() => window.history.back()}
                onDeleteRequest={() => setShowDeleteConfirm(true)}
            />

            {/* People modal */}
            {showPeople && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="card w-96 bg-base-100">
                        <div className="card-body">
                            <h3 className="card-title">Party members</h3>
                            <ul className="mt-2 space-y-2">
                                {people.length === 0 ? (
                                    <li className="text-sm text-muted">No people added.</li>
                                ) : (
                                    people.map((p, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                {p.imageUrl ? (
                                                    <div key={i} className="avatar avatar-placeholder relative">
                                                        <Image src={p.imageUrl} alt={p.name || 'User'} width={32} height={32} className="object-cover rounded-full" />
                                                    </div>
                                                ) : (
                                                    <div key={i} className="avatar avatar-placeholder relative">
                                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">{p.name?.charAt(0).toUpperCase() || 'G'}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="font-medium">{p.name}</div>
                                                {p.connectedService ? (
                                                    <span className="opacity-80">
                                                        <ConnectedIcon service={p.connectedService} size={16} />
                                                    </span>
                                                ) : null}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                            <div className="card-actions justify-end mt-4">
                                <button className="btn" onClick={() => setShowPeople(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="card w-96 bg-base-100">
                        <div className="card-body">
                            <h3 className="card-title">Confirm delete</h3>
                            <p className="text-sm text-muted">Are you sure you want to delete this session? This action cannot be undone.</p>
                            <div className="card-actions justify-end mt-4">
                                <button className="btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                <button className="btn btn-error" onClick={() => { setShowDeleteConfirm(false); removeSession(); }}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SessionSongs songs={songs} session={session} onUpdate={onUpdate} />
        </div>
    );
}
