xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Triples Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $headers - the output of your headers plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more triples
 :)
declare function plugin:create-triples(
  $id as xs:string,
  $content as item()?,
  $headers as item()*,
  $options as map:map)
{
  let $_ :=
    if (map:get($options, "triplesGoBoom") eq fn:true() and $id = ("/input-2.xml")) then
      fn:error(xs:QName("TRIPLES-BOOM"), "I BLEW UP")
    else ()
  let $_ := map:put($options, "triplesTest", "triples")
  return
    json:to-array((
      sem:triple("a", "b", "c"),
      sem:triple("x", "y", "z")
    ))
};
