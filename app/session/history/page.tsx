import SessionList from './SessionList'

export const metadata = { title: 'Session history | WantoSing' };

export default function SessionHistoryPage() {
    return (
        <main className="min-h-screen bg-base-100 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-6">Session history</h1>
                <p className="text-center text-muted mb-6">Sessions you created in this browser (stored locally).</p>
                <SessionList />
            </div>
        </main>
    );
}
