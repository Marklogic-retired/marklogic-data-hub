xquery version "1.0-ml";

(:~
 : Implementation library for handling the survivorship of collections.
 :
 :)
module namespace collection-impl = "http://marklogic.com/smart-mastering/survivorship/collections";

import module namespace coll = "http://marklogic.com/smart-mastering/collections"
  at "/com.marklogic.smart-mastering/impl/collections.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../../function-extension/base.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "base.xqy",
    "options.xqy";

declare namespace merging = "http://marklogic.com/smart-mastering/merging";

declare function collection-impl:default-function-lookup(
  $name as xs:string?,
  $arity as xs:int
) as function(*)?
{
  fn:function-lookup(
    fn:QName(
      "http://marklogic.com/smart-mastering/survivorship/collections",
      if (fn:exists($name[. ne ""])) then
        $name
      else
        "default-collection-handler"
    ),
    $arity
  )
};

declare variable $_collection-algorithm-cache as map:map := map:map();
declare variable $event-names as xs:QName+ := (
    xs:QName('merging:'|| $const:ON-MERGE-EVENT),
    xs:QName('merging:'|| $const:ON-NO-MATCH),
    xs:QName('merging:'|| $const:ON-NOTIFICATION-EVENT),
    xs:QName('merging:'|| $const:ON-ARCHIVE-EVENT)
  );
declare variable $event-name-to-json-QName as map:map := map:new(
  for $event-name in $event-names
  let $local-name := fn:local-name-from-QName($event-name)
  let $camelcase :=
    let $parts := fn:tokenize($local-name , "-")
    return
      fn:string-join(
        (
          fn:head($parts),
          for $part in fn:tail($parts)
          return fn:upper-case(fn:substring($part, 1, 1)) || fn:substring($part, 2)
        ),
        ""
      )
  return map:entry($local-name, xs:QName($camelcase))
);

declare function collection-impl:build-collection-algorithm-map(
  $merging-options as node()?
) as map:map
{
  let $cache-id := fn:string($merging-options ! fn:generate-id(.))
  return
    if (map:contains($_collection-algorithm-cache, $cache-id)) then
      map:get($_collection-algorithm-cache, $cache-id)
    else
      let $algorithm-map :=
        map:new((
          let $is-json := $merging-options instance of object-node()
          let $collection-algorithms := $merging-options/*:algorithms/*:collections
          for $event-name in $event-names
          let $local-name := fn:local-name-from-QName($event-name)
          let $algorithm-qname := if ($is-json) then $event-name-to-json-QName => map:get($local-name) else $event-name
          let $algorithm-node := $collection-algorithms/*[fn:node-name(.) eq $algorithm-qname]
          return
            map:entry(
              $local-name,
              fun-ext:function-lookup(
                fn:string($algorithm-node/(@function|function)),
                fn:string($algorithm-node/(@namespace|namespace)),
                fn:string($algorithm-node/(@at|at)),
                collection-impl:default-function-lookup(?, 3)
              )
            )
        ))
      return (
        map:put($_collection-algorithm-cache, $cache-id, $algorithm-map),
        $algorithm-map
      )
};

(:
 : Apply a collection event handler.
 : @param $algorithm  function that will determine the merged values
 : @param $event-name  string with the event name
 : @param $collections-by-uri  map of collections by uri
 : @param $event-options  configuration for how this collection event
 :)
declare function collection-impl:execute-algorithm(
  $event-name as xs:string,
  $collections-by-uri as map:map,
  $event-options as node()?
)
{
  let $algorithm-map :=
    collection-impl:build-collection-algorithm-map(
      collection-impl:get-options-root(
        $event-options
      )
    )
  let $algorithm := $algorithm-map => map:get($event-name)
  return
    if (fn:ends-with(xdmp:function-module($algorithm), "sjs")) then
      let $collections-by-uri := xdmp:to-json($collections-by-uri)/object-node()
      let $event-options := merge-impl:collection-event-to-json($event-options)
      let $result := xdmp:apply($algorithm, $event-name, $collections-by-uri, $event-options)
      return
        typeswitch($result)
          case json:array return
            json:array-values($result)
          case array-node() return
            $result/node() ! fn:string(.)
          case xs:string+ return
            $result
          default return
            ()
    else
      xdmp:apply($algorithm, $event-name, $collections-by-uri, $event-options)
};

declare function collection-impl:on-merge($collections-by-uri as map:map, $event-options as node()?) {
  collection-impl:execute-algorithm(
    "on-merge",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-archive($collections-by-uri as map:map, $event-options as node()?) {
  collection-impl:execute-algorithm(
    "on-archive",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-no-match($collections-by-uri as map:map, $event-options as node()?) {
  collection-impl:execute-algorithm(
    "on-no-match",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-notification($collections-by-uri as map:map, $event-options as node()?) {
  collection-impl:execute-algorithm(
    "on-notification",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:default-collection-handler(
  $event-name as xs:string,
  $collections-by-uri as map:map,
  $event-options as node()?
) {
  if (fn:exists($event-options/*:set/*:collection[. ne ''])) then
    $event-options/*:set/*:collection ! fn:string(.)
  else (
    let $merge-options := collection-impl:get-options-root($event-options)
    let $match-options := matcher:get-options($merge-options/(merging:match-options|matchOptions), $const:FORMAT-XML)
    let $content-collection-options := fn:head(($match-options,$merge-options))
    let $all-collections := fn:distinct-values((
          map:keys(-$collections-by-uri),
          switch ($event-name)
            case $const:ON-MERGE-EVENT return
              (coll:merged-collections($merge-options),coll:content-collections($content-collection-options))
            case $const:ON-NO-MATCH return
              coll:content-collections($content-collection-options)
            case $const:ON-ARCHIVE-EVENT return
              coll:archived-collections($merge-options)
            case $const:ON-NOTIFICATION-EVENT return
              coll:notification-collections($merge-options)
            default return
              ()
        ))
    let $remove-collections := fn:distinct-values((
        $event-options/*:remove/*:collection ! fn:string(.),
        switch ($event-name)
          case $const:ON-ARCHIVE-EVENT return
            coll:content-collections($content-collection-options)
          case $const:ON-MERGE-EVENT return
            coll:archived-collections($merge-options)
          case $const:ON-NO-MATCH return
            coll:archived-collections($merge-options)
          default return
            ()
      ))
    return
      (
        $all-collections[fn:not(. = $remove-collections)],
        $event-options/*:add/*:collection ! fn:string(.)
      )[. ne '']
  )
};

declare function collection-impl:get-options-root(
  $event-options as node()?
) as node()? {
  if (fn:exists($event-options)) then
    fn:root($event-options)/(self::*:options|*:options)
  else
    ()
};
