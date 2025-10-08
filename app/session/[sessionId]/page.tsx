import SessionDetail from './SessionDetail';

export const metadata = { title: 'Edit session | WantoSing' };

// Allow loose props here because Next's PageProps shape can vary between versions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SessionDetailPage(props: any) {
    const { sessionId } = props?.params || {};
    return (
        <main className="min-h-screen bg-base-100 p-8">
            <div className="max-w-2xl mx-auto">
                <SessionDetail id={sessionId ?? ''} />
            </div>
        </main>
    );
}
