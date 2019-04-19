xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Match-and-merge combines the two primary functions of Smart Mastering in a
 : single call. This means that both happen in the same transaction. When
 : called this way, the actions configured on thresholds in the match options
 : are taken automatically, rather than individually by the client.
 :)

module namespace proc-impl = "http://marklogic.com/smart-mastering/process-records/impl";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../function-extension/base.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace match-opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace coll-impl = "http://marklogic.com/smart-mastering/survivorship/collections"
  at "/com.marklogic.smart-mastering/survivorship/merging/collections.xqy";
import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";

declare option xdmp:mapping "false";

declare function proc-impl:process-match-and-merge($input as item()*)
  as item()*
{
  let $merging-options := merging:get-options($const:FORMAT-XML)
  return
    if (fn:exists($merging-options)) then
      for $merge-options in $merging-options
      let $match-options := matcher:get-options(fn:string($merge-options/merging:match-options), $const:FORMAT-XML)
      return
        proc-impl:process-match-and-merge-with-options-save($input, $merge-options, $match-options, cts:true-query())
    else
      fn:error($const:NO-MERGE-OPTIONS-ERROR, "No Merging Options are present. See: https://marklogic-community.github.io/smart-mastering-core/docs/merging-options/")
};

declare function proc-impl:process-match-and-merge(
  $input as item()*,
  $option-name as xs:string,
  $filter-query as cts:query)
  as item()*
{
  let $merge-options := merging:get-options($option-name, $const:FORMAT-XML)
  let $match-options := matcher:get-options(fn:string($merge-options/merging:match-options), $const:FORMAT-XML)
  return
    proc-impl:process-match-and-merge-with-options-save(
      $input,
      $merge-options,
      $match-options,
      $filter-query
    )
};

declare variable $STRING-TOKEN := "##";

(:
 : Given a map with keys that are URIs and values that are the result elements from running the match function against
 : that URI's document, produce a map where the key is a generated unique ID and the values are sequences of URIs to be
 : merged. We want to eliminate redundant cases, such as merge(docA, docB) and merge(docB, docA).
 : @param $matches
 : @return  map(unique ID -> sequence of URIs)
 :)
declare function proc-impl:consolidate-merges($matches as map:map) as map:map
{
  map:new((
    let $merges :=
      fn:distinct-values(
        for $key in map:keys($matches)
        let $merge-uris as xs:string* := map:get($matches, $key)/result[@action=$const:MERGE-ACTION]/@uri
        where fn:exists($merge-uris)
        return
          fn:string-join(
            for $uri in ($key, $merge-uris)
            let $_lock-on-uri := xdmp:lock-for-update($uri)
            order by $uri
            return $uri,
            $STRING-TOKEN
          )
      )
    for $merge in $merges
    let $uris := fn:tokenize($merge, $STRING-TOKEN)
    return
      map:entry(xdmp:md5($merge), $uris)
  ))
};

declare function proc-impl:consolidate-notifies($all-matches as map:map, $merged-into as map:map)
  as xs:string*
{
  fn:distinct-values(
    for $key in map:keys($all-matches)
    let $_lock-on-uri := xdmp:lock-for-update($key)
    for $updated-key in
      (if (map:contains($merged-into, $key)) then
        map:get($merged-into, $key)
      else
        $key)
    let $key-notifications := map:get($all-matches, $key)/result[@action=$const:NOTIFY-ACTION]
    let $key-thresholds := fn:distinct-values($key-notifications/@threshold)
    for $key-threshold in $key-thresholds
    let $updated-notification-uris :=
      for $key-notification in $key-notifications[@threshold = $key-threshold]
      let $key-uri as xs:string := $key-notification/@uri
      let $_lock-on-uri := xdmp:lock-for-update($key-uri)
      let $updated-uri :=
        if (map:contains($merged-into, $key-uri)) then
          map:get($merged-into, $key-uri)
        else
          $key-uri
      return $updated-uri
    return
      fn:string-join((
        $key-threshold,
        for $uri in fn:distinct-values(($updated-key, $updated-notification-uris))
        order by $uri
        return $uri
      ), $STRING-TOKEN)
  )
};

(: The following will store URIs of documents merged in transaction :)
declare variable $merges-in-transaction as map:map := map:map();
(: The following will store URIs of documents notified in transaction :)
declare variable $notifications-in-transaction as map:map := map:map();
(: The following will store URIs of documents notified in transaction :)
declare variable $no-matches-in-transaction as map:map := map:map();

(:
 : The workhorse function.
 :)
