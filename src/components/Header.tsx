'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <header className="w-full py-6 px-8 flex justify-between items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
            <Link href="/" className="text-sm font-semibold tracking-widest uppercase hover:text-white transition-colors">
                Digi<span className="text-muted-foreground">Klean</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>

                {!loading && (
                    <>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground/60">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-foreground hover:text-white transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
                                <Link href="/signup" className="px-4 py-2 bg-white text-black rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
}
