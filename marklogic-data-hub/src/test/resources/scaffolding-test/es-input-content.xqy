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
  $raw-content as node()?,
  $options as map:map) as map:map
{
  let $source :=
    if ($raw-content/es:envelope) then
      $raw-content/es:envelope/es:instance/node()
    else if ($raw-content/instance) then
      $raw-content/instance
    else
      $raw-content
  return
    plugin:extract-instance-my-fun-test($source)
};

(:~
 : Creates a map:map instance from some source document.
 : @param $source-node  A document or node that contains
 :   data for populating a my-fun-test
 : @return A map:map instance with extracted data and
 :   metadata about the instance.
 :)
declare function plugin:extract-instance-my-fun-test(
    $source as node()?
) as map:map
{
  (: the original source documents :)
  let $attachments := $source

  let $name as xs:string? := ()
  let $price as xs:decimal? := ()
  let $ages := ()

  (: The following property is a local reference. :)
  let $employee :=
    let $employees :=
      (: create a sequence of Employee instances from your data :)
      for $sub-entity in ()
      return
        plugin:extract-instance-Employee($sub-entity)
    return
      if (fn:exists($employees)) then
        json:to-array($employees)
      else ()


  (: The following property is a local reference. :)
  let $employees :=
    let $employees :=
      (: create a sequence of Employee instances from your data :)
      for $sub-entity in ()
      return
        plugin:extract-instance-Employee($sub-entity)
    return
      if (fn:exists($employees)) then
        json:to-array($employees)
      else ()


  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
    map:put($model, '$attachments', $attachments),
    map:put($model, '$type', 'my-fun-test'),
    map:put($model, '$version', '0.0.1'),
    es:optional($model, 'name', $name),
    es:optional($model, 'price', $price),
    es:optional($model, 'ages', $ages),
    es:optional($model, 'employee', $employee),
    es:optional($model, 'employees', $employees)
  )

  (: if you prefer the xquery 3.1 version with the => operator....
   : https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
    json:object()
      =>map:with('$attachments', $attachments)
      =>map:with('$type', 'my-fun-test')
      =>map:with('$version', '0.0.1')
      =>es:optional('name', $name)
      =>es:optional('price', $price)
      =>es:optional('ages', $ages)
      =>es:optional('employee', $employee)
      =>es:optional('employees', $employees)
  :)
  return
    $model
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
  let $id as xs:string := ()
  let $name as xs:string? := ()
  let $salary as xs:decimal? := ()

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
    map:put($model, '$type', 'Employee'),
    map:put($model, '$version', '0.0.1'),
    map:put($model, 'id', $id),
    es:optional($model, 'name', $name),
    es:optional($model, 'salary', $salary)
  )

  (: if you prefer the xquery 3.1 version with the => operator....
   : https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
    json:object()
      =>map:with('$type', 'Employee')
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