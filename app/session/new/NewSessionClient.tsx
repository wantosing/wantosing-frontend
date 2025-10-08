"use client";

import { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useSearchParams, useRouter } from 'next/navigation';
import ParticipantsList from './ParticipantsList';
import { Profile } from '@/app/profile/types';

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
            const participantsKey = `wantosing:participants:${room}`;
            const raw = localStorage.getItem(participantsKey) || '[]';
            const participants = JSON.parse(raw) as Array<Profile>;

            const people = (participants || []).map(p => ({
                name: p?.name,
                integrationUserId: p?.integrationUserId,
                connectedService: p?.connectedService,
                imageUrl: p?.imageUrl || null,
                country: p?.country || null,
                email: p?.email || null,
            }));

            const id = makeId();
            const newSession = { id, name: `Session ${id}`, createdAt: new Date().toISOString(), people };

            const SESSIONS_KEY = 'wantosing:sessions';
            const rawSessions = localStorage.getItem(SESSIONS_KEY) || '[]';
            const arr = JSON.parse(rawSessions);
            arr.unshift(newSession);
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(arr));

            // Navigate to the newly created session
            router.push(`/session/${id}`);
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
