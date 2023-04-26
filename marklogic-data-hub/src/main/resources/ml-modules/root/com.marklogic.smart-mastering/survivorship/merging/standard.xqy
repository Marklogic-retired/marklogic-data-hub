xquery version "1.0-ml";

module namespace merging = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "base.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace m = "http://marklogic.com/smart-mastering/merging";
(:
 : This is the default method of combining the set of values for a property across entities that are being merged.
 : Sample $property-spec:
 :   <merging xmlns="http://marklogic.com/smart-mastering/merging">
 :     <merge property-name="some-property" max-values="1">
 :       <source-weights>
 :         <source name="good-source" weight="2"/>
 :         <source name="better-source" weight="4"/>
 :       </source-weights>
 :     </merge>
 :     <merge property-name="another-property" max-values="1">
 :       <length weight="8" />
 :     </merge>
 :   </merging>
 :
 :   "merging": [
 :     {
 :       "propertyName": "some-property",
 :       "sourceWeights": [
 :         { "source": { "name": "good-source", "weight": "2" } },
 :         { "source": { "name": "better-source", "weight": "4" } }
 :       ]
 :     },
 :     {
 :       "propertyName": "another-property",
 :       "maxValues": "1",
 :       "length": { "weight": "8" }
 :     }
 :   ]
 :
 : @param $property-name  The name of the property being merged
 : @param $all-properties  A sequence of maps, each with "name" (the name of the property), "sources" (the URIs of the
 :                         lineage docs the value came from), and "values" (a value for that property).
 : @param $property-spec  The /m:merging/m:merge element of merge options that corresponds to a particular property
 :
 : @return selected property value(s)
 :)
declare function merging:standard(
  $property-name as xs:QName,
  $all-properties as map:map*,
  $property-spec as node()?
)
{
  let $max-values := $property-spec/(@max-values|maxValues)[. castable as xs:decimal] ! fn:number(.)
  let $max-sources := $property-spec/(@max-sources|maxSources)[. castable as xs:decimal] ! fn:number(.)
  let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
      xdmp:trace($const:TRACE-MERGE-RESULTS,
        fn:string-join(
          (
            'Merging property Name: ' || $property-name,
            'Max Sources:' || fn:string($max-sources),
            'Max Values:' || fn:string($max-values),
            'Property Merge Options:' || xdmp:to-json-string($property-spec),
            'Properties Info:' || xdmp:to-json-string($all-properties)
          ),
          "&#10;"
        )
      )
    else
      ()
  let $source-priority := $property-spec/(m:source-weights|sourceWeights|priorityOrder)/(*:source|sources)
  let $time-weight := fn:head(($property-spec/priorityOrder/timeWeight ! fn:number(.), 0))
  let $length-weight := fn:head(($property-spec/(*:length/(@weight|weight)|priorityOrder/lengthWeight) ! fn:number(.),0))
  let $properties :=
    if ($property-spec/retainDuplicateValues = fn:true()) then
      $all-properties
    else
      merging:standard-condense-properties(
        $property-name,
        $all-properties,
        $property-spec
      )
  let $distinct-sources := ($properties ! . => map:get("sources")) union ()
  let $scores-by-dateTime := merging:score-by-dateTime($distinct-sources, $time-weight)
  let $selected-sources :=
    if (fn:exists($max-sources)) then
      fn:subsequence(
        for $source in $distinct-sources
        let $source-score := fn:number(fn:head(($source-priority[(@name|name|sourceName|source-name) = $source/name]/(@weight|*:weight), 0)))
        let $source-dateTime := fn:max($source/dateTime[. ne ""] ! xs:dateTime(.))
        let $time-score := $source-dateTime ! map:get($scores-by-dateTime, fn:string(.))
        let $whole-score := fn:string-join((if ($time-score > $source-score) then ($time-score, $source-score) else ($source-score, $time-score)) ! fn:string(.), " ")
        (: Use numeric collation for proper sorting  :)
        order by $whole-score descending collation "http://marklogic.com/collation//MO", $source-dateTime descending
        return (
          xdmp:trace($const:TRACE-MERGE-RESULTS, "Source name: '" || $source/name || "' weight: '" || $source-score || "'"),
          $source
        ),
        1,
        $max-sources
      )
    else
      $distinct-sources
  let $sorted-properties :=
        let $max-length :=
          if ($length-weight gt 0) then
            fn:max(
                $properties ! (. => map:get("values")) ! fn:string-length(fn:string-join(./descendant-or-self::text()," "))
            )
          else 0
        for $property in $properties
        let $_trace :=
          if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
            xdmp:trace($const:TRACE-MERGE-RESULTS, 'Processing property in standard merge: ' || xdmp:to-json-string($property))
          else
            ()
        let $prop-value := map:get($property, "values")
        let $sources := map:get($property,"sources")
        let $source-dateTime := fn:max($sources/dateTime[. ne ""] ! xs:dateTime(.))
        let $time-score := $source-dateTime ! map:get($scores-by-dateTime, fn:string(.))
        let $length-score :=
          if ($length-weight gt 0) then
            if (fn:string-length(fn:string-join($prop-value/descendant-or-self::text()," ")) eq $max-length) then
              $length-weight
            else 0
          else 0
        let $source-score := fn:sum(
          for $source in $sources
          return
            (: See MDM-529 for why the below is needed :)
            fn:head($source-priority[(@name|name|sourceName) = $source/name]/(@weight|*:weight))
        )
        let $weight := fn:max(($time-score, $length-score, $source-score))
        where fn:exists($sources[fn:exists(. intersect $selected-sources)])
        stable order by $weight descending, $source-score descending, $source-dateTime descending
        return
          $property
  let $selected-properties :=
    if (fn:exists($max-values)) then
      fn:subsequence($sorted-properties, 1, $max-values)
    else
      $sorted-properties
  return (
    if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then (
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Selected sources: '" || xdmp:to-json-string($selected-sources)),
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Selected properties: '" || xdmp:to-json-string($selected-properties))
    ) else (),
    $selected-properties
  )
};

