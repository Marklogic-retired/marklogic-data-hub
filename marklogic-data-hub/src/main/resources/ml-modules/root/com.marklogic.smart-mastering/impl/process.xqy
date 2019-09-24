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

import module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../function-extension/base.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";
import module namespace match-opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy",
    "/com.marklogic.smart-mastering/survivorship/merging/options.xqy";
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
        proc-impl:process-match-and-merge-with-options-save($input, $merge-options, $match-options, cts:true-query(), fn:false())
    else
      fn:error($const:NO-MERGE-OPTIONS-ERROR, "No Merging Options are present. See: https://marklogic-community.github.io/smart-mastering-core/docs/merging-options/")
};

declare function proc-impl:process-match-and-merge(
  $input as item()*,
  $option-name as xs:string,
  $filter-query as cts:query)
  as item()*
{
  let $all-options := xdmp:invoke-function(function() {
      let $merge-options := merging:get-options($option-name, $const:FORMAT-XML)
      let $match-options := matcher:get-options(fn:string($merge-options/merging:match-options), $const:FORMAT-XML)
      return
        map:map()
          => map:with("merge-options", $merge-options)
          => map:with("match-options", $match-options)
    }, map:entry("update", "false"))
  return
    proc-impl:process-match-and-merge-with-options-save(
      $input,
      $all-options => map:get("merge-options"),
      $all-options => map:get("match-options"),
      $filter-query,
      fn:false()
    )
};

declare variable $STRING-TOKEN := "##";

(:
 : Given a map with keys that are URIs and values that are the result elements from running the match function against
 : that URI's document, produce a map where the key is a generated unique ID and the values are sequences of URIs to be
 : merged. We want to eliminate redundant cases, such as merge(docA, docB) and merge(docB, docA).
 : @param $matches - map:map stores search results by URI
 : @param $match-options - the match options for the query
 : @param $max-scan - max number of search results to return
 : @param $merge-threshold - max score needed for a merge
 : @param $filter-query - cts:query that restricts the search
 : @return  map(unique ID -> sequence of URIs)
 :)
declare function proc-impl:consolidate-merges(
  $matches as map:map,
  $matching-options,
  $max-scan,
  $merge-threshold,
  $filter-query,
  $provenance-map as map:map?
) as map:map
{
  map:new((
    let $merges :=
      fn:distinct-values(
        for $key in map:keys($matches)
        let $merge-items as element()* := map:get($matches, $key)/result[@action=$const:MERGE-ACTION]
        let $merge-uris as xs:string* := $merge-items/@uri
        where fn:exists($merge-uris)
        return (
          if (fn:exists($provenance-map)) then
            proc-impl:record-match-provenance(
              $provenance-map,
              $key,
              $merge-items
            )
          else (),
          let $additional-uris :=
            proc-impl:expand-uris-for-merge(
              $merge-uris,
              $merge-uris,
              $matches,
              $matching-options,
              $max-scan,
              $merge-threshold,
              $filter-query,
              $provenance-map
            )
          return
            fn:string-join(
              for $uri in fn:distinct-values(($key, $merge-uris, $additional-uris))
              let $_lock-on-uri := if (fn:not(map:contains($matches,$uri))) then merge-impl:lock-for-update($uri) else ()
              order by $uri
              return $uri,
              $STRING-TOKEN
            )
        )
      )
    for $merge in $merges
    let $uris := fn:tokenize($merge, $STRING-TOKEN)
    let $merge-id := fn:head((
      $uris[fn:starts-with(., $merge-impl:MERGED-DIR)] ! fn:replace(fn:substring-after(., $merge-impl:MERGED-DIR), "\.(json|xml)", ""),
      xdmp:md5($merge)
    ))
    return
      map:entry($merge-id, $uris)
  ))
};

