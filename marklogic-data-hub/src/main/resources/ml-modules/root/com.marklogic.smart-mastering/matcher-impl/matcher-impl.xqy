xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : The process of matching starts with one document, which is not required to
 : be in the database. The match options specify what properties are to be used
 : to find matches. See match options documentation for details. The options
 : may specify multiple thresholds, each of which corresponds to an action.
 :
 : Implementation notes: the configured properties are used to generate a boost
 : query. The match part of the query identifies a set of subqueries that a
 : document must match in order to get a score above the lowest threshold.
 : Match queries all have their scores set to zero. The boost part of the query
 : is used to provide the score.

 : @see https://marklogic-community.github.io/smart-mastering-core/docs/matching-options/
 :)

module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl";

import module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";
import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

declare variable $QUERIES_WITH_WEIGHT := (
    xs:QName("cts:element-attribute-pair-geospatial-query"),xs:QName("cts:element-attribute-range-query"),
    xs:QName("cts:element-attribute-value-query"),xs:QName("cts:element-attribute-word-query"),xs:QName("cts:element-child-geospatial-query"),
    xs:QName("cts:element-geospatial-query"),xs:QName("cts:element-pair-geospatial-query"),xs:QName("cts:element-range-query"),
    xs:QName("cts:element-value-query"),xs:QName("cts:element-word-query"),xs:QName("cts:field-range-query"),
    xs:QName("cts:field-value-query"),xs:QName("cts:field-word-query"),xs:QName("cts:geospatial-region-query"),
    xs:QName("cts:json-property-child-geospatial-query"),xs:QName("cts:json-property-geospatial-query"),
    xs:QName("cts:json-property-pair-geospatial-query"),xs:QName("cts:json-property-range-query"),xs:QName("cts:json-property-value-query"),
    xs:QName("cts:json-property-word-query"),xs:QName("cts:lsqt-query"),xs:QName("cts:near-query"),xs:QName("cts:not-query"),
    xs:QName("cts:path-geospatial-query"),xs:QName("cts:path-range-query"),xs:QName("cts:range-query"),xs:QName("cts:registered-query"),
    xs:QName("cts:reverse-query"),xs:QName("cts:similar-query"),xs:QName("cts:triple-range-query"),xs:QName("cts:word-query"));

(:
 : Find documents that are potential matches for the provided document.
 : @param $document  a source document to draw values from
 : @param $options  XML or JSON representation of match options
 : @param $start  paging: 1-based index
 : @param $page-length  paging: number of results to return
 : @param $minimum-threshold  the required score for the lowest-scoring
 :                            threshold (see match options)
 : @param $include-matches  if true, the response will include, for each result,
 :                          the properties that earned points for the match
 :                          (similar) to snippets
 : @param $filter-query  a cts:query that reduces the scope of documents that
 :                       will be searched for matches
 : @return results specify document URIs that matches for provided document
 :)
declare function match-impl:find-document-matches-by-options(
  $document as node()?,
  $options as item(),
  $start as xs:integer,
  $page-length as xs:integer,
  $minimum-threshold as xs:double,
  $include-matches as xs:boolean,
  $filter-query as cts:query
) as element(results)
{
  (: increment usage count :)
  tel:increment(),
  match-impl:find-document-matches-by-options(
    $document,
    $options,
    $start,
    $page-length,
    $minimum-threshold,
    $include-matches,
    $filter-query,
    fn:true()
  )
};

