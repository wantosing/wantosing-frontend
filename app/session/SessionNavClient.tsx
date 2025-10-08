"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import ProfileAvatar from '../profile/ProfileAvatar';
import { getProfile, clearProfile } from '../profile/types';
import type { Profile } from '../profile/types';

export default function SessionNavClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        setProfile(getProfile());
        const onChange = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail as Profile | null;
                setProfile(detail ?? getProfile());
            } catch {
                setProfile(getProfile());
            }
        };
        window.addEventListener('wantosing:profile:changed', onChange as EventListener);
        return () => window.removeEventListener('wantosing:profile:changed', onChange as EventListener);
    }, []);

    function handleLogout(e?: React.MouseEvent) {
        if (e) e.preventDefault();
        try {
            clearProfile();
        } catch {
            // ignore
        }
        // navigate to home
        router.push('/');
    }

    return (
        <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost">
                <ProfileAvatar size={36} />
            </button>

            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                <div className='p-4'>
                    <div className="font-semibold">{profile?.name ?? 'Guest'}</div>

                </div>
                <hr className='mb-2' />
                <li>
                    <Link href="/settings">Settings</Link>
                </li>
                <li>
                    <button onClick={() => { handleLogout() }}>Logout</button>
                </li>
            </ul>
        </div>
    );
}
