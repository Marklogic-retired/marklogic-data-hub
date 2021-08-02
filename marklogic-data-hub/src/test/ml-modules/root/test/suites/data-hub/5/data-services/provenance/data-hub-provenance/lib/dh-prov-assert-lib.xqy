xquery version "1.0-ml";

module namespace dhpal = "http://marklogic.com/data-hub/dh-provenance-services/assert-lib";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace prov = "http://www.w3.org/ns/prov#";

declare function verify-new-provenance-record($record as node(), $job-id as xs:string) {

  let $current-user := xdmp:get-current-user()
  return (
    test:assert-equal(fn:concat("job:", $job-id), xs:string($record//prov:activity/@prov:id/string())),
    test:assert-equal($job-id, xs:string($record//prov:activity/prov:label)),
    test:assert-equal("dh:Job", xs:string($record//prov:activity/prov:type)),
    test:assert-false(fn:empty($record//prov:activity/prov:startTime)),
    test:assert-equal(fn:concat("user:", $current-user), xs:string($record//prov:agent/@prov:id)),
    test:assert-equal($current-user, xs:string($record//prov:agent/prov:label)),
    test:assert-equal("dh:User", xs:string($record//prov:agent/prov:type)),
    test:assert-equal(fn:concat("job:", $job-id), xs:string($record//prov:wasAssociatedWith/prov:activity/@prov:ref)),
    test:assert-equal(fn:concat("user:", $current-user), xs:string($record//prov:wasAssociatedWith/prov:agent/@prov:ref))
  )
};

declare function verify-step-and-entity-in-provenance-record($record as node(), $job-id as xs:string, $step-name as xs:string,
  $target-entity-type as xs:string) {

  let $entity-name := fn:tokenize($target-entity-type, "/")[last()]
  return (
    test:assert-true($record//prov:entity/@prov:id=fn:concat("step:", $step-name)),
    test:assert-equal("dh:Step", xs:string($record//prov:entity[@prov:id=fn:concat("step:", $step-name)]/prov:type)),
    test:assert-equal($step-name, xs:string($record//prov:entity[@prov:id=fn:concat("step:", $step-name)]/prov:label)),
    test:assert-true($record//prov:used/prov:activity/@prov:ref=fn:concat("job:", $job-id)),
    test:assert-true($record//prov:used/prov:entity/@prov:ref=$step-name),

    test:assert-true($record//prov:entity/@prov:id=$target-entity-type),
    test:assert-equal("dh:EntityType", xs:string($record//prov:entity[@prov:id=$target-entity-type]/prov:type)),
    test:assert-equal($entity-name, xs:string($record//prov:entity[@prov:id=$target-entity-type]/prov:label)),
    test:assert-true($record//prov:used/prov:activity/@prov:ref=fn:concat("job:", $job-id)),
    test:assert-true($record//prov:used/prov:entity/@prov:ref=$target-entity-type),
    test:assert-equal("dh:TargetEntityType", xs:string($record//prov:used/prov:type))
  )
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
