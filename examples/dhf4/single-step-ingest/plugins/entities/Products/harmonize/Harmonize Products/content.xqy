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
  $options as map:map) as item()?
{
  let $doc := fn:doc($id)
  let $source :=
    if ($doc/es:envelope) then
      $doc/es:envelope/es:instance/node()
    else if ($doc/envelope/instance) then
      $doc/envelope/instance
    else
      $doc
  return plugin:extractInstanceProduct($source)
};

declare private function plugin:extractInstanceProduct(
  $source as node()?) as item()?
{
  let $attachments := $source

  let $sku := xs:string($source/sku || $source/SKU)
  let $title := xs:string($source/title)
  let $price := xs:decimal($source/price)

  let $object := json:object()
  let $_ := map:put($object, "$attachments", $attachments)
  let $_ := map:put($object, "$type", "Product")
  let $_ := map:put($object, "sku", $sku)
  let $_ := map:put($object, "title", $title)
  let $_ := map:put($object, "price", $price)
  return $object
};
