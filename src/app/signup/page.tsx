'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            console.log("User detected, redirecting to dashboard...");
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!auth) {
            setError('Firebase configuration missing. Please check your .env file.');
            return;
        }

        try {
            console.log("Starting signup process...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created:", user.uid);

            // Check for pending search
            const pendingQuery = localStorage.getItem('pendingSearchQuery');
            const pendingCount = localStorage.getItem('pendingSearchResultCount');
            console.log("Pending query:", pendingQuery);

            if (pendingQuery) {
                console.log("Saving pending query to Firestore...");
                await addDoc(collection(db, 'users', user.uid, 'history'), {
                    query: pendingQuery,
                    timestamp: serverTimestamp(),
                    resultCount: pendingCount ? parseInt(pendingCount) : 0
                });
                console.log("Pending query saved.");
                // Clear storage
                localStorage.removeItem('pendingSearchQuery');
                localStorage.removeItem('pendingSearchResultCount');
            }

            console.log("Redirecting to dashboard...");
            // Use window.location as a fallback if router.push is failing/stuck
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error("Signup error:", err);
            setError('Failed to create account. ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#0a0a0a] border border-border rounded-2xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-medium text-white">Create Account</h1>
                    <p className="text-muted-foreground mt-2">Sign up to view your full report</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-[#111] border border-border placeholder-muted-foreground text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 sm:text-sm transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-[#111] border border-border placeholder-muted-foreground text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-[#111] border border-border placeholder-muted-foreground text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 sm:text-sm transition-colors"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                        >
                            Sign up
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="font-medium text-white hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
