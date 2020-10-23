xquery version "1.0-ml";

(:~
 : Implementation library for merging functions. If you're building an
 : application, include com.marklogic.smart-mastering/merging.xqy, not this
 : file.
 :
 : The merging process draws values from source documents, applies an algorithm
 : to the values for each property, and creates a new merged document. The
 : source of each value gets tracked in a sidecar document that can be used to
 : provide auditing/history information. A merge document records the documents
 : that were used to generate it.
 :
 : Algorithms used to merge values can be provided by this library or custom
 : code written as part of an application. This library provides a "standard"
 : algorithm that provides a few simple ways to choose values from source
 : documents.
 :
 : Note that the process of getting values for the merged document will
 : typically be a selection among the values available in the source documents,
 : but nothing prevents an algorithm from combining or otherwise modifying
 : source document values. (Value source tracking might be a little more
 : complex.)
 :)
module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace auditing = "http://marklogic.com/smart-mastering/auditing"
  at "../../auditing/base.xqy";
import module namespace coll-impl = "http://marklogic.com/smart-mastering/survivorship/collections"
  at "collections.xqy";
import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";
import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../../function-extension/base.xqy";
import module namespace history = "http://marklogic.com/smart-mastering/auditing/history"
  at "../../auditing/history.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at  "standard.xqy",
      "options.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace prop-def = "http://marklogic.com/smart-mastering/survivorship/property-definition"
  at "property-definition.xqy";
import module namespace sem = "http://marklogic.com/semantics"
  at "/MarkLogic/semantics.xqy";
import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";
import module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl"
  at "/com.marklogic.smart-mastering/impl/util.xqy";
import module namespace mem = "http://maxdewpoint.blogspot.com/memory-operations/functional"
  at "/mlpm_modules/XQuery-XML-Memory-Operations/memory-operations-functional.xqy";
import module namespace helper = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare namespace merging = "http://marklogic.com/smart-mastering/merging";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace es = "http://marklogic.com/entity-services";
declare namespace prov = "http://www.w3.org/ns/prov#";
declare namespace host = "http://marklogic.com/xdmp/status/host";
declare namespace xsl = "http://www.w3.org/1999/XSL/Transform";

declare option xdmp:mapping "false";

(:
 : Directory in which merged documents are created.
 :)
declare variable $MERGED-DIR := "/com.marklogic.smart-mastering/merged/";

(:
 : Check whether all the URIs are already write-locked. If they are, they have been updated.
 : ASSUMPTION: If a content doc has been updated, it's because it was archived, which means that it was already merged.
 : Therefore, we don't want it to get merged into something else.
 : Scenario this is here to prevent is doing match-and-merge on multiple documents within the same transaction:
 : - docA -- docB is a good match, archive docA and docB; create docAB
 : - docB -- docA is a good match. docA and docB are already archived, don't create docBA.
 :
 : @param $uris list of URIs to be checked
 : @return fn:true() if this transaction already has write locks on ALL of the URIs
 :)
declare function merge-impl:all-merged($uris as xs:string*) as xs:boolean
{
  every $uri in $uris
  satisfies merge-impl:is-uri-locked($uri)
};

declare function merge-impl:build-merge-uri($id as xs:string, $format as xs:string)
{
  $MERGED-DIR || $id || "." || $format
};

(:~
 : Merge the documents as specified by the merge options and update the
 : involved files in the database.
 : @param $uris URIs of the source documents that will be merged
 : @param $merge-options specification of how options are to be merged
 : @return in-memory copy of the merge result
 :)
declare function merge-impl:save-merge-models-by-uri(
  $uris as xs:string*,
  $merge-options as item()?
)
{
  merge-impl:save-merge-models-by-uri($uris, $merge-options, sem:uuid-string())
};

(:~
 : Merge the documents as specified by the merge options and update the
 : involved files in the database.
 : @param $uris URIs of the source documents that will be merged
 : @param $merge-options specification of how options are to be merged
 : @param $id  an id that will uniquely identify this merged document
 : @return in-memory copy of the merge result
 :)
