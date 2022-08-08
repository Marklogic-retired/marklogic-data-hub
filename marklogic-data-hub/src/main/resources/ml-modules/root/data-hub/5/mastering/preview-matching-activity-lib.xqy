xquery version "1.0-ml";

module namespace pma = "http://marklogic.com/smart-mastering/preview-matching-activity-lib";

import module namespace hent = "http://marklogic.com/data-hub/hub-entities"
  at "/data-hub/5/impl/hub-entities.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";

declare variable $PMA-MAX-RESULTS := 100;
declare variable $DEFAULT-URI-SAMPLE-SIZE := 20;

declare option xdmp:mapping "false";

declare function pma:match-within-uris($uris as xs:string*, $original-options as object-node(), $options as object-node(), $non-matches as xs:boolean)
{
  pma:match-within-uris($uris, $original-options, $options, $non-matches, 0)
};

declare function pma:match-within-uris($uris as xs:string*, $original-options as object-node(), $options as object-node(), $non-matches as xs:boolean, $count as xs:integer)
  as element(results)*
{
  if (fn:count($uris) > 1) then
    let $uri1 := fn:head($uris)
    let $doc1 := fn:doc($uri1)
    let $uris-query := cts:document-query(fn:tail($uris))
    let $filter-query := if (fn:exists($options/filterQuery[*])) then
                          cts:and-query((cts:query($options/filterQuery), $uris-query))
                        else
                          $uris-query
    let $results := if ($non-matches) then
        let $match-query := match-impl:find-document-matches-by-options($doc1, $original-options, 1, 10000, fn:min($original-options/thresholds/score ! fn:number(.)), fn:true(), $filter-query, fn:false())/match-query/schema-element(cts:query) ! cts:query(.)
        let $exclude-uris := cts:uris((), (), $match-query)
        let $filter-query := if (fn:exists($exclude-uris)) then cts:and-not-query($filter-query, cts:document-query($exclude-uris)) else $filter-query
        return matcher:find-document-matches-by-options($doc1, $options, 1, 10000, fn:true(), $filter-query)
      else
        matcher:find-document-matches-by-options($doc1, $options, 1, 10000, fn:true(), $filter-query)
    let $count := $count + fn:count($results/result)
    let $results := pma:transform-results($results, $uri1)
    return
    (
      $results,
      if (fn:count($uris) > 2 and $count < $PMA-MAX-RESULTS) then
        pma:match-within-uris(fn:tail($uris), $original-options, $options, $non-matches, $count)
      else
        ()
    )
  else
    ()
};

(:
  Finds matches for the $uris against the rest of the database, filtered by sourceQuery. Excludes any matches between $uris,
  which were already returned by the match-within-uris() function.
:)
declare function pma:match-against-source-query-docs(
  $uris as xs:string*,
  $original-options as object-node(),
  $options as object-node(),
  $non-matches as xs:boolean,
  $source-query as cts:query,
  $previous-count as xs:integer,
  $all-results as element(results)*
) (: as element(results)* :) (: Return signature commented out to facilitate tail recursion :)
{
  if (fn:count($all-results) >= ($PMA-MAX-RESULTS - $previous-count) or fn:empty($uris)) then
    $all-results
  else
    pma:match-against-source-query-docs(
      fn:tail($uris),
      $original-options,
      $options,
      $non-matches,
      $source-query,
      $previous-count,
      (
        $all-results,
        pma:transform-results(
          matcher:find-document-matches-by-options(
            fn:doc(fn:head($uris)),
            $options,
            1,
            $PMA-MAX-RESULTS - (fn:count($all-results) + $previous-count),
            fn:true(),
            if ($non-matches) then
              let $match-query := match-impl:find-document-matches-by-options(fn:doc(fn:head($uris)), $original-options, 1, 10000, fn:min($options/thresholds/score ! fn:number(.)), fn:true(), $source-query, fn:false())/match-query/schema-element(cts:query) ! cts:query(.)
              let $exclude-uris := cts:uris((), (), $match-query)
              let $filter-query := if (fn:exists($exclude-uris)) then cts:and-not-query($source-query, cts:document-query($exclude-uris)) else $source-query
              return $filter-query
            else
              $source-query
          ),
          fn:head($uris)
        )
      )
    )
};

(: main purpose of this transform is to store the URI used for the match in the results element :)
declare function pma:transform-results($results as element(results)?, $uri as xs:string)
{
  element results {
    $results/@*,
    attribute uri { $uri },
    for $result in $results/result
    return
      element result {
        $result/@*,
        $result/matches/match/rulesetName
      }
  }
};

