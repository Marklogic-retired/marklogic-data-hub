const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

function generateTdeWithViewJoin() {
    const input =
        [{
            "info": {
                "title": "Customer",
                "version": "0.0.1",
                "baseUri": "http://example.org/"
            },
            "definitions": {
                "Customer": {
                    "required": [
                        "name"
                    ],
                    "pii": ["shipping"],
                    "primaryKey": "customerId",
                    "properties": {
                        "customerId": {
                            "datatype": "integer",
                            "sortable": true
                        },
                        "billing": {
                            "datatype": "array",
                            "items": {
                                "$ref": "#/definitions/Address"
                            }
                        }
                    }
                },
                "Address": {
                    "required": [ ],
                    "pii": [ ],
                    "elementRangeIndex": [ ],
                    "rangeIndex": [ ],
                    "wordLexicon": [ ],
                    "properties": {
                        "street": {
                            "datatype": "array",
                            "items": {
                                "datatype": "string",
                                "collation": "http://marklogic.com/collation/codepoint"
                            }
                        },
                        "city": {
                            "datatype": "string",
                            "collation": "http://marklogic.com/collation/codepoint"
                        },
                        "state": {
                            "datatype": "string",
                            "collation": "http://marklogic.com/collation/codepoint"
                        },
                        "zip": {
                            "$ref": "#/definitions/Zip"
                        }
                    }
                },
                "Zip": {
                    "required": [ ],
                    "properties": {
                        "fiveDigit": {
                            "datatype": "string",
                            "collation": "http://marklogic.com/collation/codepoint"
                        },
                        "plusFour": {
                            "datatype": "string",
                            "collation": "http://marklogic.com/collation/codepoint"
                        }
                    }
                }
            }
        }];
    const tde = hent.dumpTde(input);
    const tdeDescription = xdmp.describe(tde, Sequence.from([]), Sequence.from([]));
    // testing multi-value join
    const billingJoinTemplate = fn.head(tde.xpath('//*:templates/*:template[*:context = "./billing/Address"]'));
    const billingJoinTemplateExists = fn.exists(billingJoinTemplate)
    const assertions = [
        test.assertTrue(billingJoinTemplateExists, `Billing Join template should exist. TDE: ${tdeDescription}`)
    ];
    if (billingJoinTemplateExists) {
        for (const columnNode of billingJoinTemplate.xpath("*:rows/*:row/*:columns/*:column")) {
            const columnNodeDesc = xdmp.describe(columnNode, Sequence.from([]), Sequence.from([]));
            assertions.push(test.assertTrue(xs.boolean(fn.head(columnNode.xpath('*:nullable'))), `All columns should be nullable. ${columnNodeDesc}`));
            assertions.push(test.assertEqual('ignore', fn.string(fn.head(columnNode.xpath('*:invalid-values'))), `All columns should ignore invalid values ${columnNodeDesc}`));
        }
    }
    // testing single value join
    const zipJoinTemplate = fn.head(tde.xpath('.//*:templates/*:template[*:context = ".//Zip"]'));
    const zipJoinTemplateExists = fn.exists(zipJoinTemplate)
    assertions.push(
        test.assertTrue(zipJoinTemplateExists, `Zip Join template should exist. TDE: ${tdeDescription}`)
    );
    if (zipJoinTemplateExists) {
        for (const columnNode of zipJoinTemplate.xpath("*:rows/*:row/*:columns/*:column")) {
            const columnNodeDesc = xdmp.describe(columnNode, Sequence.from([]), Sequence.from([]));
            assertions.push(test.assertTrue(xs.boolean(fn.head(columnNode.xpath('*:nullable'))), `All columns should be nullable. ${columnNodeDesc}`));
            assertions.push(test.assertEqual('ignore', fn.string(fn.head(columnNode.xpath('*:invalid-values'))), `All columns should ignore invalid values ${columnNodeDesc}`));
        }
    }
    return assertions;

}

[]
    .concat(generateTdeWithViewJoin());