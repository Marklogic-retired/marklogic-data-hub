xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace jsonbld = "http://marklogic.com/rest-api/lib/json-build";

import module namespace json="http://marklogic.com/xdmp/json"
     at "/MarkLogic/json/json.xqy";

declare namespace xsi       = "http://www.w3.org/2001/XMLSchema-instance";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

(: TODO: retire this module and use /MarkLogic/json/json.xqy :)

declare function jsonbld:object(
    $pairs as xs:anyAtomicType*
) as xs:string
{
    concat(
        "{",
        string-join(
            let $item-count := count($pairs)
            let $pair-count :=
                if ($item-count mod 2 ne 0)
                then error((),"RESTAPI-INTERNALERROR", ("JSON build, unbalanced pairs: ",string-join($pairs," | ")))
                else $item-count idiv 2
            for $i in 1 to $pair-count
            let $val-num := $i * 2
            let $key   := string(subsequence($pairs, $val-num - 1, 1))
            let $value := string(subsequence($pairs, $val-num, 1))
            return concat(
                jsonbld:key($key),
                ":",
                $value
                ),
            ","
            ),
        "}"
        )
};

declare function jsonbld:array(
    $items as xs:anyAtomicType*
) as xs:string
{
    concat(
        "[",
        string-join(
            for $item in $items
            return string($item),
            ","
            ),
        "]"
        )
};

declare function jsonbld:key(
    $key as xs:string
) as xs:string
{
    if (starts-with($key,'"')) then $key
    else jsonbld:string($key)
};

declare function jsonbld:element-value(
    $elem as element()
) as xs:anyAtomicType
{
    xdmp:to-json-string(data($elem))
};

declare function jsonbld:value(
    $value as xs:anyAtomicType
) as xs:anyAtomicType
{
    xdmp:to-json-string($value)
};

declare function jsonbld:value(
    $value as xs:anyAtomicType,
    $type  as xs:string?
) as xs:anyAtomicType
{
    xdmp:to-json-string($value)
};

declare function jsonbld:strings(
    $values as xs:anyAtomicType*
) as xs:string*
{
    for $value in $values
    return jsonbld:string($value)
};

declare function jsonbld:string(
    $value as xs:anyAtomicType
) as xs:string
{
    xdmp:to-json-string(string($value))
};

declare function jsonbld:get-map-sequence(
    $map as map:map,
    $key as xs:string
) as item()*
{
    if (empty($map)) then ()
    else
        let $value := map:get($map,$key)
        return
            if (empty($value)) then ()
            else if ($value instance of json:array)
            then json:array-values($value)
            else $value
};
