"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinModalClient() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [codeArr, setCodeArr] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const openerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!open) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        if (open) {
            // focus first empty input
            const first = inputRefs.current.find((r) => r && r.value === '');
            (first || inputRefs.current[0])?.focus();
        } else {
            setCodeArr(['', '', '', '', '', '']);
            setError(null);
            // return focus to opener
            openerRef.current?.focus();
        }
    }, [open]);

    function closeModal() {
        setOpen(false);
    }

    function normalizeChar(ch: string) {
        return ch.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    function onChangeAt(index: number, value: string) {
        // handle paste of multiple chars
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length > 1) {
            // distribute across inputs starting at index
            const arr = [...codeArr];
            for (let i = 0; i < cleaned.length && index + i < 6; i++) {
                arr[index + i] = cleaned.charAt(i);
            }
            setCodeArr(arr);
            const nextIdx = Math.min(5, index + cleaned.length);
            inputRefs.current[nextIdx]?.focus();
            return;
        }

        const ch = normalizeChar(cleaned).slice(0, 1);
        const arr = [...codeArr];
        arr[index] = ch;
        setCodeArr(arr);
        if (ch && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function onKeyDownAt(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
        const key = e.key;
        const target = e.currentTarget;
        if (key === 'Backspace') {
            e.preventDefault();
            if (target.value === '' && index > 0) {
                // move to previous and clear
                const prev = inputRefs.current[index - 1];
                prev?.focus();
                const arr = [...codeArr];
                arr[index - 1] = '';
                setCodeArr(arr);
            } else {
                const arr = [...codeArr];
                arr[index] = '';
                setCodeArr(arr);
            }
            setError(null);
            return;
        }

        if (key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            e.preventDefault();
            return;
        }
        if (key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
            e.preventDefault();
            return;
        }

        if (key === 'Enter') {
            e.preventDefault();
            tryJoin();
            return;
        }
    }

    function tryJoin() {
        const code = codeArr.join('');
        if (code.length !== 6) {
            setError('Please enter a 6-character code (letters or numbers)');
            // focus first empty
            const first = codeArr.findIndex((c) => !c);
            if (first >= 0) inputRefs.current[first]?.focus();
            return;
        }
        setError(null);
        router.push(`/session/new?room=${encodeURIComponent(code)}`);
        closeModal();
    }

    // focus trap: handle Tab inside modal container
    function onModalKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'Tab') return;
        const focusable = inputRefs.current.filter(Boolean) as HTMLElement[];
        const buttons = Array.from(e.currentTarget.querySelectorAll('button')) as HTMLElement[];
        const nodes = [...focusable, ...buttons];
        if (nodes.length === 0) return;
        const active = document.activeElement as HTMLElement | null;
        const idx = nodes.indexOf(active as HTMLElement);
        if (e.shiftKey) {
            // move backwards
            const prev = idx <= 0 ? nodes[nodes.length - 1] : nodes[idx - 1];
            e.preventDefault();
            prev.focus();
        } else {
            const next = idx === -1 || idx === nodes.length - 1 ? nodes[0] : nodes[idx + 1];
            e.preventDefault();
            next.focus();
        }
    }

    return (
        <div>
            <button ref={openerRef} onClick={() => setOpen(true)} className="btn btn-outline btn-lg w-full h-40 flex flex-col items-center justify-center gap-2">
                <span className="text-5xl">🔢</span>
                <span className="text-xl font-semibold">Join an existing karaoke session</span>
                <span className="text-sm text-muted">Enter a 6-character session code</span>
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="card w-96 bg-base-100 p-4" role="dialog" aria-modal="true" onKeyDown={onModalKeyDown}>
                        <h3 className="text-lg font-semibold mb-2">Enter session code</h3>
                        <p className="text-sm text-muted mb-3">Enter the 6-character code provided by the host.</p>

                        <div className="flex gap-2 justify-center mb-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    value={codeArr[i] || ''}
                                    onChange={(e) => onChangeAt(i, e.target.value)}
                                    onKeyDown={(e) => onKeyDownAt(e, i)}
                                    onPaste={(e) => {
                                        const pasted = e.clipboardData.getData('text');
                                        if (!pasted) return;
                                        e.preventDefault();
                                        const cleaned = pasted.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                                        const arr = [...codeArr];
                                        for (let j = 0; j < cleaned.length; j++) {
                                            arr[j] = cleaned[j];
                                        }
                                        setCodeArr(arr);
                                        const next = Math.min(5, cleaned.length - 1);
                                        inputRefs.current[next]?.focus();
                                    }}
                                    inputMode="text"
                                    maxLength={1}
                                    className="input input-bordered w-12 h-12 text-center text-lg"
                                    aria-label={`Character ${i + 1}`}
                                />
                            ))}
                        </div>

                        {error ? <div className="text-sm text-error mb-2">{error}</div> : null}

                        <div className="flex justify-end gap-2 mt-2">
                            <button className="btn" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={tryJoin}>Join</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
