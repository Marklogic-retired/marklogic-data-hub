xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Headers Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $options - a map containing options. Options are sent from Java
 :)
declare function plugin:do-something-extra(
  $id as xs:string,
  $options as map:map)
{
  let $_ :=
    if (map:get($options, "extraGoBoom") eq fn:true() and $id = ("/input-2.json", "/input-2.xml")) then
      fn:error(xs:QName("EXTRA-BOOM"), "I BLEW UP")
    else ()
  let $_ := map:put($options, "extraTest", "extra")
  return ()
};
