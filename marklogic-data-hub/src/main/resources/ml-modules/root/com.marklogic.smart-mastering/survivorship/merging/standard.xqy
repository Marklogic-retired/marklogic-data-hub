xquery version "1.0-ml";

module namespace merging = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
at  "base.xqy";
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
  $property-spec as element()?
)
{
  if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
    xdmp:trace($const:TRACE-MERGE-RESULTS, xdmp:describe(('Merging Property Name: ',$property-name, 'Property Merge Options:', $property-spec),(),()))
  else
    (),
  let $condensed-properties := merging:standard-condense-properties(
    $property-name,
    $all-properties,
    $property-spec
  )
  let $selected-sources := fn:subsequence(
    for $source in ($condensed-properties ! . => map:get("sources")) union ()
    let $source-score := fn:head((
      $property-spec/*:source-weights/*:source[@name = $source/name]/@weight,
      $property-spec/*:source-weights/*:source[*:name = $source/name]/*:weight,
      0
    ))
    let $source-dateTime := fn:max($source/dateTime[. castable as xs:dateTime] ! xs:dateTime(.))
    order by $source-score descending, $source-dateTime descending
    return $source,
    1,
    fn:head(
      ($property-spec/@max-sources, 99)
    ))
  return
    fn:subsequence(
      (
        let $length-weight :=
          fn:head((
            $property-spec/*:length/@weight ! fn:number(.),
            0
          ))
        let $max-length :=
          if ($length-weight gt 0) then
            fn:max(
              $condensed-properties ! (. => map:get("values")) ! fn:string-length(fn:string-join(./descendant-or-self::text()," "))
            )
          else 0
        for $property in $condensed-properties
        let $_trace :=
          if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
            xdmp:trace($const:TRACE-MERGE-RESULTS, xdmp:describe(('Processing property in standard merge',$property),(),()))
          else
            ()
        let $prop-value := map:get($property, "values")
        let $sources := map:get($property,"sources")
        let $source-dateTime := fn:max($sources/dateTime[. castable as xs:dateTime] ! xs:dateTime(.))
        let $length-score :=
          if ($length-weight gt 0) then
            if (fn:string-length(fn:string-join($prop-value/descendant-or-self::text()," ")) eq $max-length) then
              $length-weight
            else 0
          else 0
        let $source-score := fn:sum((
          for $source in $sources
          return
          (: See MDM-529 for why the below is needed :)
            fn:head((
              $property-spec/*:source-weights/*:source[@name = $source/name]/@weight,
              $property-spec/*:source-weights/*:source[*:name = $source/name]/*:weight
            ))
        ))
        let $weight := fn:max(($length-score, $source-score))
        where fn:exists($sources[fn:exists(. intersect $selected-sources)])
        stable order by $weight descending, $source-score descending, $source-dateTime descending
        return
          $property
      ),
      1,
      fn:head(
        ($property-spec/@max-values, 99)
      )
    )
};

declare function merging:standard-condense-properties(
  $property-name as xs:QName,
  $all-properties as item()*,
  $property-spec as element()?
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
  $merge-options as element(m:options),
  $docs,
  $sources,
  $property-spec as element()?)
{
  let $uris := $docs ! xdmp:node-uri(.)
  return
    sem:sparql(
      'construct { ?s ?p ?o } where {
        ?s ?p ?o.
        BIND (datatype(?s) AS ?dataType)
        FILTER (!BOUND(?dataType) || ?dataType != <http://marklogic.com/xdmp/sql#rowID>)
      }',
      (), "map",
      sem:store((), cts:document-query($uris))
    )
};
