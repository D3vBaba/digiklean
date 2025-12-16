import Link from 'next/link';

const guides = [
    {
        id: 'spokeo',
        title: 'Spokeo Removal Protocol',
        difficulty: 'Easy',
        time: '5 mins',
        category: 'Data Broker',
    },
    {
        id: 'whitepages',
        title: 'Whitepages Opt-out',
        difficulty: 'Medium',
        time: '15 mins',
        category: 'Data Broker',
    },
    {
        id: 'facebook',
        title: 'Facebook Privacy Hardening',
        difficulty: 'Easy',
        time: '10 mins',
        category: 'Social Media',
    },
];

import Header from '@/components/Header';

export default function GuidesPage() {
    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-20">
                <div className="mb-16">
                    <Link href="/" className="text-xs font-mono text-muted-foreground hover:text-white transition-colors mb-6 inline-block tracking-wider">&larr; RETURN TO DASHBOARD</Link>
                    <h1 className="text-4xl font-medium mb-4 tracking-tight">Removal Protocols</h1>
                    <p className="text-xl text-muted-foreground font-light">
                        Execute these step-by-step procedures to eliminate your personal data from high-risk aggregators.
                    </p>
                </div>

                <div className="grid gap-4">
                    {guides.map((guide) => (
                        <Link key={guide.id} href={`/guides/${guide.id}`} className="group relative p-6 rounded-lg border border-border hover:border-white/30 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all duration-300 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">{guide.category}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${guide.difficulty === 'Easy' ? 'bg-emerald-500' : guide.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                </div>
                                <h2 className="text-xl font-medium text-white/90 group-hover:text-white transition-colors">{guide.title}</h2>
                                <p className="text-sm text-muted-foreground mt-1">Estimated time: {guide.time}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-white group-hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
