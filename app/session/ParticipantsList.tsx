"use client";

import { useEffect, useState } from 'react';
import type { Profile } from '../profile/types';
import Image from 'next/image';

function storageKeyFor(room?: string) {
    if (!room) return null;
    return `wantosing:participants:${room}`;
}

export default function ParticipantsList({ room }: { room?: string }) {
    const [list, setList] = useState<Profile[]>([]);

    useEffect(() => {
        function read() {
            try {
                const key = storageKeyFor(room);
                if (!key) return setList([]);
                const raw = localStorage.getItem(key) || '[]';
                setList(JSON.parse(raw));
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

    if (!room) return <div className="text-sm text-muted">Room not ready</div>;
    if (list.length === 0) return <div className="text-sm text-muted">No users yet</div>;

    return (
        <div className="space-y-3">
            {list.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                    {p.imageUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <Image src={p.imageUrl} alt={p.name || 'User'} fill sizes="40px" style={{ objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center">{p.name ? p.name.charAt(0).toUpperCase() : 'U'}</div>
                    )}
                    <div>
                        <div className="font-semibold">{p.name || 'Guest'}</div>
                        <div className="text-xs text-muted">{p.connectedService ? `Connected: ${p.connectedService}` : 'Not connected'}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
