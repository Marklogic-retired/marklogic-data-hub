const { extractDataFromPerformanceTiming } = require('./perfHelper');
const prop = require('./config');

var queryArray = ['the', 'a', 'washington', 'new york', 'louisiana', 'michigan, lansing', 'virginia', 'san francisco', 'new jersey', 'alabama', 'oregon, portland', 'apache', 'toscana', '2018-10-15', 'litespeed', 'json', 'sucuri', 'california', 'nginx', 'tengine', 'toscana, arezzo' ]

async function queries(page) {

    const selector = '[class*=search-bar_searchInput]'
    const elementHandle = await page.$(selector)

    for (var i = 0; i < queryArray.length; i++) {
        var j = 0;

        await page.waitForSelector(selector)
        await page.click(selector)

        await elementHandle.click({clickCount: 3});
        await elementHandle.press('Backspace');

        await page.waitFor(2000)
        await page.type(selector, queryArray[i])

        await page.waitFor(2000)
        await page.click('[class*=search-bar_searchInput] > .ant-input-search > .ant-input-wrapper > .ant-input-group-addon > .ant-btn')

        for (var j = 1; j < prop.numQueryPages; j++) {
            try {
                await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + j + ' > a', {timeout: 5000})
            }
            catch(error) {
                console.log("Page child element #" + j + " does not exist.")
                return
            }
            await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + j + ' > a')
            await page.waitFor(2000)

        }

    }
}

module.exports = queries;
