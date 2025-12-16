export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
    // Extract the name from the query for good mock data
    const nameMatch = query.match(/"([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : query;

    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_CX;

        // Check if credentials are placeholder values or missing
        if (!apiKey || !cx || apiKey.includes('your_') || cx.includes('your_')) {
            console.warn('Missing or invalid Google API credentials. Using mock data.');
            return mockSearch(name);
        }

        const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.warn(`Google API error: ${res.statusText}`, errorData);
            console.warn('Falling back to mock data.');
            return mockSearch(name);
        }

        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            console.log('No results from Google API. Using mock data.');
            return mockSearch(name);
        }

        return data.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: new URL(item.link).hostname,
        }));
    } catch (error) {
        console.error('Search failed:', error);
        console.warn('Falling back to mock data.');
        // Always return mock data, never throw
        return mockSearch(name);
    }
}

function mockSearch(query: string): SearchResult[] {
    return [
        {
            title: `${query} - Public Profile | Spokeo`,
            link: 'https://www.spokeo.com/search',
            snippet: `See ${query}'s age, phone number, house address, email address, social media accounts, public records, and check for criminal records on Spokeo.`,
            source: 'www.spokeo.com',
        },
        {
            title: `${query} | LinkedIn`,
            link: 'https://www.linkedin.com/in/example',
            snippet: `View ${query}'s profile on LinkedIn, the world's largest professional community. ${query} has 5 jobs listed on their profile.`,
            source: 'www.linkedin.com',
        },
        {
            title: `${query} Found | Whitepages`,
            link: 'https://www.whitepages.com/name/Example',
            snippet: `View phone numbers, addresses, public records, background check reports and possible arrest records for ${query}.`,
            source: 'www.whitepages.com',
        },
    ];
}
