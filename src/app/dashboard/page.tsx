'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ExposureChart from '@/components/ExposureChart';
import { Shield, AlertTriangle, CheckCircle, Activity, Search, ExternalLink, Trash2, LayoutDashboard, List, Eye } from 'lucide-react';

interface ScanResult {
    id: string;
    title: string;
    link: string;
    source: string;
    status: 'new' | 'processing' | 'removed';
    timestamp: any;
    query?: string;
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [scans, setScans] = useState<ScanResult[]>([]);
    const [isLoadingScans, setIsLoadingScans] = useState(true);
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [activeTab, setActiveTab] = useState<'overview' | 'exposures' | 'monitoring'>('overview');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    useEffect(() => {
        const fetchScans = async () => {
            if (loading || !user) {
                setIsLoadingScans(false);
                return;
            }

            setIsLoadingScans(true);

            try {
                // Query scans collection from Firestore
                const scansRef = collection(db, 'users', user.uid, 'scans');
                const q = query(scansRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);

                const fetchedScans: ScanResult[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    link: doc.data().link,
                    source: doc.data().source,
                    status: doc.data().status || 'new',
                    timestamp: doc.data().timestamp,
                    query: doc.data().query
                }));

                setScans(fetchedScans);
                console.log(`Fetched ${fetchedScans.length} scans from Firestore`);
            } catch (error) {
                console.error("Error fetching scans:", error);
                // Show empty state on error
                setScans([]);
            } finally {
                setIsLoadingScans(false);
            }
        };

        fetchScans();
    }, [user, loading]);

    const handleRequestRemoval = async (id: string) => {
        if (!user) return;
        const isPremium = true;
        if (!isPremium) {
            router.push('/dashboard/upgrade');
            return;
        }
        setScans(prev => prev.map(scan => scan.id === id ? { ...scan, status: 'processing' } : scan));
        try {
            const scanItem = scans.find(s => s.id === id);
            if (!scanItem) return;

            // Fetch user's monitored profile for accurate data
            const profileRef = doc(db, 'users', user.uid, 'monitoredProfile', 'info');
            const profileSnap = await getDoc(profileRef);

            let userData: { name: string; email: string; address?: string } = {
                name: user.displayName || 'User',
                email: user.email || ''
            };

            if (profileSnap.exists()) {
                const profile = profileSnap.data();
                userData = {
                    name: profile.fullName || user.displayName || 'User',
                    email: profile.email || user.email || '',
                    address: profile.address
                };
            }

            const res = await fetch('/api/opt-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broker: scanItem.source,
                    url: scanItem.link,
                    userData
                })
            });

            if (res.ok) {
                // Update status in Firestore
                const scanRef = doc(db, 'users', user.uid, 'scans', id);
                await updateDoc(scanRef, { status: 'removed' });
                setScans(prev => prev.map(scan => scan.id === id ? { ...scan, status: 'removed' } : scan));
            } else {
                setScans(prev => prev.map(scan => scan.id === id ? { ...scan, status: 'new' } : scan));
            }
        } catch (error) {
            console.error('Opt-out request failed:', error);
            setScans(prev => prev.map(scan => scan.id === id ? { ...scan, status: 'new' } : scan));
        }
    };

    // Calculate stats
    const newCount = scans.filter(s => s.status === 'new').length;
    const processingCount = scans.filter(s => s.status === 'processing').length;
    const removedCount = scans.filter(s => s.status === 'removed').length;

    if (loading || isLoadingScans) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                        <p className="text-sm text-neutral-400 mt-1">Overview for {user.email}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/dashboard/settings')}
                            className="px-3 py-1.5 rounded-md bg-neutral-900 border border-white/10 hover:bg-neutral-800 transition-colors text-xs font-medium text-neutral-300"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/upgrade')}
                            className="px-3 py-1.5 rounded-md bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-medium"
                        >
                            Upgrade
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-neutral-900/50 p-1 rounded-lg w-fit border border-white/5">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('exposures')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'exposures' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                    >
                        <List className="w-4 h-4" /> Exposures
                        {newCount > 0 && <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 rounded-full">{newCount}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('monitoring')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'monitoring' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                    >
                        <Eye className="w-4 h-4" /> Monitoring
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-lg bg-neutral-900 border border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-sm text-neutral-400 font-medium">Exposures Found</div>
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-white tracking-tight">{newCount}</div>
                                </div>
                                <div className="p-5 rounded-lg bg-neutral-900 border border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-sm text-neutral-400 font-medium">In Progress</div>
                                        <Shield className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-white tracking-tight">{processingCount}</div>
                                </div>
                                <div className="p-5 rounded-lg bg-neutral-900 border border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-sm text-neutral-400 font-medium">Removed</div>
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-white tracking-tight">{removedCount}</div>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="p-6 rounded-lg bg-neutral-900 border border-white/10">
                                <h3 className="text-sm font-medium text-white mb-6">Exposure Trend</h3>
                                <ExposureChart />
                            </div>
                        </>
                    )}

                    {activeTab === 'exposures' && (
                        <div className="rounded-lg border border-white/10 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-900 text-neutral-400 font-medium border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3">Source</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-black">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{scan.source}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${scan.status === 'new' ? 'bg-red-500/10 text-red-400' :
                                                    scan.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                    {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400">{scan.title}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <a
                                                    href={scan.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                {scan.status === 'new' && (
                                                    <button
                                                        onClick={() => handleRequestRemoval(scan.id)}
                                                        className="px-3 py-1 rounded bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {scans.length === 0 && (
                                <div className="p-8 text-center text-neutral-500">No exposures found.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'monitoring' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-lg bg-neutral-900 border border-white/10">
                                <h3 className="text-lg font-medium text-white mb-4">Continuous Monitoring</h3>
                                <p className="text-sm text-neutral-400 mb-6">
                                    Your personal information is automatically scanned for on a weekly basis.
                                    The next scheduled scan is in 3 days.
                                </p>
                                <div className="flex items-center justify-between p-4 rounded bg-black border border-white/5 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm font-medium text-white">Status: Active</span>
                                    </div>
                                    <span className="text-xs text-neutral-500">Last checked: Today</span>
                                </div>
                                <button
                                    disabled={scanStatus === 'scanning'}
                                    onClick={async () => {
                                        setScanStatus('scanning');
                                        try {
                                            const res = await fetch('/api/monitor/run', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: user.uid, query: 'John Doe' })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setScanStatus('complete');
                                                setTimeout(() => setScanStatus('idle'), 5000);
                                            }
                                        } catch (e) {
                                            setScanStatus('idle');
                                        }
                                    }}
                                    className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${scanStatus === 'complete'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-white text-black hover:bg-neutral-200'
                                        }`}
                                >
                                    {scanStatus === 'scanning' ? 'Running Scan...' :
                                        scanStatus === 'complete' ? 'Scan Complete!' : 'Run Manual Scan'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
