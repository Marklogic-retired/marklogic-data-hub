const puppeteer = require('puppeteer');
const testPage = require('./' + process.argv.slice(2)[0]);

(async () => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage()

    //await page.setCacheEnabled(false)
    const navigationPromise = page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

await page.goto('http://rh7-intel64-perf-4:8080', { waitUntil: 'domcontentloaded' });
process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

new Promise((_, reject) => reject(new Error('error'))).
catch(error => {
    console.log('caught', err.message);
});

await page.setViewport({ width: 1916, height: 997 })

    await navigationPromise


    await page.waitForSelector('.ant-col #username')
    await page.click('.ant-col #username')

    await page.type('.ant-col #username', 'admin')

    await page.waitForSelector('.ant-col #password')
    await page.click('.ant-col #password')

    await page.type('.ant-col #password', 'admin')

    await page.waitForSelector('.ant-row #submit')
    await page.click('.ant-row #submit')

    await page.waitFor(5000)
    await page.goto('http://rh7-intel64-perf-4:8080/browse', { waitUntil: 'domcontentloaded' })
    console.log(await testPage(page));

    console.log("\n==== performance.getEntries() ====\n");
    console.log(
        await page.evaluate( () =>
            JSON.stringify(performance.getEntries(), null, "  ")
            )
        );

    console.log("\n==== performance.toJSON() ====\n");
    console.log(
        await page.evaluate( () =>
            JSON.stringify(performance.toJSON(), null, "  ")
            )
        );

    console.log("\n==== page.metrics() ====\n");
    const perf = await page.metrics();
    console.log(
        JSON.stringify(perf, null, "  ")
    );

    console.log("\n==== Devtools: Performance.getMetrics ====\n");
    let performanceMetrics = await page._client.send('Performance.getMetrics');
    console.log( performanceMetrics.metrics );

    await browser.close()
})()
