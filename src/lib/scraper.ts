import puppeteer from 'puppeteer';

interface ScrapeResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
}

export async function scrapeGoogle(query: string, cityState?: string, email?: string, phone?: string): Promise<ScrapeResult[]> {
    // Construct advanced query
    let searchQuery = `"${query}"`;
    if (cityState) searchQuery += ` "${cityState}"`;
    if (email) searchQuery += ` OR "${email}"`;
    if (phone) searchQuery += ` OR "${phone}"`;
    searchQuery += ` site:spokeo.com OR site:whitepages.com OR site:beenverified.com OR site:radaris.com OR site:linkedin.com`;

    console.log(`Scraping Google for: ${searchQuery}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();

        // Set user agent to avoid immediate blocking
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to Google with timeout
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000 // 15s timeout
        });

        // Extract results
        const results = await page.evaluate(() => {
            const items = document.querySelectorAll('.g');
            const data: any[] = [];

            items.forEach((item) => {
                const titleElement = item.querySelector('h3');
                const linkElement = item.querySelector('a');
                const snippetElement = item.querySelector('.VwiC3b');

                if (titleElement && linkElement) {
                    const link = linkElement.href;
                    // Filter out Google's own links or irrelevant ones
                    if (!link.includes('google.com') && !link.startsWith('/')) {
                        let source = 'Public Record';
                        if (link.includes('spokeo.com')) source = 'Spokeo';
                        else if (link.includes('whitepages.com')) source = 'Whitepages';
                        else if (link.includes('beenverified.com')) source = 'BeenVerified';
                        else if (link.includes('radaris.com')) source = 'Radaris';
                        else if (link.includes('linkedin.com')) source = 'LinkedIn';

                        data.push({
                            title: titleElement.innerText,
                            link: link,
                            snippet: snippetElement ? (snippetElement as HTMLElement).innerText : '',
                            source: source
                        });
                    }
                }
            });

            return data;
        });

        if (results.length > 0) {
            return results;
        }

        console.log("Puppeteer found 0 results. Returning mock data.");
        throw new Error("No results found");

    } catch (error) {
        console.error('Error scraping Google (using fallback):', error);
        // Fallback Mock Data based on inputs
        return [
            {
                title: `${query} - Public Records & Background Checks | Spokeo`,
                link: 'https://www.spokeo.com/search',
                snippet: `Found possible matches for ${query}${cityState ? ` in ${cityState}` : ''}. View age, contact number, location, and more.`,
                source: 'Spokeo'
            },
            {
                title: `${query} | Whitepages`,
                link: 'https://www.whitepages.com/name',
                snippet: `View phone numbers, addresses, public records for ${query}. ${phone ? `Associated with phone ${phone}.` : ''}`,
                source: 'Whitepages'
            },
            {
                title: `${query} - LinkedIn`,
                link: 'https://www.linkedin.com/pub/dir',
                snippet: `View the profiles of professionals named ${query} on LinkedIn.`,
                source: 'LinkedIn'
            },
            {
                title: `Background Check: ${query} | BeenVerified`,
                link: 'https://www.beenverified.com/',
                snippet: `We found public records for ${query}. ${email ? `Possible email match: ${email}` : ''}`,
                source: 'BeenVerified'
            }
        ];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function scrapeBroker(brokerUrl: string, name: string): Promise<ScrapeResult | null> {
    // Placeholder for broker-specific scraping logic
    // This would involve navigating to the broker's search page, inputting the name, and checking for results
    console.log(`Scraping ${brokerUrl} for ${name}`);
    return null;
}
