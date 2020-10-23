const masteringUtil = require('/com.marklogic.smart-mastering/impl/util.xqy');
const test = require("/test/test-helper.xqy");

const entityTypeIRI = 'http://example.org/NamespacedCustomer-0.0.1/NamespacedCustomer';
const namespacedDocument = cts.doc('/content/NsCustNoMatch.xml');

let assertions = [];
// Test QuickStart format
const quickStartOptions = fn.head(xdmp.toJSON({
    propertyDefs: {
        namespaces: {
          es: 'http://marklogic.com/entity-services',
          exc: 'http://example.org/customer'
        },
        property: [
            { namespace: 'http://example.org/customer', localname: 'name', name: 'name'},
            { path: '/es:envelope/es:instance/exc:NamespacedCustomer/exc:nicknames', name: 'nicknames'}
        ]
    },
    scoring: {
        add: [
            { propertyName: 'name' }
        ],
        expand: [
            { propertyName: 'nicknames' }
        ]
    }
}));
const qsPropertyNamesToValuesFunctions = fn.head(masteringUtil.propertiesToValuesFunctions(quickStartOptions.xpath('/scoring/(add|expand)'), quickStartOptions.xpath('/propertyDefs'), entityTypeIRI, false, null));
const qsPropertyNamesToValuesFunctionsKeys = Object.keys(qsPropertyNamesToValuesFunctions);

assertions = assertions.concat([
    test.assertEqual(2, qsPropertyNamesToValuesFunctionsKeys.length, 'QuickStart property names to values functions should have 2 entries.'),
    test.assertTrue(qsPropertyNamesToValuesFunctionsKeys.includes('name'), 'QuickStart property names to values functions should have an entry for "name".'),
    test.assertEqual(
        namespacedDocument.xpath('/*:envelope/*:instance/*:NamespacedCustomer/*:name'),
        xdmp.apply(qsPropertyNamesToValuesFunctions.name, namespacedDocument),
        'QuickStart "name" function should return expected values.'
    ),
    test.assertTrue(qsPropertyNamesToValuesFunctionsKeys.includes('nicknames'), 'QuickStart property names to values functions should have an entry for "nicknames".'),
    test.assertEqual(
        namespacedDocument.xpath('/*:envelope/*:instance/*:NamespacedCustomer/*:nicknames'),
        xdmp.apply(qsPropertyNamesToValuesFunctions.nicknames, namespacedDocument),
        'QuickStart "nicknames" function should return expected values.'
    )
]);
// Test Hub Central format
const hubCentralOptions = fn.head(xdmp.toJSON({
    matchRulesets: [
        {
            matchRules: [
                {
                    entityPropertyPath: 'name'
                }
            ]
        },
        {
            matchRules: [
                {
                    namespaces: {
                        es: 'http://marklogic.com/entity-services',
                        exc: 'http://example.org/customer'
                    },
                    documentXPath: '/es:envelope/es:instance/exc:NamespacedCustomer/exc:nicknames'
                }
            ]
        }
    ]
}));
const hcPropertyNamesToValuesFunctions = fn.head(masteringUtil.propertiesToValuesFunctions(hubCentralOptions.xpath('/matchRulesets/matchRules'), null, entityTypeIRI, false, null));
const hcPropertyNamesToValuesFunctionsKeys = Object.keys(hcPropertyNamesToValuesFunctions);

assertions = assertions.concat([
    test.assertEqual(2, hcPropertyNamesToValuesFunctionsKeys.length, 'Hub Central property names to values functions should have 2 entries.'),
    test.assertTrue(hcPropertyNamesToValuesFunctionsKeys.includes('name'), 'Hub Central property names to values functions should have an entry for "name".'),
    test.assertEqual(
        namespacedDocument.xpath('/*:envelope/*:instance/*:NamespacedCustomer/*:name'),
        xdmp.apply(hcPropertyNamesToValuesFunctions.name, namespacedDocument),
        'Hub Central "name" function should return expected values.'
    ),
    test.assertTrue(hcPropertyNamesToValuesFunctionsKeys.includes('/es:envelope/es:instance/exc:NamespacedCustomer/exc:nicknames'), 'Hub Central property names to values functions should have an entry for "nicknames".'),
    test.assertEqual(
        namespacedDocument.xpath('/*:envelope/*:instance/*:NamespacedCustomer/*:nicknames'),
        xdmp.apply(hcPropertyNamesToValuesFunctions['/es:envelope/es:instance/exc:NamespacedCustomer/exc:nicknames'], namespacedDocument),
        'Hub Central "/es:envelope/es:instance/exc:NamespacedCustomer/exc:nicknames" function should return expected values.'
    )
]);
assertions;