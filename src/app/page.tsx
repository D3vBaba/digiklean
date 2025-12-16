'use client';

import { useState } from 'react';
import Link from 'next/link';

import Header from '@/components/Header';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Types matching the API response
interface Exposure {
  site: string;
  siteName: string;
  url: string;
  dataFound: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  removalDifficulty: 'easy' | 'medium' | 'hard';
  removalUrl?: string;
  removalInstructions?: string;
  snippet?: string;
}

interface RiskAssessment {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  exposures: Exposure[];
  recommendations: string[];
  stats: {
    totalExposures: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

interface SearchResponse {
  success: boolean;
  assessment: RiskAssessment;
  items?: any[];
}

// Severity badge colors
const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const difficultyColors = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400'
};

const gradeColors = {
  A: 'text-green-400',
  B: 'text-green-300',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400'
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [cityState, setCityState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setAssessment(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, cityState, email, phone }),
      });

      const data: SearchResponse = await res.json();

      if (data.success && data.assessment) {
        setAssessment(data.assessment);

        // Save to Firestore if logged in
        if (user && data.assessment.exposures.length > 0) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            query,
            cityState,
            email,
            phone,
            timestamp: serverTimestamp(),
            riskScore: data.assessment.score,
            grade: data.assessment.grade,
            exposureCount: data.assessment.exposures.length
          });

          // Save exposures
          for (const exposure of data.assessment.exposures) {
            await addDoc(collection(db, 'users', user.uid, 'scans'), {
              ...exposure,
              query,
              status: 'new',
              timestamp: serverTimestamp()
            });
          }
        } else if (!user) {
          localStorage.setItem('pendingSearchQuery', query);
          localStorage.setItem('pendingRiskScore', data.assessment.score.toString());
        }
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-background text-foreground selection:bg-white/20">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-24 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className={`flex flex-col items-center text-center gap-6 transition-all duration-700 ${assessment ? 'mb-8' : 'mb-24'}`}>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white">
              Control your digital narrative.
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Discover where your personal data is exposed online. <br className="hidden sm:block" />
              Get actionable insights to protect your privacy.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative mt-6 bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Full Name *</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">City & State</label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="w-full py-3.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Scanning Data Brokers...
                </>
              ) : (
                'Run Privacy Scan'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {assessment && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 mb-16">

            {/* Risk Score Card */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-[#222] rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className={`text-7xl font-bold ${gradeColors[assessment.grade]}`}>
                      {assessment.grade}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-center">GRADE</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-semibold text-white">{assessment.score}</span>
                      <span className="text-muted-foreground">/100 Risk Score</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      {assessment.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-red-400">{assessment.stats.criticalCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Critical</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-orange-400">{assessment.stats.highCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">High</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-yellow-400">{assessment.stats.mediumCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Medium</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-green-400">{assessment.stats.lowCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Low</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {assessment.recommendations.length > 0 && (
              <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 mb-8">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {assessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exposures List */}
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">Data Exposures Found</h2>
              <span className="text-xs font-mono text-muted-foreground">
                {assessment.stats.totalExposures} SITES
              </span>
            </div>

            {!user ? (
              // Public View: Teaser
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 flex flex-col items-center justify-end pb-12">
                  <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-border text-center max-w-md shadow-2xl">
                    <div className={`text-5xl font-bold mb-2 ${gradeColors[assessment.grade]}`}>
                      {assessment.grade}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Your Privacy Grade</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      We found {assessment.stats.totalExposures} exposures across data broker sites.
                      Sign up to see full details and removal instructions.
                    </p>
                    <Link href="/signup" className="block w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                      Unlock Full Report
                    </Link>
                    <p className="mt-3 text-xs text-muted-foreground">Free account • No credit card</p>
                  </div>
                </div>

                {/* Blurred Preview */}
                <div className="space-y-3 filter blur-sm select-none pointer-events-none opacity-50">
                  {assessment.exposures.slice(0, 3).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-[#0a0a0a]">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Logged In: Full Results
              <div className="space-y-3">
                {assessment.exposures.map((exposure, idx) => (
                  <div key={idx} className="group p-5 rounded-xl border border-[#222] bg-[#0a0a0a] hover:border-[#333] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${severityColors[exposure.severity]}`}>
                          {exposure.severity}
                        </span>
                        <span className="text-sm font-medium text-white">{exposure.siteName}</span>
                      </div>
                      <a
                        href={exposure.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        View Profile ↗
                      </a>
                    </div>

                    {exposure.snippet && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exposure.snippet}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] text-muted-foreground uppercase">Data found:</span>
                      {exposure.dataFound.map((data, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-muted-foreground">
                          {data}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-[#222]">
                      <span className="text-muted-foreground">
                        Removal: <span className={difficultyColors[exposure.removalDifficulty]}>{exposure.removalDifficulty}</span>
                      </span>
                      {exposure.removalUrl && (
                        <a
                          href={exposure.removalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-gray-300 font-medium flex items-center gap-1"
                        >
                          Remove My Data →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features Section (when no results) */}
        {!assessment && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl border-t border-border pt-16">
            <div className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a comprehensive privacy score based on where your data appears across 100+ data broker sites.
              </p>
            </div>

            <Link href="/guides" className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Removal Guides</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step instructions to remove your data from each site, with difficulty ratings and estimated time.
              </p>
            </Link>

            <div className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Monitoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get alerts when new exposures are detected. Stay on top of your digital footprint automatically.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground/40 font-mono">
        &copy; 2024 DIGIKLEAN INC. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
