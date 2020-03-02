const { extractDataFromPerformanceTiming } = require('./perfHelper');

async function search(page) {

    await page.waitForSelector('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input')
        await Promise.all ([
            page.waitForNavigation({waitUntil: 'networkidle0'}),
            page.click('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input'),
            page.type('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-search > .ant-input', 'the')
        ]);
        await page.click('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-group-addon > .ant-btn')
}

module.exports = search;
