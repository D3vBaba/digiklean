'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UpgradePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSubscribe = async () => {
        if (!user) return;
        setIsProcessing(true);

        try {
            // Mock Payment Processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update User Subscription in Firestore
            // We use setDoc with merge: true to ensure the document exists or update it
            await setDoc(doc(db, 'users', user.uid), {
                subscription: {
                    plan: 'pro',
                    status: 'active',
                    startDate: new Date().toISOString()
                }
            }, { merge: true });

            // Redirect to Dashboard
            router.push('/dashboard?upgraded=true');
        } catch (error) {
            console.error("Subscription failed:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !user) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12 flex flex-col items-center">
                <div className="text-center mb-16 max-w-2xl">
                    <h1 className="text-4xl font-medium tracking-tight text-white mb-4">Upgrade to DigiKlean Pro</h1>
                    <p className="text-xl text-muted-foreground">
                        Take control of your digital footprint with automated removal and continuous monitoring.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Basic Plan */}
                    <div className="p-8 rounded-2xl border border-border bg-[#0a0a0a] flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-medium text-white">Basic</h3>
                            <div className="text-3xl font-bold text-white mt-2">$0 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Manual Removal Guides
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Basic Exposure Scan
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground/50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Automated Removal
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground/50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Continuous Monitoring
                            </li>
                        </ul>
                        <button disabled className="w-full py-3 border border-border rounded-lg text-muted-foreground cursor-not-allowed">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative p-8 rounded-2xl border border-white/20 bg-[#111] flex flex-col shadow-2xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Most Popular
                        </div>
                        <div className="mb-4">
                            <h3 className="text-xl font-medium text-white">Pro</h3>
                            <div className="text-3xl font-bold text-white mt-2">$19 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-white">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Everything in Basic
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                One-Click Auto-Removal
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Weekly Continuous Monitoring
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Priority Support
                            </li>
                        </ul>
                        <button
                            onClick={handleSubscribe}
                            disabled={isProcessing}
                            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Subscribe Now'}
                        </button>
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Secure payment via Stripe (Mock). Cancel anytime.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
