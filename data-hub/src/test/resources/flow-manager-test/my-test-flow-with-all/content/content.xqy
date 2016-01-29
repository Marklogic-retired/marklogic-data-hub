xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/hub-in-a-box/plugins/content";

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
  $content as element()?,
  $headers as element()*,
  $triples as element()*,
  $options as map:map) as element()?
{
  let $source := fn:doc($id)
  return
    <employee>
      <emp-id>{$source/*:employee/*:id/fn:data()}</emp-id>
    </employee>

};
