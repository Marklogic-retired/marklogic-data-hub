const { extractDataFromPerformanceTiming } = require('./perfHelper');

const numPages = 10;

async function browseDocs(page) {

    for (var i = 2; i < numPages; i++) {
        try {
            await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a', {timeout: 5000})
        }
        catch(error) {
            console.log("Page child element #" + i + " does not exist.")
            return
        }
        await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        await page.waitFor(1000)
    }
}

module.exports = browseDocs;
