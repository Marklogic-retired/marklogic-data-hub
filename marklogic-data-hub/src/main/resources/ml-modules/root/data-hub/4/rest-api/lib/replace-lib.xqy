xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace replib = "http://marklogic.com/rest-api/lib/replace-lib";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

(: NOTE: This list is used to validate apply calls in document patch and so
   must be kept current with the exposed built-in functions. :)
declare variable $replib:export := (
    "ml.add", "ml.subtract", "ml.multiply", "ml.divide",
    "ml.concat-before", "ml.concat-after", "ml.concat-between",
    "ml.substring-before", "ml.substring-after", "ml.replace-regex"
    );

(: The caller is responsible for datatyping.
   For datetime/duration arithmetic, the following operations are valid:
   datetime +/-   duration
   duration +/-   duration
   duration */div number
   datetime -     datetime
   duration div   duration
  :)
declare function replib:ml.add(
    $node    as node()?,
    $content as item()*
) as node()*
{
    let $content-count := replib:check-input($node,$content,1,3)
    return replib:construct-node(
        $node,
        replib:cast-datetime-duration-numeric(
            $content,$content-count,2,data($node)
            )
        + replib:cast-datetime-duration-numeric(
            $content,$content-count,3,data(subsequence($content,1,1))
            )
        )
};

declare function replib:ml.subtract(
    $node    as node()?,
    $content as item()*
) as node()*
{
    let $content-count := replib:check-input($node,$content,1,3)
    return replib:construct-node(
        $node,
        replib:cast-datetime-duration-numeric(
            $content,$content-count,2,data($node)
            )
        - replib:cast-datetime-duration-numeric(
            $content,$content-count,3,data(subsequence($content,1,1))
            )
        )
};
declare function replib:ml.multiply(
    $node    as node()?,
    $content as item()*
) as node()*
{
    let $content-count := replib:check-input($node,$content,1,3)
    return replib:construct-node(
        $node,
        replib:cast-datetime-duration-numeric(
            $content,$content-count,2,data($node)
            )
        * replib:cast-datetime-duration-numeric(
            $content,$content-count,3,data(subsequence($content,1,1))
            )
        )
};
declare function replib:ml.divide(
    $node    as node()?,
    $content as item()*
) as node()*
{
    let $content-count := replib:check-input($node,$content,1,3)
    return replib:construct-node(
        $node,
        replib:cast-datetime-duration-numeric(
            $content,$content-count,2,data($node)
            )
        div replib:cast-datetime-duration-numeric(
            $content,$content-count,3,data(subsequence($content,1,1))
            )
        )
};

declare function replib:ml.concat-before(
    $node    as node()?,
    $content as item()*
) as node()*
{
    replib:check-input($node,$content,1,1)[false()],
    replib:construct-node(
        $node,
        concat(string($content), string($node))
        )
};
declare function replib:ml.concat-after(
    $node    as node()?,
    $content as item()*
) as node()*
{
    replib:check-input($node,$content,1,1)[false()],
    replib:construct-node(
        $node,
        concat(string($node), string($content))
        )
};
declare function replib:ml.concat-between(
    $node    as node()?,
    $content as item()*
) as node()*
{
    replib:check-input($node,$content,2,2)[false()],
    replib:construct-node(
        $node,
        concat(string(head($content)), string($node), string(tail($content)))
        )
};
declare function replib:ml.substring-before(
    $node    as node()?,
    $content as item()*
) as node()*
{
    replib:check-input($node,$content,1,1)[false()],
    replib:construct-node(
        $node,
        substring-before(string($node), string($content))
        )
};
declare function replib:ml.substring-after(
    $node    as node()?,
    $content as item()*
) as node()*
{
    replib:check-input($node,$content,1,1)[false()],
    replib:construct-node(
        $node,
        substring-after(string($node), string($content))
        )
};
declare function replib:ml.replace-regex(
    $node    as node()?,
    $content as item()*
) as node()*
{
    let $content-count := replib:check-input($node,$content,2,3)
    return replib:construct-node(
        $node,
        if ($content-count eq 2)
        then replace(
            string($node),
            string(head($content)),
            string(tail($content))
            )
        else replace(
            string($node),
            string(subsequence($content,1,1)),
            string(subsequence($content,2,1)),
            string(subsequence($content,3,1))
            )
        )
};

declare private function replib:datatype(
    $content  as item()*,
    $count    as xs:int,
    $position as xs:int
) as xs:string?
{
    if ($count lt $position) then ()
    else
        let $datatype := string(subsequence($content,$position,1))
        return
            if (starts-with($datatype,"xs:"))
            then substring-after($datatype,"xs:")
            else $datatype
};

declare private function replib:cast-datetime-duration-numeric(
    $content  as item()*,
    $count    as xs:int,
    $position as xs:int,
    $value    as item()
) as item()
{
    typeswitch($value)
    case xs:untypedAtomic return 
        replib:datetime-duration-numeric-string($content,$count,$position,$value)
    case xs:string return 
        replib:datetime-duration-numeric-string($content,$count,$position,$value)
    case json:array return error((),"RESTAPI-INVALIDCONTENT",
        concat("operation does not support JSON array values")
        )
    case json:object return error((),"RESTAPI-INVALIDCONTENT",
        concat("operation does not support JSON object values")
        )
    default return $value
};

