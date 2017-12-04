xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Headers Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more header nodes
 :)
declare function plugin:create-headers(
  $id as xs:string,
  $content as item()?,
  $options as map:map) as item()*
{
  let $_ :=
    if (map:get($options, "headersGoBoom") eq fn:true() and $id = ("/input-2.json", "/input-2.xml")) then
      fn:error(xs:QName("HEADERS-BOOM"), "I BLEW UP")
    else ()
  let $_ := map:put($options, "headersTest", "headers")
  return
  (
    object-node { "a": 1, "b": 2 }
  )
};
