"use client";

import { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useSearchParams, useRouter } from 'next/navigation';
import ParticipantsList from './ParticipantsList';
import { devLogin, createSession } from '@/lib/api-client';
import { Profile } from '@/app/profile/types';
import type { Song, SongMatchingSession } from '../types';
import { simulatedAccounts } from '../simulatedAccounts';

function cloneSong(song: Song): Song {
    return {
        ...song,
        tracks: song.tracks.map((track) => ({
            source: track.source,
            type: track.type,
            data: { ...track.data },
        })),
    };
}

function getLibrarySongs(profile: Profile) {
    if (profile.librarySongs?.length) return profile.librarySongs.map(cloneSong);
    const matchedAccount = simulatedAccounts.find((account) => account.integrationUserId === profile.integrationUserId);
    return matchedAccount?.librarySongs.map(cloneSong) || [];
}

function getSongIdentity(song: Song) {
    const primary = song.tracks?.[0]?.data;
    return [song.id, song.isrc || primary?.isrc || '', song.defaultName || primary?.name || '', song.defaultArtistName || primary?.artistNames?.[0] || '']
        .join('|')
        .toLowerCase();
}

function buildMatchingSongs(people: Profile[]) {
    const seen = new Map<string, Song>();

    for (const person of people) {
        for (const song of getLibrarySongs(person)) {
            const key = getSongIdentity(song);
            if (!seen.has(key)) seen.set(key, song);
        }
    }

    return Array.from(seen.values());
}

function makeRandomCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export default function NewSessionClient() {
    const search = useSearchParams();
    const existing = search?.get('room') || undefined;

    const [room, setRoom] = useState<string | undefined>(existing);
    const router = useRouter();
    const [inviteUrl, setInviteUrl] = useState('');

    function makeId() {
        return Math.random().toString(36).slice(2, 9);
    }

    async function createSessionWithPeople() {
        // If no room, fall back to the existing create flow
        if (!room) {
            router.push('/session/create');
            return;
        }

        try {
            const participantsKey = `wantosing:song-matching:${room}`;
            const raw = localStorage.getItem(participantsKey) || '[]';
            const parsed = JSON.parse(raw) as unknown;
            const matchingSession: SongMatchingSession = Array.isArray(parsed)
                ? { participants: (parsed as Profile[]).map((profile) => ({ profile, librarySongKeys: [] })) }
                : (parsed as SongMatchingSession);

            const participants = matchingSession.participants || [];
            const people = participants.map((p) => {
                const profile = p?.profile;
                const librarySongs = getLibrarySongs(profile);
                return {
                    name: profile?.name,
                    integrationUserId: profile?.integrationUserId,
                    connectedService: profile?.connectedService,
                    imageUrl: profile?.imageUrl || null,
                    country: profile?.country || null,
                    email: profile?.email || null,
                    librarySongs,
                    libraryLastSyncedAt: profile?.libraryLastSyncedAt || null,
                };
            });
            const songs = buildMatchingSongs(people as Profile[]);

            // Try to create a server-backed session (requires auth via dev-login)
            try {
                // ensure a dev login exists (test account)
                const storedCsrf = localStorage.getItem('ws_csrf') || null;
                let csrf = storedCsrf;
                if (!csrf) {
                    const login = await devLogin('test@example.com', 'Test User');
                    csrf = login.csrfToken;
                    if (csrf) localStorage.setItem('ws_csrf', csrf);
                }

                const created = await createSession(`Session ${makeId()}`, 'invite_only', csrf ?? undefined);
                const id = created.id;

                const SESSIONS_KEY = 'wantosing:sessions';
                const rawSessions = localStorage.getItem(SESSIONS_KEY) || '[]';
                const arr = JSON.parse(rawSessions);
                arr.unshift({ id, name: created.name, createdAt: created.createdAt, people, songs, songMatching: matchingSession });
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(arr));

                router.push(`/session/${id}`);
                return;
            } catch (err) {
                console.warn('Server session creation failed, falling back to local-only session', err);
            }
        } catch (e) {
            // if anything goes wrong, fallback to the create page which will create an empty session
            console.error('Failed to create session with participants', e);
            router.push('/session/create');
        }
    }

    // ensure a room id exists on mount
    useEffect(() => {
        if (!room) {
            const r = makeRandomCode();
            setRoom(r);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const code = useMemo(() => (room ? room : '------'), [room]);

    // compute inviteUrl and push it into history on client when room is available
    useEffect(() => {
        if (!room) {
            setInviteUrl('');
            return;
        }
        if (typeof window === 'undefined') return;
        const u = new URL(window.location.href);
        u.searchParams.set('room', room);
        const s = u.toString();
        setInviteUrl(s);
        window.history.replaceState({}, '', s);
    }, [room]);

    function copyInvite() {
        if (!inviteUrl) return;
        try {
            navigator.clipboard.writeText(inviteUrl);
            alert('Invite URL copied to clipboard');
        } catch {
            // fallback
            prompt('Copy this link', inviteUrl);
        }
    }

    return (
        <main className="min-h-screen bg-base-100 p-8">
            <div className=" mx-auto">
                <h1 className="text-3xl font-bold mb-6">Start a Karaoke Party</h1>

                <div className="card p-6">
                    <p className="mb-4">Invite friends to this temporary room — share the 6-digit code or scan the QR code.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center lg:gap-12">
                        {/* Left: code + QR (span 2) */}
                        <div className='min-h-full p-3'>
                            <h2 className="font-semibold mb-3">Invite</h2>
                            <div className="p-4 rounded border border-base-200 flex flex-col gap-6">

                                <div className="flex items-center justify-center">
                                    <div className="text-6xl font-mono tracking-widest text-center">{code}</div>
                                </div>

                                <div className="flex items-center justify-center">
                                    {room ? (
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <QRCodeCanvas value={inviteUrl} size={220} />
                                        </div>
                                    ) : (
                                        <div className="w-56 h-56 bg-base-200" />
                                    )}
                                </div>

                                <div className="flex items-center justify-center">
                                    <button className="btn btn-ghost btn-sm mt-2" onClick={copyInvite} disabled={!inviteUrl}>Copy invite</button>
                                </div>

                            </div>
                        </div>

                        {/* Right: Joined users */}
                        <div className='min-h-full p-3'>
                            <h2 className="font-semibold mb-3">Joined users</h2>
                            <div className="p-4 rounded border border-base-200">
                                {/* participants list will be rendered here */}
                                <ParticipantsList room={room} />
                            </div>
                        </div>


                    </div>
                    <div className='py-3'>
                        <button className="btn  btn-secondary btn-lg w-full rounded-md" onClick={createSessionWithPeople}>Match the songs</button>
                    </div>
                </div>
            </div>
        </main>
    );
}
