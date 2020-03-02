const { extractDataFromPerformanceTiming } = require('./perfHelper');
const prop = require('./config');

async function steps(page) {

    await page.waitForSelector('#hub-properties')
    await page.click('#hub-properties')

    await page.waitForSelector('[data-cy=step-facet-block] > div > [data-cy=step-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
    await page.click('[data-cy=step-facet-block] > div > [data-cy=step-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
    await page.waitFor(1000);

    if (prop.numSteps > 1) {
        for (var i = 2; i <= prop.numSteps; i++) {
            try {
                await page.waitForSelector('div > [data-cy=step-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]', {timeout: 5000})
            }
            catch (error) {
                console.log("Steps child element #" + i + " does not exist.")
                return
            }
            await page.click('div > [data-cy=step-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
        }
    }

     await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')
     await page.click('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')

    for (var i = 2; i <= prop.numPages+1; i++) {
        await page.waitFor(1000)
        await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
    }

}

module.exports = steps;
