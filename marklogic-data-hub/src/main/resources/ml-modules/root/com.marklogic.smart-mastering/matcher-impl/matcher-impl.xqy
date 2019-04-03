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
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace notify-impl = "http://marklogic.com/smart-mastering/notification-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/notification-impl.xqy";
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
    let $is-json := $options/matcher:data-format = $const:FORMAT-JSON
    let $scoring := $options/matcher:scoring
    let $max-property-score := fn:max(($scoring/@weight ! fn:number(.)))
    let $score-ratio :=
        if ($max-property-score le 64) then
          1
        else
          (64 idiv $max-property-score)
    let $algorithms := algorithms:build-algorithms-map($options/matcher:algorithms)
    let $property-defs := $options/matcher:property-defs
    let $queries := (
        for $score in $scoring/(matcher:add|matcher:expand)
        let $type := fn:local-name($score)
        let $weight := fn:number($score/@weight)
        let $property-name := $score/@property-name
        let $property-def := $property-defs/matcher:property[@name = $property-name]
        where fn:exists($property-def)
        order by $weight descending
        return
          let $qname := fn:QName($property-def/@namespace, $property-def/@localname)
          return map:new((
            map:entry("queryID", sem:uuid-string()),
            map:entry("propertyName",$property-name),
            map:entry("type",$type),
            map:entry("weight",$weight),
            map:entry("qname", $qname),
            map:entry(
              "valuesToQueryFunction",
              if ($type eq "add") then
                if ($is-json) then
                  cts:json-property-value-query(
                    fn:string($qname),
                    ?,
                    ("case-insensitive"),
                    $weight
                  )
                else
                  cts:element-value-query(
                    $qname,
                    ?,
                    ("case-insensitive"),
                    $weight
                  )
              else if ($type eq "expand") then
                let $algorithm := map:get($algorithms, $score/@algorithm-ref)
                where fn:exists($algorithm)
                return algorithms:execute-algorithm($algorithm, ?, $score, $options)
              else ()
            )
          )),
        for $score in $scoring/matcher:reduce
        let $type := fn:local-name($score)
        let $weight := fn:number($score/@weight)
        return
          map:new((
            map:entry("queryID", sem:uuid-string()),
            map:entry("type",$type),
            map:entry("weight",$weight),
            map:entry(
              "valuesToQueryFunction",
              if ($type eq "reduce") then
                let $algorithm := $score/@algorithm-ref ! map:get($algorithms, .)
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
        map:entry("scoreRatio", $score-ratio),
        map:entry("scoring", $scoring),
        map:entry("algorithms", $algorithms),
        map:entry("queries", $queries),
        map:entry("orderedThresholds",
          for $threshold in $options/matcher:thresholds/matcher:threshold
          order by $threshold/@above cast as xs:decimal descending
          return $threshold
        ),
        map:entry("minimumThresholdCombinations", $minimum-threshold-combinations),
        map:entry("collectionQuery", match-impl:build-collection-query(coll:content-collections($options)))
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
 : @param $lock-on-search
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
  $lock-on-search as xs:boolean,
  $include-matches as xs:boolean,
  $filter-query as cts:query
) as element(results)
{
  if (fn:exists($document)) then (
    (: increment usage count :)
    tel:increment(),
    let $is-json := (xdmp:node-kind($document) = "object" or fn:exists($document/(object-node()|array-node())))
    let $compiled-options := match-impl:compile-match-options($options, $is-json, $minimum-threshold)
    let $scoring := $compiled-options => map:get("scoring")
    let $algorithms := $compiled-options => map:get("algorithms")
    let $options := $compiled-options => map:get("options")
    let $values-by-qname := match-impl:values-by-qname($document, $compiled-options)
    let $cached-queries := map:map()
    let $boost-query := match-impl:build-boost-query($document, $values-by-qname, $compiled-options, $cached-queries)
    let $serialized-boost-query := element boost-query {$boost-query}
    let $minimum-threshold-combinations-query :=
      cts:or-query(
        for $query-set in $compiled-options => map:get("minimumThresholdCombinations")
        let $queries := $query-set => map:get("queries")
        let $queries-without-weight :=
            for $query-map in $queries
            return
              document {
                match-impl:query-map-to-query($query-map, $values-by-qname, $cached-queries)
              }/* ! cts:query(match-impl:strip-query-weights(.))
        where fn:exists($queries-without-weight)
        return
          if (fn:count($queries-without-weight) gt 1) then
            cts:and-query(
              $queries-without-weight
            )
          else
            $queries-without-weight
      )
    let $match-query :=
      cts:and-not-query(
        cts:and-query((
          $compiled-options => map:get("collectionQuery"),
          $minimum-threshold-combinations-query
        )),
        cts:or-query((
          if (fn:exists(xdmp:node-uri($document))) then
            cts:document-query(xdmp:node-uri($document))
          else (),
          let $blocks := blocks-impl:get-blocks(fn:base-uri($document))
          where fn:exists($blocks/node())
          return
            cts:document-query($blocks/node())
        ))
      )
    let $serialized-match-query :=
      element match-query {
        $minimum-threshold-combinations-query
      }
    let $_lock-on-search :=
      if ($lock-on-search) then
        match-impl:lock-on-search($serialized-match-query/cts:or-query)
      else ()
    let $matches :=
        match-impl:search(
          $match-query,
          $boost-query,
          $filter-query,
          $minimum-threshold,
          $start,
          $page-length,
          $scoring,
          $compiled-options,
          $include-matches,
          $is-json
        )
    return (
      $_lock-on-search,
      element results {
        attribute total { xdmp:estimate(cts:search(fn:collection(), match-impl:instance-query-wrapper($match-query, $is-json), "unfiltered")) },
        attribute page-length { $page-length },
        attribute start { $start },
        element boost-query {$boost-query},
        $serialized-match-query,
        $matches
      }
    )
  ) else
    element results {
      attribute total { 0 },
      attribute page-length { $page-length },
      attribute start { $start }
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
 : @return a cts:or-query that will be used as a boost query
 :)
declare function match-impl:build-boost-query(
  $document as node(),
  $values-by-qname as map:map,
  $compiled-options as map:map,
  $cached-queries as map:map
)
{
  cts:or-query((
    for $query-map in map:get($compiled-options, "queries")
    return
      if ($query-map => map:get("type") = "reduce") then
        ($query-map => map:get("valuesToQueryFunction"))($document)
      else
        match-impl:query-map-to-query($query-map, $values-by-qname, $cached-queries)
  ))
};

(:
 : Convert map:map describing query to cts:query
 : @param $query-map  map:map describing a query to generate
 : @param $values-by-qname  map:map that organizes document values by QName
 : @param $cached-queries  map:map caching previously generated queries
 : @return cts:query?
 :)
declare function match-impl:query-map-to-query(
  $query-map as map:map,
  $values-by-qname as map:map,
  $cached-queries as map:map
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
    let $values := fn:distinct-values($document//*[fn:node-name(.) eq $qname] ! fn:normalize-space(fn:string(.))[.])
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
 : @param $scoring  part of match options
 : @param $algorithms  map derived from match options
 : @param $options  full match options; included to pass to reduce algorithm
 : @param $include-matches
 : @return results specify document URIs that matches for provided document
 :)
declare function match-impl:search(
  $match-query,
  $boosting-query,
  $filter-query as cts:query,
  $min-threshold as xs:double,
  $start as xs:int,
  $page-length as xs:int,
  $scoring as element(matcher:scoring),
  $compiled-options as map:map,
  $include-matches as xs:boolean,
  $is-json as xs:boolean
) {
  let $range := $start to ($start + $page-length - 1)
  let $boost-query := cts:boost-query($match-query, $boosting-query)
  let $query :=
    match-impl:instance-query-wrapper(
      if (fn:not($filter-query instance of cts:true-query)) then
        cts:and-query((
          cts:query(match-impl:strip-query-weights(document { $filter-query }/element())),
          $boost-query
        ))
      else
        $boost-query,
      $is-json
    )
  let $cts-walk-query :=
    if ($include-matches) then
      match-impl:instance-query-wrapper(
        cts:or-query((
          $match-query,
          $boosting-query
        )),
        $is-json
      )
    else ()
  let $thresholds := $compiled-options => map:get("orderedThresholds")
  for $result at $pos in cts:search(
    fn:collection(),
    $query,
    ("unfiltered", "score-simple"),
    0
  )[fn:position() = $range]
  let $score := match-impl:simple-score($result)
  let $result-stub :=
    element result {
      attribute uri {xdmp:node-uri($result)},
      attribute index {$range[fn:position() = $pos]},
      if ($include-matches) then
        element matches {
          (: rather than store the entire node and risk mixing
             content type (json != xml) we store the path to the
             node instead :)
          cts:walk(
            $result,
            $cts-walk-query,
            $cts:node/<match>{xdmp:path(., fn:true())}</match>
          )
        }
      else ()
    }
  where $score ge $min-threshold
  return
    element result {
      $result-stub/@*,
      attribute score {$score},
      let $selected-threshold := fn:head($thresholds[$score ge @above])
      return (
        attribute threshold { fn:string($selected-threshold/@label) },
        attribute action { fn:string($selected-threshold/(matcher:action|@action)) }
      ),
      $result-stub/*
    }
};

(:
 : score-simple gives 8pts per matching term and multiplies the results by 256 (MarkLogic documentation)
 : this reduces the magnitude of the score
 : @see http://docs.marklogic.com/guide/search-dev/relevance#id_37592
 :)
declare function match-impl:simple-score($item) {
  cts:score($item) div (256 * 8)
};

(: Configuration used to convert XML match results to JSON. :)
declare variable $results-json-config := match-impl:_results-json-config();

declare function match-impl:_results-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "array-element-names", ("result","matches",xs:QName("cts:option"),xs:QName("cts:text"),xs:QName("cts:element"))),
    map:put($config, "full-element-names",
      (xs:QName("cts:query"),
      xs:QName("cts:and-query"),
      xs:QName("cts:near-query"),
      xs:QName("cts:or-query"))
    ),
    map:put($config, "json-children", "queries"),
    map:put($config, "attribute-names",
      ("name","localname", "namespace", "function",
      "at", "property-name", "weight", "above", "label","algorithm-ref")
    ),
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

(: sets the @weight attributes from cts:queries to 0
 : note: return type left off to allow for tail recursion optimization
 :)
declare function match-impl:strip-query-weights($queries)
{
  for $query in $queries
  return
    typeswitch ($query)
      case schema-element(cts:query) return
        element { fn:node-name($query) } {
          attribute { "weight" } { 0 },
          $query/@*[fn:not(self::attribute(weight))],
          match-impl:strip-query-weights($query/node())
        }
      case element() return
        element { fn:node-name($query) } {
          $query/namespace::*,
          $query/@*,
          match-impl:strip-query-weights($query/node())
        }
      default return $query
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

declare function match-impl:lock-on-search($query-results)
  as empty-sequence()
{
  let $required-queries := $query-results/element(*, cts:query)
  let $lock-prefix := "/com.marklogic.smart-mastering/query-lock/"
  for $required-query in $required-queries
  for $query-combination in match-impl:query-combinations($required-query)
  let $lock-uri := $lock-prefix || $query-combination
  return (
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
      xdmp:trace($const:TRACE-MATCH-RESULTS, "locking on URI: " || $lock-uri)
    else (),
    fn:function-lookup(xs:QName("xdmp:lock-for-update"),1)($lock-uri)
  )
};

declare function match-impl:query-combinations($required-query as element(*, cts:query))
{
  match-impl:group-query-combinations(
    $required-query/descendant-or-self::element(*, cts:query)[fn:exists(cts:value|cts:text)],
    ()
  )
};

declare function match-impl:group-query-combinations(
  $queries as element(*, cts:query)*,
  $accumulated-values as xs:string*
)
{
  if (fn:empty($queries)) then
    fn:string-join(
      for $value in ($accumulated-values ! fn:normalize-space(fn:lower-case(fn:string(.))))
      order by $value
      return $value,
      "|"
    )
  else (
    let $current := fn:head($queries)
    let $tail := fn:tail($queries)
    for $value in $current/(cts:value|cts:text)
    return
      match-impl:group-query-combinations(
        $tail,
        fn:string($value)
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
