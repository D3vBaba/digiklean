
import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Browser launched. Navigating...');
        const page = await browser.newPage();
        await page.goto('https://example.com');
        const title = await page.title();
        console.log('Page Title:', title);

        await browser.close();
        console.log('Success');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
