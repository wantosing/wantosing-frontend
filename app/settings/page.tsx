"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import { getMe, type User } from '@/lib/api-client';

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

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            setIsLoading(true);
            setError(null);

            try {
                const me = await getMe();
                if (!isMounted) return;
                setUser(me);
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setUser(null);
                setError('Sign in to view and manage your account.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        void loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <main className="min-h-screen bg-base-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                {isLoading ? (
                    <div className="card p-6">
                        <div className="skeleton h-20 w-full" />
                    </div>
                ) : null}

                {error ? (
                    <div className="alert alert-warning mb-6">
                        <span>{error}</span>
                    </div>
                ) : null}

                {(user) &&
                    <div className="card p-6">
                        <div className="flex items-center gap-6">
                            <Avatar name={user.displayName || undefined} imageUrl={user.avatarUrl} />
                            <div>
                                <h2 className="text-xl font-semibold">{user.displayName || 'Unnamed user'}</h2>
                                <p className="text-sm text-muted mt-2">Email: {user.email || 'No email available'}</p>
                                <p className="text-sm text-muted">WantoSing ID: <span className="font-mono">{user.id}</span></p>
                            </div>
                        </div>
                    </div>}

            </div>
        </main>
    );
}