declare function merge-impl:save-merge-models-by-uri(
  $uris as xs:string*,
  $merge-options as item()?,
  $id as xs:string
)
{
  tel:increment(),
  if (merge-impl:all-merged($uris)) then
    xdmp:log("Skipping merge because all uris to be merged (" || fn:string-join($uris, ", ") ||
      ") were already write-locked", "debug")
  else
    let $start-elapsed := xdmp:elapsed-time()
    let $merge-options :=
      if ($merge-options instance of object-node()) then
        merge-impl:options-from-json($merge-options)
      else
        $merge-options
    let $merge-write-object :=  merge-impl:build-merge-models-by-uri($uris, $merge-options, $id)
    let $merged-document := $merge-write-object => map:get("value")
    let $merge-uri := $merge-write-object => map:get("uri")
    let $audit-trace := $merge-write-object => map:get("audit-trace")
    return (
      $merged-document,
      xdmp:document-insert(
        $audit-trace => map:get("uri"),
        $audit-trace => map:get("value"),
        $audit-trace => map:get("context") => map:get("permissions"),
        $audit-trace => map:get("context") => map:get("collections")
      ),
      let $on-merge-options := $merge-options/merging:algorithms/merging:collections/merging:on-merge
      let $distinct-uris := fn:distinct-values(($uris, $uris))[fn:doc-available(.)][fn:not(. = $merge-uri)]
      let $_archive := $distinct-uris ! merge-impl:archive-document(., $merge-options)
      return
        xdmp:document-insert(
          $merge-uri,
          $merged-document,
          let $perms := (
            xdmp:default-permissions(),
            fn:map(xdmp:document-get-permissions#1, $uris)
          )
          return if (fn:exists($perms)) then $perms else config:get-default-data-hub-permissions(),
          coll-impl:on-merge(map:new((
            for $uri in $distinct-uris
            return map:entry($uri, xdmp:document-get-collections($uri)[fn:not(. = $const:ARCHIVED-COLL)])
          )),$on-merge-options)
        ),
        if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
          xdmp:trace($const:TRACE-PERFORMANCE, "merge-impl:save-merge-models-by-uri: " || (xdmp:elapsed-time() - $start-elapsed))
        else ()
    )
};

declare function merge-impl:construct-type($name as xs:QName, $path as xs:string?, $ns-map as map:map?)
{
  if (fn:exists($path)) then
    fn:string-join(
      xdmp:with-namespaces(
        $ns-map,
        for $path-part in fn:tokenize($path, "/")[. != ""]
        return
          if ($path-part castable as xs:QName) then
            xdmp:key-from-QName(xs:QName($path-part))
          else
            $path-part
      ),
      "/"
    )
  else
    fn:string($name)
};

(:
 : Generate attachments for the audit document.
 : @param $merge-uri  the URI of the new merged document
 : @param $final-properties  the merged properties, with their source info
 : @return
 :)
declare function merge-impl:generate-audit-attachments(
  $merge-uri as xs:string,
  $provenance-details as map:map
) as item()*
{
  xdmp:trace($const:TRACE-MERGE-RESULTS, "Provenance details: " || xdmp:to-json-string($provenance-details)),
  let $generated-entity-id := $auditing:sm-prefix ||$merge-uri
  let $generated-entity-xml :=
    element prov:generatedEntity {
      attribute prov:ref { $generated-entity-id }
    }
  let $agent-ids-map := map:map()
  let $property-related-prov :=
    for $source in map:keys($provenance-details)
    let $source-info := map:get($provenance-details, $source)
    for $property in map:keys($source-info)
    let $prop-info := map:get($source-info, $property)
    let $algorithm-info := map:get($prop-info, "algorithm")
    let $algorithm-agent := fn:distinct-values($algorithm-info ! ("algorithm:"||./name||";options:"||./optionsReference))
    let $_add-agent-id := map:put($agent-ids-map, $algorithm-agent, fn:true())
    let $influencer-xml := element prov:influencer { attribute prov:ref { $algorithm-agent }}
    let $entity-nodes := (
      element prov:type {$property},
      element prov:label {$source || ":" || $property},
      element prov:location {$source})
    for $value in json:array-values(map:get($prop-info, "value"))
    (: Due to how JSON is constructed, we can't rely on the node having a node name.
        Pull the node name from the name entry of the property map.
    :)
    let $hash := xdmp:sha512($value)
    let $used-entity-id := $auditing:sm-prefix || $source || $property || $hash
    return (
      element prov:entity {
        attribute prov:id {$used-entity-id},
        $entity-nodes,
        element prov:value { $value }
      },
      element prov:wasDerivedFrom {
        $generated-entity-xml,
        element prov:usedEntity {
          attribute prov:ref { $used-entity-id }
        }
      },
      element prov:wasInfluencedBy {
        element prov:influencee { attribute prov:ref { $used-entity-id }},
        $influencer-xml
      }
    )
  let $prop-prov-entities := $property-related-prov[. instance of element(prov:entity)]
  let $other-prop-prov := $property-related-prov except $prop-prov-entities
  return (
    element prov:hadMember {
      element prov:collection { attribute prov:ref { $generated-entity-id } },
      $prop-prov-entities
    },
    $other-prop-prov,
    for $agent-id in map:keys($agent-ids-map)
    return element prov:softwareAgent {
      attribute prov:id {$agent-id},
      element prov:label {fn:substring-before(fn:substring-after($agent-id,"algorithm:"), ";")},
      element prov:location {fn:substring-after($agent-id,"options:")}
    }
  )
};

(:
 : Generate property details for the provenance document.
 : @param $final-properties  the merged properties, with their source info
 : @return
 :)
declare function merge-impl:generate-provenance-details(
  $final-properties
) as item()*
{
  map:new((
    let $properties-by-doc-uri := map:map()
    let $_populate-map :=
      for $final-prop in $final-properties,
        $doc-uri in map:get($final-prop, "sources")/documentUri
      return
        map:put($properties-by-doc-uri, $doc-uri, (map:get($properties-by-doc-uri, $doc-uri),$final-prop))
    for $source in map:keys($properties-by-doc-uri)
    return
      map:entry(
        $source,
        map:new(
          for $prop in map:get($properties-by-doc-uri, $source)
          (: Due to how JSON is constructed, we can't rely on the node having a node name.
              Pull the node name from the name entry of the property map.
          :)
          let $type := merge-impl:construct-type(map:get($prop, "name"), map:get($prop, "path"), map:get($prop, "nsMap"))
          return map:entry($type,
            map:new((
              map:entry(
                "value",
                json:to-array(
                  for $value in map:get($prop, "values")
                  let $value-text := history:normalize-value-for-tracing($value)
                  return $value-text
                )
              ),
              map:entry("destination", $type),
              map:entry("algorithm", map:get($prop, "algorithm") union ())
          ))
        )
      )
    )
  ))
};

(:
 : Unmerge a merged document, un-archive the source documents. Create a match
 : block to make sure these documents don't get auto-merged again.
 : @param $merged-doc-uri  The URI of the document to be unmerged
 : @return ()
 :)
declare function merge-impl:rollback-merge(
  $merged-doc-uri as xs:string
) as xs:string*
{
  merge-impl:rollback-merge($merged-doc-uri, fn:true(), fn:true())
};

(:
 : Unmerge a merged document, un-archive the source documents. Create a match
 : block to make sure these documents don't get auto-merged again.
 : @param $merged-doc-uri  The URI of the document to be unmerged
 : @param $retain-rollback-info  if true, then the merged document will be
 :                               added to the archive collection; otherwise,
 :                               the merged document and its audit records will
 :                               be deleted
 : @param $block-future-merges   if true, then the future matches between documents
 :                               will be blocked; otherwise, the documents could match
 :                               on next process-match-and-merge
 : @return restored URIs
 :)
declare function merge-impl:rollback-merge(
  $merged-doc-uri as xs:string,
  $retain-rollback-info as xs:boolean,
  $block-future-merges as xs:boolean
) as xs:string*
{
  let $merge-doc-headers := fn:doc($merged-doc-uri)/*:envelope/*:headers
  let $merge-options-ref := $merge-doc-headers/*:merge-options/*:value ! fn:string(.)
  let $merge-options := merge-impl:options-ref-to-options-node($merge-options-ref)
  let $latest-auditing-receipt-for-doc :=
    fn:head(
      for $auditing-doc in auditing:auditing-receipts-for-doc-uri($merged-doc-uri, $merge-options)
      order by $auditing-doc//prov:time ! xs:dateTime(.) descending
      return $auditing-doc
    )
  let $all-contributing-uris := $merge-doc-headers/*:merges/*:document-uri
  let $last-merge-dateTime := fn:max($all-contributing-uris/(@last-merge|../last-merge) ! xs:dateTime(.))
  let $previous-uris := if (fn:empty($last-merge-dateTime) and fn:exists($latest-auditing-receipt-for-doc)) then
      $latest-auditing-receipt-for-doc/auditing:previous-uri ! fn:string(.)
    else
      $all-contributing-uris[(@last-merge|../last-merge) = $last-merge-dateTime] ! fn:string(.)
  let $merge-doc-in-previous := $previous-uris = $merged-doc-uri
  where fn:exists(($latest-auditing-receipt-for-doc,$last-merge-dateTime))
  return (
    let $prevent-auto-match :=
      if ($block-future-merges) then
        matcher:block-matches($previous-uris)
      else ()
    let $collections := merge-impl:build-target-collections($merge-options)
    let $on-no-match-options := $collections => map:get("onNoMatch")
    let $on-archive-options := $collections => map:get("onArchive")
    let $archive-collections := coll-impl:on-no-match(map:map(), $on-archive-options)
    for $previous-doc-uri in $previous-uris
    let $new-collections := coll-impl:on-no-match(
            map:entry($previous-doc-uri, xdmp:document-get-collections($previous-doc-uri)[fn:not(. = $archive-collections)])
          ,$on-no-match-options)
    where fn:not($previous-doc-uri = $merged-doc-uri or merge-impl:source-of-other-merged-doc($previous-doc-uri, $merged-doc-uri))
    return (
      $previous-doc-uri,
      xdmp:document-set-collections($previous-doc-uri, $new-collections)
    ),
    if ($merge-doc-in-previous) then
      let $merge-options-ref := $merge-doc-headers/*:merge-options/*:value ! fn:string(.)
      let $merge-options := merge-impl:options-ref-to-options-node($merge-options-ref)
      where fn:exists($merge-options)
      return
        merge-impl:save-merge-models-by-uri(
          $all-contributing-uris[fn:not(. = $previous-uris)],
          $merge-options
        )
    else (
      if ($retain-rollback-info) then (
        merge-impl:archive-document($merged-doc-uri, $merge-options)
      ) else (
        xdmp:document-delete($merged-doc-uri)
      )
    ),
    if ($retain-rollback-info) then (
      $latest-auditing-receipt-for-doc ! auditing:audit-trace-rollback(., $merge-options)
    ) else (
      $latest-auditing-receipt-for-doc ! xdmp:document-delete(xdmp:node-uri(.))
    )
  )
};

declare function merge-impl:options-ref-to-options-node($merge-options-ref) {
  let $castable-as-hex := $merge-options-ref castable as xs:hexBinary
  let $options-document :=
    if ($castable-as-hex) then
      let $zip-binary := binary { $merge-options-ref }
      let $node-uri := fn:head(xdmp:zip-manifest($zip-binary)/*:part) ! fn:string(.)
      return xdmp:zip-get($zip-binary, $node-uri)
    else
      fn:doc($merge-options-ref)
  where fn:exists($options-document)
  return
      merge-impl:options-to-node($options-document/(object-node()|element()))
};

declare function merge-impl:source-of-other-merged-doc($uri, $merge-uri)
{
  xdmp:exists(cts:search(fn:collection(),
    cts:and-query((
      cts:collection-query($const:ARCHIVED-COLL),
      cts:collection-query($const:MERGED-COLL),
      cts:or-query((
        cts:json-property-value-query("document-uri", $uri, "exact"),
        cts:element-value-query(xs:QName("sm:document-uri"), $uri, "exact")
      )),
      cts:not-query(cts:document-query($merge-uri))
    ))
  ))
};

declare function merge-impl:expanded-uris($uris as xs:string*) {
  fn:distinct-values(
    let $expanded-uris :=
      for $uri in $uris
      return
        if (fn:starts-with($uri, $merge-impl:MERGED-DIR)) then
          fn:doc($uri)/*:envelope/*:headers/*:merges/*:document-uri[fn:not(fn:starts-with(., $MERGED-DIR))] ! fn:string(.)
        else
          $uri
    for $uri in $expanded-uris
    order by $uri
    return $uri
  )
};
(:~
 : Construct a merged document from the given URIs, but do not update the
 : database.
 : @param $uris  URIs of the source documents that will be merged
 : @param $merge-options  specification of how options are to be merged
 : @return in-memory copy of the merge result
 :)
declare function merge-impl:build-merge-models-by-uri(
  $uris as xs:string*,
  $merge-options as item()?
) {
  let $sorted-uris := for $uri in $uris order by $uri return $uri
  let $expanded-uris := merge-impl:expanded-uris($uris)
  return
    merge-impl:build-merge-models-by-uri(
      $uris,
      $merge-options,
      fn:head((
        $sorted-uris[fn:starts-with(., $MERGED-DIR)] ! fn:replace(fn:substring-after(., $MERGED-DIR),"\.(json|xml)", ""),
        xdmp:md5(fn:string-join($expanded-uris, "##"))
      )),
      $expanded-uris
    )
};

(:~
 : Construct a merged document from the given URIs, but do not update the
 : database.
 : @param $uris  URIs of the source documents that will be merged
 : @param $merge-options  specification of how options are to be merged
 : @param $id  id to be used for merge document
 : @return in-memory copy of the merge result
 :)
declare function merge-impl:build-merge-models-by-uri(
  $uris as xs:string*,
  $merge-options as item()?,
  $id as xs:string
)
{
  merge-impl:build-merge-models-by-uri(
    $uris,
    $merge-options,
    $id,
    merge-impl:expanded-uris($uris)
  )
};
(:~
 : Construct a merged document from the given URIs, but do not update the
 : database.
 : @param $uris  URIs of the source documents that will be merged
 : @param $merge-options  specification of how options are to be merged
 : @param $id  id to be used for merge document
 : @param $expanded-uris  all URIs, including merged URIs that contribute the merged document
 : @return in-memory copy of the merge result
 :)
declare function merge-impl:build-merge-models-by-uri(
  $uris as xs:string*,
  $merge-options as item()?,
  $id as xs:string,
  $expanded-uris as xs:string*
)
{
  let $start-elapsed := xdmp:elapsed-time()
  let $compiled-merge-options := merge-impl:compile-merge-options($merge-options)
  let $merge-options := $compiled-merge-options => map:get("mergeOptionsNode")
  let $target-entity := $compiled-merge-options => map:get("targetEntityType")
  let $on-merge := $compiled-merge-options => map:get("onMerge")
  let $parsed-properties :=
      merge-impl:parse-final-properties-for-merge(
        $expanded-uris,
        $merge-options
      )
  let $final-properties := map:get($parsed-properties, "final-properties")
  let $final-headers := map:get($parsed-properties, "final-headers")
  let $final-triples := map:get($parsed-properties, "final-triples")
  let $headers-ns-map := map:get($parsed-properties, $PROPKEY-HEADERS-NS-MAP)
  let $docs := map:get($parsed-properties, "documents")
  let $wrapper-qnames := map:get($parsed-properties, "wrapper-qnames")
  let $format := if ($docs instance of document-node(element())+) then
                  $const:FORMAT-XML
                else
                  $const:FORMAT-JSON
  let $merge-uri := if (fn:starts-with($id, $MERGED-DIR)) then $id else merge-impl:build-merge-uri($id, $format)
  let $provenance-details := merge-impl:generate-provenance-details($final-properties)
  return (
    map:map()
      => map:with("previousUri", $uris)
      => map:with("uri", $merge-uri)
      => map:with("audit-trace",
        auditing:build-audit-trace(
          $const:MERGE-ACTION,
          $uris,
          $merge-uri,
          $merge-options,
          merge-impl:generate-audit-attachments($merge-uri, $provenance-details)
        )
      )
      => map:with("provenance", $provenance-details)
      => map:with("value",
          merge-impl:build-merge-models-by-final-properties(
            $id,
            $uris,
            $docs,
            $wrapper-qnames,
            $final-properties,
            $final-headers,
            $final-triples,
            $headers-ns-map,
            $compiled-merge-options
          )
        )
      => map:with("context",
        map:new((
          map:entry("collections",
            (
              coll-impl:on-merge(
                map:new((
                  for $uri in $uris
                  let $write-object := util-impl:retrieve-write-object($uri)
                  return
                    map:entry(
                      $uri,
                      $write-object
                      => map:get("context")
                      => map:get("collections")
                    )
                )),
                $on-merge
              ),
              $target-entity
            )
          ),
          map:entry("permissions",
            let $perms := (
              xdmp:default-permissions($merge-uri, "objects"),
              for $uri in $uris
              let $write-object := util-impl:retrieve-write-object($uri)
              return $write-object => map:get("context") => map:get("permissions")
            )
            return if (fn:exists($perms)) then $perms else config:get-default-data-hub-permissions()
          )
        ))
      ),
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "merge-impl:build-merge-models-by-uri: " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
    )
};

(:
 : Construct XML or JSON merged properties.
 : @param $id  unique ID for the merged document being built
 : @param $docs  the source documents that provide the values
 : @param $wrapper-qnames  The QNames of
 : @param $final-properties  merged property values with source info
 : @param $final-headers  merged header values with source info
 : @param $headers-ns-map  namespace map for interpreting header paths
 :)
declare function merge-impl:build-merge-models-by-final-properties(
  $id as xs:string,
  $uris as xs:string*,
  $docs as node()*,
  $wrapper-qnames as xs:QName*,
  $final-properties as item()*,
  $final-headers as item()*,
  $final-triples as item()*,
  $headers-ns-map as map:map,
  $compiled-merge-options as map:map
)
{
  if ($docs instance of document-node(element())+) then
    merge-impl:build-merge-models-by-final-properties-to-xml(
      $id,
      $uris,
      $docs,
      $wrapper-qnames,
      $final-properties,
      $final-headers,
      $final-triples,
      $headers-ns-map,
      $compiled-merge-options
    )
  else
    merge-impl:build-merge-models-by-final-properties-to-json(
      $id,
      $uris,
      $docs,
      $wrapper-qnames,
      $final-properties,
      $final-headers,
      $final-triples,
      $compiled-merge-options
    )
};

(:
 : Construct the new merged document, based on the merged values already
 : identified.
 : @param $id  unique identifier for the merged document
 : @param $docs  raw source documents
 : @param $wrapper-qnames  TODO
 : @param $final-properties  merged property values with source info
 : @param $final-headers  merged header values with source info
 : @param $headers-ns-map  map of prefixes to namespaces for header paths
 : @return merged document
 :)
declare function merge-impl:build-merge-models-by-final-properties-to-xml(
  $id as xs:string,
  $uris as xs:string*,
  $docs as node()*,
  $wrapper-qnames as xs:QName*,
  $final-properties as item()*,
  $final-headers as item()*,
  $final-triples as item()*,
  $headers-ns-map as map:map,
  $compiled-merge-options as map:map
) as element(es:envelope)
{
    <es:envelope>
      {
        merge-impl:build-headers($id, $docs, $uris, $final-headers, $headers-ns-map, $compiled-merge-options, $const:FORMAT-XML)
      }
      <es:triples>{
        $final-triples
      }</es:triples>
      <es:instance>{
        fn:head($docs)/es:envelope/es:instance/es:info,
        merge-impl:build-instance-body-by-final-properties(
          $final-properties,
          $wrapper-qnames,
          $docs,
          $compiled-merge-options,
          $const:FORMAT-XML
        )
      }</es:instance>
    </es:envelope>
};

(:~
 : Construct the <es:headers> element using merged values.
 : @param $id  identifier for the merged document
 : @param $docs  source documents; merged doc values drawn from these
 : @param $uris  URIs of the source documents
 : @param $final-headers  the result of merging headers from the source documents
 : @param $headers-ns-map  map of namespace prefixes to namespace URIs; used to
 :                         interpret paths in $final-headers
 : @param $format  $const:FORMAT-XML or $const:FORMAT-JSON
 : @return constructed <es:headers> element or object-node
 :)
declare function merge-impl:build-headers(
  $id as xs:string,
  $docs as node()*,
  $uris as xs:string*,
  $final-headers as item()*,
  $headers-ns-map as map:map?,
  $compiled-merge-options as map:map,
  $format as xs:string
)
{
  (: Combine the merged non-Smart-Mastering namespace headers. Some will be
    : configured and merged; some will not be configured and will just get
    : copied over. :)

  if ($format = ($const:FORMAT-XML, $const:FORMAT-JSON)) then
    ()
  else fn:error(xs:QName("SM-INVALID-FORMAT"), "merge-impl:build-headers called with invalid format " || $format),
  let $current-dateTime := fn:current-dateTime()
  let $all-uris :=
      for $uri in fn:distinct-values(($docs ! xdmp:node-uri(.), $uris))
      order by $uri
      return $uri
  let $all-merged-docs := $all-uris[fn:starts-with(., $MERGED-DIR)] ! fn:doc(.)
  let $is-xml := $format = $const:FORMAT-XML
  (: remove "/*:envelope/*:headers" from the paths; already accounted for :)
  let $configured-paths := $final-headers ! fn:replace(map:get(., "path"), "/.*headers(/.*)", "$1")
  let $_trace :=
      if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then (
        xdmp:trace($const:TRACE-MERGE-RESULTS, "Building Headers with: " || xdmp:to-json-string($final-headers)),
        xdmp:trace($const:TRACE-MERGE-RESULTS, "Configured paths: " || xdmp:to-json-string($configured-paths))
      ) else ()
  (: Identify the full and partial paths of the configured paths. Record in
    : a map for quick access. :)
  let $anc-path-map := map:new(merge-impl:config-paths-and-ancestors($configured-paths) ! map:entry(., 1))
  (: Identify the non-Smart-Mastering headers from the source documents.
   : Anything else will either be passed through to the merged document or
   : replaced by merged values. :)
  let $non-sm-headers :=
    if ($is-xml) then
      $docs/es:envelope/es:headers/*[fn:empty(self::sm:*|self::sources)]
    else
      let $sm-keys := ("id", "sources", "merges")
      let $sm-map := fn:data($docs/object-node("envelope")/object-node("headers"))
      return
        let $m := map:map()
        let $_ :=
          for $map in $sm-map
          for $key in map:keys($map)
          where fn:not($key = $sm-keys)
          return map:put($m, $key, (map:get($m, $key), map:get($map, $key)))
        return $m
  (: Build a map that combines the unconfigured (pass-through) values from the
   : source docs with the merged values. :)
  let $combined :=
    let $m := map:map()
    let $populate :=
      if ($is-xml) then
        merge-impl:prep-unconfigured-xml("", $anc-path-map, $configured-paths, $non-sm-headers, $m)
      else
        merge-impl:prep-unconfigured-json("", $anc-path-map, $configured-paths, $non-sm-headers, $m)
    let $add-merged-values := merge-impl:add-merged-values($final-headers, $m)
    return $m
  (: Having built a map of XPaths -> elements, generate a properly-nested
   : list of XML elements or JSON properties. :)
  let $merge-options-node := $compiled-merge-options => map:get("mergeOptionsNode")
  let $merge-options-uri := xdmp:node-uri($merge-options-node)
  let $merge-options-value := if (fn:exists($merge-options-uri))
    then
      $merge-options-uri
    else
      fn:string(xdmp:zip-create(
          <parts xmlns="xdmp:zip">
            <part>merge-options{if ($merge-options-node instance of object-node()) then ".json" else ".xml"}</part>
          </parts>,
          $merge-options-node))
  return
    if ($is-xml) then
      <es:headers>
        <sm:id>{$id}</sm:id>
        <sm:merges>{
          for $uri in $all-uris
          return
            element sm:document-uri {
              attribute last-merge {
                if ($uri = $uris) then
                  $current-dateTime
                else
                  fn:max($all-merged-docs/es:envelope/es:headers/sm:merges/sm:document-uri[. eq $uri]/@last-merge ! xs:dateTime(.))
              },
              $uri
            }
        }</sm:merges>
        {
          if (fn:exists($docs/es:envelope/es:headers/sm:sources/sm:source)) then
            <sm:sources>{
              merge-impl:distinct-node-values($docs/es:envelope/es:headers/sm:sources/sm:source)
            }</sm:sources>
          else (),
          merge-impl:distinct-node-values($docs/es:envelope/es:headers/sources)
        }
        <sm:merge-options xml:lang="zxx">
          <sm:value>{$merge-options-value}</sm:value>
        </sm:merge-options>
        {
          merge-impl:map-to-xml($headers-ns-map, $combined)
        }
      </es:headers>
    else
      xdmp:to-json(
        map:new((
          map:entry("id", $id),
          map:entry("merges", array-node {
            for $uri in $all-uris
            return
              object-node { "document-uri": $uri, "last-merge":
                if ($uri = $uris) then
                  $current-dateTime
                else
                  fn:max($all-merged-docs/envelope/headers/merges/document-uri[. eq $uri]/../last-merge ! xs:dateTime(.))
              }
          }),
          map:entry("sources", array-node {
            merge-impl:distinct-node-values($docs/envelope/headers/sources)
          }),
          map:entry("merge-options", object-node {
            "lang": "zxx",
            "value": $merge-options-value
          }),
          merge-impl:map-to-json($combined)
        ))
      )/object-node()
};

declare function merge-impl:distinct-node-values($nodes as node()*)
{
  for $node at $pos in $nodes
  where fn:not(some $n in fn:subsequence($nodes, $pos + 1) satisfies fn:deep-equal($n, $node))
  return $node
};

(:~
 : Examines a sequence of paths and returns a set of distinct paths and their
 : ancestors. For instance, given ("/a/b/c", "/a/b/d/e"), returns
 : ("/a", "/a/b", "/a/b/c", "/a/b/d", "/a/b/d/e")
 :)
declare function merge-impl:config-paths-and-ancestors($paths as xs:string*) as xs:string*
{
  fn:distinct-values(
    for $path in $paths
    let $parts := fn:tokenize($path, "/")[fn:not(.="")]
    let $count := fn:count($parts)
    for $i in (1 to $count)
    return "/" || fn:string-join($parts[1 to $i], "/")
  )
};

(:~
 : Work through the original header properties recursively. Properties that weren't
 : configured for merging pass through and will become part of the merged
 : document. Any property that conflicts with a configured path will be skipped.
 :
 : The $m parameter will have keys that are property names and values that
 : are either JSON to be included in the merged document, or another map:map.
 : This structure allows us to combine overlapping XPaths.
 : @param $path  current path being processed, relative to /envelope/headers
 : @param $anc-path-map  "ancestor path map"; used to quickly determine whether
 :                       the current path is part of a configured path
 : @param $configured-paths  sequence of full configured paths
 : @param $headers  all the non-Smart Mastering header objects from the source
 :                  documents
 : @param $m  recursive map:map where the keys are property names and the values
 :            are either map:maps (for the next level of properties down) or
 :            values to include in the merged document
 : @return ()  (no "as" clause to allow for tail call optimization)
 :)
declare function merge-impl:prep-unconfigured-json(
  $path as xs:string,
  $anc-path-map as map:map,
  $configured-paths as xs:string*,
  $headers as map:map*,
  $m as map:map
)
{
  for $header in $headers
  for $key in map:keys($header)
  let $curr-path := $path || "/" || $key
  let $current := map:get($header, $key)
  return
    if (fn:empty(map:get($anc-path-map, $curr-path))) then
      (: This path is not related to any configured path, so we can just pass
        : any elements through. :)
      map:put($m, $key, (map:get($m, $key), $current))
    else if ($curr-path = $configured-paths) then
      (: Any elements here will be replaced by the calculated merged elements :)
      ()
    else
      if (fn:exists($current)) then
        let $child-map := map:map()
        let $populate :=
          merge-impl:prep-unconfigured-json($curr-path, $anc-path-map, $configured-paths, $current, $child-map)
        return
          if (map:keys($child-map)) then
            map:put(
              $m, $key,
              if (map:contains($m, $key)) then map:get($m, $key) + $child-map
              else $child-map
            )
          else ()
      else
        map:put($m, $key, (map:get($m, $key), $current))

};

(:~
 : Work through the original header elements recursively. Elements that weren't
 : configured for merging pass through and will become part of the merged
 : document. Any element that conflicts with a configured path will be skipped.
 :
 : The map:map parameter will have keys that are element names and values that
 : are either XML to be included in the merged document, or another map:map.
 : This structure allows us to combine overlapping XPaths.
 : @param $path  current path being processed, relative to /es:envelope/es:headers
 : @param $anc-path-map  "ancestor path map"; used to quickly determine whether
 :                       the current path is part of a configured path
 : @param $configured-paths  sequence of full configured paths
 : @param $headers  all the non-Smart Mastering header elements from the source
 :                  documents
 : @param $m  recursive map:map where the keys are element names and the values
 :            are either map:maps (for the next level of elements down) or
 :            values to include in the merged document
 : @return ()  (no "as" clause to allow for tail call optimization)
 :)
declare function merge-impl:prep-unconfigured-xml(
  $path as xs:string,
  $anc-path-map as map:map,
  $configured-paths as xs:string*,
  $headers,
  $m as map:map
)
{
  let $node-names := fn:distinct-values($headers ! fn:node-name(.))
  for $node-name in $node-names
  let $current := $headers[fn:node-name(.) eq $node-name]
  let $curr-path := $path || "/" || $node-name
  let $key := xdmp:key-from-QName($node-name)
  return
    if (fn:empty(map:get($anc-path-map, $curr-path))) then
    (: This path is not related to any configured path, so we can just pass
        : any elements through. :)
      map:put($m, $key, (map:get($m, $key),  $current))
    else if ($curr-path = $configured-paths) then
    (: Any elements here will be replaced by the calculated merged elements :)
      ()
    else
      let $children := $current/element()
      return
        if (fn:exists($children)) then
          let $child-map := map:map()
          let $populate := merge-impl:prep-unconfigured-xml($curr-path, $anc-path-map, $configured-paths, $children, $child-map)
          return
            if (map:keys($child-map)) then
              map:put(
                  $m, $key,
                  if (fn:exists(map:get($m, $key))) then map:get($m, $key) + $child-map
                  else $child-map
              )
            else ()
        else
          map:put($m, $key, (map:get($m, $key), $current))
};

(:~
 : Helper function for add-merged-values.
 : @param $m  a map:map where the keys are element names and the values are
 :            nested maps or elements to be put in the merged document
 : @param $path-parts  the path to an element, tokenized by "/"
 : @param $value  the merged value for this header
 : @return ()  no "as" clause to allow for tail call optimization
 :)
declare function merge-impl:add-merged-part(
  $m as map:map,
  $path-parts as xs:string*,
  $value
)
{
  let $key := fn:head($path-parts)
  let $path-tail := fn:tail($path-parts)
  return (
    if (fn:exists(map:get($m, $key)) and fn:exists($path-tail)) then
      for $present in map:get($m, $key)
      where $present instance of map:map and fn:not(merge-impl:is-source-values-map($present))
      return
          merge-impl:add-merged-part($present, $path-tail, $value)
    else
      if (fn:exists($path-tail)) then
        let $child-map := map:map()
        let $populate := merge-impl:add-merged-part($child-map, $path-tail, $value)
        return
          map:put($m, $key, $child-map)
      else if (merge-impl:is-source-values-map($value)) then
        map:put($m, $key, map:get($value, "values"))
      else
        map:put($m, $key, $value)
  )
};

(:~
 : Combine the calculated merged header elements with those that are being
 : passed through.
 : @param $final-headers  a sequence of maps having "path" and "values"
 : @param $m  a map:map where the keys are element names and the values are
 :            nested maps or elements to be put in the merged document
 : @return ()  works by modifying $m
 :)
declare function merge-impl:add-merged-values($final-headers, $m as map:map)
{
  for $header in $final-headers
  (: remove "/*:envelope/*:headers" from the paths; already accounted for :)
  let $key := fn:replace(map:get($header, "path"), "/.*headers(/.*)", "$1")
  return (
    merge-impl:add-merged-part($m, fn:tokenize($key, "/")[fn:not(. = "")], map:get($header, "values"))
  )
};

(:~
 : Converts a map to XML, where the keys are XPaths and the values are elements.
 : @param $ns-map a map of namespace prefixes to namespace URIs
 : @param $m the map with XPath -> element mappings
 : @return a sequence of elements (no "as" clause to allow tail call optimization)
 :)
declare function merge-impl:map-to-xml($ns-map as map:map, $m as map:map)
{
  for $path in map:keys($m)
  let $value := map:get($m, $path)
  return
    if ($value instance of map:map) then
      if (merge-impl:is-source-values-map($value)) then
        map:get($value, "values")
      else
        xdmp:with-namespaces(
          $ns-map,
          (
          let $qname := xdmp:QName-from-key($path)
          let $prefix := if (fn:contains(fn:string($qname), ":")) then fn:tokenize(fn:string($qname),":")[1] else ""
          return
            element { fn:QName(map:get($ns-map, $prefix), fn:local-name-from-QName($qname)) } {
              merge-impl:map-to-xml($ns-map, $value)
            }
          )
        )
    else if ($value instance of object-node()+) then (
      $value/values
    )
    else
      $value
};

declare function merge-impl:is-source-values-map($m as item()*) as xs:boolean {
  $m instance of map:map and map:contains($m, "sources") and map:contains($m, "values") and map:contains($m, "name")
};

(:~
 : The incoming structure is a nested set of map:maps, where the leaf nodes
 : contain the name of a property, the values for it, and the sources where
 : those values came from. Return a map:map that simplifies the leaf nodes to
 : just the values.
 :)
declare function merge-impl:map-to-json($m as map:map)
{
  if (map:contains($m, "sources") and map:contains($m, "values") and map:contains($m, "name")) then
    (: Extract the values and return those :)
    map:get($m, "values")
  else
    map:new(
      for $key in map:keys($m)
      let $value := map:get($m, $key)
      return
        if ($value instance of map:map) then
          map:entry($key, merge-impl:map-to-json($value))
        else
          (: Unconfigured values :)
          map:entry($key, $value)
    )
};

(:
 : Construct the new merged document, based on the merged values already
 : identified.
 : @param $id  unique identifier for the merged document
 : @param $docs  raw source documents
 : @param $wrapper-qnames  TODO
 : @param $final-properties  merged property values with source info
 : @param $final-headers  merged header values with source info
 : @return merged document
 :)
declare function merge-impl:build-merge-models-by-final-properties-to-json(
  $id as xs:string,
  $uris as xs:string*,
  $docs as node()*,
  $wrapper-qnames as xs:QName*,
  $final-properties as item()*,
  $final-headers as item()*,
  $final-triples as item()*,
  $compiled-merge-options as map:map
)
{
    object-node {
      "envelope": object-node {
        "headers": merge-impl:build-headers($id, $docs, $uris, $final-headers, (), $compiled-merge-options, $const:FORMAT-JSON),
        "triples": array-node {
          $final-triples
        },
        "instance": (
          let $instance-body :=
            merge-impl:build-instance-body-by-final-properties(
              $final-properties,
              $wrapper-qnames,
              $docs,
              $compiled-merge-options,
              $const:FORMAT-JSON
            )
          let $info := fn:head($docs)/envelope/instance/info
          return
            if (fn:exists($info)) then
              object-node{
                "info": $info
              } + $instance-body
            else
              $instance-body
        )
      }
    }
};

(:
 : Construct the Entity Services instance for the new merged document.
 : @param $final-properties  merged property values with source info
 : @param $wrapper-qnames  TODO
 : @param $format  $const:FORMAT-JSON or $const:FORMAT-XML
 : @return instance elements or properties
 :)
declare function merge-impl:build-instance-body-by-final-properties(
  $final-properties as map:map*,
  $wrapper-qnames as xs:QName*,
  $docs as document-node()*,
  $compiled-merge-options as map:map,
  $format as xs:string
)
{
  if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
    xdmp:trace($const:TRACE-MERGE-RESULTS, "Building instance with properties: " || xdmp:to-json-string($final-properties))
  else (),
  if ($format eq $const:FORMAT-JSON) then (
    xdmp:to-json(
      let $props-to-retain-array := map:map()
      (: TODO - consider using XSLT. I'd be able to specify a path rather than tracking through recursive descent :)
      let $merged-props-body :=
        (: consolidate $final-properties into a single map of names (keys) and values :)
        fn:fold-left(
          function($map-a, $map-b) {
            $map-a + $map-b
          },
          map:map(),
          let $non-path-properties := $final-properties[fn:not(map:contains(., "path"))]
          let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
            xdmp:trace($const:TRACE-MERGE-RESULTS, "Building instance with non-path properties: " || xdmp:to-json-string($non-path-properties))
          else ()
          for $prop at $pos in $non-path-properties
          let $prop-name := fn:string($prop => map:get("name"))
          let $prop-values := $prop => map:get("values")
          let $retain-array := (($prop => map:get("retainArray"))[. castable as xs:boolean] ! xs:boolean(.)) = fn:true()
          return (
            if ($retain-array and fn:not(map:contains($props-to-retain-array, $prop-name))) then
              map:put($props-to-retain-array, $prop-name, $retain-array)
            else (),
            map:entry(
              $prop-name,
              $prop-values
            )))
      let $_convert-to-arrays :=
        for $prop-name in map:keys($props-to-retain-array)
        let $values := map:get($merged-props-body, $prop-name)
        where fn:count($values) le 1
        return
          map:put($merged-props-body, $prop-name, array-node{$values})
      let $merged-props := fn:fold-left(
        function($child-object, $parent-name) {
          map:entry(fn:string($parent-name), $child-object)
        },
        $merged-props-body,
        $wrapper-qnames
      )
      (: Convert from maps to json:object notation, needed for XSLT :)
      let $xml-json := <root>{xdmp:from-json(xdmp:to-json($merged-props))}</root>
      let $path-properties := $final-properties[map:contains(., "path")]
      let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
        xdmp:trace($const:TRACE-MERGE-RESULTS, "Building instance with path properties: " || xdmp:to-json-string($path-properties))
      else ()
      let $path-templates := merge-impl:generate-path-templates($path-properties)
      let $full-template :=
        <xsl:stylesheet
          xmlns:xs="http://www.w3.org/2001/XMLSchema" version="2.0"
          xmlns:json="http://marklogic.com/xdmp/json">

          { $path-templates }

          <xsl:template match="node()|@*">
            <xsl:copy>
              <xsl:apply-templates select="node()|@*"/>
            </xsl:copy>
          </xsl:template>

        </xsl:stylesheet>
      let $fully-merged := xdmp:xslt-eval($full-template, $xml-json)
      return json:object($fully-merged/root/node())

    )/object-node()
  )
  else (
    fn:fold-left(
      function($children, $parent-name) {
        element {$parent-name} {
          $children
        }
      },
      let $prop-element-updates := map:map()
      let $prop-elements :=
          let $non-path-properties := $final-properties[fn:not(map:contains(., "path"))]
          let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
              xdmp:trace($const:TRACE-MERGE-RESULTS, "Building instance with non-path properties: " || xdmp:to-json-string($non-path-properties))
            else ()
          for $prop in $non-path-properties
          let $prop-values := $prop => map:get("values")
          return
            if ($prop-values instance of element()+) then
              $prop-values
            else
              element {($prop => map:get("name"))} {
                $prop-values
              }
      let $paths-used-to-update-elements-map := map:map()
      let $path-properties := $final-properties[fn:exists(map:get(., "path"))]
      (: Need QNames in document order to determine if element properties need updated via XPath merge rules  :)
      let $document-order-wrapper-qnames := fn:reverse($wrapper-qnames)
      let $element-updates-by-paths :=
          for $prop in $prop-elements
          (: Send wrapper-qnames in document order :)
          let $copy-op :=  mem:copy($prop)
          let $prop-updates := merge-impl:find-updates($copy-op, $path-properties, $document-order-wrapper-qnames, $prop, $paths-used-to-update-elements-map)
          where fn:exists(map:keys($prop-updates))
          return
            (map:put($prop-element-updates, fn:generate-id($prop), mem:execute($prop-updates)), fn:true())

      let $path-updates :=
        let $merge-rules := $compiled-merge-options => map:get("mergeRulesInfo")
        for $path in fn:distinct-values($final-properties ! map:get(., "path"))[fn:empty(map:get($paths-used-to-update-elements-map, .))]
        let $path-properties := $path-properties[map:get(., "path") = $path]
        (: A property may contain path-specified properties. Overlay the path property values on the top-level properties :)
        let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
            xdmp:trace($const:TRACE-MERGE-RESULTS, "Building instance with path properties: " || xdmp:to-json-string($path-properties))
          else ()
        return
          (: determine path structure from original documents :)
          let $merge-rule := $merge-rules[map:get(., "path") = $path]
          let $docs-to-values-function := $merge-rule => map:get("documentToValuesFunction")
          let $original-element := fn:head($docs ! $docs-to-values-function(.))
          let $ancestor-qnames := $original-element/ancestor::element() ! fn:node-name(.)
          let $last-index-of := fn:index-of($ancestor-qnames, fn:head(($wrapper-qnames,xs:QName('es:instance'))))[fn:last()]
          let $path-wrapping-qnames := fn:subsequence($ancestor-qnames, $last-index-of + 1)
          return
            fn:fold-left(
              function($children, $parent-name) {
                element {$parent-name} {
                  $children
                }
              },
              $path-properties ! map:get(., "values"),
              $path-wrapping-qnames
            )
      return (
        for $prop in $prop-elements
        let $prop-id := fn:generate-id($prop)
        return
          if (map:contains($prop-element-updates, $prop-id)) then
            map:get($prop-element-updates, $prop-id)
          else
            $prop,
        $path-updates
      ),
      $wrapper-qnames
    )
  )
};

declare function merge-impl:multi-node-equals($nodes1 as node()*, $nodes2 as node()*)
{
  (fn:count($nodes1) eq fn:count($nodes2)
    and
  (every $bool in fn:map-pairs(fn:deep-equal#2, $nodes1, $nodes2)
  satisfies $bool))
};

declare function merge-impl:strip-top-path($path, $wrapper-qnames as xs:QName*, $namespaces as map:map?) as xs:string
{
  let $instance-level := fn:replace($path, "^/(\w*:?envelope\|?){1,2}/(\w*:?instance\|?){1,2}/", "")
  return
    if (fn:exists($wrapper-qnames)) then
      xdmp:with-namespaces(
        $namespaces,
        fn:string-join(
          for $step at $step-pos in fn:tokenize($instance-level, "/")
          let $qname-search := if ($step castable as xs:QName) then xs:QName($step) else $step
          let $wrapper-qname-index := fn:index-of($wrapper-qnames, $qname-search)
          where fn:not($step-pos = $wrapper-qname-index)
          return $step,
          "/"
        )
      )
    else
      fn:replace($instance-level, "^[^/]+/", "")
};

(:
 : Given an XPath, rewrite it to apply to the XML serialization of JSON.
 : Example: "/LowerProperty1/EvenLowerProperty/LowestProperty1" becomes
 : "json:entry[@key='LowerProperty1']/json:value/json:object/json:entry[@key='EvenLowerProperty']/json:value/json:object/json:entry[@key='LowestProperty1']/json:value"
 :)
declare function merge-impl:convert-path-to-json($path as xs:string)
  as xs:string
{
  fn:string-join(
    for $segment in fn:tokenize($path, "/")
    where $segment ne ""
    return ("json:entry[@key='" || $segment || "']/json:value"),
    "/json:object/"
  )
};

(:
 : For each of the $path-properties, generate an XSL template
 : TODO
 :)
declare function merge-impl:generate-path-templates($path-properties)
{
  let $distinct-paths := fn:distinct-values($path-properties ! map:get(., 'path'))
  for $path in $distinct-paths
  let $lower-path := merge-impl:strip-top-path($path, (), ())
  let $path-props := $path-properties[map:get(., 'path') = $path]
  return
    <xsl:template>
      { attribute match { merge-impl:convert-path-to-json($lower-path) }}
      <xsl:copy>
        {
          let $values := $path-props ! map:get(., 'values')
          let $is-array := fn:count($values) gt 1 or (some $path-prop in $path-props satisfies $path-prop => map:get("retainArray"))
          let $values := if ($is-array) then array-node {$values} else $values
          return
            typeswitch($values)
            case array-node()|object-node() return
              xdmp:from-json($values)
            default return
              $values
        }
      </xsl:copy>
    </xsl:template>
};

(:
 : Recurse through $path-properties to build up a map of mem:replace operations.
 : @param $updates  a map for tracking updates to be made
 : @param $path-properties  a sequence of maps that hold property values and sources
 : @param $wrapper-qnames  a list of QNames in document order to wrap around the elements
 : @param $prop  a merged non-path property
 : @param $path-updates tracks the paths that have been updated
 : @return a map:map of mem:replace operations. Type not specified to allow for tail call optimization.
 :)
declare function merge-impl:find-updates($updates as map:map, $path-properties as map:map*, $wrapper-qnames as xs:QName*, $prop, $path-updates as map:map)
{
  if (fn:exists($path-properties)) then
    let $path-prop := fn:head($path-properties)
    let $path := map:get($path-prop, "path")
    (: $path is a rooted path, but we need to apply the path under the level of the top property. Strip off the
      : top part of the path. :)
    let $namespace-map := map:get($path-prop, "nsMap")
    let $lower-path := merge-impl:strip-top-path($path, ($wrapper-qnames, fn:node-name($prop)), $namespace-map)
    let $target := xdmp:unpath($lower-path, $namespace-map, $prop)
    return
        if (fn:exists($target)) then (
          map:put($path-updates, $path, fn:true()),
          (: This property contains this path; replace :)
          mem:replace(
            merge-impl:find-updates($updates, fn:tail($path-properties), $wrapper-qnames, $prop, $path-updates),
            $target,
            map:get($path-prop, "values")
          )
        ) else
          (: This property doesn't contain this path; check the other paths :)
          merge-impl:find-updates($updates, fn:tail($path-properties), $wrapper-qnames, $prop, $path-updates)
  else
    $updates

};

(:
 : Given a sequence of documents, extract the Entity Services instance from
 : each of them.
 : @param $docs  source documents
 : @return  ES instance
 :)
declare function merge-impl:get-instances($docs)
{
  for $doc in $docs
  let $instance-root := $doc/(es:envelope|object-node("envelope"))/(es:instance|object-node("instance"))
  let $instance := $instance-root/((element()[*]|object-node()) except (es:info|object-node("info")))
  return
    if (fn:empty($instance) or fn:count($instance) gt 1) then
      $instance-root
    else if ($instance instance of element(MDM)) then
      $instance/*/*
    else if (fn:node-name($instance) eq xs:QName("MDM")) then
      (: Ensure we navigating a array at the instance root :)
      $instance/(array-node()|.)/object-node()/object-node()
    else
      $instance
};

declare function merge-impl:get-sources(
  $docs,
  $compiled-merge-options as item())
  as object-node()*
{
  let $last-timestamp-function := $compiled-merge-options => map:get("lastUpdatedFunction")
  for $doc in $docs
  let $sources := $doc/(es:envelope|object-node("envelope"))
      /(es:headers|object-node("headers"))
      /(*:sources/(*:source|*:name)[self::element()]|array-node("sources")/object-node("sources")|object-node("sources"))
  let $sources := if (fn:empty($sources)) then object-node { "name": xdmp:node-uri($doc) } else $sources
  for $source in $sources
  let $last-updated := $last-timestamp-function($doc)
  order by $last-updated descending
  return
    object-node {
      "name": fn:string($source/descendant-or-self::*:name),
      "dateTime": fn:string($last-updated),
      "documentUri": xdmp:node-uri($doc)
    }

};

declare variable $PROPKEY-HEADERS-NS-MAP := "headers-ns-map";

(:~
 : Extract the instance parts from the source documents and pass them to
 : functions that will do the property and header merges. Return a map with
 : that data.
 : @param $uris  URIs of the source documents
 : @param $merge-options  these control how the source data get merged together
 : @return map:map with merged information from the source docs
 :)
declare function merge-impl:parse-final-properties-for-merge(
  $uris as xs:string*,
  $merge-options as item()?
) as map:map
{
  let $compiled-merge-options := merge-impl:compile-merge-options($merge-options)
  let $docs :=
    for $uri in $uris
    return
      fn:doc($uri)
  let $first-doc := fn:head($docs)
  let $first-instance := merge-impl:get-instances($first-doc)
  let $instances := ($first-instance,merge-impl:get-instances(fn:tail($docs)))
  let $wrapper-qnames :=
    fn:reverse(
      ($first-instance/ancestor-or-self::*
        except
      $first-doc/(es:envelope|object-node("envelope"))/(es:instance|object-node("instance"))/ancestor-or-self::*)
      ! fn:node-name(.)
    )
  let $sources := merge-impl:get-sources($docs, $compiled-merge-options)
  let $sources-by-document-uri as map:map := util-impl:combine-maps(map:map(),for $doc-uri in $sources/documentUri return map:entry($doc-uri, $doc-uri/..))
  let $final-properties := merge-impl:build-final-properties(
    $compiled-merge-options,
    $instances,
    $docs,
    $sources-by-document-uri)
  let $final-headers := merge-impl:build-final-headers(
    $compiled-merge-options,
    $docs,
    $sources-by-document-uri
  )
  let $final-triples := merge-impl:build-final-triples(
    $compiled-merge-options,
    $docs,
    $sources)
  return
    map:new((
      map:entry("instances", $instances),
      map:entry("sources", $sources),
      map:entry("documents", $docs),
      map:entry("wrapper-qnames",$wrapper-qnames),
      map:entry("final-properties", $final-properties),
      map:entry($PROPKEY-HEADERS-NS-MAP, fn:head($final-headers)),
      map:entry("final-headers", fn:tail($final-headers)),
      map:entry("final-triples", $final-triples)
    ))
};

(:~
 : Build a sequence of maps that contain, for each configured header, the
 : algorithm used to do the merging, the merged values, and the sources of
 : those values (embedded in the values).
 : @param $merge-options  an element or object containing the merge options
 : @param $docs  the source documents the header values will be drawn from
 : @param $sources  information about the source of the header data
 : @return sequence of maps. First map is the mapping from namespace prefixes
 :         to namespace URIs, as configured on the property-defs element. The
 :         rest of the maps are final header values.
 :)
declare function merge-impl:build-final-headers(
  $compiled-merge-options as item(),
  $docs,
  $sources-by-document-uri as map:map
) as map:map*
{
  let $merge-options-ref := $compiled-merge-options => map:get("mergeOptionsRef")
  let $ns-map := $compiled-merge-options => map:get("namespaces")
  let $default-merge-rule-info := $compiled-merge-options => map:get("defaultMergeRuleInfo")
  let $header-merge-rules-info := ($compiled-merge-options => map:get("mergeRulesInfo"))[map:contains(., "path")][fn:matches(map:get(., "path"),"^/[\w]*:?envelope/[\w]*:?headers/")]
  let $top-level-properties := fn:distinct-values(($docs/*:envelope/*:headers/node()[fn:not(fn:local-name-from-QName(fn:node-name(.)) = ("id","merges","sources"))] ! (fn:node-name(.))))
  return (
    $ns-map,
    for $top-level-property in $top-level-properties
    let $local-name := fn:local-name-from-QName($top-level-property)
    let $path-regex := "^/[\w]*:?envelope/[\w]*:?headers/[\w]*:?" || $local-name
    where fn:empty($header-merge-rules-info[fn:matches(map:get(., "path"),$path-regex)])
    return
    let $property-spec := $default-merge-rule-info => map:get("mergeRule")
    let $algorithm-name := $default-merge-rule-info => map:get("mergeAlgorithmName")
    let $algorithm := $default-merge-rule-info => map:get("mergeAlgorithm")
    let $algorithm-info :=
      object-node {
        "name": fn:head(($algorithm-name[fn:exists($algorithm)], "standard")),
        "optionsReference": $merge-options-ref
      }
    let $properties :=  $docs/*:envelope/*:headers/node()[fn:node-name(.) eq $top-level-property]
    let $raw-values :=
      for $prop-value in $properties
      let $curr-uri := xdmp:node-uri($prop-value)
      let $prop-sources := map:get($sources-by-document-uri, $curr-uri)
      return
          merge-impl:wrap-revision-info(
            $top-level-property,
            $prop-value,
            $prop-sources,
            (), ()
          )
    return
      if (fn:exists($raw-values)) then
        prop-def:new()
          => prop-def:with-algorithm-info($algorithm-info)
          => prop-def:with-path('/es:envelope/es:headers/' || $local-name)
          => prop-def:with-namespaces($ns-map)
          => prop-def:with-extensions(
            fn:fold-left(
              function($cumulative, $map) {
                $cumulative + $map
              },
              map:map(),
              if (fn:exists($algorithm)) then
                merge-impl:execute-algorithm(
                  $algorithm,
                  $top-level-property,
                  $raw-values,
                  $property-spec
                )
              else
                merge-impl:standard(
                  $top-level-property,
                  $raw-values,
                  $property-spec
                )
            )
          )
      else (),
    for $header-merge-rule-info in $header-merge-rules-info
    let $algorithm-name := fn:string($header-merge-rule-info => map:get("mergeAlgorithmName"))
    let $algorithm := $header-merge-rule-info => map:get("mergeAlgorithm")
    let $algorithm-info :=
      object-node {
        "name": fn:head(($algorithm-name[fn:exists($algorithm)], "standard")),
        "optionsReference": $merge-options-ref
      }
    let $merge-rule := $header-merge-rule-info => map:get("mergeRule")
    let $raw-values := merge-impl:get-raw-values($docs, $header-merge-rule-info, $sources-by-document-uri)
    return
      if (fn:exists($raw-values)) then
        prop-def:new()
          => prop-def:with-algorithm-info($algorithm-info)
          => prop-def:with-namespaces($ns-map)
          => prop-def:with-values(
            (: get the merged values :)
            if (fn:exists($algorithm)) then
              merge-impl:execute-algorithm(
                $algorithm,
                map:get(fn:head($raw-values), "name"),
                $raw-values,
                $merge-rule
              )
            else
              merge-impl:standard(
                map:get(fn:head($raw-values), "name"),
                $raw-values,
                $merge-rule
              )
          )
          => prop-def:with-path($header-merge-rule-info => map:get("path"))
      else ()
  )
};

(:~
 : Build a sequence of triples
 :
 : NOTE that unlike how other algorithms are configured,
 : the <triple-merge> element refers directly to the
 : @at, @namespace, @function params. This is because there will only
 : be 1 triple merge function.
 :
 : @param $merge-options  an element or object containing the merge options
 : @param $docs  the source documents the header values will be drawn from
 : @param $sources  information about the source of the header data
 : @return sequence of sem:triples
 :)
declare function merge-impl:build-final-triples(
  $compiled-merge-options as map:map,
  $docs,
  $sources
) as sem:triple*
{
  let $merge-options := $compiled-merge-options => map:get("mergeOptionsNode")
  let $triple-merge := fn:head($merge-options/(merging:triple-merge|tripleMerge))
  let $algorithm :=
    fun-ext:function-lookup(
      fn:string(fn:head(($triple-merge/(@function|function), "standard-triples"))),
      fn:string($triple-merge/(@namespace|namespace)),
      fn:string($triple-merge/(@at|at)),
      merge-impl:default-function-lookup(?, 4)
    )
  let $is-javascript := fn:ends-with(xdmp:function-module($algorithm), "js")
  let $triple-merge :=
    if ($is-javascript) then
      typeswitch($triple-merge)
      case element() return
        merge-impl:propertyspec-to-json($triple-merge)
      case object-node() return
        xdmp:from-json($triple-merge)
      default return
        ()
    else
      typeswitch($triple-merge)
        case element() return
          $triple-merge
        case object-node() return
          merge-impl:propertyspec-to-xml(xdmp:from-json($triple-merge), xs:QName('merging:triple-merge'))
        default return
          ()
  return
      xdmp:apply(
        $algorithm,
        $merge-options,
        $docs,
        $sources,
        $triple-merge)
};

(:~
 : Identify and merge any headers whose paths are given in the merge options.
 : @param $docs  the source documents
 : @param $property  the property specification, which includes the path to
 :                   look for source values
 : @param $sources  structure reflecting the origin of the data
 : @param $ns-map maps from namespace prefixes to namespace URIs
 : @return a sequence of maps, one for each value of this property found in a
 :         source document
 :)
declare function merge-impl:get-raw-values(
  $docs,
  $merge-rule-info as map:map,
  $sources-by-document-uri as map:map
) as map:map*
{
  let $path := $merge-rule-info => map:get("path")
  for $doc in $docs
  let $values := ($merge-rule-info => map:get("documentToValuesFunction"))($doc)
  let $curr-uri := xdmp:node-uri($doc)
  let $prop-sources := map:get($sources-by-document-uri, $curr-uri)
  let $res :=
    if (fn:exists($values)) then
      merge-impl:wrap-revision-info(
        fn:node-name(fn:head($values)),
        $values,
        $prop-sources,
        (), ()
      )
    else ()
  return
    $res
};

(:
 : Get instance property values by following the configured path.
 : @param $instances  all instance values from the source documents
 : @param $path-prop  full path to property
 : @param $ns-map  map of namespaces for interpreting the path
 : @return sequence: a QName, followed by values (elements or JSON properties)
 :)
declare function merge-impl:get-instance-props-by-path(
  $instances,
  $path-prop as element(merging:property),
  $ns-map as map:map
)
{
  (: Remove /es:envelope/es:instance/{top property name}, because we'll evaluate against the instance property :)
  let $inst-path := merge-impl:strip-top-path($path-prop/@path, (), ())
  let $parts := fn:tokenize($inst-path, "/")
  (: We'll grab the node above our target so that we determine whether it's an array :)
  let $middle-path := fn:string-join($parts[fn:position() != fn:last()], "/")
  let $target-name-str := $parts[fn:last()]
  let $target-name := fn:QName(map:get($ns-map, fn:replace($target-name-str, ":.*", "")), $target-name-str)
  return (
    $target-name,
    for $instance in $instances
    return
      (: The value will be an XML element, a string (if target is a JSON property), or a JSON array :)
      xdmp:unpath($middle-path, $ns-map, $instance)/node()[fn:node-name(.) = $target-name]
  )
};

(:
 : Returns a sequence of map:maps, one for each top-level property. Each map has the following keys:
 : - "algorithm" -- object-node with the name and optionsReference of the algorithm used for this property
 : - "sources" -- one or more object-nodes indicating which of the original docs the surviving value(s) came from
 : - "values" -- the surviving property values
 : - "path" -- if the property was specified by a path, the XPath expression
 : - "nsMap" -- if the property was specified by a path, a map of (prefix -> namespace)
 :)
declare function merge-impl:build-final-properties(
  $compiled-merge-options as map:map,
  $instances,
  $docs,
  $sources-by-document-uri as map:map
) as map:map*
{
  merge-impl:build-final-properties(
    $compiled-merge-options,
    $instances,
    $docs,
    $sources-by-document-uri,
    fn:exists($docs/(object-node()|array-node()))
  )
};
(:
 : Returns a sequence of map:maps, one for each top-level property. Each map has the following keys:
 : - "algorithm" -- object-node with the name and optionsReference of the algorithm used for this property
 : - "sources" -- one or more object-nodes indicating which of the original docs the surviving value(s) came from
 : - "values" -- the surviving property values
 : - "path" -- if the property was specified by a path, the XPath expression
 : - "nsMap" -- if the property was specified by a path, a map of (prefix -> namespace)
 :)
declare function merge-impl:build-final-properties(
  $compiled-merge-options as map:map,
  $instances,
  $docs,
  $sources-by-document-uri as map:map,
  $is-json
) as map:map*
{
  let $entity-definition := $compiled-merge-options => map:get("targetEntityTypeDefinition")
  let $namespaces-map := $compiled-merge-options => map:get("namespaces")
  let $merge-options-ref := $compiled-merge-options => map:get("mergeOptionsRef")
  let $merge-rules-info := $compiled-merge-options => map:get("mergeRulesInfo")
  let $top-level-properties := $instances/*
  let $top-level-qnames := fn:distinct-values($top-level-properties ! fn:node-name(.))
  let $explicit-merges :=
    for $merge-rule-info in $merge-rules-info[fn:not(map:contains(., "path") and fn:matches(map:get(., "path"), "^/[\w]*:?envelope/[\w]*:?headers/"))]
    where fn:exists(map:get($merge-rule-info,"path")) or map:get($merge-rule-info, "propertyQName") = $top-level-qnames
    return merge-impl:get-merge-values($merge-rule-info, $docs, $namespaces-map, $sources-by-document-uri, $merge-options-ref)
  let $implicit-merges :=
    if (fn:empty($entity-definition)) then
      let $default-merge-rule-info := $compiled-merge-options => map:get("defaultMergeRuleInfo")
      for $property-name in fn:distinct-values($top-level-properties ! fn:node-name(.))
      where fn:empty($merge-rules-info[map:get(., "propertyQName") = $property-name])
      return
        let $property-instances := $top-level-properties[fn:node-name(.) eq $property-name]
        return
          merge-impl:get-merge-values(
            $default-merge-rule-info
              => map:with("documentToValuesFunction", function($doc) {
                $property-instances[fn:root(.) is $doc]
              }),
            $docs,
            $namespaces-map,
            $sources-by-document-uri,
            $merge-options-ref
          )
    else ()
  return (
    $explicit-merges,
    $implicit-merges
  )
};

declare function merge-impl:get-merge-values(
  $merge-rule-info as map:map,
  $docs as document-node()*,
  $namespaces-map as map:map,
  $sources-by-document-uri as map:map,
  $merge-options-ref as xs:string
) {
  let $property-name := $merge-rule-info => map:get("propertyName")
  let $merge-spec := $merge-rule-info => map:get("mergeRule")
  let $path := $merge-rule-info => map:get("path")
  let $algorithm := $merge-rule-info => map:get("mergeAlgorithm")
  let $algorithm-name := $merge-rule-info => map:get("mergeAlgorithmName")
  let $algorithm-info :=
    object-node {
      "name": $algorithm-name,
      "optionsReference": $merge-options-ref
    }
  let $instance-props-by-root-id := map:map()
  let $document-to-values-function := $merge-rule-info => map:get("documentToValuesFunction")
  let $instance-props :=
    for $doc in $docs
    let $instance-properties := $document-to-values-function($doc)
    return (
      map:put($instance-props-by-root-id, fn:generate-id($doc), $instance-properties),
      $instance-properties
    )
  where fn:exists($instance-props)
  return
    let $prop-qname := fn:head($instance-props) ! fn:node-name(.)
    let $wrapped-properties :=
      for $doc at $pos in $docs
      let $generate-id := fn:generate-id($doc)
      for $prop-value in map:get($instance-props-by-root-id, $generate-id)
      let $prop-qname := fn:node-name($prop-value)
      let $lineage-uris := merge-impl:node-uri($doc)
      let $prop-sources := $lineage-uris ! map:get($sources-by-document-uri, .)
      let $ns-map := fn:head(($merge-spec/namespaces ! xdmp:from-json(.),$namespaces-map))
      return
        merge-impl:wrap-revision-info($prop-qname, $prop-value, $prop-sources, $path, $ns-map)
          => prop-def:with-algorithm-info($algorithm-info)
          => prop-def:with-retain-array(fn:exists($instance-props/parent::array-node()))
    let $merged-values :=
      if (fn:exists($algorithm)) then
        merge-impl:execute-algorithm(
            $algorithm,
            $prop-qname,
            $wrapped-properties,
            $merge-spec
        )
      else
        merge-impl:standard(
            $prop-qname,
            $wrapped-properties,
            $merge-spec
        )
    return (
      if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
        xdmp:trace($const:TRACE-MERGE-RESULTS, 'Processing merge rule: ' || $property-name || '&#10;merge rule details: '|| xdmp:to-json-string($merge-spec) || '&#10;merge values details: ' || xdmp:to-json-string($merged-values))
      else (),
      $merged-values
    )
};

(: Trust xdmp:node-uri over fn:base-uri, but we use base uri for some merging
 : of in-memory constructed nodes.
 :)
declare function merge-impl:node-uri($node as node()?)
as xs:string?
{
  $node ! fn:head((xdmp:node-uri(.), fn:base-uri(.), fn:root(.)/text("$baseUri")))
};


(:
 : Create maps to connect a property's name, values, and sources.
 : @param $property-name  XML element or JSON property name
 : @param $properties  XML elements or JSON properties corresponding to ES instance properties
 : @param $sources  information pulled from the source document headers
 : @param $path  an XPath to a property
 : @param $ns-map  namespace map for the $path
 : @return sequence of maps
 :)
declare function merge-impl:wrap-revision-info(
  $property-name as xs:QName,
  $properties as item()*,
  $sources as item()*,
  $path as xs:string?,
  $ns-map as map:map?
) as map:map*
{
  merge-impl:wrap-revision-info-with-extensions(
    $property-name,
    $properties,
    $sources,
    if (fn:exists($path)) then map:new((
      map:entry("path", $path),
      map:entry("nsMap", $ns-map)
    ))
    else ()
  )
};

(:
 : Create maps to connect a property's name, values, and sources with extension ability.
 : @param $property-name  XML element or JSON property name
 : @param $properties  XML elements or JSON properties corresponding to ES instance properties
 : @param $sources  information pulled from the source document headers
 : @param $extension map for any additional details that need to be associated with a property
 : @return sequence of maps
 :)
declare function merge-impl:wrap-revision-info-with-extensions(
  $property-name as xs:QName,
  $properties as item()*,
  $sources as item()*,
  $extensions as map:map?
) as map:map*
{
  for $prop in $properties
  return
    prop-def:new()
      => prop-def:with-name($property-name)
      => prop-def:with-sources($sources)
      => prop-def:with-values($prop)
      => prop-def:with-extensions($extensions)
};

(: Compare all keys and values between two maps :)
declare function merge-impl:objects-equal($object1 as map:map, $object2 as map:map) as xs:boolean
{
  merge-impl:objects-equal-recursive($object1, $object2)
};

(:
 : Compare JSON data for equality.
 :)
declare function merge-impl:objects-equal-recursive($object1, $object2)
{
  typeswitch($object1)
    case map:map return
      let $k1 := map:keys($object1)
      let $k2 := map:keys($object2)
      let $counts-equal := fn:count($k1) eq fn:count($k2)
      let $maps-equal :=
        for $key in map:keys($object1)
        let $v1 := map:get($object1, $key)
        let $v2 := map:get($object2, $key)
        return
          merge-impl:objects-equal-recursive($v1, $v2)
      return $counts-equal and fn:not($maps-equal = fn:false())
    case json:array return
      let $counts-equal := fn:count($object1) = fn:count($object2)
      let $items-equal :=
        let $o1 := json:array-values($object1)
        let $o2 := json:array-values($object2)
        for $item at $i in $o1
        return
          merge-impl:objects-equal-recursive($item, $o2[$i])
      return
        $counts-equal and fn:not($items-equal = fn:false())
    default return
      $object1 = $object2
};

(:
 : Apply a merge algorithm to a set of properties in order to determine the
 : property values to be used in a merged document.
 : @param $algorithm  function that will determine the merged values
 : @param $property-name  QName of the property
 : @param $properties  value and source data from the source documents
 : @param $property-spec  configuration for how this property should be merged
 :)
declare function merge-impl:execute-algorithm(
  $algorithm as xdmp:function,
  $property-name as xs:QName,
  $properties as map:map*,
  $property-spec as node()?
)
{
  xdmp:trace($const:TRACE-MERGE-RESULTS,  "Calling function at '" || xdmp:function-module($algorithm) || "' " || xdmp:describe($algorithm, (),())),
  let $is-javascript := fn:ends-with(xdmp:function-module($algorithm), "js")
  let $properties := if ($is-javascript) then json:to-array($properties) else $properties
  let $property-spec :=
    if ($is-javascript) then
      if ($property-spec instance of element(merging:merge)) then
        merge-impl:propertyspec-to-json($property-spec)
      else if ($property-spec instance of object-node()) then
        xdmp:from-json($property-spec)
      else
        $property-spec
    else
      if ($property-spec instance of element(merging:merge)) then
        $property-spec
      else if ($property-spec instance of object-node() or $property-spec instance of json:object) then
        merge-impl:propertyspec-to-xml($property-spec, xs:QName("merging:merge"))
      else
        $property-spec
  let $results := xdmp:apply($algorithm, $property-name, $properties, $property-spec)
  return merge-impl:normalize-javascript-results($results)
};

(:
 : Normalize the results of JavaScript merge function.
 : @param $results  output of a merge JavaScript function
 :)
declare function merge-impl:normalize-javascript-results(
  $results as item()*
) {
  xdmp:trace($const:TRACE-MERGE-RESULTS, "Normalizing JavaScript results: " || xdmp:describe($results, (), ())),
  let $results-sequence :=
    if ($results instance of json:array) then
      json:array-values($results)
    else
      $results
  for $result in $results-sequence
  let $values := map:get($result, "values")
  return
    if (fn:exists($values[fn:not(. instance of node())])) then
      map:new((
        $result,
        map:entry("values", merge-impl:normalize-json-to-nodes(map:get($result, "name"), $values))
      ))
    else
      $result
};

(:
 : Normalize the values to nodes of JavaScript merge function.
 : @param $results  output of a merge JavaScript function
 :)
declare function merge-impl:normalize-json-to-nodes(
  $prop-name as xs:QName,
  $values as item()*
) {
  for $value in $values
  return
    if ($value instance of node()) then
      $value
    else if ($value instance of json:array or $value instance of json:object or $value instance of map:map) then
      xdmp:to-json($value)/node()
    else
      object-node { $prop-name: $value }/node()
};

declare variable $documents-archived-in-transaction := map:map();
declare function merge-impl:archive-document($uri as xs:string, $merge-options as node()?)
{
  merge-impl:lock-for-update($uri),
  if (map:contains($documents-archived-in-transaction, $uri)) then ()
  else
    (: If we're archiving a merged document, we want to only retain the collections specifically for merged and archived
      and drop collections carried over by the documents merged into it.
    :)
    let $collection-algorithms := $merge-options/(*:algorithms/*:collections|targetCollections)
    let $is-merged-doc := fn:starts-with($uri,$MERGED-DIR)
    let $doc-collections := if ($is-merged-doc) then map:map() else map:entry($uri, xdmp:document-get-collections($uri))
    return
    map:put(
      $documents-archived-in-transaction,
      $uri,
      (
        xdmp:document-set-collections(
          $uri,
          (
            if ($is-merged-doc) then (
              let $on-no-match-collections := coll-impl:on-no-match(
                  $doc-collections,
                  $collection-algorithms/(merging:on-archive|onArchive)
                )
              let $on-merge-collections := coll-impl:on-merge(
                  $doc-collections,
                  $collection-algorithms/(merging:on-merge|onMerge)
                )
              (: Exclude any overlap of on-merge with on-no-match :)
              return $on-merge-collections[fn:not(. = $on-no-match-collections)]
            ) else (),
            coll-impl:on-archive(
              $doc-collections,
              $collection-algorithms/(merging:on-archive|onArchive)
            )
          )
        ),
        fn:true()
      )
    )
};

declare function merge-impl:NCName-compatible($value as xs:string)
{
  helper:NCName-compatible($value)
};

declare variable $_to-decoded-NCName as map:map := map:map();

declare function merge-impl:NCName-compatible-reverse($value as xs:string)
{
  if (map:contains($_to-decoded-NCName, $value)) then
    map:get($_to-decoded-NCName, $value)
  else
    let $decoded-value := fn:head((try {xdmp:decode-from-NCName($value)} catch * {()}, $value))
    return (
      map:put($_to-decoded-NCName, $value, $decoded-value),
      $decoded-value
    )
};

(: Prefix for locking to identify the task being done on the URI :)
declare variable $lock-task-prefix as xs:string := "sm-merging:";
declare variable $locked-uris-map as map:map := map:map();

(:
 : This attempts to view URIs have been locked by other mastering processes.
 : Only one attempt is made and the results are cached to avoid too much network noise in a cluster.
 :)
declare function merge-impl:locked-uris() {
  if (map:contains($locked-uris-map, "runAlready")) then
    $locked-uris-map
  else
    let $transaction-id := xdmp:transaction()
    let $locked-uris := fn:distinct-values(
                        for $host-id in xdmp:hosts()
                        let $check-transactions := xdmp:host-status($host-id)/host:transactions/host:transaction[host:transaction-mode = "update"]/host:transaction-id[. ne $transaction-id]
                        for $check-transaction in $check-transactions
                        (: Invoking to another transaction in query mode to avoid deadlocking :)
                        return xdmp:invoke-function(function() {merge-impl:locked-uris($host-id, $check-transaction)}, map:map() => map:with("update","false"))
                      )
    return (
      map:put($locked-uris-map, "runAlready", fn:true()),
      $locked-uris ! map:put($locked-uris-map, ., fn:true()),
      $locked-uris-map
    )
};

(:
 : This returns the write/waiting locks that were created by mastering for a given host/transaction pair.
 : This is a separate overloaded function to retain the amp privileges after an invoke.
 : @param $host-id ID of host we're looking at transaction locks of
 : @param $transaction-id ID of transaction we're looking at transaction locks of
 :)
declare function merge-impl:locked-uris($host-id, $transaction-id) {
  fn:distinct-values(
    (: transaction may have closed between getting it from the host status and now looking for locks :)
    try {
      xdmp:transaction-locks($host-id, $transaction-id)/(host:waiting|host:write)[fn:starts-with(., $lock-task-prefix)]/fn:substring-after(., $lock-task-prefix)
    } catch * {()}
  )
};

declare function merge-impl:filter-out-locked-uris($uris) {
  let $locked-uris := merge-impl:locked-uris()
  let $filtered-uris := $uris[fn:not(map:contains($locked-uris, .))]
  return $filtered-uris
};

declare function merge-impl:is-uri-locked($uri as xs:string) as xs:boolean {
  map:contains(merge-impl:locked-uris(), $uri)
};

(: Don't want to trigger static analysis for our separate read-only operations :)
declare variable $lock-for-update-fun := fn:function-lookup(xs:QName('xdmp:lock-for-update'), 1);

declare variable $locked-in-this-transaction as map:map := map:map();

declare function merge-impl:lock-for-update($uri as xs:string) {
  if (fn:not(map:contains($locked-in-this-transaction, $uri))) then (
    map:put($locked-in-this-transaction, $uri, fn:true()),
    if (fn:not(merge-impl:is-uri-locked($uri))) then
      map:put(merge-impl:locked-uris(), $uri, fn:true())
    else (),
    (: This is to tell transactions outside mastering we are working with this document :)
    $lock-for-update-fun($uri),
    (: Below is to identify locks specific to mastering  :)
    $lock-for-update-fun($lock-task-prefix || $uri)
  ) else ()
};
