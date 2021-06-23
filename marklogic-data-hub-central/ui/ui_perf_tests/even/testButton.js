const {extractDataFromPerformanceTiming} = require("./perfHelper");

async function testButton(page) {
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  await page.waitFor(1000);
  await page.waitForSelector("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");
  await page.click("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");

  await page.waitFor(1000);
  await page.waitForSelector(".ant-collapse > .ant-collapse-item:nth-child(4) > .ant-collapse-header > .anticon > svg");
  await page.click(".ant-collapse > .ant-collapse-item:nth-child(4) > .ant-collapse-header > .anticon > svg");

  await page.waitFor(1000);
  await page.waitForSelector("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Even-stepDetails]");
  await page.click("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Even-stepDetails]");
  await page.waitForSelector("#functionIcon");
  await page.waitForSelector(".ant-table-row-level-1 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");
  await page.click(".ant-table-row-level-1 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");

  await page.waitForSelector(".ant-table-row-level-2 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");
  await page.click(".ant-table-row-level-2 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");

  await page.waitForSelector(".ant-table-row-level-3 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");
  await page.click(".ant-table-row-level-3 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");

  await page.waitForSelector("#mapexpressionprop-50");


  await page.waitForSelector(".ant-table-row #mapexpressionprop-2");
  await page.click(".ant-table-row #mapexpressionprop-2");

  await page.type(".ant-table-row #mapexpressionprop-2", "Test");
  await page.waitForSelector(".mosaic-tile > .mosaic-window > .mosaic-window-body > div > .ant-page-header");
  await page.click(".mosaic-tile > .mosaic-window > .mosaic-window-body > div > .ant-page-header");

  await page.waitForSelector("#successMessage");
  await page.waitForSelector(".mosaic-window-body #Test-btn");
  await page.click(".mosaic-window-body #Test-btn");

  return extractDataFromPerformanceTiming(
    performanceTiming,
    "responseEnd",
    "domInteractive",
    "domContentLoadedEventEnd",
    "domComplete",
    "loadEventEnd"
  );
}

module.exports = testButton;
