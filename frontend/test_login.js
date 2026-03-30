const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
        if(msg.type() === 'error' && msg.args().length) {
            msg.args()[0].jsonValue().then(v => {
                if (v && v.message) console.log('ERROR TRACE:', v.message, v.stack || '');
            }).catch(() => {});
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE ERROR STR:', err.toString());
        console.log('PAGE ERROR STACK:', err.stack);
    });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    console.log('Clicking the demo button...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
        if (demoBtn) {
            demoBtn.click();
        } else {
            console.log('DEMO BUTTON NOT FOUND');
        }
    });

    // Wait 5 seconds to let actions complete
    console.log('Waiting 5s for transition/crash...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Current URL:', page.url());
    console.log('Closing browser...');
    await browser.close();
})();
