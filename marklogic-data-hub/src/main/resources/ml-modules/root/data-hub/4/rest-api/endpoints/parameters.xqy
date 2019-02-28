xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters";

declare namespace rest="http://marklogic.com/appservices/rest";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function parameters:query-parameter(
    $params     as map:map,
    $name       as xs:string,
    $required   as xs:boolean,
    $repeatable as xs:boolean
) as map:map
{
   parameters:query-parameter($params,$name,$required,$repeatable,(),(),())
};
declare function parameters:query-parameter(
    $params     as map:map,
    $name       as xs:string,
    $required   as xs:boolean,
    $repeatable as xs:boolean,
    $allowed    as xs:string*
) as map:map
{
   parameters:query-parameter($params,$name,$required,$repeatable,$allowed,(),())
};
declare function parameters:query-parameter(
    $params     as map:map,
    $name       as xs:string,
    $required   as xs:boolean,
    $repeatable as xs:boolean,
    $allowed    as xs:string*,
    $privileges as xs:string*
) as map:map
{
   parameters:query-parameter($params,$name,$required,$repeatable,$allowed,$privileges,())
};
declare function parameters:query-parameter(
    $params     as map:map,
    $name       as xs:string,
    $required   as xs:boolean,
    $repeatable as xs:boolean,
    $allowed    as xs:string*,
    $privileges as xs:string*,
    $converter  as function(*)?
) as map:map
{
    let $values := xdmp:get-request-field($name)
    return (
        if (not($required) or exists($values[. ne ""])) then ()
        else error((),"REST-REQUIREDPARAM",$name),

        if (empty($values))
        then $params
        else (
            if (empty($privileges) or xdmp:has-privilege($privileges, "execute")) then ()
            else error((),"REST-INVALIDPARAM", concat(
                $name," parameter requires at least one privilege: ",string-join($privileges,", ")
                )),

            if ($repeatable or count($values) lt 2) then ()
            else error((),"REST-REPEATEDPARAM",$name),

            map:with($params,$name,
                if (empty($allowed) and empty($converter))
                then $values
                else
                    let $fname  :=
                        if (empty($converter)) then ()
                        else function-name($converter)
                    let $fns    :=
                        if (empty($fname)) then ()
                        else namespace-uri-from-QName($fname)
                    let $flocal :=
                        if (not($fns = ("http://www.w3.org/2001/XMLSchema"))) then ()
                        else local-name-from-QName($fname)
                    for $val in $values
                    let $converted :=
                        if (empty($converter))
                        then $val
                        else if (empty($flocal) or xdmp:castable-as($fns,$flocal,$val))
                        then $converter($val)
                        else error((),"REST-INVALIDPARAM", concat(
                            $name, " parameter not convertible to xs:",
                            local-name-from-QName($fname)," value: ",string($val)
                            ))
                    return
                        if (exists($allowed) and not($converted = $allowed))
                        then error((),"REST-INVALIDTYPE",
                            ($name, $val, "is not one of", string-join($allowed, "|")))
                        else $converted
                )
            )
        )
};

declare function parameters:prefixed-query-parameter(
    $prefix as xs:string
) as map:map?
{
   let $values := map:new()
   return
      if (empty(
         for $name in xdmp:get-request-field-names()
         return
            if (not(starts-with($name,$prefix))) then ()
            else (
               map:put($values,substring-after($name,$prefix),xdmp:get-request-field($name)),
               true()
               )
         )) then ()
      else $values
};

declare function parameters:query-parameters-passthrough(
    $params  as map:map,
    $pattern as xs:string
) as map:map
{
   for $name in xdmp:get-request-field-names()
   return 
      if (matches($name,$pattern))
      then map:put($params,$name,xdmp:get-request-field($name))
      else (),
   $params
};

declare function parameters:validate-parameter-names(
    $params          as map:map,
    $ignore-patterns as xs:string*
) as xs:string*
{
    for $name in xdmp:get-request-field-names()
    return
        if (map:contains($params,$name)) then ()
        else parameters:check-ignore($name,$ignore-patterns)
};
declare private function parameters:check-ignore(
    $name            as xs:string,
    $ignore-patterns as xs:string*
) as xs:string?
{
    if (exists($ignore-patterns) and exists(
        for $pattern in $ignore-patterns
        return
            if (matches($name,$pattern))
            then true()
            else ()
        ))
    then ()
    else $name
};
