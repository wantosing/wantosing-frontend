"use client";

import Image from 'next/image';
import type { Profile } from '../../profile/types';
import type { Session, Song } from '../types';

type MatchEntry = {
    person: Profile;
    song: Song;
};

type Props = {
    song: Song;
    session: Session;
    selectedThumb: string;
    selectedTitle: string;
    selectedArtist: string;
    selectedTracks: Song['tracks'];
    matchCount: number;
    matchPercentage: number;
    totalPeople: number;
    matchingEntries: MatchEntry[];
    onClose: () => void;
};

export default function SessionSongInfoModal({
    song,
    session,
    selectedThumb,
    selectedTitle,
    selectedArtist,
    selectedTracks,
    matchCount,
    matchPercentage,
    totalPeople,
    matchingEntries,
    onClose,
}: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card w-96 bg-base-100 relative" onClick={(e) => e.stopPropagation()}>
                <button
                    className="absolute top-2 right-2 btn btn-ghost btn-sm"
                    onClick={onClose}
                    aria-label="Close song details"
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="card-body flex flex-col items-center">
                    <div className="w-36 h-36 relative rounded overflow-hidden">
                        <Image src={selectedThumb} alt="thumb" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <h3 className="text-lg font-semibold mt-4 text-center">{selectedTitle}</h3>
                    <div className="text-sm text-muted  text-center">{selectedArtist}</div>

                   

                    <div className="flex gap-3 mt-4">
                        {selectedTracks.map((t) => {
                            const url = t.data?.url;
                            if (!url) return null;
                            if (t.source === 'spotify') {
                                return (
                                    <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in Spotify" title="Open in Spotify">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168" className="h-5 w-5" aria-hidden="true">
                                            <path fill="#1ED760" d="M84 0a84 84 0 1 0 0 168A84 84 0 0 0 84 0z" />
                                            <path fill="#fff" d="M123.9 118.6c-1.9 2.8-5.6 3.6-8.3 1.7-22.6-15-51-18.4-84.3-10-3.2.8-6.6-1.1-7.4-4.3-.8-3.2 1.1-6.6 4.3-7.4 36.6-9 67.6-5.1 93.4 11.5 2.8 1.8 3.6 5.6 1.7 8.5zM128.5 88.6c-2.3 3.4-7 4.4-10.4 2.1-26-17-65.8-21.9-96.5-12-3.9 1.2-8.1-.9-9.3-4.8-1.2-3.9.9-8.1 4.8-9.3 34.8-11 78.2-5.7 109.4 13 3.4 2.2 4.4 7 2 10.9zM129.4 58.9c-31.8-17.8-81.1-19.4-108.6-10.6-4.6 1.6-9.5-.8-11.1-5.4-1.6-4.6.8-9.5 5.4-11.1 32.8-11.3 87.3-9.3 124.1 11 4 2.3 5.5 7.5 3.2 11.5-2.3 4-7.5 5.5-11.5 3.6z" />
                                        </svg>
                                    </a>
                                );
                            }
                            if (t.source === 'youtube' || t.source === 'ytmusic') {
                                return (
                                    <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in YouTube Music" title="Open in YouTube Music">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                                            <path fill="#FF0000" d="M43.6 11.2c-.4-1.6-1.6-2.8-3.2-3.2C36.4 7 24 7 24 7s-12.4 0-16.4.9c-1.6.4-2.8 1.6-3.2 3.2C3 15.3 3 24 3 24s0 8.7 1.4 12.8c.4 1.6 1.6 2.8 3.2 3.2C11.6 41 24 41 24 41s12.4 0 16.4-.9c1.6-.4 2.8-1.6 3.2-3.2C45 32.7 45 24 45 24s0-8.7-1.4-12.8z" />
                                            <path fill="#fff" d="M20 17l12 7-12 7z" />
                                        </svg>
                                    </a>
                                );
                            }
                            if (t.source === 'appleMusic' || t.source === 'apple') {
                                return (
                                    <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square" aria-label="Open in Apple Music" title="Open in Apple Music">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                            <path fill="#000" d="M16.365 1.43c.06.11.12.22.18.33.2.39.36.82.45 1.28.14.7.08 1.47-.16 2.22-.28.86-.81 1.65-1.5 2.02-.24.13-.5.22-.77.27-.28.05-.56.07-.84.07-.26 0-.53-.02-.8-.07-.27-.06-.52-.15-.76-.27C11.36 6.4 10.9 5.61 10.62 4.75c-.25-.75-.32-1.52-.17-2.22.09-.46.25-.89.45-1.28.06-.11.12-.22.18-.33C11.39.2 11.69 0 12 0c.3 0 .6.2.77.43z" />
                                            <path fill="#000" d="M19.6 12.1c-.17-.42-.3-.86-.3-1.32 0-2.3 1.3-4.3 3.2-5.4-.9-1.1-2.2-1.8-3.6-1.9-1.4-.1-2.9.4-4 1.4-.9.9-1.7 2.3-1.7 3.8 0 .4.03.8.12 1.2-3.1.4-5.8 1.9-7.6 4.2-1.9 2.4-2.9 5.6-2.5 8.9.2 1.8.8 3.6 1.6 5.1 1 .2 2.1.3 3.3.1 1.7-.3 3.5-.9 5-1.8 2.6-1.5 4.5-3.6 6-6.1 1.1-1.8 1.9-3.9 2.2-6.1-.4-.1-.9-.2-1.4-.2-.2 0-.4 0-.5.01z" />
                                        </svg>
                                    </a>
                                );
                            }
                            return (
                                <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-square">
                                    🔗
                                </a>
                            );
                        })}
                    </div>

                     <div className="w-full mt-4 rounded-lg bg-base-200 p-4 text-left">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Group match</div>
                        <div className="text-sm">
                            <span className="font-medium">{matchCount}</span>
                            <span className="text-muted"> of {totalPeople} people match</span>
                        </div>
                            </div>
                            <div className="badge badge-primary badge-outline">{matchPercentage}%</div>
                        </div>


                        <div className="mt-3 flex flex-wrap gap-2">
                            {matchingEntries.length === 0 ? (
                                <div className="text-sm text-muted">No one in the group has this song yet.</div>
                            ) : (
                                matchingEntries.map((entry, index) => {
                                    const name = entry.person.name || 'Guest';
                                    const avatarLabel = `${name} has ${entry.song.defaultName || entry.song.tracks?.[0]?.data?.name || 'this song'}`;
                                    const primary = entry.person.imageUrl;
                                    return (
                                        <button
                                            key={`${entry.person.integrationUserId || entry.person.name || 'person'}-${entry.song.id}-${index}`}
                                            className="tooltip tooltip-bottom"
                                            data-tip={name}
                                            title={name}
                                            aria-label={avatarLabel}
                                            onClick={() => window.alert(name)}
                                        >
                                            {primary ? (
                                                <div className="w-9 h-9 rounded-full overflow-hidden relative ring-2 ring-base-100">
                                                    <Image src={primary} alt={name} fill sizes="36px" style={{ objectFit: 'cover' }} />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold ring-2 ring-base-100">
                                                    {name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}