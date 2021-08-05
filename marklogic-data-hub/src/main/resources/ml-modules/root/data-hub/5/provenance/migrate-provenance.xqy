xquery version "1.0-ml";

module namespace migrate-prov = "http://marklogic.com/datahub/migrate-prov";

declare namespace prov = "http://www.w3.org/ns/prov#";

import module namespace config = "http://marklogic.com/data-hub/config" at "/com.marklogic.hub/config.xqy";
import module namespace dh-prov = "http://marklogic.com/data-hub/dh-provenance-services" at "dh-provenance.xqy";

declare private variable $collection as xs:string := "http://marklogic.com/provenance-services/record";
declare private variable $user-role as xs:string := "ps-user";
declare private variable $internal-role as xs:string := "ps-internal";

declare function migrate-provenance($migrate-request as json:object, $endpoint-state as json:object) {
  xdmp:security-assert("http://marklogic.com/data-hub/privileges/delete-provenance", "execute"),
  let $batch-size := fn:head((map:get($migrate-request, "batchSize"), 250))
  let $transform-results := xdmp:invoke-function(function() {
    let $collection-query := cts:collection-query('http://marklogic.com/provenance-services/record')
    let $last-migrated-uri-query := if (map:contains($endpoint-state, "lastUri")) then
      cts:range-query(cts:uri-reference(), '>=', map:get($endpoint-state, "lastUri"))
    else ()
    let $final-query := if (fn:exists($last-migrated-uri-query)) then
      cts:and-query(($collection-query, $last-migrated-uri-query))
    else
      $collection-query
    let $estimate-count := xdmp:estimate(cts:search(fn:collection(),$final-query))
    let $uris := cts:uris((), "limit="||$batch-size, $final-query)
    let $last-uri := fn:head(fn:reverse($uris))
    return (
      if (fn:exists($last-uri) and $estimate-count gt $batch-size) then
        json:object() => map:with("lastUri", $last-uri)
      else (),
      for $uri in $uris
      let $prov-doc := fn:doc($uri)
      let $prov-id := fn:head($prov-doc/prov:document/prov:entity)/@prov:id ! fn:string(.)
      return (
        map:put($cached-prov-documents, $prov-id, $prov-doc),
        convert-record(fn:doc($uri))
      )
    )
  }, map:map()
  => map:with("database", xdmp:database($config:JOB-DATABASE))
  => map:with("update", "false")
  => map:with("commit", "auto")
  => map:with("ignoreAmps", fn:false())
  )
  let $new-endpoint-state := $transform-results[. instance of json:object]
  let $group-prov-by-database :=
    let $map := map:map()
    let $_ :=
      for $prov-doc in $transform-results[. instance of document-node()]
      let $database := $prov-doc/prov:document/prov:entity/database ! fn:string(.)
      return map:put($map, $database, (map:get($map, $database), $prov-doc))
    return $map
  return (
    $new-endpoint-state,
    for $database in map:keys($group-prov-by-database)
    return xdmp:invoke-function(function() {
      for $prov-doc in map:get($group-prov-by-database,$database)
      let $id := fn:head($prov-doc/prov:document/prov:entity)/@prov:id ! fn:string(.)
      return xdmp:document-insert(
          dh-prov:record-uri($id),
          $prov-doc,
          (xdmp:permission($internal-role,"update"), xdmp:permission($user-role,"read")),
          $collection
      )
    },
        map:map()
        => map:with("database", xdmp:database($database))
        => map:with("update", "true")
        => map:with("commit", "auto")
        => map:with("ignoreAmps", fn:false())
    )
  )
};

