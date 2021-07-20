xquery version "1.0-ml";

module namespace dhpal = "http://marklogic.com/data-hub/dh-provenance-services/assert-lib";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace prov = "http://www.w3.org/ns/prov#";

declare function verify-new-provenance-record($record as node(), $job-id as xs:string) {
  test:assert-equal(fn:concat("job:", $job-id), xs:string($record//prov:activity/@prov:id/string())),
  test:assert-equal($job-id, xs:string($record//prov:activity/prov:label)),
  test:assert-equal("dh:Job", xs:string($record//prov:activity/prov:type)),
  test:assert-false(fn:empty($record//prov:activity/prov:startTime)),
  test:assert-equal("user:test-data-hub-developer", xs:string($record//prov:agent/@prov:id)),
  test:assert-equal("test-data-hub-developer", xs:string($record//prov:agent/prov:label)),
  test:assert-equal("dh:User", xs:string($record//prov:agent/prov:type)),
  test:assert-equal(fn:concat("job:", $job-id), xs:string($record//prov:wasAssociatedWith/prov:activity/@prov:ref)),
  test:assert-equal("user:test-data-hub-developer", xs:string($record//prov:wasAssociatedWith/prov:agent/@prov:ref))
};

declare function verify-end-time-in-provenance-record($record as node()) {
  test:assert-false(fn:empty($record//prov:activity/prov:endTime))
};

declare function query-provenance-record($job-id as xs:string) as node() {
  let $collection-query := cts:collection-query("http://marklogic.com/provenance-services/record")
  let $prov-query := cts:element-attribute-value-query(fn:QName("http://www.w3.org/ns/prov#", "activity"),
    fn:QName("http://www.w3.org/ns/prov#", "id"), fn:concat("job:",$job-id))
  return fn:head(cts:search(fn:doc(), cts:and-query(($collection-query,$prov-query))))
};
