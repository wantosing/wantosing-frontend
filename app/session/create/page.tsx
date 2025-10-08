"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "wantosing:sessions";

function makeId() {
    return Math.random().toString(36).slice(2, 9);
}

export default function NewSessionPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Creating session...");

    async function createAndRedirect() {
        try {
            const id = makeId();
            const newSession = { id, name: `Session ${id}`, createdAt: new Date().toISOString() };
            const raw = localStorage.getItem(STORAGE_KEY) || "[]";
            const arr = JSON.parse(raw);
            arr.unshift(newSession);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            // small delay for UX
            setStatus("Redirecting...");
            router.push(`/session/${id}`);
        } catch (e) {
            console.error(e);
            setStatus("Failed to create session");
        }
    }

    useEffect(() => {
        // Auto-create session when the page mounts
        createAndRedirect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center p-8">
            <div className="text-center">
                <p className="text-lg">{status}</p>
                <div className="mt-4">
                    <button className="btn" onClick={createAndRedirect}>
                        Create session
                    </button>
                </div>
            </div>
        </main>
    );
}