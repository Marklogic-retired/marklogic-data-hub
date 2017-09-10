xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace es = "http://marklogic.com/entity-services";

declare option xdmp:mapping "false";

(:~
 : Create Content Plugin
 :
 : @param $id          - the identifier returned by the collector
 : @param $options     - a map containing options. Options are sent from Java
 :
 : @return - your transformed content
 :)
declare function plugin:create-content(
  $id as xs:string,
  $options as map:map) as node()?
{
  let $doc := fn:doc($id)
  return
    if ($doc/es:envelope) then
      $doc/es:envelope/es:instance/node()
    else if ($doc/envelope/instance) then
      $doc/envelope/instance
    else
      $doc
};
