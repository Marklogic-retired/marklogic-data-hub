xquery version "1.0-ml";

module namespace pma = "http://marklogic.com/smart-mastering/preview-matching-activity-lib";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

declare variable $PMA-MAX-RESULTS := 100;
declare variable $DEFAULT-URI-SAMPLE-SIZE := 20;

declare option xdmp:mapping "false";

declare function pma:match-within-uris($uris as xs:string*, $options as object-node())
{
  pma:match-within-uris($uris, $options, 0)
};

declare function pma:match-within-uris($uris as xs:string*, $options as object-node(), $count as xs:integer)
  as element(results)*
{
  if (fn:count($uris) > 1) then
    let $uri1 := fn:head($uris)
    let $doc1 := fn:doc($uri1)
    let $results := matcher:find-document-matches-by-options($doc1, $options, 1, 10000, fn:true(), cts:document-query(fn:tail($uris)))
    let $count := $count + fn:count($results/result)
    let $results := pma:transform-results($results, $uri1)
    return
    (
      $results,
      if (fn:count($uris) > 2 and $count < $PMA-MAX-RESULTS) then
        pma:match-within-uris(fn:tail($uris), $options, $count)
      else
        ()
    )
  else
    ()
};

(:
  Finds matches for the $uris against the rest of the database, filtered by sourceQuery. Excludes any matches between $uris,
  which were already returned by the match-within-uris() function.

  Using the some-satisfies-set pattern for short-circuiting when max results is reached. Use sparingly.
:)
declare function pma:match-against-source-query-docs(
  $uris as xs:string*,
  $options as object-node(),
  $source-query as cts:query,
  $previous-count as xs:integer)
  as element(results)*
{
  let $exclude-uris-query := cts:not-query(cts:document-query($uris))
  let $query := cts:and-query(($source-query, $exclude-uris-query))
  let $count := $previous-count
  let $all-results := ()
  let $_ :=
    some $uri in $uris satisfies
      $count >= $PMA-MAX-RESULTS or
        (
          let $doc := fn:doc($uri)
          let $remaining-count := $PMA-MAX-RESULTS - $count
          let $results := matcher:find-document-matches-by-options($doc, $options, 1, $remaining-count, fn:true(), $query)
          let $results := pma:transform-results($results, $uri)
          let $_ := xdmp:set($all-results, ($all-results, $results))
          let $_ := xdmp:set($count, $count + fn:count($results/result))
          return fn:false()
        )
  return $all-results
};

(: main purpose of this transform is to store the URI used for the match in the results element :)
declare function pma:transform-results($results as element(results), $uri as xs:string)
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
    (
      for $doc in cts:search(doc(), $source-query, ("unfiltered", "score-random"))
      return xdmp:node-uri($doc)
    )[1 to $sample-size]
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
  $options as object-node(),
  $source-query as cts:query,
  $uris as xs:string*,
  $restrict-to-uris as xs:boolean,
  $sample-size as xs:integer?)
  as object-node()
{
  let $obj := json:object()
  let $uris :=
    if (fn:exists($uris)) then
      $uris
    else
      pma:get-uri-sample($source-query, $sample-size)
  let $results-within-uris :=
    pma:consolidate-preview-results(
      pma:match-within-uris($uris, $options)
    )
  let $previous-count := fn:count($results-within-uris)
  let $results-against-source-query-docs :=
    if ($restrict-to-uris or $previous-count >= $PMA-MAX-RESULTS) then
      ()
    else
      pma:consolidate-preview-results(
        pma:match-against-source-query-docs($uris, $options, $source-query, $previous-count)
      )
  let $all-results := fn:subsequence(($results-within-uris, $results-against-source-query-docs), 1, $PMA-MAX-RESULTS)
  let $_ :=
  (
    map:put($obj, "sampleSize", $sample-size),
    map:put($obj, "uris", json:to-array($uris)),
    map:put($obj, "actionPreview", json:to-array($all-results))
  )
  return xdmp:to-json($obj)/node()
};
