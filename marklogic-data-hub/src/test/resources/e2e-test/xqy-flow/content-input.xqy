xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Content Plugin
 :
 : @param $id          - the identifier returned by the collector
 : @param $raw-content - the raw content being loaded.
 : @param $options     - a map containing options. Options are sent from Java
 :
 : @return - your transformed content
 :)
declare function plugin:create-content(
  $id as xs:string,
  $raw-content as node()?,
  $options as map:map) as item()?
{
  let $_ :=
    if (map:get($options, "contentGoBoom") eq fn:true() and $id = ("/input-2.json", "/input-2.xml")) then
      fn:error(xs:QName("CONTENT-BOOM"), "I BLEW UP")
    else ()
  return
    $raw-content
};
