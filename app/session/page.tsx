import Link from 'next/link';
import JoinModalClient from './JoinModalClient';

export const metadata = { title: 'Start a session | WantoSing' };

export default function SessionIndexPage() {
    return (
        <main className="min-h-screen bg-base-100 p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link href="/session/new" className="btn btn-outline btn-lg w-full h-40 flex flex-col items-center justify-center gap-2">
                        <span className="text-5xl">🎤</span>
                        <span className="text-xl font-semibold">Create a new karaoke session</span>
                        <span className="text-sm text-muted">Host and invite friends</span>
                    </Link>

                    <JoinModalClient />
                </section>

                <hr />

                <div className="text-center mt-4 opacity-70 text-sm">
                    <h2 className="text-xl font-semibold mb-2 text-muted">Your recent karaoke sessions</h2>
                    <Link href="/session/history" className="link link-primary">View session history</Link>
                </div>
            </div>
        </main>
    );
}
