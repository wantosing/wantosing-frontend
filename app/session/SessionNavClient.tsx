"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { clearProfile } from '../profile/types';
import { getMe, logoutAndClearProfile, type User } from '@/lib/api-client';

function Avatar({ user, size = 36 }: { user: User | null; size?: number }) {
    const initial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

    if (user?.avatarUrl) {
        return (
            <div className="avatar" style={{ width: size, height: size }}>
                <div className="rounded-full overflow-hidden relative" style={{ width: size, height: size }}>
                    <Image src={user.avatarUrl} alt={user.displayName || user.email || 'Avatar'} fill sizes={`${size}px`} style={{ objectFit: 'cover' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="avatar avatar-placeholder" style={{ width: size, height: size }}>
            <div className="rounded-full bg-success text-white flex items-center justify-center font-semibold" style={{ width: size, height: size }}>{initial}</div>
        </div>
    );
}

export default function SessionNavClient() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            try {
                const me = await getMe();
                if (!isMounted) return;
                setUser(me);
            } catch {
                if (!isMounted) return;
                setUser(null);
            }
        }

        void loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleLogout(e?: React.MouseEvent) {
        if (e) e.preventDefault();
        try {
            await logoutAndClearProfile();
        } catch {
            // ignore
        } finally {
            clearProfile();
            router.push('/');
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-ghost" aria-label="Open profile menu" title="Open profile menu">
                    <Avatar user={user} size={36} />
                </button>

                <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                    <div className='p-4'>
                        <div className="font-semibold">{user?.displayName ?? user?.email ?? 'Guest'}</div>

                    </div>
                    <hr className='mb-2' />
                    <li>
                        <Link href="/profile">Library</Link>
                    </li>
                    <li>
                        <Link href="/settings">Settings</Link>
                    </li>
                    <li>
                        <button onClick={() => { void handleLogout() }}>Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
