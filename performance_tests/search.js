const { extractDataFromPerformanceTiming } = require('./perfHelper');

async function search(page) {

    await page.waitForSelector('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input')
        await page.click('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input')

        await page.waitFor(3000)
        await page.type('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input', 'the')

        await page.waitFor(2000)
        await page.click('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-group-addon > .ant-btn')

}

module.exports = search;
