"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import type { Profile } from '../profile/types';
import { getProfile, setProfile, clearProfile } from '../profile/types';

function Avatar({ name, imageUrl }: { name?: string; imageUrl?: string | null }) {
    const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : "U";
    if (imageUrl) {
        return (
            <div className="avatar">
                <div className="w-20 h-20 rounded-full overflow-hidden relative">
                    <Image src={imageUrl} alt={name || 'Avatar'} fill sizes="80px" style={{ objectFit: 'cover' }} />
                </div>
            </div>
        );
    }
    return (
        <div className="avatar avatar-placeholder">
            <div className="w-20 h-20 rounded-full bg-success text-white flex items-center justify-center text-2xl">{initial}</div>
        </div>
    );
}

function SpotifyIcon({ size = 16, title = 'Spotify' }: { size?: number; title?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}>
            <title>{title}</title>
            <circle cx="84" cy="84" r="84" fill="#1ED760" />
            <path d="M122.1 118.2c-1.6 2.6-4.9 3.5-7.6 1.9-20.8-12.9-47-15.9-77.6-8.9-3 0.7-6-1.1-6.6-4.1s1.1-6 4.1-6.6c33.8-7.9 63.7-4.2 87.8 10.1 2.6 1.6 3.5 4.9 1.9 7.6z" fill="#fff" />
            <path d="M128.4 96.8c-1.9 3.1-5.9 4.2-9 2.3-23.9-14.9-60.3-19.3-88.6-10.8-3.5 1-7.3-0.9-8.2-4.5-1-3.5 0.9-7.3 4.5-8.2 32.7-9.5 73.6-4.6 101.8 12.2 3.1 1.9 4.2 5.9 2.5 9z" fill="#fff" />
            <path d="M131.8 75.2C103 58 57.1 56 32.1 63.2c-4 1.1-8.2-1-9.3-5-1.1-4 1-8.2 5-9.3 28.9-7.5 80.4-5 113 15.8 3.4 2.1 4.5 6.6 2.4 10s-6.6 4.5-10 2.5z" fill="#fff" />
        </svg>
    );
}

function AppleIcon({ size = 16, title = 'Apple Music' }: { size?: number; title?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}>
            <title>{title}</title>
            <rect width="24" height="24" rx="4" fill="#FA2" />
            <path d="M12 7c.8-1 1.8-2 3-2s2 1 2 2c0 1-1 2-2 2s-2-.5-3-2zM8 13c0-2 1-4 3-4s3 2 3 4-1 4-3 4-3-2-3-4z" fill="#fff" />
        </svg>
    );
}

function YouTubeIcon({ size = 16, title = 'YouTube' }: { size?: number; title?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}>
            <title>{title}</title>
            <rect width="24" height="24" rx="4" fill="#FF0000" />
            <path d="M9 8l6 4-6 4V8z" fill="#fff" />
        </svg>
    );
}

function countryFlagEmoji(code?: string | null) {
    if (!code) return null;
    try {
        const upper = code.toUpperCase();
        if (upper.length !== 2) return null;
        const A = 0x1f1e6;
        const first = upper.charCodeAt(0) - 65 + A;
        const second = upper.charCodeAt(1) - 65 + A;
        return String.fromCodePoint(first) + String.fromCodePoint(second);
    } catch {
        return null;
    }
}

