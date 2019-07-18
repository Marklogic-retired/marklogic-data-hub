xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";
import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";

declare option xdmp:mapping "false";
declare variable $ENTITY as xs:string := "entity";

(:~
 : Collect IDs plugin
 :
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - a sequence of ids or uris
 :)
declare function plugin:collect(
  $options as map:map) as xs:string*
{
  (:read collection(s) out of a property, split them out by the comma :)
  let $input-collections as xs:string* := map:get($options, $cfg:INPUT-COLLECTIONS-KEY) => fn:tokenize(",")
  (:read entity name to be used as a collection:)
  let $entity-collection := map:get($options, $ENTITY)
  (:construct collection query:)
  let $collection-query := cts:collection-query(($input-collections, $entity-collection))
  return
    (:retrieve uris:)
    cts:uris((), (), $collection-query)
};

