const search = require('/MarkLogic/appservices/search/search');
const test = require("/test/test-helper.xqy");
const op = require('/MarkLogic/optic');

const queryOptions = '<options xmlns="http://marklogic.com/appservices/search"/>';

function invokeOpticPlanService(schemaName, viewName, limit, structuredQuery, searchText, sortOrder, columns, retries=0) {
    try {
        // Need to clear the modules cache or unrelated error could be thrown. Investigating to file a bugtrack.
        xdmp.moduleCacheClear();
        return fn.head(xdmp.invoke(
            "/data-hub/5/data-services/entitySearch/getOpticPlan.sjs",
            {
                schemaName,
                viewName,
                limit,
                structuredQuery,
                searchText,
                queryOptions,
                sortOrder: xdmp.toJSON(sortOrder).root,
                columns: Sequence.from(columns)
            }
        ));
    } catch (e) {
        if (e.code === 'SQL-TABLEREINDEXING' || e.name === 'SQL-TABLEREINDEXING' && retries < 20) {
            if (retries === 0) {
                xdmp.sleep(1000);
            } else {
                xdmp.sleep(500);
            }
            xdmp.log(`Optic retry: ${retries}`);
            return invokeOpticPlanService(schemaName, viewName, limit, structuredQuery, searchText, sortOrder, columns, ++retries);
        } else {
            throw e;
        }
    }
}

function testValidAscendingPlan() {
    const structuredQuery = xdmp.quote(search.parse(''));
    const plan = invokeOpticPlanService(
        'EntitySearchEntity',
        'EntitySearchEntity', 10,
        structuredQuery, '',
        [{'name':'searchEntityProp1', 'ascending':true}],
        ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
    const result = op.import(plan).result();
    const firstItem = fn.head(result);
    return [
        test.assertEqual('doc1SrchEntyProp1', firstItem['EntitySearchEntity.EntitySearchEntity.searchEntityProp1'], `doc1 property should be first. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc1HyphenatedProp', firstItem['EntitySearchEntity.EntitySearchEntity.hyphenated_property'], `doc1 should have hyphenated property changed to underscore. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`)
    ];
}

function testValidDescendingPlan() {
    const structuredQuery = xdmp.quote(search.parse(''));
    const plan = invokeOpticPlanService(
        'EntitySearchEntity',
        'EntitySearchEntity', 10,
        structuredQuery, '',
        [{'name':'searchEntityProp1', 'ascending':false}],
        ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
    const result = op.import(plan).result();
    const firstItem = fn.head(result);
    return [
        test.assertEqual('doc2SrchEntyProp1', firstItem['EntitySearchEntity.EntitySearchEntity.searchEntityProp1'], `doc2 property should be first. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc2HyphenatedProp', firstItem['EntitySearchEntity.EntitySearchEntity.hyphenated_property'], `doc2 should have hyphenated property changed to underscore. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`)
    ];
}

function testPlanWithBadSortOrder() {
    const structuredQuery = xdmp.quote(search.parse(''));
    let err = null;
    try {
        const plan = invokeOpticPlanService(
            'EntitySearchEntity',
            'EntitySearchEntity', 10,
            structuredQuery, '',
            [{'name':'colDoesNotExist', 'ascending':false}],
            ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
        const result = op.import(plan).result();
    } catch (e) {
        err = e;
    }
    return [
        test.assertTrue(err !== null, `Exception should be thrown for invalid column. ${xdmp.describe(err, Sequence.from([]), Sequence.from([]))}`)
    ];
}

let assertions = []
    .concat(testValidAscendingPlan())
    .concat(testValidDescendingPlan())
    .concat(testPlanWithBadSortOrder());

assertions;