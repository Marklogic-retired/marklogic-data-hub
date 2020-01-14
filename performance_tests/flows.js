const { extractDataFromPerformanceTiming } = require('./perfHelper');

const numPages = 10; //number of pages the script will browse
const numFlows = 1; //number of flow facets that will be selected

async function collections(page) {
    const performanceTiming = JSON.parse(
        await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    await page.waitForSelector('#hub-properties')
    await page.click('#hub-properties')

    await page.waitForSelector('[data-cy=flow-facet-block] > div > [data-cy=flow-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
    await page.click('[data-cy=flow-facet-block] > div > [data-cy=flow-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
    await page.waitFor(1000);

    if (numFlows > 1) {
        for (var i = 2; i <= numFlows; i++) {
            try {
                await page.waitForSelector('div > [data-cy=flow-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]', {timeout: 5000})
            }
            catch (error) {
                console.log("Flow child element #" + i + " does not exist.")
                return
            }
            await page.click('div > [data-cy=flow-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
        }
    }

    for (var i = 2; i <= numPages+1; i++) {
        await page.waitFor(1000)
        await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        console.log(extractDataFromPerformanceTiming(performanceTiming,
            'responseEnd',
            'domInteractive',
            'loadEventEnd'))
    }


    return extractDataFromPerformanceTiming(
        performanceTiming,
        'responseEnd',
        'domInteractive',
        'loadEventEnd'
    );
}

module.exports = collections;
