xquery version "1.0-ml";

import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";
import module namespace tf = "http://example.com/test-flows-lib" at "/lib/test-flows-lib.xqy";
import module namespace tcfg = "http://example.com/test-config" at "/lib/test-config.xqy";

declare namespace error = "http://marklogic.com/xdmp/error";

xdmp:log("Harmonize Employee Suite Teardown STARTING....")

,
try {

	(:remove all test content from the STAGING db :)
	let $uris  := cts:uri-match($cfg:STAGING-PREFIX || "*",(), $tcfg:UNIT-TEST-COLLECTION-QUERY)
	let $_ := xdmp:log(fn:concat("Harmonize Employee Suite Teardown : about to remove ",fn:count($uris)," documents from STAGING" ) )
	for $i at $count in $uris
	let $_ := xdmp:log(fn:concat("Harmonize Employee Suite Teardown : removing test file ",$count," uri = ", $i) )
	return xdmp:document-delete($i)

	,
	(:clean up FINAL-TEST:)
	let $cleanup := function() {

		let $result :=
			for $i at $count in cts:uris()[fn:not(fn:contains(.,"entities"))]
			let $_ := xdmp:log(fn:concat("Harmonize Employee Suite Teardown : removing test file ",$count," uri = ", $i) )
			return (xdmp:document-delete($i),1)
		return xdmp:log(fn:concat("Harmonize Employee Suite Teardown: removed ",fn:count($result), " test files from db ",xdmp:database-name(xdmp:database()) ) )

	}
	return
		xdmp:invoke-function(
				(:$cleanup,:)
	            function () {()},
				<options xmlns="xdmp:eval">
					<database>{xdmp:database($cfg:FINAL-DB)}</database>
				</options>
		)


} catch ($ex) {
	  xdmp:log(fn:concat("Harmonize Employee teardown failed ", $ex/error:format-string/text() ), "error")

}

,

xdmp:log("Harmonize Employee Suite Teardown ENDING....")
