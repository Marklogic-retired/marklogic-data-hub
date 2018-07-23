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
  let $source      :=
    if ($source/*:envelope and $source/node() instance of element()) then
      $source/*:envelope/*:instance/node()
    else if ($source/*:envelope) then
      $source/*:envelope/*:instance
    else if ($source/instance) then
        $source/instance
      else
        $source
  let $name := xs:string($source/name)
  let $price := xs:decimal($source/price)
  let $ages := (json:to-array($source/ages))

  (: The following property is a local reference. :)
  let $employee := (
    let $employees :=
      (: create a sequence of Employee instances from your data :)
      for $sub-entity in ($source/employee)
      return
        plugin:extract-instance-Employee($sub-entity)
    return
      if (fn:exists($employees)) then
        json:to-array($employees)
      else ()
  )

  (: The following property is a local reference. :)
  let $employees := (
    let $employees :=
      (: create a sequence of Employee instances from your data :)
      for $sub-entity in ($source/employees)
      return
        plugin:extract-instance-Employee($sub-entity)
    return
      if (fn:exists($employees)) then
        json:to-array($employees)
      else ()
  )

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
    map:put($model, '$attachments', $attachments),
    map:put($model, '$type', 'my-fun-test'),
    map:put($model, '$version', '0.0.1'),
    map:put($model, 'name', $name),
    map:put($model, 'price', $price),
    map:put($model, 'ages', $ages),
    map:put($model, 'employee', $employee),
    map:put($model, 'employees', $employees)
  )

  (: if you prefer the xquery 3.1 version with the => operator....
  https://www.w3.org/TR/xquery-31/#id-arrow-operator
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
  return $model
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

  let $source :=
    if($source/node() instance of element()) then
      $source/node()
    else (
      $source
    )
  let $id := xs:string($source/id)
  let $name := xs:string($source/name)
  let $salary := xs:decimal($source/salary)

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (

    map:put($model, '$type', 'Employee'),
    map:put($model, '$version', '0.0.1'),
    map:put($model, 'id', $id),
    map:put($model, 'name', $name),
    map:put($model, 'salary', $salary)
  )

  (: if you prefer the xquery 3.1 version with the => operator....
  https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
  json:object()

    =>map:with('$type', 'Employee')
    =>map:with('$version', '0.0.1')
    =>map:with('id', $id)
    =>es:optional('name', $name)
    =>es:optional('salary', $salary)
  :)
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
