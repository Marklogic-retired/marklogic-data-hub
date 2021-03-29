xquery version "1.0-ml";

module namespace pma = "http://marklogic.com/smart-mastering/preview-matching-activity-lib";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

declare option xdmp:mapping "false";

declare function pma:match-within-uris($uris as xs:string*, $options as object-node())
{
  if (fn:count($uris) > 1) then
    let $uri1 := fn:head($uris)
    let $doc1 := fn:doc($uri1)
    let $results := matcher:find-document-matches-by-options($doc1, $options, 1, 10000, fn:true(), cts:document-query(fn:tail($uris)))
    let $results :=
      element results {
        $results/@*,
        attribute uri { $uri1 },
        for $result in $results/result
        return
          element result {
            $result/@*,
            $result/matches/match/rulesetName
          }
      }
    return
    (
      $results,
      if (fn:count($uris) > 2) then
        pma:match-within-uris(fn:tail($uris), $options)
      else
        ()
    )
  else
    ()
};

declare function pma:consolidate-preview-results($results as element(results)*)
  as json:array
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
  return json:to-array($objects)
};

declare function pma:get-uri-sample($options as object-node(), $sample-size as xs:integer?)
  as xs:string*
{
  let $sample-size :=
    if (fn:exists($sample-size)) then
      $sample-size
    else
      20
  return ()
};

declare function pma:preview-matching-activity(
  $options as object-node(),
  $uris as xs:string*,
  $sample-size as xs:integer?)
  as object-node()
{
  let $obj := json:object()
  let $uris :=
    if (fn:exists($uris)) then
      $uris
    else
      pma:get-uri-sample($options, $sample-size)
  let $_ :=
  (
    map:put($obj, "sampleSize", $sample-size),
    map:put($obj, "uris", json:to-array($uris)),
    map:put($obj, "actionPreview",
      pma:consolidate-preview-results(
        pma:match-within-uris($uris, $options)
      )
    )
  )
  return xdmp:to-json($obj)/node()
};
