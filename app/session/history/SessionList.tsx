"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session as FullSession, Song, TrackEntry, TrackData } from "../types";
import type { Profile } from '../../profile/types';

type SessionItem = { id: string; name: string; createdAt: string };

const STORAGE_KEY = "wantosing:sessions";

export default function SessionList() {
    const [sessions, setSessions] = useState<SessionItem[]>(() => {
        // During SSR `window` and `localStorage` are not available.
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw) as unknown;
            if (!Array.isArray(arr)) return [];
            return arr.map((s) => {
                const si = s as Record<string, unknown>;
                return { id: String(si.id), name: String(si.name), createdAt: String(si.createdAt || new Date().toISOString()) };
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const arr = JSON.parse(raw) as unknown;
            if (!Array.isArray(arr)) return;
            setSessions(arr.map((s) => {
                const si = s as Record<string, unknown>;
                return { id: String(si.id), name: String(si.name), createdAt: String(si.createdAt || new Date().toISOString()) };
            }));
        } catch (e) {
            console.error(e);
        }
    }, []);

    function addSample() {
        const id = Math.random().toString(36).slice(2, 9);
        const newFull: FullSession = { id, name: `Session ${id}`, createdAt: new Date().toISOString(), people: [], songs: [] };
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const parsed = JSON.parse(raw) as unknown;
            const arr = Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : [];
            arr.unshift(newFull as unknown as Record<string, unknown>);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            setSessions((st) => [{ id, name: newFull.name, createdAt: newFull.createdAt || new Date().toISOString() }, ...st]);
        } catch (e) {
            console.error(e);
        }
    }

    function clearAll() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        } catch (e) {
            console.error(e);
        }
        setSessions([]);
    }

    // validators for imported payload
    function isPersonArray(v: unknown): v is Profile[] {
        if (!Array.isArray(v)) return false;
        return v.every((p) => {
            if (!p || typeof p !== 'object') return false;
            const pr = p as Record<string, unknown>;
            // Profile has optional name, but for session import we require a name string
            return typeof pr.name === 'string';
        });
    }

    function isTrackData(v: unknown): v is TrackData {
        if (!v || typeof v !== 'object') return false;
        const d = v as Record<string, unknown>;
        return typeof d.externalId === 'string' && typeof d.name === 'string' && Array.isArray(d.artistNames) && (d.artistNames as unknown[]).every((a: unknown) => typeof a === 'string');
    }

    function isTrackEntry(v: unknown): v is TrackEntry {
        if (!v || typeof v !== 'object') return false;
        const t = v as Record<string, unknown>;
        return typeof t.source === 'string' && (typeof t.type === 'undefined' || typeof t.type === 'string') && isTrackData(t.data);
    }

    function isSongArray(v: unknown): v is Song[] {
        if (!Array.isArray(v)) return false;
        return v.every((s) => {
            if (!s || typeof s !== 'object') return false;
            const so = s as Record<string, unknown>;
            if (typeof so.id !== 'string') return false;
            if (!Array.isArray(so.tracks)) return false;
            return (so.tracks as unknown[]).every((t: unknown) => isTrackEntry(t));
        });
    }

    function importSession() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const parsed = JSON.parse(text) as unknown;
                if (!parsed || typeof parsed !== 'object') {
                    alert('Invalid session file: expected an object');
                    return;
                }

                const obj = parsed as Record<string, unknown>;
                if (typeof obj.name !== 'string') {
                    alert('Invalid session file: missing required field `name`');
                    return;
                }

                // validate people and songs if present
                let people: Profile[] | undefined;
                let songs: Song[] | undefined;
                if ('people' in obj) {
                    if (!isPersonArray(obj.people)) {
                        alert('Invalid session file: `people` must be an array of { name: string }');
                        return;
                    }
                    people = obj.people as Profile[];
                }
                if ('songs' in obj) {
                    if (!isSongArray(obj.songs)) {
                        alert('Invalid session file: `songs` structure is invalid');
                        return;
                    }
                    songs = obj.songs as Song[];
                }

                // Always create a new id for the imported session to avoid collisions
                const newId = Math.random().toString(36).slice(2, 9);
                const newFull: FullSession = {
                    id: newId,
                    name: String(obj.name),
                    createdAt: obj.createdAt ? String(obj.createdAt) : new Date().toISOString(),
                    people,
                    songs,
                };

                // Load existing stored sessions (full objects)
                const raw = localStorage.getItem(STORAGE_KEY) || '[]';
                const arrUnknown = JSON.parse(raw) as unknown;
                const arr = Array.isArray(arrUnknown) ? (arrUnknown as Array<Record<string, unknown>>) : [];
                arr.unshift(newFull as unknown as Record<string, unknown>);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

                // Update the minimal sessions list shown in history
                const minimalList: SessionItem[] = arr.map((s) => {
                    const si = s as Record<string, unknown>;
                    return { id: String(si.id), name: String(si.name), createdAt: String(si.createdAt || new Date().toISOString()) };
                });
                setSessions(minimalList);
            } catch (e) {
                console.error(e);
                alert('Failed to import session: invalid file or JSON');
            }
        };
        input.click();
    }

    return (
        <div>
            <div className="flex gap-2 justify-center mb-4">
                <button className="btn btn-sm" onClick={addSample}>
                    Add sample session
                </button>
                <button className="btn btn-sm btn-outline" onClick={importSession}>
                    Import session
                </button>
                <button className="btn btn-sm btn-ghost" onClick={clearAll}>
                    Clear
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center text-muted">No previous sessions found.</div>
            ) : (
                <ul className="space-y-2">
                    {sessions.map((s) => (
                        <li key={s.id} className="w-full">
                            <Link href={`/session/${s.id}`} className="card block w-full bg-base-200 hover:shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title">{s.name}</h3>
                                    <p className="text-sm">Created: {new Date(s.createdAt).toLocaleString()}</p>
                                    <p className="text-xs text-muted">ID: <span className="font-mono">{s.id}</span></p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
