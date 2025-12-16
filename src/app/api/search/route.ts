import { NextResponse } from 'next/server';
import { searchGoogle } from '@/lib/google-search';

export async function POST(request: Request) {
    try {
        const { query, cityState, email, phone } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        console.log(`API: Searching for "${query}" (City: ${cityState}, Email: ${email}, Phone: ${phone})`);

        // Construct advanced query for data broker sites
        let searchQuery = `"${query}"`;
        if (cityState) searchQuery += ` "${cityState}"`;
        if (email) searchQuery += ` OR "${email}"`;
        if (phone) searchQuery += ` OR "${phone}"`;
        searchQuery += ` (site:spokeo.com OR site:whitepages.com OR site:beenverified.com OR site:radaris.com OR site:linkedin.com)`;

        // Use Google Custom Search API instead of scraper
        const results = await searchGoogle(searchQuery);

        return NextResponse.json({ items: results });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
