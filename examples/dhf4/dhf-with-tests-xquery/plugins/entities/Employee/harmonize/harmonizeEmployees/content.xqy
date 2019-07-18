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
  let $doc := fn:doc($id)
  let $source := $doc
  return
  plugin:extract-instance-Employee($source)
};
  
(:~
: Creates a map:map instance from some source document.
: @param $source-node  A document or node that contains
:   data for populating a Employee
: @return A map:map instance with extracted data and
:   metadata about the instance.
:)
declare function plugin:extract-instance-Employee(
$source as node()?
) as map:map
{

  (: the original source documents :)
  let $attachments := $source
  let $source      :=
    if ($source/*:envelope and $source/node() instance of element()) then
      $source/*:envelope/*:instance/node()
    else if ($source/*:envelope) then
      $source/*:envelope/*:instance
    else if ($source/instance) then
      $source/instance
    else
      $source
  let $i-d := xs:string($source/ID)
  let $hire-date := xs:date($source/HireDate)
  let $salary := xs:double($source/Salary)

  let $model :=
  json:object()
    =>map:with('$attachments', $attachments)
    =>map:with('$type', 'Employee')
    =>map:with('$version', '0.0.1')
    =>map:with('ID', $i-d)
  =>map:with('HireDate', $hire-date)
  =>map:with('Salary', $salary)

  return $model
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