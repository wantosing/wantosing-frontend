import type { Profile } from '../profile/types';

export type TrackData = {
    externalId: string;
    previewUrl?: string | null;
    name: string;
    artistNames: string[];
    albumName?: string | null;
    imageUrl?: string | null;
    isrc?: string | null;
    duration?: number | null; // milliseconds
    url?: string | null;
};

export type TrackEntry = {
    source: string; // 'spotify' | 'appleMusic' | 'youtube' | ...
    type?: string; //  'track'| 'playlist'| 'album'
    data: TrackData;
};

export type Song = {
    id: string;
    // Optional defaults used for UI when tracks are incomplete; durations are milliseconds
    defaultName?: string;
    defaultArtistName?: string;
    defaultThumbnail?: string;
    defaultDuration?: number;
    // optional canonical identifiers copied from a preferred source (e.g. Spotify)
    isrc?: string | null;
    // A single logical song may have multiple track sources (Spotify, Apple Music, YouTube)

    tracks: TrackEntry[];
};

export type Session = {
    id: string;
    name: string;
    createdAt?: string;
    people?: Profile[];
    songs?: Song[];
};

export const STORAGE_KEY = "wantosing:sessions";