declare private function replib:datetime-duration-numeric-string(
    $content  as item()*,
    $count    as xs:int,
    $position as xs:int,
    $value    as item()
) as item()
{
    let $datatype := replib:datatype($content,$count,$position)
    return
        if (empty($datatype))
        then replib:default-numeric-cast($value)
        else replib:cast-datetime-duration-numeric($datatype, $value)
};

declare function replib:cast-value(
    $datatype as xs:string,
    $value    as item()
) as item()
{
    let $type :=
        if (starts-with($datatype,"xs:"))
        then substring-after($datatype,"xs:")
        else $datatype
    return
        if ($type eq 'string')
        then xs:string($value)
        else replib:cast-datetime-duration-numeric($type, $value)
};

declare private function replib:cast-datetime-duration-numeric(
    $datatype as xs:string,
    $value    as item()
) as item()
{
    let $numeric := replib:cast-numeric-datatype($datatype,$value)
    return
        if (exists($numeric))
        then $numeric
        else
            let $datetime := replib:cast-datetime-datatype($datatype,$value)
            return
                if (exists($datetime))
                then $datetime
                else
                    let $duration := replib:cast-duration-datatype($datatype,$value)
                    return
                        if (exists($duration))
                        then $duration
                        else error((),"RESTAPI-INVALIDCONTENT",
                            concat("operation does not support datatype: ",$datatype)
                            )
};

declare private function replib:cast-datetime-datatype(
    $datatype as xs:string,
    $value    as item()
)
{
    if      ($datatype eq "date"      ) then xs:date($value)
    else if ($datatype eq "dateTime"  ) then xs:dateTime($value)
    else if ($datatype eq "time"      ) then xs:time($value)
    else if ($datatype eq "gDay"      ) then xs:gDay($value)
    else if ($datatype eq "gMonth"    ) then xs:gMonth($value)
    else if ($datatype eq "gMonthDay" ) then xs:gMonthDay($value)
    else if ($datatype eq "gYear"     ) then xs:gYear($value)
    else if ($datatype eq "gYearMonth") then xs:gYearMonth($value)
    else ()
};

declare private function replib:cast-duration-datatype(
    $datatype as xs:string,
    $value    as item()
)
{
    if      ($datatype eq "yearMonthDuration") then xs:yearMonthDuration($value)
    else if ($datatype eq "dayTimeDuration"  ) then xs:dayTimeDuration($value)
    else ()
};

declare private function replib:cast-numeric-datatype(
    $datatype as xs:string,
    $value    as item()
)
{
    if      ($datatype eq "decimal"      ) then xs:decimal($value)
    else if ($datatype eq "double"       ) then xs:double($value)
    else if ($datatype eq "float"        ) then xs:float($value)
    else if ($datatype eq "int"          ) then xs:int($value)
    else if ($datatype eq "integer"      ) then xs:integer($value)
    else if ($datatype eq "long"         ) then xs:long($value)
    else if ($datatype eq "short"        ) then xs:short($value)
    else if ($datatype eq "unsignedInt"  ) then xs:unsignedInt($value)
    else if ($datatype eq "unsignedLong" ) then xs:unsignedLong($value)
    else if ($datatype eq "unsignedShort") then xs:unsignedShort($value)
    else ()
};

declare private function replib:default-numeric-cast(
    $value as item()
)
{
    if ($value castable as xs:double)
    then xs:double($value)
    else error((),"RESTAPI-INVALIDCONTENT",
        concat("cannot cast ",string($value)," for numeric operation"))
};

declare private function replib:check-input(
    $node    as node()?,
    $content as item()*,
    $min     as xs:int,
    $max     as xs:int
) as xs:int
{
    if (exists($node)) then ()
    else error((),"RESTAPI-INVALIDCONTENT",
        "function usable only for replace and not insert"
        ),

    let $count := count($content)
    return
        if ($count ge $min and $count le $max)
        then $count
        else error((),"RESTAPI-INVALIDCONTENT",
            if ($min eq $max)
            then concat("requires exactly ",$min," additional arguments")
            else concat(
                "requires between ",$min," and ",$max," additional arguments"
                )
            )
};

declare private function replib:construct-node(
    $node     as node(),
    $content  as item()?
) as node()
{
    typeswitch($node)
    case text() return
        replib:name-node($node, text{$content})
    case number-node() return
        replib:name-node($node, number-node{$content})
    case boolean-node() return
        replib:name-node($node, boolean-node{$content})
    case element() return
        element {node-name($node)} {
        $node/(@* except @xsi:type),

        let $is-untyped := empty($node/@xsi:type)
        return (
            if ($is-untyped or empty($content) or
                $content instance of node()) then ()
            else 
               let $type := data($node/@xsi:type)
               return 
                  if (xdmp:castable-as(namespace-uri-from-QName($type),local-name-from-QName($type),$content))
                  then attribute xsi:type { $type }
                  else attribute xsi:type { substring-after(xdmp:describe(sc:type($content)),"#") },

            if ($is-untyped and $content instance of xs:double and
                ceiling($content) eq floor($content) and
                $content castable as xs:integer)
            then xs:integer($content)
            else $content
            )
        }
    case attribute() return
        attribute {node-name($node)} {$content}
    default return error((),"RESTAPI-INVALIDCONTENT",
        "can only operate on elements, attributes, text, or numbers"
        )
};

declare private function replib:name-node(
    $node     as node(),
    $content  as node()
) as node()
{
    let $name := string(node-name($node))
    return
        if (empty($name))
        then $content
        else
            let $object := json:object()
            return (
                map:put($object,$name,$content),

                xdmp:to-json($object)/object-node()/node()
                )
};
