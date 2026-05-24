"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getMe, getMyLibrary, type MyLibrarySong, type User } from '@/lib/api-client';
import { SavedSongsList } from './SavedSongsList';

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

type ProfileState = {
    user: User;
    librarySongs: MyLibrarySong[];
    libraryLastSyncedAt: string | null;
    provider: string;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            setIsLoading(true);
            setError(null);

            try {
                const [user, library] = await Promise.all([getMe(), getMyLibrary(page)]);
                if (!isMounted) return;
                setProfile({
                    user,
                    librarySongs: library.songs,
                    libraryLastSyncedAt: new Date().toISOString(),
                    provider: library.provider,
                    page: library.page,
                    pageSize: library.pageSize,
                    totalItems: library.totalItems,
                    totalPages: library.totalPages,
                });
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setProfile(null);
                setError('Sign in to view your streaming library.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, [page]);

    const initials = profile?.user.displayName?.charAt(0).toUpperCase() || profile?.user.email?.charAt(0).toUpperCase() || 'U';
    const librarySongs = profile?.librarySongs || [];
    const currentPage = profile?.page ?? page;
    const totalPages = profile?.totalPages ?? 1;
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <main className="min-h-screen bg-base-100 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        {/* <p className="text-sm text-muted mb-2">Streaming profile</p> */}
                        <h1 className="text-3xl font-bold">{'Your account'}</h1>
                        <p className="text-sm text-muted mt-2">Latest sync: {formatDate(profile?.libraryLastSyncedAt)}</p>
                    </div>

                    <button className="btn btn-primary" disabled title="Sync is coming soon">
                        Sync {profile?.provider || 'service'}
                    </button>
                </div>

                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-base-300 relative">
                                {profile?.user.avatarUrl ? (
                                    <Image src={profile.user.avatarUrl} alt={profile.user.displayName || profile.user.email || 'Profile avatar'} fill sizes="64px" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{initials}</div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold">{profile?.user.displayName || profile?.user.email || profile?.user.id}</div>
                                <div className="text-sm text-muted">Provider: {profile?.provider || 'Unknown'}</div>
                                <div className="text-sm text-muted">Songs in library: {librarySongs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <div className="skeleton h-6 w-48" />
                            <div className="skeleton h-12 w-full" />
                            <div className="skeleton h-12 w-full" />
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="alert alert-warning">
                        <span>{error}</span>
                    </div>
                ) : null}

                <SavedSongsList
                    songs={librarySongs}
                    totalItems={profile?.totalItems ?? 0}
                    page={currentPage}
                    totalPages={totalPages}
                    isLoading={isLoading}
                    canGoPrevious={canGoPrevious}
                    canGoNext={canGoNext}
                    onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                    onNext={() => setPage((current) => current + 1)}
                />
            </div>
        </main>
    );
}