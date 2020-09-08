const search = require('/MarkLogic/appservices/search/search');
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");

const queryOptions = `<options xmlns="http://marklogic.com/appservices/search"/>`;

// This is a simple CSV parser intended for simplifying tests only.
function basicCsvParser(csv) {
    const lines = csv.split('\n').map((line) => fn.normalizeSpace(line)).filter((line) => line !== '');
    const results = [];
    const headers = lines[0].split(',').map((header) => fn.normalizeSpace(header));
    for (const line of lines.slice(1)) {
        const obj = {};
        let properties = line.split(',').map((val) => fn.normalizeSpace(val));
        for (let i = 0; i < properties.length; i++) {
            obj[headers[i]] = properties[i];
        }
        results.push(obj);
    }
    return Sequence.from(results);
}

function invokeExportSearchService(schemaName, viewName, limit, structuredQuery, searchText, sortOrder, columns, retries=0) {
    try {
        return fn.head(xdmp.invoke(
            "/data-hub/5/data-services/entitySearch/exportSearchAsCSV.sjs",
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
            return invokeExportSearchService(schemaName, viewName, limit, structuredQuery, searchText, sortOrder, columns, ++retries);
        } else {
            throw e;
        }
    }
}

function testValidAscendingPlan() {
    const structuredQuery = xdmp.quote(search.parse(''));
    const searchExport = invokeExportSearchService(
        'EntitySearchEntity',
        'EntitySearchEntity', 10,
        structuredQuery, '',
        [{'propertyName':'searchEntityProp1', 'sortDirection':'ascending'}],
        ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
    const result = basicCsvParser(searchExport);
    const firstItem = fn.head(result);
    return [
        test.assertTrue(fn.exists(firstItem), `There should be results returned. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc1SrchEntyProp1', firstItem['EntitySearchEntity.EntitySearchEntity.searchEntityProp1'], `doc1 property should be first. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc1HyphenatedProp', firstItem['EntitySearchEntity.EntitySearchEntity.hyphenated_property'], `doc1 should have hyphenated property changed to underscore. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`)
    ];
}

function testValidDescendingPlan() {
    const structuredQuery = xdmp.quote(search.parse(''));
    const searchExport = invokeExportSearchService(
        'EntitySearchEntity',
        'EntitySearchEntity', 10,
        structuredQuery, '',
        [{'propertyName':'searchEntityProp1', 'sortDirection':'descending'}],
        ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
    const result = basicCsvParser(searchExport);
    const firstItem = fn.head(result);
    return [
        test.assertTrue(fn.exists(firstItem), `There should be results returned. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc2SrchEntyProp1', firstItem['EntitySearchEntity.EntitySearchEntity.searchEntityProp1'], `doc2 property should be first. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`),
        test.assertEqual('doc2HyphenatedProp', firstItem['EntitySearchEntity.EntitySearchEntity.hyphenated_property'], `doc2 should have hyphenated property changed to underscore. ${xdmp.describe(firstItem, Sequence.from([]), Sequence.from([]))}`)
    ];
}

function testPlanWithBadSortOrder() {
    const structuredQuery = xdmp.quote(search.parse(''));
    let err = null;
    try {
        const plan = invokeExportSearchService(
            'EntitySearchEntity',
            'EntitySearchEntity', 10,
            structuredQuery, '',
            [{'propertyName':'colDoesNotExist', 'sortDirection':'descending'}],
            ['searchEntityProp1','searchEntityProp2', 'hyphenated-property']);
    } catch (e) {
        err = e;
    }
    return [
        test.assertTrue(err !== null, `Exception should be thrown for invalid column. ${xdmp.describe(err, Sequence.from([]), Sequence.from([]))}`)
    ];
}

let assertions = [];
// Test with hub-central-entity-exporter
hubTest.runWithRolesAndPrivileges(['hub-central-entity-exporter'], [], function() {
    assertions = []
        .concat(testValidAscendingPlan())
        .concat(testValidDescendingPlan())
        .concat(testPlanWithBadSortOrder());
});

assertions;