declare function pma:consolidate-preview-results($results as element(results)*)
  as json:object*
{
  let $objects :=
    for $results in $results
    let $uri := $results/@uri/fn:string(.)
    for $result in $results/result
    let $obj := json:object()
    return (
      map:put($obj, "name", $result/@threshold),
      map:put($obj, "action", $result/@action),
      map:put($obj, "score", $result/@score),
      map:put($obj, "uris", json:to-array(($uri, $result/@uri))),
      map:put($obj, "matchRulesets", json:to-array($result/rulesetName/fn:string(.))),
      $obj
    )
  let $objects :=
    for $obj in $objects
    order by xs:double(map:get($obj, "score")) descending
    return $obj
  return fn:subsequence($objects, 1, $PMA-MAX-RESULTS)
};

declare function pma:get-uri-sample($source-query as cts:query, $sample-size as xs:integer?)
  as xs:string*
{
  let $sample-size :=
    if (fn:exists($sample-size) and $sample-size > 0) then
      $sample-size
    else
      $DEFAULT-URI-SAMPLE-SIZE
  return
    for $doc in cts:search(doc(), $source-query, ("unfiltered", "score-random"))[1 to $sample-size]
    let $uri := xdmp:node-uri($doc)
    order by $uri
    return $uri
};

declare function pma:preview-matching-activity(
  $original-options as object-node(),
  $source-query as cts:query,
  $uris as xs:string*,
  $restrict-to-uris as xs:boolean,
  $sample-size as xs:integer?)
  as object-node()
{
  pma:preview-matching-activity(
    $original-options,
    $source-query,
    $uris,
    $restrict-to-uris,
    fn:false(),
    $sample-size)
};
(:
  The XQuery entry point function for the previewMatchingActivity API.
  If there are at least two $uris, we first match within $uris, sorted descending by score.
  If matching within $uris does not have at least $PMA-MAX-RESULTS results,
  we match the $uris against all the documents in the database matching the sourceQuery,
  (excluding $uris) with those results also sorted descending by score and appended
  to the within-uris results.

  To support the "All Data" option in the UI, pass a very large $sample-size.
:)
declare function pma:preview-matching-activity(
  $original-options as object-node(),
  $source-query as cts:query,
  $uris as xs:string*,
  $restrict-to-uris as xs:boolean,
  $non-matches as xs:boolean,
  $sample-size as xs:integer?)
  as object-node()
{
  let $options :=
    if ($non-matches) then
      let $min-score := fn:min($original-options/matchRulesets/weight)
      let $new-threshold := json:object() => map:with("thresholdName", "Not Matched") => map:with("score", $min-score) => map:with("action", "none")
      return xdmp:to-json(
        xdmp:from-json($original-options) =>
            map:with("thresholds", json:array() => json:array-with($new-threshold))
        )/object-node()
    else
      $original-options
  let $obj := json:object()
  let $source-query :=
    if (fn:exists($options/filterQuery[*])) then
      cts:and-query((cts:query($options/filterQuery), $source-query))
    else
      $source-query
  let $uris :=
    if (fn:exists($uris)) then
      $uris
    else
      pma:get-uri-sample($source-query, $sample-size)
  let $results-within-uris :=
    pma:consolidate-preview-results(
      pma:match-within-uris($uris, $original-options, $options, $non-matches)
    )
  let $previous-count := fn:count($results-within-uris)
  let $results-against-source-query-docs :=
    if ($restrict-to-uris or $previous-count >= $PMA-MAX-RESULTS) then
      ()
    else
      pma:consolidate-preview-results(
        pma:match-against-source-query-docs($uris, $original-options, $options, $non-matches, cts:and-not-query($source-query, cts:document-query($uris)), $previous-count, ())
      )
  let $all-results := fn:subsequence(($results-within-uris, $results-against-source-query-docs), 1, $PMA-MAX-RESULTS)
  let $all-uris := fn:distinct-values(($all-results ! ( json:array-values(map:get(., "uris")))))
  let $entity-type := $options/targetEntityType
  let $primary-keys := hent:find-entity-identifiers($all-uris, $entity-type)
  let $_ :=
  (
    map:put($obj, "sampleSize", $sample-size),
    map:put($obj, "primaryKeys", $primary-keys),
    map:put($obj, "uris", json:to-array($uris)),
    map:put($obj, "actionPreview", json:to-array($all-results))
  )
  return xdmp:to-json($obj)/node()
};