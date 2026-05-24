import Image from 'next/image';
import type { MyLibrarySong } from '@/lib/api-client';

function formatDuration(durationMs?: number | null) {
    if (!durationMs || durationMs <= 0) return '0:00';
    const totalSeconds = Math.floor(durationMs / 1000);
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

type SavedSongsListProps = {
    songs: MyLibrarySong[];
    totalItems: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

export function SavedSongsList({
    songs,
    totalItems,
    page,
    totalPages,
    isLoading,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
}: SavedSongsListProps) {
    const safeSongs = Array.isArray(songs) ? songs : [];

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-xl font-semibold">Library songs</h2>
                </div>

                <div className="flex items-center justify-between gap-3 mb-4 text-sm text-muted">
                    <span>
                        Showing {safeSongs.length} of {totalItems} songs
                    </span>
                    <div className="join">
                        <button className="btn btn-sm join-item" onClick={onPrevious} disabled={!canGoPrevious || isLoading}>
                            Previous
                        </button>
                        <button className="btn btn-sm join-item pointer-events-none" disabled>
                            Page {page} of {totalPages}
                        </button>
                        <button className="btn btn-sm join-item" onClick={onNext} disabled={!canGoNext || isLoading}>
                            Next
                        </button>
                    </div>
                </div>

                {safeSongs.length === 0 ? (
                    <div className="text-sm text-muted">No songs saved in this library yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {safeSongs.map((song) => {
                            const title = song.title;
                            const artist = song.artist;
                            const thumb = song.imageUrl || '/file.svg';

                            return (
                                <li key={song.songId} className="flex items-center gap-3 rounded bg-base-100 p-2">
                                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                                        <Image src={thumb} alt={title} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{title}</div>
                                        <div className="text-sm text-muted truncate">{artist}</div>
                                    </div>
                                    <div className="text-sm text-muted whitespace-nowrap">
                                        {formatDuration(song.durationMs)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
