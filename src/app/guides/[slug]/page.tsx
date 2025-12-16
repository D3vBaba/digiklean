import Link from 'next/link';
import { notFound } from 'next/navigation';

// Mock data
const guidesData: Record<string, { title: string; steps: string[] }> = {
    spokeo: {
        title: 'Spokeo Removal Protocol',
        steps: [
            'Navigate to Spokeo.com and execute a search for your identity.',
            'Locate the specific record and access the profile detail view.',
            'Extract the URL from the browser address bar.',
            'Proceed to the Spokeo Opt-out Portal (spokeo.com/optout).',
            'Input the target profile URL and a disposable email address.',
            'Authenticate the removal request via the confirmation email.',
        ],
    },
    whitepages: {
        title: 'Whitepages Opt-out',
        steps: [
            'Access Whitepages.com and query your listing.',
            'Copy the direct URL of the listing to be removed.',
            'Navigate to the Whitepages Opt-out page.',
            'Submit the URL and complete the identity verification process.',
            'Telephonic verification may be required to finalize the request.',
        ],
    },
    facebook: {
        title: 'Facebook Privacy Hardening',
        steps: [
            'Access Settings & Privacy > Settings interface.',
            'Initiate the "Privacy Checkup" module.',
            'Configure "Who can see what you share" to minimal visibility.',
            'Restrict historical and future posts to "Friends" or "Only Me".',
            'Disable search engine indexing in "How people can find you".',
        ],
    },
};

import Header from '@/components/Header';

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const guide = guidesData[slug];

    if (!guide) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
            <Header />

            <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-20">
                <Link href="/guides" className="text-xs font-mono text-muted-foreground hover:text-white transition-colors mb-8 inline-block tracking-wider">&larr; BACK TO PROTOCOLS</Link>

                <h1 className="text-3xl font-medium mb-12 tracking-tight">{guide.title}</h1>

                <div className="space-y-0 border-l border-border ml-4">
                    {guide.steps.map((step, index) => (
                        <div key={index} className="relative pl-8 pb-12 last:pb-0">
                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-background border border-muted-foreground/50 ring-4 ring-background"></div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Step {index + 1}</span>
                                <p className="text-lg text-white/90 font-light leading-relaxed">{step}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-6 bg-[#0a0a0a] border border-border rounded-lg flex gap-4 items-start">
                    <div className="text-emerald-500 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white mb-1">Pro Tip</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Data brokers frequently repopulate databases. Schedule a monthly audit to ensure continued privacy.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