export default function SettingsPage() {
    const [profile, setProfileState] = useState<Profile | null>(null);
    // name editing disabled per request

    useEffect(() => {
        try {
            const p = getProfile();
            if (p) {
                setProfileState(p);
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // fallback sample profile
        const fallback: Profile = { integrationUserId: "21ye6p6wcuqhmx5334ipt34ra", name: "NaphatS", imageUrl: "https://i.scdn.co/image/ab6775700000ee856f7342124488e7c6e7acf408", country: null, connectedService: "spotify" };
        setProfileState(fallback);

        // listen for external profile changes
        const onChange = (e: Event) => {
            try {
                // event detail may contain Profile or null
                const detail = (e as CustomEvent).detail as Profile | null;
                if (detail === null) return setProfileState(null);
                if (detail) setProfileState(detail);
            } catch {
                const p = getProfile();
                setProfileState(p);
            }
        };
        window.addEventListener('wantosing:profile:changed', onChange as EventListener);
        return () => window.removeEventListener('wantosing:profile:changed', onChange as EventListener);
    }, []);

    function persist(p: Profile) {
        try {
            setProfile(p);
            setProfileState(p);
        } catch (e) {
            console.error(e);
        }
    }

    function disconnect() {
        if (!profile) return;
        const next = { ...profile, connectedService: undefined, integrationUserId: undefined };
        persist(next);
    }

    // Developer quick-switch sample accounts
    const spotifyDevAccount: Profile = { integrationUserId: "12345", name: "NaphatS", imageUrl: "https://i.scdn.co/image/ab6775700000ee856f7342124488e7c6e7acf408", country: null, connectedService: 'spotify' };
    const youtubeDevAccount: Profile = { integrationUserId: "67890", name: "Napat Saokomut (plux_gy)", email: "a@gmail.com", imageUrl: "https://lh3.googleusercontent.com/a/ACg8ocJkiZ4Xz8BOP1-IPDh2BUUIjGy05L_SKvaoqTmoF8jS7VBF-Qur=s96-c", country: null, connectedService: 'youtube' };

    function applyDevAccount(p: Profile) {
        try {
            setProfile(p);
            setProfileState(p);
        } catch (e) {
            console.error(e);
        }
    }

    function clear() {
        try {
            clearProfile();
            setProfileState(null);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <main className="min-h-screen bg-base-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                {(profile) &&
                    <div className="card p-6">
                        <div className="flex items-center gap-6">
                            <Avatar name={profile.name} imageUrl={profile.imageUrl} />
                            <div>
                                <h2 className="text-xl font-semibold">{profile.name}</h2>

                                <p className="text-sm text-muted mt-2 flex items-center gap-2">
                                    Connected:
                                    {profile.connectedService ? (
                                        <span className="inline-flex items-center gap-2">
                                            {profile.connectedService === 'spotify' ? <span title="Connected via Spotify"><SpotifyIcon size={18} title="Connected via Spotify" /></span> : null}
                                            {profile.connectedService === 'appleMusic' ? <AppleIcon size={18} title="Connected via Apple Music" /> : null}
                                            {profile.connectedService === 'youtube' ? <YouTubeIcon size={18} title="Connected via YouTube" /> : null}
                                            <span className="capitalize">{profile.connectedService}</span>
                                        </span>
                                    ) : (
                                        'Not connected'
                                    )}
                                </p>
                                <p className="text-sm text-muted">WantoSing ID: <span className="font-mono">{profile.integrationUserId || '—'}</span></p>
                                {profile.country && (
                                    <p className="text-sm text-muted mt-1">Country: <span className="ml-2">{countryFlagEmoji(profile.country)} {profile.country}</span></p>
                                )}
                                {profile.connectedService && (
                                    <div className="mt-3">
                                        <button className="btn btn-outline btn-sm" onClick={disconnect}>Disconnect {profile.connectedService}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}


                {/* {(process.env.NODE_ENV !== 'production') && */}
                <div className="card p-6 mt-6">
                    <h3 className="font-semibold mb-2">Developer</h3>
                    <p className="text-sm text-muted mb-4">Quick-switch sample accounts for development.</p>
                    <div className="flex gap-2">
                        <button className="btn" onClick={() => applyDevAccount(spotifyDevAccount)}>Use Spotify Account</button>
                        <button className="btn" onClick={() => applyDevAccount(youtubeDevAccount)}>Use YouTube Account</button>
                        <button className="btn btn-ghost" onClick={clear}>Clear Profile</button>
                    </div>
                </div>
                {/* } */}


            </div>
        </main>
    );
}
