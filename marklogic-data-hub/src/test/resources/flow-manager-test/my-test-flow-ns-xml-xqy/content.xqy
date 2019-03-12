xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Content Plugin
 :
 : @param id       - the identifier returned by the collector
 : @param content  - your final content
 : @param headers  - a sequence of header elements
 : @param triples  - a sequence of triples
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - your transformed content as an element
 :)
declare function plugin:create-content(
  $id as xs:string,
  $options as map:map)
{
  let $pid := fn:doc($id)/*:employee/*:id/fn:string()
  let $map := map:map()
  =>map:with("$type","Person")
  =>map:with("$version","0.0.1")
  =>map:with("$namespace","http://marklogic.com/Person")
  =>map:with("$namespacePrefix","prs")
  =>map:with("Id", $pid)
  return $map
};