declare function match-impl:find-document-matches-by-options(
  $document as node()?,
  $options as item(),
  $start as xs:integer,
  $page-length as xs:integer,
  $minimum-threshold as xs:double,
  $include-matches as xs:boolean,
  $filter-query as cts:query,
  $include-results as xs:boolean
) as element(results)
{
  match-impl:find-document-matches-by-options(
    $document,
    $options,
    $start,
    $page-length,
    $minimum-threshold,
    $include-matches,
    $filter-query,
    $include-results,
    (: by default don't short-circuit redundant queries :)
    fn:false()
  )
};

(: A map to track match queries previously searched on. Useful for process-impl:build-match-summary :)
declare variable $map-of-queries-previously-run := map:map();

declare function match-impl:find-document-matches-by-options(
  $document as node()?,
  $options as item(),
  $start as xs:integer,
  $page-length as xs:integer,
  $minimum-threshold as xs:double,
  $include-matches as xs:boolean,
  $filter-query as cts:query,
  $include-results as xs:boolean,
  $short-circuit-redundant-queries as xs:boolean
) as element(results)
{
  if (fn:exists($document)) then (
    let $start-elapsed := xdmp:elapsed-time()
    let $is-json := (xdmp:node-kind($document) = "object" or fn:exists($document/(object-node()|array-node())))
    let $_trace := xdmp:trace($const:TRACE-MATCH-RESULTS, " is-json: " || $is-json)
    let $compiled-options := opt-impl:compile-match-options($options, $minimum-threshold)
    let $_set-data-format := $compiled-options => map:put("dataFormat", if ($is-json) then $const:FORMAT-JSON else $const:FORMAT-XML)
    let $values-by-property-name := match-impl:values-by-property-name($document, $compiled-options)
    let $query-prov as map:map? :=
        if ($include-results and $include-matches) then
          map:map()
        else ()
    let $cached-queries := map:map()
    let $minimum-threshold-combinations-queries :=
      for $query-set in $compiled-options => map:get("minimumThresholdCombinations")
      let $query-maps := $query-set => map:get("queries")
      let $not-query-maps := $query-set => map:get("notQueries")
      let $queries :=
        for $query-map in $query-maps
        (: if there are no values from the document for a query, then match-impl:query-map-to-query returns an empty sequence  :)
        let $queries := match-impl:query-map-to-query($document, $query-map, $values-by-property-name, $cached-queries, $query-prov)
        return if (fn:count($queries) gt 1) then
            (: if a match ruleset has multiple queries, be sure to AND them :)
            helper-impl:group-queries-by-scope($queries, cts:and-query#1)
          else
            $queries
      let $not-queries :=
        for $not-query-map in $not-query-maps
        (: if there are no values from the document for a query, then match-impl:query-map-to-query returns an empty sequence  :)
        let $queries := match-impl:query-map-to-query($document, $not-query-map, $values-by-property-name, $cached-queries, ())
        return if (fn:count($queries) gt 1) then
        (: if a match ruleset has multiple queries, be sure to AND them :)
          helper-impl:group-queries-by-scope($queries, cts:and-query#1)
        else
          $queries
      (: We want to be certain that we have values for each of the queries in a min threshold combo :)
      where fn:exists($queries) and fn:count($queries) eq fn:count($query-maps)
      return
          let $positive-query :=
            if (fn:count($queries) gt 1) then
              helper-impl:group-queries-by-scope($queries, cts:and-query#1)
            else
              $queries
          return
            if (fn:exists($not-queries)) then
              cts:and-not-query(
                  $positive-query,
                  if (fn:count($not-queries) gt 1) then
                    cts:or-query($not-queries)
                  else
                    $not-queries
              )
            else
              $positive-query
    (: We want to ignore redundant queries. This only applies to expanded searches to find additional merges that may be added via process-impl:build-match-summary
     : If the queries generated by a document are the same as document previously searched on, it won't result in additional URIs.
     :)
    let $has-redundant-match-combo := $short-circuit-redundant-queries and (
      every $min-query in $minimum-threshold-combinations-queries satisfies
        map:contains($map-of-queries-previously-run, xdmp:md5(document{$min-query}))
    )
    let $_cache-minimum-threshold := if ($short-circuit-redundant-queries and fn:not($has-redundant-match-combo)) then
      for $min-query in $minimum-threshold-combinations-queries
      return map:put($map-of-queries-previously-run, xdmp:md5(document{$min-query}), fn:true())
    else ()
    (: If there are no match queries, just return a cts:false-query  :)
    let $minimum-threshold-combinations-query :=
      if (fn:exists($minimum-threshold-combinations-queries)) then
        helper-impl:group-queries-by-scope($minimum-threshold-combinations-queries, cts:or-query#1)
      else
        cts:false-query()
    (: Exclude the current document and any blocked matches :)
    let $document-uri := xdmp:node-uri($document)
    let $excluded-uris := (
      $document-uri,
      blocks-impl:get-blocks(fn:base-uri($document))/node()
    )
    let $match-base-query := cts:and-query((
          $compiled-options => map:get("baseContentQuery"),
          $minimum-threshold-combinations-query
        ))
    let $match-query :=
      if (fn:exists($excluded-uris)) then
        cts:and-not-query(
          $match-base-query,
          cts:document-query($excluded-uris)
        )
      else
        $match-base-query
    let $match-query :=
      match-impl:instance-query-wrapper(
        if (fn:not($filter-query instance of cts:true-query)) then
          cts:and-query((
            $filter-query,
            $match-query
          ))
        else
          $match-query,
        $is-json
      )
    let $serialized-match-query :=
      element match-query {
        $match-query
      }
    let $_trace := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
            xdmp:trace($const:TRACE-MATCH-RESULTS, "match-query cts.doc('"||$document-uri||"'):" || xdmp:describe($match-query, (),()))
        else ()
    return
      (: If minimum threshold can't be met or we're short-circuiting a query already run, don't bother with estimate and search :)
      if ($minimum-threshold-combinations-query instance of cts:false-query or $has-redundant-match-combo) then
        match-impl:build-empty-results($start, $page-length, $serialized-match-query)
      else
        let $estimate := xdmp:estimate(cts:search(fn:collection(), $match-query, "unfiltered"))
        return (
          xdmp:trace($const:TRACE-MATCH-RESULTS, "Estimated " || $estimate || " doc(s) found for cts.doc('"|| $document-uri ||"') in " || xdmp:database-name(xdmp:database())),
          element results {
            attribute total { $estimate },
            attribute page-length { $page-length },
            attribute start { $start },
            $serialized-match-query,
            if ($include-results and $estimate gt 0) then
              let $queries-for-scoring :=
                for $query-map in map:get($compiled-options, "queries")
                let $query := match-impl:query-map-to-query($document, $query-map, $values-by-property-name, $cached-queries, $query-prov)
                let $_trace :=
                  if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
                    xdmp:trace($const:TRACE-MATCH-RESULTS, "'"|| $query-map => map:get("name") ||"' query:" || xdmp:describe($query,(),()))
                  else ()
                (: query may not exist if there weren't values passed, etc. :)
                where fn:exists($query)
                return
                  map:map()
                    => map:with("name", $query-map => map:get("name"))
                    => map:with("weight", $query-map => map:get("weight"))
                    => map:with("matchRules", $query-map => map:get("matchRules"))
                    => map:with("query",
                        if (fn:count($query) gt 1) then
                          helper-impl:group-queries-by-scope($query, cts:and-query#1)
                        else
                          $query
                  )
              let $_trace :=
                if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
                  xdmp:trace($const:TRACE-MATCH-RESULTS, "cts.doc('"|| $document-uri ||"') property values:" || xdmp:to-json-string($values-by-property-name))
                else ()
              return
                  match-impl:search(
                    $match-query,
                    $queries-for-scoring,
                    $minimum-threshold,
                    $start,
                    $page-length,
                    $compiled-options,
                    $include-matches,
                    $is-json,
                    $query-prov
                  )
            else (),
            if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
              xdmp:trace($const:TRACE-PERFORMANCE, "match-impl:find-document-matches-by-options: " || (xdmp:elapsed-time() - $start-elapsed))
            else ()
          }
        )
  ) else
    match-impl:build-empty-results($start,$page-length, ())
};

declare function match-impl:build-empty-results(
  $start as xs:integer,
  $page-length as xs:integer,
  $serialize-match-query as node()?
) {
  element results {
    attribute total { 0 },
    attribute page-length { $page-length },
    attribute start { $start },
    $serialize-match-query
  }
};

(:
 : Does each item in $s1 appear in $s2?
 :)
declare function match-impl:seq-contains($s1, $s2)
{
  every $s in $s1 satisfies $s = $s2
};

(:
 : Convert map:map describing query to cts:query
 : @param $query-map  map:map describing a query to generate
 : @param $values-by-qname  map:map that organizes document values by QName
 : @param $cached-queries  map:map caching previously generated queries
 : @param $query-prov map:map to optionally track the provenance of queries contributing to match
 : @return cts:query?
 :)
declare function match-impl:query-map-to-query(
  $document as node(),
  $query-map as map:map,
  $values-by-property-name as map:map,
  $cached-queries as map:map,
  $query-prov as map:map?
)
{
  if (map:contains($query-map, "matchRulesetId") and map:contains($cached-queries, $query-map => map:get("matchRulesetId"))) then
    map:get($cached-queries, $query-map => map:get("matchRulesetId"))
  else
    let $is-reduce := $query-map => map:get("isReduce")
    let $sub-query-maps := map:get($query-map, "matchQueries")
    let $queries :=
      for $sub-query-map in $sub-query-maps
      let $queries :=
        if ($sub-query-map => map:get("type") = "reduce") then
          ($sub-query-map => map:get("valuesToQueryFunction"))($document)
        else
          let $property-name := fn:string($sub-query-map => map:get("propertyName"))
          let $values := $values-by-property-name => map:get($property-name)
          where fn:exists($values)
          return
            ($sub-query-map => map:get("valuesToQueryFunction"))($values)
      let $query :=
        if (fn:count($queries) gt 1) then
          (: if a query function returns multiple queries without explict ANDing them, we're assuming that they should be ORed :)
          helper-impl:group-queries-by-scope($queries, cts:or-query#1)
        else
          $queries
      return (
        if (fn:exists($query-prov)) then
          for $query-hash in document {$query}//schema-element(cts:query) ! xdmp:md5(document{.})
          where fn:not(map:contains($query-prov,$query-hash)) or ((map:get($query-prov, $query-hash) => map:get("type")) = "reduce")
          return map:put($query-prov, $query-hash, $sub-query-map)
        else (),
        $query
      )
    (: We want to be certain that didn't lose any queries in the match ruleset, since we don't call the function if no values exist :)
    where fn:exists($queries) and fn:count($queries) eq fn:count($sub-query-maps)
    return (
      map:put($cached-queries, $query-map => map:get("matchRulesetId"), $queries),
      $queries
    )

};

(:
 : Organize values by property name
 : @param $document  document with property values
 : @param $compiled-options  map:map with compiled details about match options
 : @return map:map of values organized by QName
 :)
declare function match-impl:values-by-property-name(
  $document as node()?,
  $compiled-options as map:map
)
{
  map:new(
    let $property-names-to-values := map:get($compiled-options, "propertyNamesToValues")
    for $property-name in map:keys($property-names-to-values)
    let $values := map:get($property-names-to-values, $property-name)($document)
    let $_trace :=
      if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "Values for cts.doc(" || xdmp:node-uri($document) || ") " || $property-name || ": " || xdmp:describe($values, (), ()))
      else ()
    where fn:exists($values)
    return
      map:entry($property-name, $values)
  )
};

(:
 : Execute the generated search and construct the response.
 : @param $match-query  a query built such that any matches will score at least
 :                      high enough to reach the lowest threshold
 : @param $queries-for-scoring  a sequence of query maps that are used to score matches
 : @param $filter-query  a query to reduce the universe of match candidates
 : @param $min-threshold  lowest score required to hit a threshold
 : @param $start  paging: 1-based index
 : @param $page-length  paging
 : @param $algorithms  map derived from match options
 : @param $options  full match options; included to pass to reduce algorithm
 : @param $include-matches
 : @param $is-json
 : @param $query-prov an optional map for tracking how options/algorithms contributed to matches
 : @return results specify document URIs that matches for provided document
 :)
declare function match-impl:search(
  $match-query,
  $queries-for-scoring,
  $min-threshold as xs:double,
  $start as xs:int,
  $page-length as xs:int,
  $compiled-options as map:map,
  $include-matches as xs:boolean,
  $is-json as xs:boolean,
  $query-prov as map:map?
) {
  let $range := $start to ($start + $page-length - 1)
  let $cts-walk-query :=
    if ($include-matches) then
      cts:or-query($queries-for-scoring ! map:get(., "query"))
    else ()
  let $thresholds := $compiled-options => map:get("orderedThresholds")
  for $result at $pos in cts:search(
    fn:collection(),
    $match-query,
    ("unfiltered", "score-simple"),
    0
  )[fn:position() = $range]
  let $uri := xdmp:node-uri($result)
  let $matching-query-maps :=
    for $query-map in $queries-for-scoring
    let $query := $query-map => map:get("query")
    let $contains := cts:contains($result,$query)
    let $_trace :=
      if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        let $weight := $query-map => map:get("weight")
        let $name := $query-map => map:get("name")
        return (
          xdmp:trace($const:TRACE-MATCH-RESULTS, "Checking cts.doc('" || $uri ||"') for match against ruleset '" || $name || " with weight "|| $weight ||": " || $contains),
          xdmp:trace($const:TRACE-MATCH-RESULTS, "Ruleset '" || $name || "' query: " || xdmp:describe($query, (),()))
        )
      else ()
    where $contains
    return $query-map
  let $score :=
      fn:sum(
          $matching-query-maps ! map:get(., "weight")
      )
  let $_trace := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "cts.doc('" || $uri || "') score: " || $score || " minimum-threshold: " || $min-threshold)
    else ()
  where $score ge $min-threshold
  return
    element result {
      attribute uri {$uri},
      attribute index {$range[fn:position() = $pos]},
      attribute score {$score},
      let $selected-threshold := fn:head($thresholds[$score ge score])
      return (
        attribute threshold { fn:string($selected-threshold/thresholdName) },
        attribute action { fn:string($selected-threshold/action) }
      ),
      if ($include-matches) then
        element matches {
        (: rather than store the entire node and risk mixing
             content type (json != xml) we store the path to the
             node instead :)
          let $instance := $result/*:envelope/*:instance
          for $match-query-map in $matching-query-maps
          let $ruleset-name := map:get($match-query-map, "name")
          let $ruleset-query := map:get($match-query-map, "query")
          let $ruleset-weight := map:get($match-query-map, "weight")
          let $walk-query := if ($ruleset-query instance of cts:and-query) then
            cts:or-query(cts:and-query-queries($ruleset-query))
          else
            $ruleset-query
          let $_trace := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
              xdmp:trace($const:TRACE-MATCH-RESULTS, "Walking document with query: " || xdmp:describe($walk-query,(),()))
            else ()
          return <match weight="{$ruleset-weight}">
            <rulesetName>{$ruleset-name}</rulesetName>
            { cts:walk(
                $instance,
                $walk-query,
                (for $query in $cts:queries
                let $query-hash := xdmp:md5(document {$query})
                let $node-name := fn:string(fn:head((fn:node-name($cts:node), fn:node-name($cts:node/..))))
                let $query-map := map:get($query-prov, $query-hash)
                let $_trace := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then (
                  xdmp:trace($const:TRACE-MATCH-RESULTS, "Walking document and matched query: " || xdmp:describe($query,(),())),
                  if (fn:empty($query-map)) then
                    xdmp:trace($const:TRACE-MATCH-RESULTS, "Query hash '" || $query-hash || "' not found in provenance. All provenance: " || xdmp:to-json-string($query-prov))
                  else
                    xdmp:trace($const:TRACE-MATCH-RESULTS, "Query hash '" || $query-hash || "' found in provenance. Query provenance: " || xdmp:to-json-string($query-map))
                ) else ()
                return
                  <contributions>
                    <algorithm>{fn:string(fn:head(($query-map ! map:get(., "algorithm") ! fn:string(.), "exact")))}</algorithm>
                    <nodeName>{$node-name}</nodeName>,
                    <value>{fn:data($cts:node)}</value>,
                    <path>{xdmp:path($cts:node, fn:true())}</path>
                  </contributions>)
            )
          }</match>
        }
      else ()
    }
};

(: Configuration used to convert XML match results to JSON. :)
declare variable $results-json-config := match-impl:_results-json-config();

declare function match-impl:_results-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "array-element-names", ("result","matches","algorithms",xs:QName("cts:option"),xs:QName("cts:text"),xs:QName("cts:element"))),
    map:put($config, "full-element-names",
      (xs:QName("cts:query"),
      xs:QName("cts:and-query"),
      xs:QName("cts:near-query"),
      xs:QName("cts:or-query"))
    ),
    map:put($config, "json-children", "queries"),
    map:put($config, "attribute-names",
      ("name","localname", "namespace", "function", "weight",
      "at", "property-name", "weight", "above", "label","algorithm-ref")
    ),
    map:put($config, "camel-case", fn:true()),
    $config
  )
};

(:
 : Convert XML match results to JSON.
 :)
declare function match-impl:results-to-json($results-xml)
  as object-node()?
{
  if (fn:exists($results-xml)) then
    xdmp:to-json(
      json:transform-to-json-object($results-xml, $results-json-config)
    )/node()
  else ()
};

declare function match-impl:instance-query-wrapper(
  $query as cts:query,
  $is-json as xs:boolean
) {
  if ($is-json) then
    if (fn:exists($const:JSON-INSTANCE)) then
      cts:json-property-scope-query($const:JSON-INSTANCE, $query)
    else ()
  else
    if (fn:exists($const:XML-INSTANCE)) then
      cts:element-query($const:XML-INSTANCE, $query)
    else ()
};
