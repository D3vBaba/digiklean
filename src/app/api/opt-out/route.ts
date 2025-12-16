import { NextResponse } from 'next/server';
import { processOptOut } from '@/lib/opt-out';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { broker, url, userData } = body;

        if (!broker || !url || !userData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`API: Processing opt-out for ${broker}...`);

        // Trigger the Puppeteer script
        const result = await processOptOut({ broker, url, userData });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Opt-Out API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
