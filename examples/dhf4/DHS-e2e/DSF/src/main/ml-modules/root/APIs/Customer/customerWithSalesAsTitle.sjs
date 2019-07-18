'use strict';
// declareUpdate(); // Note: uncomment if changing the database state

var title; // instance of xs.string

function getCustomerWithSalesAsTitle(contactTitle) {
        var wordMatch = Sequence.from(cts.elementWordMatch(xs.QName("ContactTitle"), "*"+contactTitle+"*", ["collation=http://marklogic.com/collation/codepoint", "case-insensitive"])).toArray();
        return cts.search(cts.orQuery([cts.elementWordQuery(xs.QName('ContactTitle'), wordMatch),
                        cts.jsonPropertyWordQuery('ContactTitle', wordMatch)
                       ]))
}


// TODO:  produce the DocumentNode output from the input variables
var res = getCustomerWithSalesAsTitle(title)
res
