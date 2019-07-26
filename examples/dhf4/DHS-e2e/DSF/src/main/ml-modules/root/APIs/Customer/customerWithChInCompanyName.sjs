'use strict';
// declareUpdate(); // Note: uncomment if changing the database state

var keyword; // instance of xs.string

function getCustomerWithChInCompanyName(key) {
        var wordMatch = Sequence.from(cts.elementWordMatch(xs.QName("CompanyName"), "*"+key+"*", ["collation=http://marklogic.com/collation/codepoint", "case-insensitive"])).toArray();
        return cts.search(cts.jsonPropertyWordQuery('CompanyName', wordMatch))
}


// TODO:  produce the DocumentNode output from the input variables
var res = getCustomerWithChInCompanyName(keyword)
res

