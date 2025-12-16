'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

import Header from '@/components/Header';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [query, setQuery] = useState('');
  const [cityState, setCityState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResults(null);

    try {
      // 1. Perform Search
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, cityState, email, phone }),
      });
      const data = await res.json();
      setResults(data.items);

      // 2. Save to History and Scans (if logged in)
      if (user && data.items && data.items.length > 0) {
        // Save search history
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          query,
          cityState,
          email,
          phone,
          timestamp: serverTimestamp(),
          resultCount: data.items.length
        });

        // Save each result to scans collection for dashboard
        const scansPromises = data.items.map((item: SearchResult) =>
          addDoc(collection(db, 'users', user.uid, 'scans'), {
            title: item.title,
            link: item.link,
            source: item.source,
            snippet: item.snippet,
            status: 'new',
            query: query,
            cityState: cityState || null,
            email: email || null,
            phone: phone || null,
            timestamp: serverTimestamp()
          })
        );
        await Promise.all(scansPromises);
        console.log(`Saved ${data.items.length} scan results to Firestore`);
      } else if (!user) {
        // Save query to local storage for signup flow
        localStorage.setItem('pendingSearchQuery', query);
        localStorage.setItem('pendingSearchResultCount', (data.items?.length || 0).toString());
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

      <main className="flex-1 flex flex-col items-center pt-32 px-4 sm:px-8 max-w-5xl mx-auto w-full">

        {/* Hero Section */}
        <div className={`flex flex-col items-center text-center gap-8 transition-all duration-700 ${results ? 'mb-12' : 'mb-32'}`}>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl sm:text-7xl font-medium tracking-tight text-white">
              Control your digital narrative.
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              The enterprise-grade solution for managing your online footprint. <br className="hidden sm:block" />
              Identify exposure. Mitigate risk.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative mt-8 bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">City & State (Optional)</label>
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
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-3 bg-black/50 border border-white/10 text-foreground rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 ml-1">Phone (Optional)</label>
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
              className="w-full py-3 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Scanning Public Records...
                </>
              ) : (
                'Run Comprehensive Scan'
              )}
            </button>

            <p className="mt-4 text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Secure • Private • Anonymous
            </p>
          </form>
        </div>

        {/* Search Results */}
        {results && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
              <h2 className="text-xl font-medium">Intelligence Report</h2>
              <span className="text-xs font-mono text-muted-foreground">{results.length} RECORDS FOUND</span>
            </div>

            {!user ? (
              // Public View: Teaser + Upsell
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 flex flex-col items-center justify-end pb-12">
                  <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-border text-center max-w-md shadow-2xl">
                    <h3 className="text-2xl font-medium text-white mb-2">Unlock Full Report</h3>
                    <p className="text-muted-foreground mb-6">
                      We found {results.length} potential exposures. Sign up to view details and start removing your data.
                    </p>
                    <Link href="/signup" className="block w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Create Free Account
                    </Link>
                    <p className="mt-4 text-xs text-muted-foreground">No credit card required.</p>
                  </div>
                </div>

                {/* Blurred Results */}
                <div className="space-y-4 filter blur-sm select-none pointer-events-none opacity-50">
                  {results.slice(0, 3).map((result, index) => (
                    <div key={index} className="p-6 rounded-lg border border-border bg-[#0a0a0a]">
                      <h3 className="text-lg font-medium mb-2 text-white/90">Hidden Result</h3>
                      <p className="text-sm text-muted-foreground">This content is hidden for privacy reasons.</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Logged In View: Full Results
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="group p-6 rounded-lg border border-transparent hover:border-border hover:bg-[#0a0a0a] transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] tracking-wider font-mono uppercase text-muted-foreground group-hover:text-white transition-colors">
                        {result.source}
                      </span>
                      <a href={result.link} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 text-xs text-white transition-opacity flex items-center gap-1">
                        OPEN <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-white/90 group-hover:text-white">
                      <a href={result.link} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-secondary-foreground transition-colors">{result.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features / Empty State */}
        {!results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl border-t border-border pt-16">
            <Link href="/guides" className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Removal Protocols</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Systematic guides to expunge your data from high-risk brokers.</p>
            </Link>

            <div className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Exposure Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {results
                  ? `Your estimated privacy score is ${Math.max(0, 100 - (results as SearchResult[]).length * 5)}/100 based on visible public records.`
                  : "Quantify your digital risk with our proprietary scoring algorithm."}
              </p>
            </div>

            <div className="group p-6 rounded-xl border border-border/40 hover:border-white/20 hover:bg-[#0a0a0a] transition-all duration-500">
              <div className="w-10 h-10 mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Identity Monitoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Real-time alerts for new mentions across the surface web.</p>
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
