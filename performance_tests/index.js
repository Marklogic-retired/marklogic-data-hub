const puppeteer = require('puppeteer');
const testPage = require('./' + process.argv.slice(2)[0]);

(async () => {
  const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage()

  const navigationPromise = page.waitForNavigation()

  await page.goto('http://rh7-intel64-perf-4:3000');
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

  await page.goto('http://rh7-intel64-perf-4:3000/browse')
  console.log(await testPage(page));
  await browser.close()
})()
