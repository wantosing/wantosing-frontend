export type ConnectedService = 'spotify' | 'appleMusic' | 'youtube' | string;

export type Profile = {
    name?: string;
    integrationUserId?: string;
    connectedService?: ConnectedService;
    imageUrl?: string | null;
    country?: string | null;
    email?: string | null;
};

const STORAGE_KEY = 'wantosing:profile';

export function getProfile(): Profile | null {
    try {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as Profile;
    } catch {
        return null;
    }
}

export function setProfile(p: Profile) {
    try {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
        // notify listeners
        try {
            window.dispatchEvent(new CustomEvent('wantosing:profile:changed', { detail: p }));
        } catch {
            // ignore
        }
    } catch {
        // ignore
    }
}

export function clearProfile() {
    try {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
        try { window.dispatchEvent(new CustomEvent('wantosing:profile:changed', { detail: null })); } catch { }
    } catch { }
}
