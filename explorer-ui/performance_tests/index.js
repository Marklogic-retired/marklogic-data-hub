const puppeteer = require('puppeteer');
const testPage = require('./' + process.argv.slice(2)[0]);
const prop = require('./config');

(async () => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage()


    const navigationPromise = page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    await page.goto(prop.host, { waitUntil: 'domcontentloaded' });
    process.on('unhandledRejection', error => {
        console.log('unhandledRejection', error.message);
    });

    await navigationPromise

    await page.waitForSelector('.ant-col #username')
    await page.click('.ant-col #username')

    await page.type('.ant-col #username', prop.username)

    await page.waitForSelector('.ant-col #password')
    await page.click('.ant-col #password')

    await page.type('.ant-col #password', prop.password)

    await page.waitForSelector('.ant-row #submit')
    await page.click('.ant-row #submit')

    await page.waitFor(5000)
    await page.goto(prop.host + '/browse', { waitUntil: 'domcontentloaded' })
    await testPage(page);

    //console.log("\n==== performance.getEntries() ====\n");
    console.log(
        await page.evaluate( () =>
            JSON.stringify(performance.getEntries()
                .filter(e => e.entryType === 'resource')
                .map(e => [e.name, e.duration]), null, "  ")
        )
    );

    /* console.log("\n==== performance.toJSON() ====\n");
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
console.log( performanceMetrics.metrics ); */

    await browser.close()
})()