declare function merging:score-by-dateTime($distinct-sources, $time-weight) {
    let $all-ordered-dateTimes := for $dt in fn:distinct-values($distinct-sources/dateTime[. ne ""] ! xs:dateTime(.)) order by $dt ascending return $dt
    let $all-dateTimes-count := fn:count($all-ordered-dateTimes)
    return map:new(
      for $dt at $pos in $all-ordered-dateTimes
      return map:entry(fn:string($dt), ($pos div $all-dateTimes-count) * $time-weight)
    )
};

declare function merging:standard-condense-properties(
  $property-name as xs:QName,
  $all-properties as item()*,
  $property-spec as node()?
)
{
  if (fn:count((
    ($all-properties ! map:get(., "values") ! fn:root(.)) union ()
  )) eq 1) then
    $all-properties
  else
    merging:merge-complementing-properties($all-properties)
};

declare function merging:merge-complementing-properties(
  $all-properties
)
{
  let $complementing-indexes-map := map:map()
  let $_populate-map :=
    for $current-property at $prop-pos in $all-properties,
      $current-property-value at $val-pos in $current-property => map:get("values")
    let $property-hash := xdmp:sha1(xdmp:describe(document{$current-property-value},(),()))
    let $existing-property := map:get($complementing-indexes-map, $property-hash)
    return
      if (fn:exists($existing-property)) then
        map:put(
          $complementing-indexes-map,
          $property-hash,
          map:new((
            $existing-property,
            map:entry('sources', map:get($existing-property, "sources") union map:get($current-property, "sources"))
          ))
        )
      else
        map:put(
          $complementing-indexes-map,
          $property-hash,
          map:new((
            $current-property,
            map:entry('values', $current-property-value),
            map:entry('$pos', $prop-pos * $val-pos)
          ))
        )
  for $hash in map:keys($complementing-indexes-map)
  let $property-description := map:get($complementing-indexes-map, $hash)
  order by map:get($property-description, '$pos') ascending
  return
    $property-description
};

(: The standard triples merge function.
 : It gets all the triples from all of the matched docs
 :)
declare function merging:standard-triples(
  $merge-options as item()?,
  $docs,
  $sources,
  $property-spec as node()?)
{
  let $uris := $docs ! xdmp:node-uri(.)
  let $triples := 
    sem:sparql(
      'construct { ?s ?p ?o } where {
        ?s ?p ?o.
        BIND (datatype(?s) AS ?dataType)
        FILTER (!BOUND(?dataType) || ?dataType != <http://marklogic.com/xdmp/sql#rowID>)
      }',
      (), "map",
      sem:store((), cts:document-query($uris))
    )

  return ($triples, get-triples-from-in-memory-docs($docs, $triples))
};

(:
This is intended to grab triples from in-memory docs that can exist when e.g. running a
merging step as a connected step. The indexed-triples are required so that we don't return any 
triples that already exist. The undocumented sem:triple-hash function is used to generate a unique
identifier for each triple so that we can determine duplicates.
:)
declare function get-triples-from-in-memory-docs(
  $docs, 
  $indexed-triples (: triples that were obtained already from the triple index :)
)
{
  let $triple-hashes := map:new(
    for $triple in $indexed-triples
    return map:entry(fn:string(sem:triple-hash($triple)), $triple)
  )

  for $doc in $docs
  where fn:not(xdmp:node-uri($doc))
  return 
    for $triple-node in $doc/*:envelope/*:triples/node()
    let $triple := sem:triple($triple-node)
    let $hash := fn:string(sem:triple-hash($triple))
    where fn:not(map:contains($triple-hashes, $hash))
    return (
      map:put($triple-hashes, $hash, $triple),
      $triple
    )
};