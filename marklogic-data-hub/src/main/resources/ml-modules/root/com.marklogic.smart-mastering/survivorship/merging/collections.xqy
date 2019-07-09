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

declare function collection-impl:build-collection-algorithm-map(
  $merging-xml as element(merging:options)?
) as map:map
{
  let $cache-id := fn:string($merging-xml ! fn:generate-id(.))
  return
    if (map:contains($_collection-algorithm-cache, $cache-id)) then
      map:get($_collection-algorithm-cache, $cache-id)
    else
      let $algorithm-map :=
        map:new((
          for $event-name in $event-names
          let $local-name := fn:local-name-from-QName($event-name)
          let $algorithm-xml := $merging-xml/merging:algorithms/merging:collections/*[fn:node-name(.) eq $event-name]
          return
            map:entry(
              $local-name,
              fun-ext:function-lookup(
                fn:string($algorithm-xml/@function),
                fn:string($algorithm-xml/@namespace),
                fn:string($algorithm-xml/@at),
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
  $event-options as element()?
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

declare function collection-impl:on-merge($collections-by-uri as map:map, $event-options as element()?) {
  collection-impl:execute-algorithm(
    "on-merge",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-archive($collections-by-uri as map:map, $event-options as element()?) {
  collection-impl:execute-algorithm(
    "on-archive",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-no-match($collections-by-uri as map:map, $event-options as element()?) {
  collection-impl:execute-algorithm(
    "on-no-match",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:on-notification($collections-by-uri as map:map, $event-options as element()?) {
  collection-impl:execute-algorithm(
    "on-notification",
    $collections-by-uri,
    $event-options
  )
};

declare function collection-impl:default-collection-handler(
  $event-name as xs:string,
  $collections-by-uri as map:map,
  $event-options as element()?
) {
  if (fn:exists($event-options/merging:set/merging:collection[. ne ''])) then
    $event-options/merging:set/merging:collection ! fn:string(.)
  else (
    let $merge-options := collection-impl:get-options-root($event-options)
    let $match-options := matcher:get-options($merge-options/merging:match-options, $const:FORMAT-XML)
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
        $event-options/merging:remove/merging:collection ! fn:string(.),
        switch ($event-name)
          case $const:ON-ARCHIVE-EVENT return
            coll:content-collections($match-options)
          default return
            ()
      ))
    return
      (
        $all-collections[fn:not(. = $remove-collections)],
        $event-options/merging:add/merging:collection ! fn:string(.)
      )[. ne '']
  )
};

declare function collection-impl:get-options-root(
  $event-options as element()?
) as element(merging:options)? {
  if (fn:exists($event-options)) then
    fn:root($event-options)/(self::merging:options|merging:options)
  else
    ()
};
