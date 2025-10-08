"use client";

import React from "react";
import Image from 'next/image';
import type { Song } from "../types";
import type { Profile } from '../../profile/types';

function SpotifyIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <circle cx="84" cy="84" r="84" fill="#1ED760" />
            <path d="M122.1 118.2c-1.6 2.6-4.9 3.5-7.6 1.9-20.8-12.9-47-15.9-77.6-8.9-3 0.7-6-1.1-6.6-4.1s1.1-6 4.1-6.6c33.8-7.9 63.7-4.2 87.8 10.1 2.6 1.6 3.5 4.9 1.9 7.6z" fill="#fff" />
        </svg>
    );
}

function AppleIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <rect width="24" height="24" rx="4" fill="#FA2" />
            <path d="M12 7c.8-1 1.8-2 3-2s2 1 2 2c0 1-1 2-2 2s-2-.5-3-2zM8 13c0-2 1-4 3-4s3 2 3 4-1 4-3 4-3-2-3-4z" fill="#fff" />
        </svg>
    );
}

function YouTubeIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <rect width="24" height="24" rx="4" fill="#FF0000" />
            <path d="M9 8l6 4-6 4V8z" fill="#fff" />
        </svg>
    );
}

function ConnectedIcon({ service, size = 14 }: { service?: string; size?: number }) {
    if (!service) return null;
    if (service === 'spotify') return <SpotifyIcon size={size} />;
    if (service === 'appleMusic' || service === 'apple') return <AppleIcon size={size} />;
    if (service === 'youtube') return <YouTubeIcon size={size} />;
    return null;
}

type Props = {
    session: { id: string; name: string };
    editing: boolean;
    nameValue: string;
    setNameValue: (v: string) => void;
    setEditing: (b: boolean) => void;
    onUpdate: (updated: { id: string; name: string; createdAt?: string; people?: Profile[]; songs?: Song[] }) => void;
    people: Profile[];
    setShowPeople: (b: boolean) => void;
    formattedCreated: string;
    totalTime: string;
    onBack: () => void;
    onDeleteRequest: () => void;
};

export default function SessionInfo({
    session,
    editing,
    nameValue,
    setNameValue,
    setEditing,
    onUpdate,
    people,
    setShowPeople,
    formattedCreated,
    totalTime,
    onBack,
    onDeleteRequest,
}: Props) {
    const STORAGE_KEY = "wantosing:sessions";

    type SessionLocal = { id: string; name: string; createdAt?: string; people?: Profile[]; songs?: Song[] };

    function persistSession(updated: SessionLocal) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const arr = JSON.parse(raw);
            const idx = arr.findIndex((s: SessionLocal) => s.id === updated.id);
            // If an existing session exists, merge it with the updated fields so we don't
            // accidentally drop songs or other fields that the caller didn't include.
            let merged: SessionLocal = updated;
            if (idx >= 0) {
                const existing: SessionLocal = arr[idx];
                merged = { ...existing, ...updated };
                arr[idx] = merged;
            } else {
                arr.unshift(merged);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            onUpdate(merged);
        } catch (e) {
            console.error(e);
        }
    }

    function saveName() {
        const updated = { ...session, name: nameValue };
        persistSession(updated);
        setEditing(false);
    }

    function addPerson() {
        const name = window.prompt("Add person name:", "Guest")?.trim();
        if (!name) return;
        const updated: SessionLocal = { ...session, people: [...(people || []), { name }] };
        persistSession(updated);
    }

    function exportSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const arr = JSON.parse(raw);
            const idx = arr.findIndex((s: SessionLocal) => s.id === session.id);
            const toExport: SessionLocal = idx >= 0 ? arr[idx] : { ...session, people, songs: [] } as SessionLocal;
            const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `wantosing-session-${toExport.id}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Failed to export session");
        }
    }


    return (
        <div className="card bg-base-200 p-6">
            <div>
                <div className="flex-1">
                    {!editing ? (
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold mb-0">{session.name}</h2>
                            <button
                                className="btn btn-outline btn-sm ml-2"
                                onClick={() => setEditing(true)}
                                aria-label="Edit session name"
                                title="Edit session name"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z" />
                                    <path d="M2 15.5V18h2.5l7.873-7.873-2.5-2.5L2 15.5z" />
                                </svg>
                                <span className="sr-only">Edit session name</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input className="input input-bordered w-full" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
                            <button className="btn btn-primary btn-sm" onClick={saveName}>
                                Save
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    )}

                    <p className="text-xs text-muted mt-1">
                        ID: <span className="font-mono">{session.id}</span>
                    </p>

                    {/* avatar group below the title */}
                    <div className="mt-4 flex items-center gap-3">
                        <button onClick={() => setShowPeople(true)}>
                            <div className="avatar-group -space-x-3">

                                {people.slice(0, 3).map((p, i) => (
                                    <>
                                        {p.imageUrl ? (
                                            <div key={i} className="avatar">
                                                <div className="w-12">
                                                    <Image src={p.imageUrl} alt={p.name || 'User'} width={40} height={40} className="rounded-full object-cover" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={i} className="avatar avatar-placeholder">
                                                <div className="bg-primary text-white w-12 ">
                                                    <span>{p.name?.charAt(0).toUpperCase() || 'G'}</span>
                                                </div>
                                            </div>

                                        )}


                                    </>



                                ))}

                                {people.length > 3 && (
                                    <div className="avatar avatar-placeholder bg-base-300 ">
                                        <div className="w-12">
                                            <div className="rounded-full  text-base-content ">+{people.length - 3}</div>
                                        </div>
                                    </div>

                                )}
                            </div>
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={addPerson} title="Add person">
                            + Person
                        </button>
                    </div>

                    {/* datetime and total playlist time */}
                    <div className="mt-3">
                        <p className="text-sm text-secondary">{formattedCreated}</p>
                        <p className="text-sm text-muted mt-1">Total: {totalTime}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button className="btn btn-ghost" onClick={onBack}>
                            Back
                        </button>
                        <button className="btn btn-outline" onClick={exportSession} title="Export session to file">
                            Export
                        </button>
                        {/* <button className="btn btn-outline" onClick={importSession} title="Import session from file">
                            Import
                        </button> */}
                        <button className="btn btn-error" onClick={onDeleteRequest}>
                            Delete session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