(:
 : This expands out searches to find any documents that may exist
 : @param $current-uris - xs:string* URIs that we just discovered with the last search
 : @param accumlated-uris - xs:string* URIs that we've discovered so far
 : @param $matches - map:map stores search results by URI
 : @param $match-options - the match options for the query
 : @param $max-scan - max number of search results to return
 : @param $merge-threshold - max score needed for a merge
 : @param $filter-query - cts:query that restricts the search
 : @return  xs:string* URIs found for the merge
 :)
declare function proc-impl:expand-uris-for-merge(
  $current-uris as xs:string*,
  $accumlated-uris as xs:string*,
  $matches as map:map,
  $matching-options,
  $max-scan,
  $merge-threshold,
  $filter-query,
  $provenance-map as map:map?
) (: as xs:string* ~leaving off for tail recursion~ :)
{
  let $additional-uris :=
    for $merge-uri in $current-uris
    return
      if (map:contains($matches,$merge-uri)) then
        map:get($matches, $merge-uri)/result[@action=$const:MERGE-ACTION]/@uri ! fn:string(.)
      else
        let $_lock-for-update := merge-impl:lock-for-update($merge-uri)
        let $results :=
          match-impl:find-document-matches-by-options(
            fn:doc($merge-uri),
            $matching-options,
            1,
            $max-scan,
            $merge-threshold,
            (: don't include detailed match information :)
            fn:false(),
            if ($filter-query instance of cts:true-query) then
              cts:not-query(cts:document-query($accumlated-uris))
            else
              cts:and-not-query($filter-query, cts:document-query($accumlated-uris)),
            (: return results :)
            fn:true()
          )[result/@action = $const:MERGE-ACTION]
        let $merge-items := $results/result[@action=$const:MERGE-ACTION]
        where fn:exists($results)
        return (
          map:put($matches, $merge-uri, $results),
          $merge-items/@uri ! fn:string(.),
          if (fn:exists($provenance-map)) then
            proc-impl:record-match-provenance(
              $provenance-map,
              $merge-uri,
              $merge-items
            )
          else ()
        )
  let $new-uris := $additional-uris[fn:not(. = $accumlated-uris)]
  return
    if (fn:empty($new-uris)) then
      $accumlated-uris
    else
      proc-impl:expand-uris-for-merge(
        $new-uris,
        fn:distinct-values(($new-uris,$accumlated-uris)),
        $matches,
        $matching-options,
        $max-scan,
        $merge-threshold,
        $filter-query,
        $provenance-map
      )
};

declare function proc-impl:record-match-provenance(
  $provenance-map as map:map,
  $uri as xs:string,
  $merge-items as element()*
) {
  if (fn:not(map:contains($provenance-map, $uri))) then
    map:put(
      $provenance-map,
      $uri,
      map:new((
        for $merge-item in $merge-items
        let $matched-document := fn:string($merge-item/@uri)
        return map:entry(
          $matched-document,
          map:new((
            for $match in $merge-item/matches/match
            return map:entry(
              fn:string($match/path),
              map:new((
                map:entry("type", "matchInformation"),
                map:entry("destination", $uri),
                map:entry("matchedDocuments", $matched-document),
                map:entry("matchedValues", fn:string($match/value)),
                map:entry("matchContributions", fn:string-join($match/contributions ! fn:concat(algorithm,"(",nodeName,"):",weight), ";"))
              ))
            )
          ))
        )
      ))
    )
  else ()
};

declare function proc-impl:consolidate-notifies($all-matches as map:map, $merged-into as map:map)
  as xs:string*
{
  fn:distinct-values(
    for $key in map:keys($all-matches)
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
      let $_lock-on-uri := if (fn:not(map:contains($all-matches, $key))) then merge-impl:lock-for-update($key-uri) else ()
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
  $filter-query as cts:query,
  $fine-grain-provenance as xs:boolean
) as json:array
{
  (: increment usage count :)
  tel:increment(),
  let $start-elapsed := xdmp:elapsed-time()
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
  let $archived-collection := coll-impl:on-archive(map:map(), $merge-options)
  let $normalized-input :=
    if ($input instance of xs:string*) then
      for $doc in cts:search(fn:doc(), cts:and-not-query(cts:document-query($input), cts:collection-query($archived-collection)), "unfiltered")
      return
        proc-impl:build-write-object-for-doc($doc)
    else if ($input instance of map:map*) then
      $input
    else ()
  let $write-objects-by-uri := fn:fold-left(
    function($map, $map-addition) { $map => map:with($map-addition => map:get("uri"), $map-addition) },
    map:map(),
    $normalized-input
  )
  let $uris := map:keys($write-objects-by-uri)
  let $_prime-blocks-cache := blocks-impl:get-blocks-of-uris($uris)
  let $_ := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "processing: " || fn:string-join($uris, ", "))
      else ()
  let $target-entity := $matching-options/matcher:target-entity ! fn:string(.)
  let $actions := fn:distinct-values(($matching-options/matcher:actions/matcher:action/@name ! fn:string(.), $const:MERGE-ACTION, $const:NOTIFY-ACTION))
  let $thresholds := $matching-options/matcher:thresholds/matcher:threshold[(@action|matcher:action) = $actions]
  let $threshold-labels := $thresholds/(@label|matcher:label)
  let $minimum-threshold :=
    fn:min(
      $thresholds[(@label|matcher:label) = $threshold-labels]/(@above|matcher:above) ! fn:number(.)
    )
  let $merge-threshold :=
    fn:min((
      $thresholds[(@action|matcher:action) = $const:MERGE-ACTION]/(@above|matcher:above) ! fn:number(.),
      999
    ))
  let $_min-threshold-err :=
            if (fn:empty($minimum-threshold)) then
              fn:error($const:NO-THRESHOLD-ACTION-FOUND, "No threshold actions to act on.", ($matching-options/matcher:thresholds))
            else ()
  let $max-scan := fn:head((
    $matching-options//*:max-scan ! xs:integer(.),
    500
  ))
  let $all-matches :=
    let $start-elapsed := xdmp:elapsed-time()
    let $matches :=
        map:new((
          $normalized-input !
            map:entry(
              (. => map:get("uri")),
              matcher:find-document-matches-by-options(
                (. => map:get("value")),
                $matching-options,
                1,
                $max-scan,
                $minimum-threshold,
                $fine-grain-provenance,
                $filter-query
              )
            )
        ))
    return (
      $matches,
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options: Matches: " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
    )
  let $provenance-map := if ($fine-grain-provenance) then map:map() else ()
  let $consolidated-merges := xdmp:eager(
    proc-impl:consolidate-merges($all-matches,
      $matching-options,
      $max-scan,
      $merge-threshold,
      $filter-query,
      $provenance-map
    )
  )
  let $merged-uris := map:keys($consolidated-merges)
  let $merged-into := map:map()
  let $on-merge-options := $merge-options/merging:algorithms/merging:collections/merging:on-merge
  let $processed-merges :=
    (: Process merges :)
    let $start-elapsed := xdmp:elapsed-time()
    let $merges :=
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
        let $doc-provenance-info := $merged-doc-def => map:get("provenance")
        let $prov-entry := if ($fine-grain-provenance) then (
            map:entry("provenance",
              fn:fold-left(
                function($map1,$map2) {
                  map:new(
                    for $key in fn:distinct-values((map:keys($map1),map:keys($map2)))
                    return
                      map:entry(
                        $key,
                        if (map:contains($map1, $key)) then
                          if (map:contains($map2, $key)) then
                            ($map1 => map:get($key)) + ($map2 => map:get($key))
                          else
                            ($map1 => map:get($key))
                        else
                          ($map2 => map:get($key))
                      )
                  )
                },
                $doc-provenance-info,
                fn:distinct-values((map:keys($doc-provenance-info), $distinct-uris)) ! map:get($provenance-map, .)
              )
            )
          ) else ()
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
            $prov-entry,
            map:entry("context",
              map:new((
                map:entry("collections",
                  (
                    coll-impl:on-merge(
                      map:new((
                        for $uri in $distinct-uris
                        let $write-object := proc-impl:retrieve-write-object($write-objects-by-uri, $uri)
                        return
                          map:entry(
                            $uri,
                            $write-object
                              => map:get("context")
                              => map:get("collections")
                          )
                      )),
                      $on-merge-options
                    ),
                    $target-entity
                  )
                ),
                map:entry("permissions",
                  (
                    xdmp:default-permissions($merge-uri, "objects"),
                    for $uri in $distinct-uris
                    let $write-object := proc-impl:retrieve-write-object($write-objects-by-uri, $uri)
                    return
                      $write-object
                        => map:get("context")
                        => map:get("permissions")
                  )
                )
              ))
            )
          ))
        )
      )
    return (
      $merges,
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options: ["||xdmp:request()||"] Merges: " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
    )
  let $uris-that-were-merged := map:keys($merged-into)
  let $_archived-updates :=
    (: Process collections on no matches :)
    let $start-elapsed := xdmp:elapsed-time()
    let $archived :=
      let $on-archive := $merge-options/merging:algorithms/merging:collections/merging:on-archive
      for $uri in $uris-that-were-merged
      let $write-object := proc-impl:retrieve-write-object($write-objects-by-uri, $uri)
      let $write-context := $write-object
          => map:get("context")
      let $current-collections := $write-context
          => map:get("collections")
      let $new-collections := coll-impl:on-archive(
        map:entry($uri, $current-collections),
        $on-archive
      )
      return $write-context
        => map:put("collections", $new-collections)
    return (
      $archived,
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options:["||xdmp:request()||"] Archived: " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
    )
  let $consolidated-notifies := proc-impl:consolidate-notifies($all-matches, $merged-into)
  let $_no-matches-updates :=
    (: Process collections on no matches :)
    let $start-elapsed := xdmp:elapsed-time()
    let $no-matches :=
      let $on-no-match := $merge-options/merging:algorithms/merging:collections/merging:on-no-match
      for $uri in $uris[fn:not(. = $uris-that-were-merged)]
      let $write-object := proc-impl:retrieve-write-object($write-objects-by-uri, $uri)
      let $doc := $write-object
        => map:get("value")
      let $has-merges :=
        if (map:contains($all-matches, $uri)) then
          fn:number(map:get($all-matches, $uri)/@total) gt 0
        else
          fn:number(
            match-impl:find-document-matches-by-options(
              $doc,
              $matching-options,
              1,
              1,
              $merge-threshold,
              (: don't include detailed match information :)
              fn:false(),
              $filter-query,
              (: don't return results. we just want the estimate. :)
              fn:false()
            )/@total
          ) gt 0
      return
      (: If there are merges with a doc outside of this batch then leave it alone. :)
        if ($has-merges) then
          map:delete($write-objects-by-uri, $uri)
        (: otherwise, we want to pick up new collections :)
        else
          let $write-context := $write-object
          => map:get("context")
          let $current-collections := $write-context
          => map:get("collections")
          let $new-collections := (
            coll-impl:on-no-match(
              map:entry($uri, $current-collections),
              $on-no-match
            ),
            $target-entity
          )
          let $_update := $write-context
          => map:put("collections", $new-collections)
          return
            if (fn:not(map:contains($all-matches, $uri))) then
              xdmp:lock-for-update($uri)
            else ()
    return (
        $no-matches,
        if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
          xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options:["||xdmp:request()||"] No matches: " || (xdmp:elapsed-time() - $start-elapsed))
        else ()
    )
  let $processed-notifications :=
    let $start-elapsed := xdmp:elapsed-time()
    let $notifications :=
      (: Process notifications :)
      for $notification in $consolidated-notifies
      let $parts := fn:tokenize($notification, $STRING-TOKEN)
      let $threshold := fn:head($parts)
      let $uris := fn:tail($parts)
      let $match-write-object := matcher:build-match-notification($threshold, $uris, $merge-options)
      return
        $match-write-object
    return (
      $notifications,
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options:["||xdmp:request()||"] Notifications: " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
    )
  (: Ensure that we are only writing once to a URI and merges take precedence over archives :)
  let $_processed-merges :=
    for $processed-merge in $processed-merges
    return
      $write-objects-by-uri => map:put(($processed-merge => map:get("uri")), $processed-merge)
  let $_processed-notifications :=
    for $processed-notification in $processed-notifications
    return
      $write-objects-by-uri => map:put(($processed-notification => map:get("uri")), $processed-notification)
  return json:to-array((
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then (
      xdmp:trace($const:TRACE-MATCH-RESULTS, "All matches: " || xdmp:describe($all-matches, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Matching options: " || xdmp:describe($matching-options, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Merge options: " || xdmp:describe($merge-options, (),())),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Consolidated merges: " || xdmp:quote($consolidated-merges)),
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Consolidated notifications: " || xdmp:quote($consolidated-notifies))
    )
    else (),
    for $uri in map:keys($write-objects-by-uri)
    return
      $write-objects-by-uri => map:get($uri),
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
        fn:error(xs:QName("SM-CONFIGURATION"), "Threshold action is not configured or not found", $custom-action-match),
      if (xdmp:trace-enabled($const:TRACE-PERFORMANCE)) then
        xdmp:trace($const:TRACE-PERFORMANCE, "proc-impl:process-match-and-merge-with-options:["||xdmp:request()||"] " || (xdmp:elapsed-time() - $start-elapsed))
      else ()
  ))
};

(:
 : The workhorse function.
 :)
declare function proc-impl:process-match-and-merge-with-options-save(
  $input as item()*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query,
  $fine-grain-provenance as xs:boolean)
{
  let $actions as item()* := json:array-values(proc-impl:process-match-and-merge-with-options(
      $input,
      $merge-options,
      $match-options,
      $filter-query,
      $fine-grain-provenance
    ))
  for $action in $actions
  return
    if ($action instance of map:map) then
      let $uri as xs:string := $action => map:get("uri")
      let $context as map:map? := $action => map:get("context")
      let $permissions := $context => map:get("permissions")
      return (
        if (fn:not(($action => map:get("hidden")))) then
          ($action => map:get("value"))[fn:empty(xdmp:node-uri(.))]
        else (),
        xdmp:document-insert(
          $uri,
          $action => map:get("value"),
          map:new((
            map:entry("collections", $context => map:get("collections")),
            map:entry("permissions", if (fn:exists($permissions)) then $permissions else xdmp:default-permissions($uri, "objects")),
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

declare function proc-impl:build-write-object-for-doc($doc as document-node())
  as map:map
{
  map:new((
    map:entry("uri", xdmp:node-uri($doc)),
    map:entry("value", $doc),
    map:entry("context", map:new((
      map:entry("collections", xdmp:node-collections($doc)),
      map:entry("metadata", xdmp:node-metadata($doc)),
      map:entry("permissions", xdmp:node-permissions($doc, "objects"))
    )))
  ))
};

declare function proc-impl:retrieve-write-object(
  $write-objects-by-uri as map:map,
  $uri as xs:string
) as map:map?
{
  if (map:contains($write-objects-by-uri, $uri)) then
    $write-objects-by-uri
    => map:get($uri)
  else
    let $write-obj := proc-impl:build-write-object-for-doc(fn:doc($uri))
    return (
      map:put($write-objects-by-uri, $uri, $write-obj),
      $write-obj
    )
};
