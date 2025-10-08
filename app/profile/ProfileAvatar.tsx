"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Profile } from './types';
import { getProfile } from './types';

export default function ProfileAvatar({ size = 40 }: { size?: number }) {
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

    const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'U';

    if (profile?.imageUrl) {
        return (
            <div className="avatar" style={{ width: size, height: size }}>
                <div className="rounded-full overflow-hidden relative" style={{ width: size, height: size }}>
                    <Image src={profile.imageUrl} alt={profile.name || 'Avatar'} fill sizes={`${size}px`} style={{ objectFit: 'cover' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="avatar avatar-placeholder" style={{ width: size, height: size }}>
            <div className="rounded-full bg-success text-white flex items-center justify-center" style={{ width: size, height: size }}>{initial}</div>
        </div>
    );
}
