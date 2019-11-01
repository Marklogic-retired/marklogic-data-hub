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

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms"
  at  "/com.marklogic.smart-mastering/algorithms/base.xqy",
      "/com.marklogic.smart-mastering/algorithms/standard-reduction.xqy";
import module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace es-helper = "http://marklogic.com/smart-mastering/entity-services" at "/com.marklogic.smart-mastering/sm-entity-services.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";
import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";
import module namespace coll = "http://marklogic.com/smart-mastering/collections"
  at "/com.marklogic.smart-mastering/impl/collections.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace es = "http://marklogic.com/entity-services";

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

declare variable $_cached-compiled-match-options as map:map := map:map();

(:
 : Calculate queries once per unique match options in request to reduce repeat logic
 : @param $match-options  Options specifying how documents will be matched
 : @param $document-is-json  Is a JSON document we are matching?
 : @param $minimum-threshold  Minimum threshold for search results to meet
 : @return map:map with compiled information about match options
 :)
declare function match-impl:compile-match-options(
  $match-options as node(),
  $document-is-json as xs:boolean,
  $minimum-threshold as xs:double
) {
  let $cache-id :=
      fn:generate-id($match-options) || "|doc-is-json:"|| $document-is-json || "|min-threshold:" || $minimum-threshold
  return
  if (map:contains($_cached-compiled-match-options, $cache-id)) then
    map:get($_cached-compiled-match-options, $cache-id)
  else
    let $options :=
      if ($match-options instance of object-node()) then
        opt-impl:options-from-json($match-options)
      else
        $match-options
    let $data-format := $options/matcher:data-format
    let $options :=
          if (fn:empty($data-format)) then
            element matcher:options {
              element matcher:data-format {
                if ($document-is-json) then $const:FORMAT-JSON else $const:FORMAT-XML
              },
              $options/*
            }
          else
            $options
    let $scoring := $options/matcher:scoring
    let $max-property-score := fn:max(($scoring/@weight ! fn:number(.)))
    let $score-ratio :=
        if ($max-property-score le 64) then
          1
        else
          (64 idiv $max-property-score)
    let $algorithms := algorithms:build-algorithms-map($options/matcher:algorithms)
    let $target-entity := $options/matcher:target-entity ! fn:string(.)
    let $target-entity-def := es-helper:get-entity-def($target-entity)
    let $queries := (
        for $score in $scoring/(matcher:add|matcher:expand)
        let $type := fn:local-name($score)
        let $weight := fn:number($score/@weight)
        let $full-property-name := $score/@property-name
        let $helper-query := helper-impl:property-name-to-query($options, $full-property-name)
        where fn:exists($helper-query)
        order by $weight descending
        return
          let $qname := helper-impl:property-name-to-qname($options, $full-property-name)
          let $base-values-query :=
              if ($type eq "add") then
                $helper-query(?, $weight)
              else if ($type eq "expand") then
                let $algorithm := map:get($algorithms, $score/@algorithm-ref)
                where fn:exists($algorithm)
                return algorithms:execute-algorithm($algorithm, ?, $score, $options)
              else ()
          return map:new((
            map:entry("queryID", sem:uuid-string()),
            map:entry("propertyName",$full-property-name),
            map:entry("type",$type),
            map:entry("weight",$weight),
            map:entry("qname", $qname),
            map:entry(
              "valuesToQueryFunction",
              $base-values-query
            )
          )),
        for $score in $scoring/matcher:reduce
        let $type := fn:local-name($score)
        let $weight := fn:number($score/@weight)
        let $algorithm-ref := $score/@algorithm-ref
        return
          map:new((
            map:entry("queryID", sem:uuid-string()),
            map:entry("type",$type),
            map:entry("weight",$weight),
            map:entry("algorithm", fn:head(($algorithm-ref, "standard"))),
            map:entry(
              "valuesToQueryFunction",
              if ($type eq "reduce") then
                let $algorithm := $algorithm-ref ! map:get($algorithms, .)
                return
                  if (fn:exists($algorithm)) then
                    algorithms:execute-algorithm($algorithm, ?, $score, $options)
                  else
                    algorithms:standard-reduction-query(?, $score, $options)
              else ()
            )
          ))
      )
    let $minimum-threshold-combinations :=
        match-impl:minimum-threshold-combinations($queries[fn:not(. => map:get("type") = "reduce")], $minimum-threshold)
    let $compiled-match-options := map:new((
        map:entry("options", $options),
        map:entry("targetEntity", $target-entity),
        map:entry("scoreRatio", $score-ratio),
        map:entry("algorithms", $algorithms),
        map:entry("queries", $queries),
        map:entry("orderedThresholds",
          for $threshold in $options/matcher:thresholds/matcher:threshold
          order by $threshold/@above cast as xs:decimal descending
          return $threshold
        ),
        map:entry("minimumThresholdCombinations", $minimum-threshold-combinations),
        map:entry("baseContentQuery",
          if (fn:exists($target-entity)) then
            instance-query-wrapper(
              if ($document-is-json) then
                cts:json-property-scope-query(
                  "info",
                  cts:json-property-value-query("title", fn:string($target-entity-def/entityTitle), (), 0)
                )
              else
                cts:element-query(
                  xs:QName("es:info"),
                  cts:element-value-query(xs:QName("es:title"), fn:string($target-entity-def/entityTitle), (), 0)
                )
              ,
              $document-is-json
            )
          else
            match-impl:build-collection-query(coll:content-collections($options))
        )
      ))
    return (
      map:put(
        $_cached-compiled-match-options,
        $cache-id,
        $compiled-match-options
      ),
      $compiled-match-options
    )
};

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
    let $compiled-options := match-impl:compile-match-options($options, $is-json, $minimum-threshold)
    let $values-by-qname := match-impl:values-by-qname($document, $compiled-options)
    let $query-prov as map:map? :=
        if ($include-results and $include-matches) then
          map:map()
        else ()
    let $cached-queries := map:map()
    let $minimum-threshold-combinations-queries :=
      for $query-set in $compiled-options => map:get("minimumThresholdCombinations")
      let $query-maps := $query-set => map:get("queries")
      let $queries :=
        for $query-map in $query-maps
        (: if there are no values from the document for a query, then match-impl:query-map-to-query returns an empty sequence  :)
        return match-impl:query-map-to-query($query-map, $values-by-qname, $cached-queries, $query-prov)
      (: We want to be certain that we have values for each of the queries in a min threshold combo :)
      where fn:exists($queries) and fn:count($queries) eq fn:count($query-maps)
      return
        let $queries := if (fn:count($queries) gt 1) then
          helper-impl:group-queries-by-scope($queries, cts:and-query#1)
        else
          $queries
        return
          if (fn:count($queries) gt 1) then
            cts:and-query($queries)
          else
            $queries
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
    let $excluded-uris := (
      xdmp:node-uri($document),
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
    return
      (: If minimum threshold can't be met or we're short-circuiting a query already run, don't bother with estimate and search :)
      if ($minimum-threshold-combinations-query instance of cts:false-query or $has-redundant-match-combo) then
        match-impl:build-empty-results($start, $page-length, $serialized-match-query)
      else
        let $estimate := xdmp:estimate(cts:search(fn:collection(), match-impl:instance-query-wrapper($match-query, $is-json), "unfiltered"))
        return (
          element results {
            attribute total { $estimate },
            attribute page-length { $page-length },
            attribute start { $start },
            $serialized-match-query,
            if ($include-results and $estimate gt 0) then
              let $boost-query := match-impl:build-boost-query($document, $values-by-qname, $compiled-options, $cached-queries, $query-prov)
              return
                  match-impl:search(
                    $match-query,
                    $boost-query,
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
 :
 :)
declare function match-impl:build-collection-query($collections as xs:string*)
{
  if (fn:empty($collections)) then
    ()
  else if (fn:count($collections) > 1) then
    cts:and-query($collections ! cts:collection-query(.))
  else
    cts:collection-query($collections)
};

(:
 : Does each item in $s1 appear in $s2?
 :)
declare function match-impl:seq-contains($s1, $s2)
{
  every $s in $s1 satisfies $s = $s2
};

(:
 : Build the boost query as specified by the match options.
 : @param $document  the source document from which property values are drawn
 : @param $values-by-qname  map:map that organizes document values by QName
 : @param $compiled-options map:map with compiled details about match options
 : @param $cached-queries map:map containing previously created queries
 : @param $query-prov map:map to optionally track the provenance of queries contributing to match
 : @return a cts:or-query that will be used as a boost query
 :)
declare function match-impl:build-boost-query(
  $document as node(),
  $values-by-qname as map:map,
  $compiled-options as map:map,
  $cached-queries as map:map,
  $query-prov as map:map?
)
{
  cts:or-query((
    for $query-map in map:get($compiled-options, "queries")
    return
      if ($query-map => map:get("type") = "reduce") then
        ($query-map => map:get("valuesToQueryFunction"))($document)
      else
        match-impl:query-map-to-query($query-map, $values-by-qname, $cached-queries, $query-prov)
  ))
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
  $query-map as map:map,
  $values-by-qname as map:map,
  $cached-queries as map:map,
  $query-prov as map:map?
)
{
  if (map:contains($query-map, "queryID") and map:contains($cached-queries, $query-map => map:get("queryID"))) then
    map:get($cached-queries, $query-map => map:get("queryID"))
  else
    let $query :=
        let $qname := $query-map => map:get("qname")
        let $values := $values-by-qname => map:get(xdmp:key-from-QName($qname))
        where fn:exists($values)
        return
          ($query-map => map:get("valuesToQueryFunction"))($values)
    return (
      map:put($cached-queries, $query-map => map:get("queryID"), $query),
      if (fn:exists($query-prov)) then
        let $query-hashes := fn:distinct-values(cts:element-walk(document{$query}, $QUERIES_WITH_WEIGHT, element query-hash{xdmp:md5(document {$cts:node})})//query-hash !
          fn:string(.))
        for $query-hash in $query-hashes
        return map:put($query-prov, $query-hash, $query-map)
      else (),
      $query
    )
};

(:
 : Organize values by QName
 : @param $document  document with property values
 : @param $compiled-options  map:map with compiled details about match options
 : @return map:map of values organized by QName
 :)
declare function match-impl:values-by-qname(
  $document as node()?,
  $compiled-options as map:map
)
{
  map:new(
    for $qname in fn:distinct-values((map:get($compiled-options, "queries") ! map:get(.,"qname")))
    let $values := fn:distinct-values($document/(self::*:envelope|*:envelope)/*:instance//*[fn:node-name(.) eq $qname][fn:normalize-space(fn:string(.))]/fn:data(.))
    where fn:exists($values)
    return
      map:entry(xdmp:key-from-QName($qname), $values)
  )
};

(:
 : Execute the generated search and construct the response.
 : @param $match-query  a query built such that any matches will score at least
 :                      high enough to reach the lowest threshold
 : @param $boosting-query  a query that is used to score matches
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
  $boosting-query,
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
      match-impl:instance-query-wrapper(
        $boosting-query,
        $is-json
      )
    else ()
  let $thresholds := $compiled-options => map:get("orderedThresholds")
  let $individual-matching-queries := cts:or-query-queries($boosting-query)
  for $result at $pos in cts:search(
    fn:collection(),
    $match-query,
    ("unfiltered", "score-simple"),
    0
  )[fn:position() = $range]
  let $uri := xdmp:node-uri($result)
  let $matching-queries := $individual-matching-queries[cts:contains($result, .)]
  let $matching-weights-map := map:entry("values", ())
  let $_accumulate-scores :=
    cts:element-walk(document{$matching-queries}, $QUERIES_WITH_WEIGHT,
      let $weight := fn:head(($cts:node/@weight, 1))
      return
      (
        $matching-weights-map => map:put("values",
          ($matching-weights-map => map:get("values"), $weight)),
        $matching-weights-map => map:put(xdmp:md5(document {$cts:node}), $weight)
      )
    )
  let $score :=
      fn:sum(
        $matching-weights-map => map:get("values")
      )
  where $score ge $min-threshold
  return
    element result {
      attribute uri {$uri},
      attribute index {$range[fn:position() = $pos]},
      attribute score {$score},
      let $selected-threshold := fn:head($thresholds[$score ge @above])
      return (
        attribute threshold { fn:string($selected-threshold/@label) },
        attribute action { fn:string($selected-threshold/(matcher:action|@action)) }
      ),
      if ($include-matches) then
        element matches {
          (: rather than store the entire node and risk mixing
             content type (json != xml) we store the path to the
             node instead :)
          cts:walk(
            $result/*:envelope/*:instance,
            cts:or-query($matching-queries),
            (let $query-hashes := fn:distinct-values($cts:queries !
                cts:element-walk(document{.}, $QUERIES_WITH_WEIGHT, element query-hash{xdmp:md5(document {$cts:node})})//query-hash !
                fn:string(.))
            let $weight := fn:sum($query-hashes ! ($matching-weights-map => map:get(.)))
            let $node-name := fn:string(fn:head((fn:node-name($cts:node),fn:node-name($cts:node/..))))
            return <match weight="{$weight}">
                      {
                        for $query-hash in $query-hashes
                        let $query-map := map:get($query-prov, $query-hash)
                        return
                          <contributions>
                            <algorithm>{fn:string(fn:head(($query-map ! map:get(., "algorithm") ! fn:string(.),"standard")))}</algorithm>
                            <weight>{fn:string($matching-weights-map => map:get($query-hash))}</weight>
                          </contributions>
                      }
                      <nodeName>{$node-name}</nodeName>
                      <value>{fn:data($cts:node)}</value>
                      <path>{xdmp:path($cts:node, fn:true())}</path>
                   </match>)
          )
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
 : Identify a sequence of queries whose scores add up to the $threshold. A document must match at least one of these
 : queries in order to be returned as a potential match.
 :
 : @param $query-results  a sequence of queries with weights
 : @param $threshold  minimum weighted-score for a match to be relevant
 : @return a sequence of queries; a document that matches any of these will have at least $threshold as a score
 :)
declare function match-impl:minimum-threshold-combinations($query-results, $threshold as xs:double)
  as map:map*
{
  (: Each of $queries-ge-threshold has a weight high enough to hit the $threshold :)
  let $queries-ge-threshold := $query-results[(. => map:get("weight")) ge $threshold]
  let $queries-lt-threshold := $query-results[(. => map:get("weight")) lt $threshold]
  return (
    $queries-ge-threshold ! map:entry("queries", .),
    match-impl:filter-for-required-queries($queries-lt-threshold, 0, $threshold, ())
  )
};

(:
 : Find combinations of queries whose weights are individually below the threshold, but combined are above it.
 :
 : @param $remaining-queries  sequence of queries ordered by their weights, descending
 : @param $combined-weight
 : @param $threshold  the target value
 : @param $accumulated-queries  accumlated sequence, building up to see whether it can hit the $threshold.
 : @return a sequence of cts:and-queries, one for each required filter
 : note: return type left off to allow for tail recursion optimization.
 :)
declare function match-impl:filter-for-required-queries(
  $remaining-queries as map:map*,
  $combined-weight,
  $threshold,
  $accumulated-queries as map:map*
)
{
  if ($threshold eq 0 or $combined-weight ge $threshold) then (
    if (fn:exists($accumulated-queries)) then
      map:entry(
        "queries",
        $accumulated-queries
      )
    else
      ()
  )
  else
    for $query at $pos in $remaining-queries
    let $query-weight := fn:head(($query => map:get("weight"), 1))
    let $new-combined-weight := $combined-weight + $query-weight
    return (
      match-impl:filter-for-required-queries(
        fn:subsequence($remaining-queries, $pos + 1),
        $new-combined-weight,
        $threshold,
        ($accumulated-queries, $query)
      )
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
