"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Profile } from './types';
import { getProfile } from './types';

function formatDate(value?: string | null) {
    if (!value) return 'Not synced yet';
    try {
        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(value));
    } catch {
        return value;
    }
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        setProfile(getProfile());
        const onChange = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail as Profile | null;
                if (detail === null) return setProfile(null);
                if (detail) return setProfile(detail);
            } catch {
                setProfile(getProfile());
            }
        };
        window.addEventListener('wantosing:profile:changed', onChange as EventListener);
        return () => window.removeEventListener('wantosing:profile:changed', onChange as EventListener);
    }, []);

    const librarySongs = useMemo(() => profile?.librarySongs || [], [profile]);

    return (
        <main className="min-h-screen bg-base-100 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted mb-2">Profile library</p>
                        <h1 className="text-3xl font-bold">{profile?.name || 'Guest'}</h1>
                        <p className="text-sm text-muted mt-2">Latest sync: {formatDate(profile?.libraryLastSyncedAt)}</p>
                    </div>

                    <button className="btn btn-primary" disabled title="Sync is coming soon">
                        Sync songs
                    </button>
                </div>

                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-base-300 relative">
                                {profile?.imageUrl ? (
                                    <Image src={profile.imageUrl} alt={profile.name || 'Profile'} fill sizes="64px" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{profile?.name?.charAt(0).toUpperCase() || 'U'}</div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold">{profile?.email || profile?.integrationUserId || 'No profile details available'}</div>
                                <div className="text-sm text-muted">Songs in library: {librarySongs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <h2 className="text-xl font-semibold">Library songs</h2>
                            <Link href="/session" className="btn btn-ghost btn-sm">
                                Back to sessions
                            </Link>
                        </div>

                        {librarySongs.length === 0 ? (
                            <div className="text-sm text-muted">No songs saved in this library yet.</div>
                        ) : (
                            <ul className="space-y-2">
                                {librarySongs.map((song, index) => {
                                    const primary = song.tracks?.[0]?.data;
                                    const thumb = song.defaultThumbnail || primary?.imageUrl || '/file.svg';
                                    const title = song.defaultName || primary?.name || 'Untitled';
                                    const artist = song.defaultArtistName || primary?.artistNames?.[0] || 'Unknown';
                                    const durationMs = song.defaultDuration ?? primary?.duration ?? 0;
                                    const durationSec = Math.floor(durationMs / 1000);

                                    return (
                                        <li key={`${song.id}-${index}`} className="flex items-center gap-3 rounded bg-base-100 p-2">
                                            <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                                                <Image src={thumb} alt={title} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{title}</div>
                                                <div className="text-sm text-muted truncate">{artist}</div>
                                            </div>
                                            <div className="text-sm text-muted whitespace-nowrap">
                                                {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, '0')}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}