declare function proc-impl:process-match-and-merge-with-options(
  $input as item()*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query) as json:array
{
  (: increment usage count :)
  tel:increment(),
  let $uris :=
    if ($input instance of xs:string*) then
      $input
    else if ($input instance of map:map*) then
      $input ! (. => map:get("uri"))
    else ()
  let $_lock-for-update-on-uris := $uris ! xdmp:lock-for-update(.)
  let $_ := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "processing: " || fn:string-join($uris, ", "))
      else ()
  let $matching-options :=
      if ($match-options instance of object-node()) then
        match-opt-impl:options-from-json($match-options)
      else
        $match-options
  let $merge-options :=
      if ($merge-options instance of object-node()) then
        merge-impl:options-from-json($merge-options)
      else
        $merge-options
  let $actions := fn:distinct-values(($matching-options/matcher:actions/matcher:action/@name ! fn:string(.), $const:MERGE-ACTION, $const:NOTIFY-ACTION))
  let $thresholds := $matching-options/matcher:thresholds/matcher:threshold[(@action|matcher:action) = $actions]
  let $threshold-labels := $thresholds/@label
  let $minimum-threshold :=
    fn:min(
      $matching-options/matcher:thresholds/matcher:threshold[@label = $threshold-labels]/@above ! fn:number(.)
    )
  let $lock-on-query := fn:true()
  let $documents :=
    if ($input instance of xs:string*) then
      cts:search(fn:doc(), cts:document-query($input), "unfiltered")
    else if ($input instance of map:map*) then
      $input ! (. => map:get("value"))
    else
      ()
  let $all-matches :=
    map:new((
      $documents !
        map:entry(
          xdmp:node-uri(.),
          matcher:find-document-matches-by-options(
            .,
            $matching-options,
            1,
            fn:head((
              $matching-options//*:max-scan ! xs:integer(.),
              500
            )),
            $minimum-threshold,
            $lock-on-query,
            fn:false(),
            $filter-query
          )
        )
    ))
  let $consolidated-merges := proc-impl:consolidate-merges($all-matches)
  let $merged-uris := map:keys($consolidated-merges)
  let $merged-into := map:map()
  let $on-merge-options := $merge-options/merging:algorithms/merging:collections/merging:on-merge
  let $processed-merges :=
    (: Process merges :)
    for $new-uri in $merged-uris
    where fn:not(map:contains($merges-in-transaction, $new-uri))
    return (
      map:put($merges-in-transaction, $new-uri, fn:true()),
      let $distinct-uris := fn:distinct-values(map:get($consolidated-merges, $new-uri))
      let $merged-doc-def := merge-impl:build-merge-models-by-uri($distinct-uris, $merge-options, $new-uri)
      let $merged-doc := $merged-doc-def => map:get("value")
      let $merge-uri := merge-impl:build-merge-uri(
        $new-uri,
        if ($merged-doc instance of element() or
          $merged-doc instance of document-node(element())) then
          $const:FORMAT-XML
        else
          $const:FORMAT-JSON
      )
      return (
        $distinct-uris ! map:put($merged-into, ., $merge-uri),
        $merged-doc-def
          => map:get("audit-trace")
          => map:with("hidden", fn:true()),
        map:new((
          map:entry("uri", $merge-uri),
          map:entry("value",
            $merged-doc
          ),
          map:entry("context",
            map:new((
              map:entry("collections",
                coll-impl:on-merge(
                  map:new((
                    for $uri in $distinct-uris
                    return
                      map:entry(
                        $uri,
                        xdmp:document-get-collections($uri)
                      )
                  )),
                  $on-merge-options
                )
              ),
              map:entry("permissions",
                (
                  xdmp:default-permissions(),
                  fn:map(xdmp:document-get-permissions#1, $distinct-uris)
                )
              )
            ))
          )
        ))
      )
    )
  let $uris-that-were-merged := map:keys($merged-into)
  let $archived-updates :=
    (: Process collections on no matches :)
    let $on-archive := $merge-options/merging:algorithms/merging:collections/merging:on-archive
    for $uri in $uris-that-were-merged
    let $current-collections := xdmp:document-get-collections($uri)
    let $new-collections := coll-impl:on-archive(
      map:entry($uri, $current-collections),
      $on-archive
    )
    where
      fn:not(
        fn:count($new-collections) eq fn:count($current-collections)
          and
          (every $col in $new-collections satisfies $col = $current-collections)
      )
    return map:new((
      map:entry("uri", $uri),
      map:entry("value", fn:doc($uri)),
      map:entry("context",
        map:new((
          map:entry("collections",$new-collections),
          map:entry("permissions",xdmp:document-get-permissions($uri))
        ))
      )
    ))
  let $consolidated-notifies := proc-impl:consolidate-notifies($all-matches, $merged-into)
  let $no-matches-updates :=
    (: Process collections on no matches :)
    let $on-no-match := $merge-options/merging:algorithms/merging:collections/merging:on-no-match
    for $uri in $uris[fn:not(. = $uris-that-were-merged)]
    let $current-collections := xdmp:document-get-collections($uri)
    let $new-collections := coll-impl:on-no-match(
      map:entry($uri, $current-collections),
      $on-no-match
    )
    where
      fn:not(
        fn:count($new-collections) eq fn:count($current-collections)
          and
          (every $col in $new-collections satisfies $col = $current-collections)
      )
    return map:new((
      map:entry("uri", $uri),
      map:entry("value", fn:doc($uri)),
      map:entry("context",
        map:new((
          map:entry("collections",$new-collections),
          map:entry("permissions",xdmp:document-get-permissions($uri))
        ))
      )
    ))
  let $processed-notifications :=
    (: Process notifications :)
    for $notification in $consolidated-notifies
    let $parts := fn:tokenize($notification, $STRING-TOKEN)
    let $threshold := fn:head($parts)
    let $uris := fn:tail($parts)
    return
      matcher:build-match-notification($threshold, $uris, $merge-options)
  return json:to-array((
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then (
      xdmp:trace($const:TRACE-MATCH-RESULTS, "All matches: " || xdmp:describe($all-matches, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Matching options: " || xdmp:describe($matching-options, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Merge options: " || xdmp:describe($merge-options, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Consolidated merges: " || xdmp:quote($consolidated-merges)),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Consolidated notifications: " || xdmp:quote($consolidated-notifies))
    )
    else (),
    $archived-updates,
    $processed-merges,
    $no-matches-updates,
    $processed-notifications,
    (: Process custom actions :)
    let $action-map :=
      map:new((
        let $custom-action-names := $matching-options/matcher:thresholds/matcher:threshold/(matcher:action|@action)[fn:not(. = $const:NOTIFY-ACTION or . = $const:MERGE-ACTION)]
        for $custom-action-name in fn:distinct-values($custom-action-names)
        let $action-xml := $matching-options/matcher:actions/matcher:action[@name = $custom-action-name]
        return
          map:entry(
            $custom-action-name,
            fun-ext:function-lookup(
              fn:string($action-xml/@function),
              fn:string($action-xml/@namespace),
              fn:string($action-xml/@at),
              ()
            )
          )
      ))
    for $uri in map:keys($all-matches)
    for $custom-action-match in map:get($all-matches, $uri)/result[fn:not(./@action = $const:NOTIFY-ACTION or ./@action = $const:MERGE-ACTION)]
    let $action-func := map:get($action-map, $custom-action-match/@action)
    return
      if (fn:exists($action-func)) then
        if (fn:ends-with(xdmp:function-module($action-func), "sjs")) then
          xdmp:apply(
            $action-func,
            $uri,
            proc-impl:matches-to-json($custom-action-match),
            merge-impl:options-to-json($merge-options)
          )
        else
          xdmp:apply($action-func, $uri, $custom-action-match, $merge-options)
      else
        fn:error(xs:QName("SM-CONFIGURATION"), "Threshold action is not configured or not found", $custom-action-match)
  ))
};

(:
 : The workhorse function.
 :)
declare function proc-impl:process-match-and-merge-with-options-save(
  $input as item()*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query)
{
  let $actions as item()* := json:array-values(proc-impl:process-match-and-merge-with-options(
      $input,
      $merge-options,
      $match-options,
      $filter-query
    ))
  for $action in $actions
  return
    if ($action instance of map:map) then
      let $context as map:map? := $action => map:get("context")
      return (
        if (fn:not(($action => map:get("hidden")))) then
          ($action => map:get("value"))[fn:empty(xdmp:node-uri(.))]
        else (),
        xdmp:document-insert(
          $action => map:get("uri"),
          $action => map:get("value"),
          map:new((
            map:entry("collections", $context => map:get("collections")),
            map:entry("permissions", $context => map:get("permissions")),
            map:entry("metadata", $context => map:get("metadata"))
          ))
        )
      )
    else
      $action
};

(:
 : Convert the result elements into JSON objects.
 : TODO -- does not yet convert result/match elements to JSON. This is okay for now as there is no way to turn on the
 : $include-matches parameter from process-match-and-merge.
 :)
declare function proc-impl:matches-to-json($filtered-matches as element(result)*)
{
  array-node {
    for $match in $filtered-matches
    return object-node {
      "uri": $match/@uri/fn:string(),
      "score": $match/@score/fn:data(),
      "threshold": $match/@threshold/fn:string()
    }
  }
};
