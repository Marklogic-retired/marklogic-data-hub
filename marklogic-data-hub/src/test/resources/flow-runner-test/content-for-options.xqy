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
  $options as map:map) as node()?
{
  element result {
    for $x in map:keys($options)
    return
      element { xs:QName($x) } {
        map:get($options, $x)
      }
  }
};