declare function convert-record($previous-record as document-node(element(prov:document))) {
  let $job-id := $previous-record/prov:document/prov:wasGeneratedBy/prov:activity/@prov:ref
  let $job := get-job($job-id)
  let $step-name := get-step-name($previous-record, $job)
  let $job-step-response := $job/stepResponses/*[stepName = $step-name]
  return
  document {
    element prov:document {
      namespace prov {"http://www.w3.org/ns/prov#"},
      namespace xsi {"http://www.w3.org/2001/XMLSchema-instance"},
      namespace ps  {"http://marklogic.com/provenance-services"},
      namespace dh  {"http://marklogic.com/data-hub/prov#"},
      namespace dhf  {"http://marklogic.com/data-hub/prov#"},
      namespace job  {"http://marklogic.com/data-hub/job#"},
      namespace step  {"http://marklogic.com/data-hub/step#"},
      namespace step  {"http://marklogic.com/data-hub/step#"},
      (: We shouldn't do much other than move fine-grain provenance at this point :)
      if (fn:exists($previous-record/prov:entity/prov:type[fn:string(.) = "dhf:AlteredEntityProperty"])) then
        let $entity := $previous-record/prov:document/prov:entity
        let $type-default-database := default-database-for-step-type($job-step-response/stepDefinitionType)
        let $database := fn:head(($job-step-response/targetDatabase[fn:normalize-space(.)], $type-default-database))
        return (
          element prov:entity {
            element prov:type { "ps:EntityProperty" },
            $entity/* except $entity/prov:type[fn:string(.) = ("ps:Flow", "ps:Entity")],
            element database {$database}
          },
          $previous-record/prov:document/* except $entity
        )
      else
        let $all-entities := $previous-record/prov:document/prov:entity
        let $primary-entity := fn:head($all-entities)
        let $primary-prov-id := $primary-entity/@prov:id ! fn:string(.)
        let $document-uri := $primary-entity/location ! fn:string(.)
        let $other-entities := fn:tail($all-entities)
        let $target-entity-type := $job-step-response/targetEntityType ! fn:string(.)[. ne ""]
        let $prov-id := generate-new-prov-id($primary-prov-id)
        let $database := fn:substring-before($prov-id, ":")
        let $time := fn:substring($prov-id, fn:index-of(fn:string-to-codepoints($prov-id),fn:string-to-codepoints("#"))[fn:last()] + 1)
        let $user-id := $previous-record/prov:document/prov:wasAttributedTo[prov:entity/@prov:id = $primary-prov-id]/prov:agent/@prov:ref ! fn:string(.)
        let $primary-derived-from := $previous-record/prov:document/prov:wasDerivedFrom[prov:entity/@prov:id = $primary-prov-id]
        return (
          element prov:entity {
            attribute prov:id {$prov-id},
            element prov:type {"ps:Document"},
            if (fn:exists($target-entity-type)) then (
              element prov:type {"ps:Entity"},
              extract-entity-information($target-entity-type)
            ) else (),
            element stepName {$step-name},
            element documentURI {$document-uri},
            element database {$database}
          },
          element prov:wasGeneratedBy {
            element prov:entity { attribute prov:ref {$prov-id}},
            element prov:activity { attribute prov:ref {"job:"||$job-id}},
            element prov:time { $time}
          },
          element prov:wasInfluencedBy {
            element prov:influencee { attribute prov:ref {$prov-id}},
            element prov:influencer { attribute prov:ref {"step:"||$step-name}}
          },
          for $derived-from in $primary-derived-from
          let $used-entity-id := $derived-from/prov:usedEntity/@prov:ref
          let $new-used-entity-id := generate-new-prov-id($used-entity-id)
          return
            element prov:wasDerivedFrom {
              element prov:generatedEntity { attribute prov:ref {$prov-id}},
              element prov:usedEntity { attribute prov:ref {$new-used-entity-id}}
            },
          element prov:wasAttributedTo {
            element prov:entity { attribute prov:ref {$prov-id}},
            element prov:agent { attribute prov:ref {"user:"||$user-id}}
          },
          (: Carry forward any fine-grain related provenance with minimal changes :)
          $other-entities,
          ($previous-record/prov:document/* except $all-entities)[fn:not(*/@prov:ref = $primary-prov-id)],
          if (fn:exists($previous-record/prov:document/prov:hadMember)) then
            element prov:hadMember {
              element prov:collection { attribute prov:ref { $prov-id } },
              $previous-record/prov:document/prov:hadMember/prov:entity
            }
          else ()
        )
    }
  }
};

declare function default-database-for-step-type($step-definition-type as xs:string?) {
    if (fn:lower-case($step-definition-type) = "ingestion") then
      $config:STAGING-DATABASE
    else
      $config:FINAL-DATABASE
};

declare function extract-entity-information($target-entity-type as xs:string) {
  let $entity-iri-regex := "^([a-z]+://)?[^/]+/([^/]+)/.*$"
  (: if the IRI doesn't match our standard format, don't bother trying to add entity PROV meta :)
  where fn:matches($target-entity-type, $entity-iri-regex)
  return
    let $model-parts := fn:tokenize(fn:replace($target-entity-type,$entity-iri-regex, "$2"), "-")
    let $entity-type-name := $model-parts[1]
    let $entity-type-version := $model-parts[2]
    where fn:exists($entity-type-name) and fn:exists($entity-type-version)
    return (
      element entityName {$entity-type-name},
      element entityVersion {$entity-type-version}
    )
};

declare variable $cached-jobs as map:map := map:map();

declare function get-job($job-id as xs:string) {
  if (map:contains($cached-jobs, $job-id)) then
    map:get($cached-jobs, $job-id)
  else
    let $job := cts:search(fn:collection("Job"), cts:json-property-value-query("jobId", $job-id))/job
    return (
      map:put($cached-jobs, $job-id, $job),
      $job
    )
};

declare variable $cached-prov-documents as map:map := map:map();

declare function get-prov-document($prov-id as xs:string) {
  if (map:contains($cached-prov-documents, $prov-id)) then
    map:get($cached-prov-documents, $prov-id)
  else
    let $prov-document := fn:doc(dh-prov:record-uri($prov-id))
    return (
      map:put($cached-prov-documents, $prov-id, $prov-document),
      $prov-document
    )
};

declare function generate-new-prov-id($prov-id as xs:string) {
  let $prov-document := get-prov-document($prov-id)
  let $all-entities := $prov-document/prov:document/prov:entity
  let $primary-entity := fn:head($all-entities)
  let $document-uri := $primary-entity/location ! fn:string(.)
  let $job-id := $prov-document/prov:document/prov:wasGeneratedBy/prov:activity/@prov:ref
  let $job := get-job($job-id)
  let $step-name := get-step-name($prov-document, $job)
  let $time := $prov-document/prov:document/prov:wasGeneratedBy/prov:time ! fn:string(.)
  let $job-step-response := $job/stepResponses/*[stepName = $step-name]
  let $type-default-database := default-database-for-step-type($job-step-response/stepDefinitionType)
  let $database := fn:head(($job-step-response/targetDatabase[fn:normalize-space(.)], $type-default-database))
  return $database || ":" || $document-uri || "#" || $time
};

declare function get-step-name($prov-doc, $job) {
  let $step-name := $prov-doc/prov:document/prov:wasInfluencedBy/prov:influencer/@prov:ref ! fn:string(.)
  return if (fn:empty($step-name)) then
    (: This is a special case where ingestion is using wasAttributedTo instead of influencedBy :)
    let $job-step-names := $job/stepResponses/*/stepName
    return $prov-doc/prov:document/prov:wasAssociatedWith/prov:agent/@prov:ref[. = $job-step-names] ! fn:string(.)
  else
    $step-name
};