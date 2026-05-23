"use client";

import { useEffect, useState } from 'react';
import type { Profile } from '../../profile/types';
import type { SongMatchParticipant, SongMatchingSession } from '../types';
import { simulatedAccounts, sampleSpotify, sampleYoutube } from '../simulatedAccounts';
import Image from 'next/image';

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

function ConnectedIcon({ service }: { service?: string }) {
    if (!service) return null;
    if (service === 'spotify') return <SpotifyIcon size={16} />;
    if (service === 'appleMusic' || service === 'apple') return <AppleIcon size={16} />;
    if (service === 'youtube') return <YouTubeIcon size={16} />;
    return null;
}

function storageKeyFor(room?: string) {
    if (!room) return null;
    return `wantosing:song-matching:${room}`;
}

export default function ParticipantsList({ room }: { room?: string }) {
    const [list, setList] = useState<SongMatchParticipant[]>([]);

    // simple counter to generate unique dev user ids
    const [devCounter, setDevCounter] = useState(1);
    // controlled dev form state (dev-only)
    const [devType, setDevType] = useState<'spotify' | 'youtube' | 'guest'>('spotify');
    const [devName, setDevName] = useState('');

    // dev-only samples
    const sampleSpotifyParticipant: SongMatchParticipant = {
        profile: { ...sampleSpotify, librarySongs: undefined, libraryLastSyncedAt: undefined },
        librarySongKeys: sampleSpotify.librarySongs.map((song) => `songId:${song.id}`),
    };
    const sampleYoutubeParticipant: SongMatchParticipant = {
        profile: { ...sampleYoutube, librarySongs: undefined, libraryLastSyncedAt: undefined },
        librarySongKeys: sampleYoutube.librarySongs.map((song) => `songId:${song.id}`),
    };

    useEffect(() => {
        function read() {
            try {
                const key = storageKeyFor(room);
                if (!key) return setList([]);
                const raw = localStorage.getItem(key) || '[]';
                const parsed = JSON.parse(raw) as unknown;
                if (Array.isArray(parsed)) {
                    const legacy = parsed as Profile[];
                    setList(legacy.map((profile) => ({ profile, librarySongKeys: [] })));
                    return;
                }
                const obj = parsed as Partial<SongMatchingSession> | null;
                setList(Array.isArray(obj?.participants) ? obj.participants : []);
            } catch {
                setList([]);
            }
        }

        read();

        const onStorage = (e: StorageEvent) => {
            if (!e.key) return;
            const expected = storageKeyFor(room);
            if (e.key === expected) read();
        };

        const onCustom = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail as { room?: string } | undefined;
                if (!detail) return;
                if (detail.room === room) read();
            } catch {
                // ignore
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('wantosing:participants:changed', onCustom as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('wantosing:participants:changed', onCustom as EventListener);
        };
    }, [room]);

    function addDevUser(type: 'spotify' | 'youtube' | 'guest', guestName?: string) {
        if (!room) return;
        const key = storageKeyFor(room);
        if (!key) return;
        try {
            const raw = localStorage.getItem(key) || '[]';
            const parsed = JSON.parse(raw) as unknown;
            const arr: SongMatchParticipant[] = Array.isArray(parsed)
                ? (parsed as Profile[]).map((profile) => ({ profile, librarySongKeys: [] }))
                : Array.isArray((parsed as Partial<SongMatchingSession>)?.participants)
                    ? ((parsed as SongMatchingSession).participants || [])
                    : [];

            let sample: SongMatchParticipant;
            if (type === 'spotify') sample = sampleSpotifyParticipant;
            else if (type === 'youtube') sample = sampleYoutubeParticipant;
            else sample = { profile: { integrationUserId: '', name: guestName || `Guest ${devCounter}`, imageUrl: null, connectedService: undefined }, librarySongKeys: [] };

            const id = sample.profile.integrationUserId ? `${sample.profile.integrationUserId}-${Date.now()}-${devCounter}` : `dev-${Date.now()}-${devCounter}`;
            const participant: SongMatchParticipant = {
                profile: {
                    ...sample.profile,
                    integrationUserId: id,
                    name: sample.profile.name || guestName || `Dev User ${devCounter}`,
                },
                librarySongKeys: sample.librarySongKeys || [],
            };
            arr.push(participant);
            const sessionState: SongMatchingSession = { participants: arr };
            localStorage.setItem(key, JSON.stringify(sessionState));
            // notify listeners
            try { window.dispatchEvent(new CustomEvent('wantosing:participants:changed', { detail: { room } })); } catch { }
            setDevCounter(c => c + 1);
            setList(arr);
        } catch {
            // ignore
        }
    }

    function addSimulatedAccount(accountId: string) {
        if (!room) return;
        const key = storageKeyFor(room);
        if (!key) return;
        try {
            const account = simulatedAccounts.find((entry) => entry.integrationUserId === accountId);
            if (!account) return;

            const raw = localStorage.getItem(key) || '[]';
            const parsed = JSON.parse(raw) as unknown;
            const arr: SongMatchParticipant[] = Array.isArray(parsed)
                ? (parsed as Profile[]).map((profile) => ({ profile, librarySongKeys: [] }))
                : Array.isArray((parsed as Partial<SongMatchingSession>)?.participants)
                    ? ((parsed as SongMatchingSession).participants || [])
                    : [];

            const participant: SongMatchParticipant = {
                profile: {
                    ...account,
                    librarySongs: undefined,
                    libraryLastSyncedAt: undefined,
                },
                librarySongKeys: account.librarySongs.map((song) => `songId:${song.id}`),
            };

            arr.push(participant);
            const sessionState: SongMatchingSession = { participants: arr };
            localStorage.setItem(key, JSON.stringify(sessionState));
            try { window.dispatchEvent(new CustomEvent('wantosing:participants:changed', { detail: { room } })); } catch { }
            setList(arr);
        } catch {
            // ignore
        }
    }

    function removeUser(index: number) {
        if (!room) return;
        const key = storageKeyFor(room);
        if (!key) return;
        try {
            const raw = localStorage.getItem(key) || '[]';
            const parsed = JSON.parse(raw) as unknown;
            const arr: SongMatchParticipant[] = Array.isArray(parsed)
                ? (parsed as Profile[]).map((profile) => ({ profile, librarySongKeys: [] }))
                : Array.isArray((parsed as Partial<SongMatchingSession>)?.participants)
                    ? ((parsed as SongMatchingSession).participants || [])
                    : [];
            const p = arr[index];
            if (!p) return;
            if (!confirm(`Remove ${p.profile.name || 'this user'} from the room?`)) return;
            arr.splice(index, 1);
            localStorage.setItem(key, JSON.stringify({ participants: arr }));
            try { window.dispatchEvent(new CustomEvent('wantosing:participants:changed', { detail: { room } })); } catch { }
            setList(arr);
        } catch {
            // ignore
        }
    }

    return (
        <div className="space-y-3">

            {(!room) && <div className="text-sm text-muted">Room not ready</div>}
            {(list.length === 0) && (<>
                <div className="text-sm text-muted">No users yet</div>
            </>)}


            {list.map((p, i) => (
                <div key={i} className="flex items-center gap-3 justify-between">
                    {p.profile.imageUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <Image src={p.profile.imageUrl} alt={p.profile.name || 'User'} fill sizes="40px" style={{ objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center">{p.profile.name ? p.profile.name.charAt(0).toUpperCase() : 'U'}</div>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className="font-semibold">{p.profile.name || 'Guest'}</div>
                            <div className="opacity-80">{p.profile.connectedService ? <ConnectedIcon service={p.profile.connectedService} /> : null}</div>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-ghost btn-xs" onClick={() => removeUser(i)} aria-label={`Remove ${p.profile.name || 'user'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}

            {/* {process.env.NODE_ENV !== 'production' && ( */}
            <div className="pt-3 mt-3">
                <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                        <select
                            className="select select-bordered select-sm"
                            value={devType}
                            onChange={(e) => setDevType(e.target.value as 'spotify' | 'youtube' | 'guest')}
                        >
                            <option value="spotify">Spotify</option>
                            <option value="youtube">YouTube</option>
                            <option value="guest">Guest</option>
                        </select>

                        {devType === 'guest' && (
                            <input
                                className="input input-sm input-bordered"
                                placeholder="Guest name (optional)"
                                value={devName}
                                onChange={(e) => setDevName(e.target.value)}
                            />
                        )}

                        <button
                            className="btn btn-sm"
                            onClick={() => {
                                addDevUser(devType, devType === 'guest' ? (devName || undefined) : undefined);
                                // reset guest name after adding a guest
                                if (devType === 'guest') setDevName('');
                            }}
                        >
                            Add dev user
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-muted">Simulated accounts</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {simulatedAccounts.map((account) => (
                                <button
                                    key={account.integrationUserId}
                                    className="btn btn-outline justify-between h-auto py-3 px-4"
                                    onClick={() => addSimulatedAccount(account.integrationUserId || '')}
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
            {/* )} */}


        </div>
    );
}
