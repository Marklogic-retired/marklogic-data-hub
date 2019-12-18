const { extractDataFromPerformanceTiming } = require('./perfHelper');

async function createdOn(page) {

  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  await page.waitForSelector('#hub-properties > .ant-collapse-header')
  await page.click('#hub-properties > .ant-collapse-header')

  await page.wait(1000)
  await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > #range-picker > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)')
  await page.click('.ant-collapse-content > .ant-collapse-content-box > #range-picker > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)')

  await page.waitForSelector('.ant-calendar-range-left > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(2) > .ant-calendar-date')
  await page.click('.ant-calendar-range-left > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(2) > .ant-calendar-date')

  await page.waitForSelector('.ant-calendar-table > .ant-calendar-tbody > .ant-calendar-active-week > .ant-calendar-selected-end-date > .ant-calendar-date')
  await page.click('.ant-calendar-table > .ant-calendar-tbody > .ant-calendar-active-week > .ant-calendar-selected-end-date > .ant-calendar-date')

    return extractDataFromPerformanceTiming(
    performanceTiming,
    'responseEnd',
    'domInteractive',
    'domContentLoadedEventEnd',
    'domComplete',
    'loadEventEnd'
  );
}

module.exports = createdOn;
