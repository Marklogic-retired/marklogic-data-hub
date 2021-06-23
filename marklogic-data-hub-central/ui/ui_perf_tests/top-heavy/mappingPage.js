const {extractDataFromPerformanceTiming} = require("./perfHelper");

async function mappingPage(page) {
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  await page.waitFor(1000);
  await page.waitForSelector("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");
  await page.click("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");

  await page.waitFor(1000);
  await page.waitForSelector(".ant-collapse > .ant-collapse-item:nth-child(8) > .ant-collapse-header > .anticon > svg");
  await page.click(".ant-collapse > .ant-collapse-item:nth-child(8) > .ant-collapse-header > .anticon > svg");

  await page.waitFor(1000);
  await page.waitForSelector("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Top-Heavy-stepDetails]");
  await page.click("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Top-Heavy-stepDetails]");
  await page.waitForSelector("#functionIcon");

  return extractDataFromPerformanceTiming(
    performanceTiming,
    "responseEnd",
    "domInteractive",
    "domContentLoadedEventEnd",
    "domComplete",
    "loadEventEnd"
  );
}

module.exports = mappingPage;
