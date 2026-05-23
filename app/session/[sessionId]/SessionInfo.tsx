"use client";

import React from "react";
import Image from 'next/image';
import type { Song } from "../types";
import type { Profile } from '../../profile/types';
import { simulatedAccounts } from '../simulatedAccounts';

// Removed unused social icon helpers after menu refactor

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
    onBack,
    onDeleteRequest,
}: Props) {
    const STORAGE_KEY = "wantosing:sessions";
    const [showAddPersonMenu, setShowAddPersonMenu] = React.useState(false);

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
        setShowAddPersonMenu(true);
    }

    function addGuestPerson() {
        const name = window.prompt("Add person name:", "Guest")?.trim();
        if (!name) return;
        const updated: SessionLocal = { ...session, people: [...(people || []), { name }] };
        persistSession(updated);
        setShowAddPersonMenu(false);
    }

    function addSimulatedPerson(accountId: string) {
        const account = simulatedAccounts.find((entry) => entry.integrationUserId === accountId);
        if (!account) return;

        const updatedPerson: Profile = {
            ...account,
            librarySongs: account.librarySongs.map((song) => ({
                ...song,
                tracks: song.tracks.map((track) => ({
                    source: track.source,
                    type: track.type,
                    data: { ...track.data },
                })),
            })),
        };

        const currentPeople = people || [];
        const nextPeople = currentPeople.some((person) => person.integrationUserId === updatedPerson.integrationUserId)
            ? currentPeople
            : [...currentPeople, updatedPerson];

        persistSession({ ...session, people: nextPeople });
        setShowAddPersonMenu(false);
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
        <>
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
                                    <React.Fragment key={p.integrationUserId || p.name || i}>
                                        {p.imageUrl ? (
                                            <div className="avatar">
                                                <div className="w-12">
                                                    <Image src={p.imageUrl} alt={p.name || 'User'} width={40} height={40} className="rounded-full object-cover" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="avatar avatar-placeholder">
                                                <div className="bg-primary text-white w-12 ">
                                                    <span>{p.name?.charAt(0).toUpperCase() || 'G'}</span>
                                                </div>
                                            </div>

                                        )}


                                    </React.Fragment>



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

                    {/* datetime */}
                    <div className="mt-3">
                        <p className="text-sm text-secondary">{formattedCreated}</p>
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

        {showAddPersonMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddPersonMenu(false)}>
                <div className="card w-full max-w-2xl bg-base-100" onClick={(e) => e.stopPropagation()}>
                    <div className="card-body">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="card-title">Add person</h3>
                                <p className="text-sm text-muted">Pick a simulated account or add a guest.</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddPersonMenu(false)}>
                                Close
                            </button>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <button className="btn btn-outline justify-between h-auto py-3 px-4" onClick={addGuestPerson}>
                                <div className="text-left">
                                    <div className="font-semibold">Add guest</div>
                                    <div className="text-xs text-muted">Create a custom person</div>
                                </div>
                                <span className="btn btn-xs btn-secondary">Add</span>
                            </button>

                            {simulatedAccounts.map((account) => (
                                <button
                                    key={account.integrationUserId}
                                    className="btn btn-outline justify-between h-auto py-3 px-4"
                                    onClick={() => addSimulatedPerson(account.integrationUserId || '')}
                                    title={`Add ${account.name || account.integrationUserId}`}
                                >
                                    <div className="text-left min-w-0">
                                        <div className="font-semibold truncate">{account.name || account.integrationUserId}</div>
                                        <div className="text-xs text-muted truncate">
                                            {account.connectedService || 'Unknown'} · {account.librarySongs.length} songs
                                        </div>
                                    </div>
                                    <span className="btn btn-xs btn-secondary">Add</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
