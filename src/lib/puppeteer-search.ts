import puppeteer from 'puppeteer';
import { SearchResult } from './google-search';

export async function searchGooglePuppeteer(query: string): Promise<SearchResult[]> {
    console.log(`Puppeteer: Starting search for "${query}"`);
    let browser = null;

    try {
        // Launch browser with minimal footprint to run fast and avoid detection
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to Google
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10&hl=en`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Extract results
        const results = await page.evaluate(() => {
            const items: any[] = [];

            // Select standard result blocks
            const elements = document.querySelectorAll('div.g');

            elements.forEach((el) => {
                const titleEl = el.querySelector('h3');
                const linkEl = el.querySelector('a');
                const snippetEl = el.querySelector('div[style*="-webkit-line-clamp"]');

                if (titleEl && linkEl) {
                    const title = titleEl.textContent || '';
                    const link = linkEl.getAttribute('href') || '';

                    // Cleanup snippet (sometimes it's in different containers)
                    let snippet = '';
                    if (snippetEl) {
                        snippet = snippetEl.textContent || '';
                    } else {
                        // Fallback selector for snippet
                        const altSnippet = el.querySelector('div.VwiC3b');
                        if (altSnippet) snippet = altSnippet.textContent || '';
                    }

                    if (title && link.startsWith('http')) {
                        items.push({
                            title,
                            link,
                            snippet,
                            source: new URL(link).hostname.replace('www.', '')
                        });
                    }
                }
            });
            return items;
        });

        console.log(`Puppeteer: Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('Puppeteer search failed:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
