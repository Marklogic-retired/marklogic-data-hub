const { extractDataFromPerformanceTiming } = require('./perfHelper');
const prop = require('./config');

async function allFacets(page) {

    await page.waitForSelector('#hub-properties > .ant-collapse-header')
    await page.click('#hub-properties > .ant-collapse-header')

    // COLLECTIONS
    await page.waitForSelector('[data-cy=collection-facet-block] > div > [data-cy=collection-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=collection-facet-item-checkbox]')
    await page.click('[data-cy=collection-facet-block] > div > [data-cy=collection-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=collection-facet-item-checkbox]')
    await page.waitFor(1000);

    if (prop.numCollections > 1) {
        for (var i = 2; i <= prop.numCollections; i++) {
            try{
                await page.waitForSelector('div > [data-cy=collection-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=collection-facet-item-checkbox]')
            }
            catch (error) {
                console.log("Collection child element #" + i + " does not exist.")
                return
            }
            await page.click('div > [data-cy=collection-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=collection-facet-item-checkbox]')
        }
    }

    await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')
    await page.click('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')
    // FLOWS

    await page.waitFor(1000);
    await page.waitForSelector('[data-cy=flow-facet-block] > div > [data-cy=flow-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
    await page.click('[data-cy=flow-facet-block] > div > [data-cy=flow-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')

    if (prop.numFlows > 1) {
        for (var i = 2; i <= prop.numFlows; i++) {
            try {
                await page.waitForSelector('div > [data-cy=flow-facet-item]:nth-child(' + i + ') > [class*=facet_value > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
            }
            catch (error) {
                console.log("Flow child element #" + i + " does not exist.")
                return
            }
            await page.click('div > [data-cy=flow-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=flow-facet-item-checkbox]')
        }
    }

    await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')
    await page.click('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')

    //STEPS
    await page.waitFor(1000);
    await page.waitForSelector('[data-cy=step-facet-block] > div > [data-cy=step-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
    await page.click('[data-cy=step-facet-block] > div > [data-cy=step-facet-item] > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
    if (prop.numSteps > 1) {
        for (var i = 2; i <= prop.numSteps; i++) {
            try {
                await page.waitForSelector('div > [data-cy=step-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
            }
            catch (error) {
                console.log("Step child element #" + i + " does not exist.")
                return
            }
            await page.click('div > [data-cy=step-facet-item]:nth-child(' + i + ') > [class*=facet_value] > .ant-checkbox > [data-cy=step-facet-item-checkbox]')
        }
    }

    await page.waitForSelector('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')
    await page.click('.ant-collapse-content > .ant-collapse-content-box > [class*=facet_facetContainer] > [class*=facet_applyButtonContainer] > .ant-btn')

    // BROWSE DOCS
    for (var i = 2; i <= prop.numPages+1; i++) {
        await page.waitFor(1000)
        try {
            await page.waitForSelector('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
        }
        catch (error){
            console.log("Page child element #" + i + " does not exist.")
            return
        }
        await page.click('[class*=Browse_searchBar] > [class*=search-pagination_searchPaginationContainer]:nth-child(3) > .ant-pagination > .ant-pagination-item-' + i + ' > a')
    }

}

module.exports = allFacets;
