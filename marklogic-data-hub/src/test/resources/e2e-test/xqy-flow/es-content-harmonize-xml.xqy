xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

import module namespace es = "http://marklogic.com/entity-services"
at "/MarkLogic/entity-services/entity-services.xqy";

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
  $options as map:map) as map:map
{
  let $_ :=
    if (map:get($options, "contentGoBoom") eq fn:true() and $id = ("/input-2.json", "/input-2.xml")) then
      fn:error(xs:QName("CONTENT-BOOM"), "I BLEW UP")
    else ()

  let $doc := fn:doc($id)
  let $source :=
    if ($doc/es:envelope) then
      $doc/es:envelope/es:instance/node()
    else if ($doc/instance) then
      $doc/instance
    else
      $doc/node()
  return
    plugin:extract-instance-e2eentity($source)
};

(:~
 : Creates a map:map instance from some source document.
 : @param $source-node  A document or node that contains
 :   data for populating a e2eentity
 : @return A map:map instance with extracted data and
 :   metadata about the instance.
 :)
declare function plugin:extract-instance-e2eentity(
  $source as node()?
) as map:map
{
(: the original source documents :)
  let $attachments := $source

  let $id as xs:string := $source/id
  let $name as xs:string? := $source/name
  let $salary as xs:decimal? := $source/salary

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
    map:put($model, '$attachments', $attachments),
    map:put($model, '$type', 'e2eentity'),
    map:put($model, '$version', '0.0.1'),
    map:put($model, 'id', $id),
    es:optional($model, 'name', $name),
    es:optional($model, 'salary', $salary)
  )

  (: if you prefer the xquery 3.1 version with the => operator....
   : https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
    json:object()
      =>map:with('$attachments', $attachments)
      =>map:with('$type', 'e2eentity')
      =>map:with('$version', '0.0.1')
      =>map:with('id', $id)
      =>es:optional('name', $name)
      =>es:optional('salary', $salary)
  :)
  return
    $model
};

declare function plugin:make-reference-object(
  $type as xs:string,
  $ref as xs:string)
{
  let $o := json:object()
  let $_ := (
    map:put($o, '$type', $type),
    map:put($o, '$ref', $ref)
  )
  return
    $o
};
