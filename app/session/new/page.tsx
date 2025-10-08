import React, { Suspense } from 'react';
import NewSessionClient from './NewSessionClient';

export default function NewSessionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <NewSessionClient />
        </Suspense>
    );
}
