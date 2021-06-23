/* eslint-disable */
const puppeteer = require("puppeteer");
const testPage = require("./" + process.argv.slice(2)[0]);
const prop = require("../config");

(async () => {
  const browser = await puppeteer.launch({headless: prop.headless, args: ["--no-sandbox", "--disable-setuid-sandbox"]});
  const page = await browser.newPage();

  const navigationPromise = page.waitForNavigation();

  await page.goto(prop.host);
  process.on("unhandledRejection", error => {
    console.log("unhandledRejection", error.message);
  });

  new Promise((_, reject) => reject(new Error("error"))).
    catch(error => {
      console.log("caught", err.message);
    });

  await page.setViewport({width: 1916, height: 1097});

  await navigationPromise;

  await page.waitForSelector(".ant-col #username");
  await page.click(".ant-col #username");

  await page.type(".ant-col #username", prop.username);

  await page.waitForSelector(".ant-col #password");
  await page.click(".ant-col #password");

  await page.type(".ant-col #password", prop.password);

  await page.waitForSelector(".ant-row #submit");
  await page.click(".ant-row #submit");

  console.log(await testPage(page));

  console.log("\n==== performance.getEntries() ====\n");
  console.log(
    await page.evaluate(() =>
      JSON.stringify(performance.getEntries()
        .filter(e => e.entryType === "resource")
        .map(e => [e.name, e.duration]), null, "  ")
    )
  );

  console.log("\n==== performance.toJSON() ====\n");
  console.log(
    await page.evaluate(() =>
      JSON.stringify(performance.toJSON(), null, "  ")
    )
  );

  console.log("\n==== page.metrics() ====\n");
  const perf = await page.metrics();
  console.log(
    JSON.stringify(perf, null, "  ")
  );

  console.log("\n==== Devtools: Performance.getMetrics ====\n");
  let performanceMetrics = await page._client.send("Performance.getMetrics");
  console.log(performanceMetrics.metrics);
  await browser.close();
})();
