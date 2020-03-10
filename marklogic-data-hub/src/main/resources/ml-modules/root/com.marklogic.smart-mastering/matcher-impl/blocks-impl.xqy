xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Match blocks prevent automatic merges from happening. They can be created
 : manually and are automatically created when a merge gets rolled back.
 : Blocks are implemented here as managed RDF triples of the form:
 :   <uri1> $const:PRED-MATCH-BLOCK <uri2>
 : The reverse triple also gets stored:
 :   <uri2> $const:PRED-MATCH-BLOCK <uri1>
 :)

module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace sem = "http://marklogic.com/semantics"
  at "/MarkLogic/semantics.xqy";

declare option xdmp:mapping "false";

(:
 : Return a JSON array of any URIs the that input URI is blocked from matching.
 : @param $uri  input URI
 : @return JSON array of URIs
 :)
declare function blocks-impl:get-blocks($uri as xs:string?)
  as array-node()
{
  array-node {
    if (fn:exists($uri)) then
      if (map:contains($cached-blocks-by-uri, $uri)) then
        map:get($cached-blocks-by-uri, $uri)[. ne ""]
      else
        blocks-impl:get-blocks-of-uris($uri)
    else ()
  }
};

declare variable $cached-blocks-by-uri as map:map := map:map();

declare function blocks-impl:get-values(
  $map as map:map,
  $key as xs:string
)
{
  let $values := map:get($map, $key)
  return
    if (fn:exists($values))
    then $values
    else
      let $n :=  map:map()
      return (map:put($map, $key, $n), $n)
};

declare function blocks-impl:get-blocks-of-uris($uris as xs:string*)
as xs:string*{
  if (fn:exists($uris)) then (
    let $iris := $uris ! sem:iri(.)
    let $elapsed := xdmp:elapsed-time()
    let $solution :=  cts:triples($iris, $const:PRED-MATCH-BLOCK, (), "=", ("order-sop","concurrent"))
    let $_ := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
                let $elapsed := xs:integer((xdmp:elapsed-time() - $elapsed) div xs:dayTimeDuration("PT0.001S"))
                return
                  xdmp:trace($const:TRACE-MATCH-RESULTS, "get-blocks-of-uris," || xdmp:request() || ",sparql," || $elapsed ||  ",uris," || fn:string-join($uris, ";"))
              else ()
    let $elapsed := xdmp:elapsed-time()
    let $tmp := map:map()
    let $values :=
        for $triple in $solution
        let $target := fn:string(sem:triple-subject($triple))
        let $value := fn:string(sem:triple-object($triple))
        let $current-for-target := blocks-impl:get-values($tmp, $target)
        return
          (
            map:put($current-for-target,$value, fn:true()),
            $value
          )
    let $_ := for $k in map:keys($tmp)
    return map:put($cached-blocks-by-uri, $k,
      fn:distinct-values((map:get($cached-blocks-by-uri, $k), map:keys(map:get($tmp, $k)))))
    let $_populate-empty :=
      for $uri in $uris
      where fn:not(map:contains($cached-blocks-by-uri, $uri))
      return
        map:put($cached-blocks-by-uri, $uri, "")
    let $_ := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
                let $elapsed := xs:integer((xdmp:elapsed-time() - $elapsed) div xs:dayTimeDuration("PT0.001S"))
                return
                  xdmp:trace($const:TRACE-MATCH-RESULTS, "get-blocks-of-uris," || xdmp:request() || ",map," || $elapsed)
              else ()
    return fn:distinct-values($values)
  ) else ()
};


(:
 : Block all pairs of URIs from matching.
 :
 : @param uris the sequence of URIs
 : @return empty sequence
 :)
declare function blocks-impl:block-matches($uris as xs:string*)
{
  let $triples :=
    for $uri at $pos in $uris,
      $other-uri in (fn:subsequence($uris, 1, $pos - 1), fn:subsequence($uris, $pos + 1))
    return
      blocks-impl:block-match-triples($uri, $other-uri)
  let $_ := sem:rdf-insert($triples, (), config:get-default-data-hub-permissions())
  return ()
};

(:
 : Triples to prevent the two input URIs from being allowed to match. Helper function for block-matches.
 :
 : @param $uri1  First input URI
 : @param $uri2  Second input URI
 : @return sem:triple+
 :)
declare function blocks-impl:block-match-triples($uri1 as xs:string, $uri2 as xs:string)
as sem:triple+
{
  (
      sem:triple(sem:iri($uri1), $const:PRED-MATCH-BLOCK, sem:iri($uri2)),
      sem:triple(sem:iri($uri2), $const:PRED-MATCH-BLOCK, sem:iri($uri1))
  )
};

(:
 : Clear a match block between the two input URIs.
 :
 : @param $uri1  First input URI
 : @param $uri2  Second input URI
 :
 : @error will throw xs:QName("SM-CANT-UNBLOCK") if a block is present, but it cannot be cleared
 : @return  fn:true if a block was found and cleared; fn:false if no block was found
 :)
declare function blocks-impl:allow-match($uri1 as xs:string, $uri2 as xs:string)
{
  let $nodes := sem:database-nodes((
    cts:triples(sem:iri($uri1), $const:PRED-MATCH-BLOCK, sem:iri($uri2)),
    cts:triples(sem:iri($uri2), $const:PRED-MATCH-BLOCK, sem:iri($uri1))
  ))
  return (
    $nodes ! xdmp:node-delete(.),
    fn:exists($nodes)
  )
};
