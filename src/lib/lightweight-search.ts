import * as cheerio from 'cheerio';
import { SearchResult } from './google-search';

// Use DuckDuckGo HTML version which is easier to scrape and doesn't require JS
const DDG_URL = 'https://html.duckduckgo.com/html/';

export async function searchLightweight(query: string): Promise<SearchResult[]> {
    console.log(`Lightweight Search: Starting search for "${query}"`);

    try {
        const formData = new URLSearchParams();
        formData.append('q', query);

        const response = await fetch(DDG_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`Lightweight search failed: ${response.status} ${response.statusText}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const results: SearchResult[] = [];

        // Parse DuckDuckGo HTML results
        $('.result').each((i, el) => {
            if (i >= 15) return; // Limit results

            const title = $(el).find('.result__title a').text().trim();
            const link = $(el).find('.result__url').attr('href') || $(el).find('.result__title a').attr('href');
            const snippet = $(el).find('.result__snippet').text().trim();

            // DDG sometimes wraps urls in /l/?kh=-1&uddg=...
            let cleanLink = link || '';
            if (cleanLink.startsWith('//duckduckgo.com/l/')) {
                const match = cleanLink.match(/uddg=([^&]+)/);
                if (match && match[1]) {
                    cleanLink = decodeURIComponent(match[1]);
                }
            }

            if (title && cleanLink && cleanLink.startsWith('http')) {
                results.push({
                    title,
                    link: cleanLink,
                    snippet,
                    source: new URL(cleanLink).hostname.replace('www.', '')
                });
            }
        });

        console.log(`Lightweight Search: Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('Lightweight search failed:', error);
        return [];
    }
}
