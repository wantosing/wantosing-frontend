import type { Profile } from '../profile/types';
import type { Song } from './types';
import SAMPLE_SONGS from './sampleSongs';

export type SimulatedAccount = Profile & {
    librarySongs: Song[];
    libraryLastSyncedAt: string;
};

function cloneSong(song: Song): Song {
    return {
        ...song,
        tracks: song.tracks.map((track) => ({
            source: track.source,
            type: track.type,
            data: { ...track.data },
        })),
    };
}

function buildAccount(partial: Omit<SimulatedAccount, 'libraryLastSyncedAt'> & Partial<Pick<SimulatedAccount, 'libraryLastSyncedAt'>>): SimulatedAccount {
    return {
        ...partial,
        librarySongs: partial.librarySongs.map(cloneSong),
        libraryLastSyncedAt: partial.libraryLastSyncedAt || new Date().toISOString(),
    };
}

const baseTime = Date.now();

export const sampleSpotify = buildAccount({
    integrationUserId: '123',
    name: 'NaphatS',
    imageUrl: 'https://i.scdn.co/image/ab6775700000ee856f7342124488e7c6e7acf408',
    connectedService: 'spotify',
    country: null,
    librarySongs: SAMPLE_SONGS.slice(0, 4),
    libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 18).toISOString(),
});

export const sampleYoutube = buildAccount({
    integrationUserId: '456',
    name: 'Napat Saokomut (plux_gy)',
    imageUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJkiZ4Xz8BOP1-IPDh2BUUIjGy05L_SKvaoqTmoF8jS7VBF-Qur=s96-c',
    connectedService: 'youtube',
    country: null,
    email: '1@gmail.com',
    librarySongs: SAMPLE_SONGS.slice(1, 5),
    libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 42).toISOString(),
});

export const simulatedAccounts: SimulatedAccount[] = [
    sampleSpotify,
    sampleYoutube,
    buildAccount({
        integrationUserId: '789',
        name: 'Arisa J.',
        imageUrl: null,
        connectedService: 'spotify',
        country: 'TH',
        librarySongs: [SAMPLE_SONGS[0], SAMPLE_SONGS[2], SAMPLE_SONGS[4]].filter(Boolean) as Song[],
        libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 10).toISOString(),
    }),
    buildAccount({
        integrationUserId: '842',
        name: 'Mek Win',
        imageUrl: null,
        connectedService: 'appleMusic',
        country: 'TH',
        email: 'mek.win@example.com',
        librarySongs: [SAMPLE_SONGS[1], SAMPLE_SONGS[3]].filter(Boolean) as Song[],
        libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 64).toISOString(),
    }),
    buildAccount({
        integrationUserId: '915',
        name: 'June K.',
        imageUrl: null,
        connectedService: 'youtube',
        country: 'TH',
        email: 'june.k@example.com',
        librarySongs: [SAMPLE_SONGS[2], SAMPLE_SONGS[4]].filter(Boolean) as Song[],
        libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 92).toISOString(),
    }),
    buildAccount({
        integrationUserId: '338',
        name: 'Pond R.',
        imageUrl: null,
        connectedService: 'spotify',
        country: 'SG',
        librarySongs: [SAMPLE_SONGS[0], SAMPLE_SONGS[1], SAMPLE_SONGS[3]].filter(Boolean) as Song[],
        libraryLastSyncedAt: new Date(baseTime - 1000 * 60 * 125).toISOString(),
    }),
];
