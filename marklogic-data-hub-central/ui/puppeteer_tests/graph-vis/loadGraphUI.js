const {extractDataFromPerformanceTiming} = require("./perfHelper");

async function loadGraphUI(page) {
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  await page.waitFor(1000);
  await page.waitForSelector("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolWrapper] > .modelIcon");


  await Promise.all([
    page.click("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolWrapper] > .modelIcon"),
    page.waitForNavigation({waitUntil: "networkidle2"}),
  ]);
  return extractDataFromPerformanceTiming(
    performanceTiming,
    "responseEnd",
    "domInteractive",
    "domContentLoadedEventEnd",
    "domComplete",
    "loadEventEnd"
  );
}

module.exports = loadGraphUI;
