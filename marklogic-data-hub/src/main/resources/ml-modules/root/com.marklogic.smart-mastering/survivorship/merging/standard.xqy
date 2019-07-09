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
    merging:merge-complementing-properties(
      $all-properties,
      ()
    )
};

declare function merging:merge-complementing-properties(
  $remaining-properties,
  $merged-properties
)
{
  if (fn:empty($remaining-properties)) then
    $merged-properties
  else if (fn:empty($merged-properties) and fn:count($remaining-properties) eq 1) then
    $remaining-properties
  else
    let $complementing-indexes-map := map:map()
    let $current-property := fn:head($remaining-properties)
    let $current-property-values := $current-property => map:get("values")
    let $prop-has-values := ($current-property-values ! merging:node-has-values(.)) = fn:true()
    let $current-property-values-by-type := merging:group-properties-by-type($current-property-values)
    let $following-properties := fn:tail($remaining-properties)
    let $is-nested := fn:count(fn:head($current-property-values)/*) eq 1 and fn:exists($current-property-values/*/*)
    let $complementing-properties :=
        for $prop at $pos in $following-properties
        let $prop-values := $prop => map:get("values")
        let $sub-values :=
          if ($is-nested) then
            $prop-values/*/*
          else
            $prop-values/*
        where
          merge-impl:multi-node-equals($current-property-values, $prop-values)
          or
          (($prop-values ! merging:node-has-values(.)) = fn:true()
          and
          $prop-has-values
          and
          ((
            fn:empty($sub-values)
              and
            merging:are-grouped-nodes-complementary(
              $current-property-values-by-type,
              merging:group-properties-by-type($prop-values)
            )
          )
          or
          (
            fn:exists($sub-values)
              and
            (fn:string-length(fn:string($prop-values)) > 0)
              and
            (every $sub-value in $sub-values,
              $sub-value-qn in fn:node-name($sub-value),
              $counterpart-sub-value in $current-property-values/(.|*)/*[fn:node-name(.) eq $sub-value-qn]
            satisfies
              fn:deep-equal($counterpart-sub-value, $sub-value)
                or
              $sub-value instance of null-node()
                or
              (
                (
                  $sub-value instance of text() or $sub-value instance of boolean-node()
                  or $sub-value instance of number-node() or $sub-value instance of element()
                )
                  and
                fn:string($sub-value) eq ""
              )
            )
          )))
        return
          let $_set-index :=
            $complementing-indexes-map => map:put("$indexes", (map:get($complementing-indexes-map, "$indexes"),$pos))
          return
            $prop
    let $merged-properties :=
      if (fn:exists($complementing-properties)) then
        let $all-complementing-values := (
          $current-property-values,
          $complementing-properties ! map:get(., "values")
        )
        let $distinct-property-names :=
          if ($is-nested) then
            fn:distinct-values($all-complementing-values/*/* ! fn:node-name(.))
          else
            fn:distinct-values($all-complementing-values/* ! fn:node-name(.))
        let $current-property-name := $current-property => map:get("name")
        return (
          $merged-properties,
          map:new((
            fn:fold-left(function($a, $b) { $a + $b }, $current-property, $complementing-properties),
            map:entry("sources", (
              ($current-property => map:get("sources"))
                union
              ($complementing-properties ! map:get(., "sources"))
            )),
            map:entry("values", (
              if ($current-property-values instance of element()+) then
                element {$current-property-name} {
                  let $selected-items :=
                    for $prop-name in $distinct-property-names
                    return
                      fn:head($all-complementing-values/(.|*)/*[fn:node-name(.) eq $prop-name][fn:normalize-space(fn:string())])
                  return
                    if (fn:empty($current-property-values/*)) then
                      text { $current-property-values/text() ! fn:string(.) }
                    else if ($is-nested) then
                      element {fn:node-name(fn:head($current-property-values)/*)} {
                        $selected-items
                      }
                    else
                      $selected-items
                }
              else if ($current-property-values instance of object-node()) then
                (
                object-node {
                  $current-property-name: (
                    xdmp:to-json(
                      let $object-body := map:new((
                          for $prop-name in $distinct-property-names
                          let $complementing-values := $all-complementing-values/(.|node())/node()[fn:node-name(.) eq $prop-name]
                          return
                            map:entry(
                              fn:string($prop-name),
                              fn:head((
                                for $val in $complementing-values
                                order by fn:string-length(fn:string-join($val//node() ! fn:string(.),"")) descending
                                return $val
                              ))
                            )
                        ))
                      return
                        if ($is-nested) then
                          map:entry(fn:string(fn:node-name(fn:head($current-property-values)/*)), $object-body)
                        else
                          $object-body
                    )/object-node()
                  )
                })/*[fn:node-name(.) eq $current-property-name]
              else
                let $original-values := $all-complementing-values/(.[fn:empty(self::array-node())]/node()|.)
                let $group-by-node-type := merging:group-properties-by-type($original-values)
                let $new-values :=
                  for $type in map:keys($group-by-node-type)
                  let $values := map:get($group-by-node-type, $type)
                  return
                    switch ($type)
                      case "null" return
                        null-node {}
                      case "number" return
                        fn:distinct-values($values ! fn:number(.)) ! number-node {.}
                      case "boolean" return
                        fn:distinct-values($values ! fn:boolean(.)) ! boolean-node {.}
                      default return
                        fn:distinct-values($values ! fn:string(.)) ! text {.}
                for $new-value in $new-values
                let $comparable-nodes :=
                  typeswitch($new-value)
                  case null-node() return map:get($group-by-node-type, 'null')
                  case number-node() return map:get($group-by-node-type, 'number')
                  case boolean-node() return map:get($group-by-node-type, 'boolean')
                  default return
                    map:keys($group-by-node-type)[fn:not(. = ("null","number","boolean"))] !
                    map:get($group-by-node-type, .)
                let $matching-nodes := $comparable-nodes[. = $new-value]
                order by fn:max($matching-nodes ! fn:count(./preceding-sibling::node())) ascending
                return $new-value
            )),
            map:entry("name", $current-property-name)
          ))
        )
      else (
        $merged-properties,
        $current-property
      )
    let $complementing-indexes := $complementing-indexes-map => map:get("$indexes")
    return
      merging:merge-complementing-properties(
        if (fn:exists($complementing-indexes)) then
          $following-properties[fn:not(fn:position() = $complementing-indexes)]
        else
          $following-properties,
        $merged-properties
      )
};

declare function merging:are-grouped-nodes-complementary($grouped-nodes-1 as map:map, $grouped-nodes-2 as map:map)
{
  let $group-1-keys := map:keys($grouped-nodes-1)
  let $group-2-keys := map:keys($grouped-nodes-2)
  return
    $group-1-keys = $group-2-keys
    and (
      every $node-kind in fn:distinct-values(($group-1-keys,$group-2-keys))
      satisfies (
        let $nodes-of-kind-1 := map:get($grouped-nodes-1, $node-kind)
        let $nodes-of-kind-2 := map:get($grouped-nodes-2, $node-kind)
        let $nodes-1-is-min-count := fn:count($nodes-of-kind-1) lt fn:count($nodes-of-kind-2)
        let $min-set-of-nodes :=
          if ($nodes-1-is-min-count) then
            $nodes-of-kind-1
          else
            $nodes-of-kind-2
        let $max-set-of-nodes :=
          if ($nodes-1-is-min-count) then
            $nodes-of-kind-2
          else
            $nodes-of-kind-1
        return
          every $n in $min-set-of-nodes satisfies
          $n = $max-set-of-nodes
      )
    )
};


declare function merging:group-properties-by-type($nodes as node()*)
{
  let $group-by-node-type := map:map()
  let $_group-by-node-type :=
    for $val in $nodes
    let $type := xdmp:node-kind($val)
    return
      map:put($group-by-node-type, $type, (map:get($group-by-node-type, $type),$val))
  return $group-by-node-type
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

declare function merging:node-has-values($node as node())
{
  typeswitch($node)
    case object-node()|array-node() return
      fn:normalize-space(fn:string-join($node//(text()|boolean-node()|number-node()) ! fn:string(.), "")) ne ""
    default return
      fn:normalize-space(fn:string($node)) ne ""
};
