const { extractDataFromPerformanceTiming } = require('./perfHelper');

const numPages = 10;

async function createdOn(page) {

    await page.waitForSelector('#hub-properties > .ant-collapse-header')
        await page.click('#hub-properties > .ant-collapse-header')
        await page.waitFor(1000)

        // Open Calendar
        await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > #range-picker > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)')
        await page.click('.ant-collapse-content > .ant-collapse-content-box > #range-picker > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)')

        // Pick Start Date
        await page.waitForSelector('.ant-calendar-range-left > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(2) > .ant-calendar-date')
        await page.click('.ant-calendar-range-left > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(2) > .ant-calendar-date')

        // Pick End Date
        await page.waitForSelector('.ant-calendar-range-right > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(3) > .ant-calendar-date')
        await page.click('.ant-calendar-range-right > div > .ant-calendar-body > .ant-calendar-table > .ant-calendar-tbody > tr:nth-child(1) > .ant-calendar-cell:nth-child(3) > .ant-calendar-date')

        // Browse docs
        for (var i = 2; i <= numPages+1; i++) {
            await page.waitFor(1000)
                await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
                await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        }
}

module.exports = createdOn;
