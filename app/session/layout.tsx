import Link from "next/link";
import SessionNavClient from './SessionNavClient';

export default function SessionLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <label tabIndex={0} className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>
                        <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                            <li>
                                <Link href="/session">New session</Link>
                            </li>
                            <li>
                                <Link href="/session/history">Session history</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="hidden lg:flex">
                        <ul className="menu menu-horizontal px-1">
                            <li>
                                <Link href="/session">New session</Link>
                            </li>
                            <li>
                                <Link href="/session/history">Session history</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="navbar-center">
                    <Link href="/session" className="btn btn-ghost normal-case text-xl">
                        Wantosing
                    </Link>
                </div>

                <div className="navbar-end">
                    <SessionNavClient />
                </div>
            </div>

            <div>{children}</div>
        </div>
    );
}
