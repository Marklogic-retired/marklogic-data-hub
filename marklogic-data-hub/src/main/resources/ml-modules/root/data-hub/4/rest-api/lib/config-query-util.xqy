xquery version "1.0-ml";
(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace csu = "http://marklogic.com/rest-api/config-query-util";

import module namespace json="http://marklogic.com/xdmp/json"
    at "/MarkLogic/json/json.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $csu:indexable-elements := ( xs:QName("search:range"), xs:QName("search:word"), xs:QName("search:sort-order") );
declare variable $csu:index-elements := (xs:QName("search:attribute"), xs:QName("search:element"),  xs:QName("search:field"));

declare variable $csu:search-ns := "http://marklogic.com/appservices/search";
declare variable $csu:search-prefix := "search";

declare variable $csu:transform-config := csu:config();

declare private variable $csu:array-element-names := (
    "aggregate", "aggregate-result", "annotation", "axis", "boolean", "bucket", 
    "computed-bucket", "constraint", "constraint-value",
    "extract-path", "facet-option", "forest", "geo-option", "joiner", "number", "operator", "operator-state",
    "period", "point",
    "qname", "qtext", "search-option", "sort-order", "starter", "state", "suggestion-option", "suggestion-source", 
    "temporal-option", "term-option", "text", "tuples", "uri", "values", "values-option"
    );
declare private variable $csu:extract-metadata-array-names := ("constraint-value", "json-key", "qname");
declare private variable $csu:full-element-names := ("query", "and-query", "near-query", "or-query");
declare private variable $csu:attribute-names := (
    "anchor", "apply", "at", "attr-name", "attr-ns", "collation", "compare", "confidence", "consume", "coord", "count",
    "cts-element", "cts-options", "delimiter", "direction", "e", "elem-name", "elem-ns", "facet", "frequency", "ge",
    "ge-anchor", "index", "latdivs", "londivs", "lt",  "lt-anchor", "n", "name", "ns", "parent-name", "path", "prefix",
    "ref", "s", "selected", "snippet-format", "start", "strength", "style", "tokenize", "total", "type", "udf", "w",
    "warning"
    );

declare variable $csu:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function csu:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($csu:trace-id, ("restapi.documents", "restapi"))),

    $is-untraced
};

declare private function csu:config() as map:map
{
    let $config := json:config("custom")
    let $array-element-names-map    := map:map()
    let $extract-metadata-names-map := map:map()
    return (
        for $name in $csu:array-element-names
            return map:put($array-element-names-map,$name,true()),
        for $name in $csu:extract-metadata-array-names
            return map:put($extract-metadata-names-map,$name,true()),

        $config
        =>map:with("element-to-json",
            csu:element-to-json($array-element-names-map, map:get($config,"element-to-json"), ?, ?)
            )
        =>map:with("object-from-json",
            csu:object-from-json(map:get($config,"object-from-json"), ?, ?, ?)
            )
        =>map:with("array-element-names", $csu:array-element-names)
        =>map:with("extract-metadata-array-names", $csu:extract-metadata-array-names)
        =>map:with("is-array-element",
            csu:is-array-element($array-element-names-map,$extract-metadata-names-map,?,?)
            )
        =>map:with("element-namespace", $csu:search-ns)
        =>map:with("element-namespace-prefix", $csu:search-prefix)
        =>map:with("json-name-from-attribute-qname", csu:json-name-from-attribute-qname#2)
        =>map:with("json-children","queries")
        =>map:with("full-element-names", $csu:full-element-names)
        =>map:with("attribute-qname-from-json-name", csu:attribute-qname-from-json-name#2)
        =>map:with("attribute-names", $csu:attribute-names)
        (: The above list is a complete configuration of those names that
         : should be rendered as attributes in JSON -> XML transforms.
         : The only exception is "anchor" which can be used as a valid element in search configurations, for custom facet extensions.
         : This element does not round-trip to JSON, and we've punted on the
         : issue for plex. :)
        )
};


declare variable $csu:parsers := 
    let $map := map:map()
    let $c := map:put($map, "application/json", xdmp:function(xs:QName("csu:json-to-xml")))  
    let $d := map:put($map, "application/xml", xdmp:function(xs:QName("csu:to-nodes")))
    return $map;

declare variable $csu:serializers := 
    let $map := map:map()
    let $c := map:put($map, "application/json", xdmp:function(xs:QName("csu:xml-to-json")))  
    let $d := map:put($map, "application/xml", xdmp:function(xs:QName("csu:identity")))
    let $e := map:put($map, "*/*", xdmp:function(xs:QName("csu:identity")))
    return $map;


declare function csu:json-name-from-attribute-qname(
    $config as map:map,
    $qname  as xs:QName
) as xs:string
{
    if ($qname eq xs:QName("options"))
    then "cts-options"
    else if ($qname eq xs:QName("element"))
    then "cts-element"
    else local-name-from-QName($qname)
};

declare function csu:attribute-qname-from-json-name(
    $config    as map:map,
    $json_name as xs:string
) as xs:QName
{
    if ($json_name eq "cts-element") 
    then xs:QName("element")
    else if ($json_name eq "cts-options") 
    then xs:QName("options")
    else xs:QName($json_name)
};

declare function csu:identity($x) {
    $x
};

declare function csu:to-nodes($x) {
    $x/*
};

declare function csu:options-from-json(
    $json as node()? 
) as element()*
{
    csu:json-to-xml($json)
};


(:  to json :)
declare function csu:json-to-xml(
    $json as node()? 
) as element()*
{
    try {
        if ($is-untraced or csu:check-untraced()) then ()
        else lid:log($csu:trace-id,"json-to-xml",map:entry("json", $json)),

        csu:internal-transform-from-json(json:transform-from-json($json, $csu:transform-config))
    } catch ($e) {
        error((), "REST-INVALIDPARAM", ("Could not parse JSON: " || $json || "." || $e/error:format-string))
    }
};



declare function csu:options-to-json-object(
    $xml as element()+
) as json:object
{
    if ($is-untraced or csu:check-untraced()) then ()
    else lid:log($csu:trace-id,"options-to-json-object",map:entry("xml", $xml)),

    json:transform-to-json-object(csu:internal-transform-to-json($xml), $csu:transform-config)
};

declare function csu:xml-to-json(
    $xml as element()+
) as document-node() 
{
    if ($is-untraced or csu:check-untraced()) then ()
    else lid:log($csu:trace-id,"xml-to-json",map:entry("xml", $xml)),

    json:transform-to-json(csu:internal-transform-to-json($xml), $csu:transform-config)
};


declare private function csu:path-expressions-from-json(
    $path-expr-node as element()
) as node()+
{
    element { node-name($path-expr-node) } {
        for $ns-node in $path-expr-node/search:namespaces/*
        return namespace { local-name($ns-node) } { string($ns-node) },

        $path-expr-node/search:text/text()
        }
};

declare private function csu:fold-text-from-json(
    $node as element()
) as element()
{
    element { node-name($node) } {
        $node/@*,
        data($node)  (: extract data from nested element and promote it to text node :)
    }
};

declare function csu:internal-transform-from-json(
    $nodes as node()*
) as node()*
{
    for $node in $nodes
    return
        typeswitch($node)
        case element(search:additional-query) return
            element search:additional-query {
                if (exists($node/schema-element(cts:query)))
                then $node/*
                else xdmp:unquote($node/string())
                }
        case element(search:implicit) return
            element search:implicit {
                if (exists($node/schema-element(cts:query)))
                then $node/*
                else if (empty($node/@options))
                then xdmp:unquote($node/string())
                else (
                    $node/@*,
                    xdmp:unquote($node/search:text/string())
                    )
                }
        case element(search:searchable-expression) return csu:path-expressions-from-json($node)
        case element(search:path-index) return
            let $children := $node/*
            return
                if (empty($children))
                then $node
                else if (exists($node/search:path-index))
                then csu:internal-transform-from-json($children)
                else csu:path-expressions-from-json($node)
        case element(search:bucket) return csu:fold-text-from-json($node)
        case element(search:computed-bucket) return csu:fold-text-from-json($node)
        case element(search:starter) return csu:fold-text-from-json($node)
        case element(search:joiner) return csu:fold-text-from-json($node)
        case element(search:namespaces) return ()
        case element() return
            element { node-name($node) } {
                $node/@*,
                csu:internal-transform-from-json($node/node()) }
        default return $node
};

declare private function csu:fold-text-to-json(
    $node as element()
) as element()
{
    element { node-name($node) } {
        for $attr in $node/@*
        let $attr-name := local-name($attr)
        return
            element { 
                if ($attr-name = ("options", "element"))
                then "cts-" || $attr-name
                else $attr-name } {
                text { data($attr) }
            },
            element label { data($node) }
    }
};

declare private function csu:path-expression-to-json(
    $path-expression as element()
) as element()
{
    let $prefixes := in-scope-prefixes($path-expression)[not(. = ("search", "xml", ""))]
    let $xpath-expression := $path-expression/text()
    return
        element { node-name($path-expression) } {
            element text {
                $xpath-expression
            },
            if (empty($prefixes)) then ()
            else
                element namespaces {
                    for $prefix in reverse($prefixes)
                    return element { $prefix } {
                        namespace-uri-for-prefix($prefix, $path-expression)
                        }
                }
        }
};

declare function csu:internal-transform-to-json(
    $nodes as node()*
) as node()*
{
    for $node in $nodes
    return
        typeswitch($node)
        case element(search:additional-query) return
            element additional-query {
                xdmp:quote($node/*)
            }
        case element(search:implicit) return
            if (empty($node/@*))
            then element implicit {
                xdmp:quote($node/*)
                }
            else
                element implicit {
                    attribute options { data($node/@options) },
                    element text { xdmp:quote($node/*) }
                }
        case element(search:searchable-expression) return csu:path-expression-to-json($node)
        case element(search:path-index) return csu:path-expression-to-json($node)
        case element(search:bucket) return csu:fold-text-to-json($node)
        case element(search:computed-bucket) return csu:fold-text-to-json($node)
        case element(search:starter) return csu:fold-text-to-json($node)
        case element(search:joiner) return csu:fold-text-to-json($node)
        case text() return $node (: TODO inject JSON type :)
        case attribute() return $node
        case element() return
            element { node-name($node) } {
                csu:internal-transform-to-json(( $node/@*, $node/node() ))
            }
        default return csu:internal-transform-to-json(( $node/@*, $node/node() ))
};


declare function csu:negotiate(
    $accept as xs:string,
    $content-model
)
{
    let $func := head((map:get($csu:serializers,$accept), map:get($csu:serializers,"*/*")))
    return $func($content-model)
};

declare function csu:accept-data(
    $content-type as xs:string,
    $content-model
)
{
    let $func := map:get($csu:parsers, $content-type)
    let $data :=
        if (exists($func) )
        then $func($content-model)
        else error((), "RESTAPI-INVALIDMIMETYPE", ("Unable to determine content type of payload.  Received "||$content-type))
    return
        if (empty($data))
        then error((), "RESTAPI-EMPTYBODY", "Empty POST or PUT body")
        else $data
};


(: begin customized json transforms :)
declare function csu:is-array-element(
    $array-element-names-map    as map:map,
    $extract-metadata-names-map as map:map,
    $config                     as map:map,
    $e                          as node()
) as xs:boolean
{
    if ($e instance of element()) then
        switch(local-name($e/..))
        case "path-index"            return false()
        case "searchable-expression" return false()
        case "additional-query"      return false()
        case "extract-metadata"      return map:contains($extract-metadata-names-map,local-name($e))
        default                      return
            let $name := local-name($e)
            return
                switch($name)
                case "path-index" return
                    exists($e/preceding-sibling::*:path-index) or
                    exists($e/following-sibling::*:path-index)
                case "value"      return
                    exists($e/preceding-sibling::*:value) or
                    exists($e/following-sibling::*:value)
                default           return map:contains($array-element-names-map,$name)
    else false()
};

declare private function csu:qname(
    $namespace as xs:string?,
    $prefix    as xs:string?,
    $localname as xs:string
) as xs:QName
{
    QName($namespace,
       if (exists($prefix))
       then concat($prefix,":",$localname)
       else $localname
       )
};

declare private function csu:resolve-if-array(
    $base-function,
    $config as map:map,
    $options as map:map,
    $option-elem,
    $option-name
) as empty-sequence()
{

    let $option-value := map:get(
        $base-function($config,$option-elem), $option-name
        )
    let $subarray := map:get($options,$option-name)
    return
        if (exists($subarray))
        then json:array-push($subarray,json:array-values($option-value, false()))
        else map:put($options,$option-name,json:to-array($option-value))
};


declare private function csu:element-to-json(
    $array-names   as map:map,
    $base-function as function(map:map, element()) as item()?,
    $config        as map:map,
    $element       as element()
) as item()?
{
    typeswitch($element)
    case element(search:options) return
        let $top     := json:object()
        let $subopts := $element/element()
        let $options :=
            if (empty($subopts)) then ()
            else json:object()
        return (
            map:put($top, "options", $options),

            let $is-array-element :=
                if (empty($options)) then ()
                else map:get($config,"is-array-element")
            for $option-elem in $subopts
            let $option-name := local-name($option-elem)
            return
                if ($option-name eq "tuples") then
                    let $tuples-array :=
                        let $test-array := map:get($options,$option-name)
                        return
                            if (exists($test-array))
                            then $test-array
                            else
                                let $new-array := json:array()
                                return (
                                    map:put($options,$option-name,$new-array),
                                    $new-array
                                    )
                    let $style  := $option-elem/@style/string(.)
                    let $tuples := json:object()
                    return (
                        json:array-push($tuples-array,$tuples),

                        map:put($tuples, "name", string($option-elem/@name)),
                        if (empty($style)) then ()
                        else map:put($tuples,"style",$style),
                        map:put($tuples, "indexes", json:to-array(
                            for $tuple-elem in $option-elem/(element() except (search:aggregate|search:annotation|search:values-option))
                            return $base-function($config,$tuple-elem)
                            )),
                        for $tuple-elem in $option-elem/(search:aggregate|search:annotation|search:values-option)
                            return csu:resolve-if-array($base-function, $config, $tuples, $tuple-elem, local-name($tuple-elem))
                        )
                else if ($option-name eq "transform-results") then
                    let $preferred :=
                        $option-elem/(search:preferred-elements|search:preferred-matches)
                    return
                        if (exists($preferred) and empty($option-elem/@at))
                        then map:put($options, $option-name, csu:transform-results-to-json(
                            $base-function, $config, $option-elem, $preferred
                            ))
                        else
                            let $option-value := map:get(
                                $base-function($config,$option-elem), $option-name
                            )
                            return map:put($options, $option-name, $option-value)
                else if ($is-array-element($config,$option-elem)) then
                    csu:resolve-if-array($base-function, $config, $options, $option-elem, $option-name)
                else
                    let $option-value := map:get(
                        $base-function($config,$option-elem), $option-name
                        )
                    return map:put($options, $option-name, $option-value),

            $top
            )
    default return $base-function($config,$element)
};

declare private function csu:transform-results-to-json(
    $base-function as function(map:map, element()) as item()?,
    $config        as map:map,
    $element       as element(search:transform-results),
    $preferred     as element()
) as json:object
{
    let $transform-object := json:object()
    return (
        for $transform-att in $element/@*
        return map:put($transform-object, local-name($transform-att),
            string($transform-att)),

        for $transform-elem in $element/*
        let $elem-name := local-name($transform-elem)
        return
            if (not($transform-elem is $preferred)) then
                let $elem-value := map:get(
                    $base-function($config,$transform-elem), $elem-name
                    )
                return map:put($transform-object, $elem-name, $elem-value)
            else
                let $preferred-object := json:object()
                let $preferred-elems  := $transform-elem/search:element
                let $preferred-props  := $transform-elem/search:json-property
                return (
                    if (empty($preferred-elems)) then ()
                    else map:put($preferred-object, "element", json:to-array(
                        for $preferred-elem in $preferred-elems
                        let $elem-object := json:object()
                        return (
                            map:put($elem-object, "ns",
                                head(($preferred-elem/@ns/string(.),""))),
                            map:put($elem-object, "name",
                                head(($preferred-elem/@name/string(.),""))),

                            $elem-object
                            ))),

                    if (empty($preferred-props)) then ()
                    else map:put($preferred-object, "json-property",
                        json:to-array($preferred-props/string(.))),

                    map:put($transform-object, $elem-name, $preferred-object)
                    ),

        $transform-object
        )
};

declare private function csu:object-from-json(
    $base-function as function(map:map, xs:string?, map:map) as item()*,
    $config        as map:map,
    $name          as xs:string?,
    $object        as map:map
) as item()*
{
    let $combined := map:get($object,"search")
    let $options  :=
        if (exists($combined)) then ()
        else map:get($object,"options")
    return
        if (empty($combined) and empty($options))
        then $base-function($config,$name,$object)
        else if (exists($combined)) then
            let $combined-keys := map:keys($combined)
            return
                if (not($combined-keys = "options"))
                then $base-function($config,$name,$object)
                else
                    <search:search>{
                        let $array-from-json  := map:get($config,"array-from-json")
                        let $atomic-from-json := map:get($config,"atomic-from-json")
                        let $attribute-names  := map:get($config,"attribute-names")
                        for $combined-key in $combined-keys
                        let $combined-value := map:get($combined,$combined-key)
                        return
                            if ($combined-key eq "options")
                            then csu:options-from-json($base-function,$config,$combined-value)
                            else csu:value-from-json(
                                $base-function,$array-from-json,$atomic-from-json,
                                $attribute-names,$config,$combined-key,$combined-value
                                )
                    }</search:search>
        else csu:options-from-json($base-function,$config,$options)
};

declare private function csu:options-from-json(
    $base-function as function(map:map, xs:string?, map:map) as item()*,
    $config        as map:map,
    $options       as map:map
) as item()*
{
    <search:options>{
        let $array-from-json  := map:get($config,"array-from-json")
        let $atomic-from-json := map:get($config,"atomic-from-json")
        let $null-from-json   := map:get($config,"null-from-json")
        let $attribute-names  := map:get($config,"attribute-names")
        for $option-key in map:keys($options)
        let $option-value := map:get($options,$option-key)
        return
            if (empty($option-value))
            then $null-from-json($config,$option-key)
            else if (not($option-key eq "tuples"))
            then csu:value-from-json(
                $base-function,$array-from-json,$atomic-from-json,
                $attribute-names,$config,$option-key,$option-value
                )
            else
                for $tuples-option in json:array-values($option-value,false())
                let $indexes := map:get($tuples-option,"indexes")
                return
                    if (empty($indexes))
                    then $base-function($config,$option-key,$tuples-option)
                    else
                        <search:tuples>{
                            for $tuple-key in map:keys($tuples-option)
                            let $tuple-value := map:get($tuples-option,$tuple-key)
                            return
                                if (empty($tuple-value))
                                then $null-from-json($config,$tuple-key)
                                else if (not($tuple-key eq "indexes"))
                                then csu:value-from-json(
                                    $base-function,$array-from-json,$atomic-from-json,
                                    $attribute-names,$config,$tuple-key,$tuple-value
                                    )
                                else
                                    for $index-value in json:array-values($tuple-value)
                                    return $base-function($config,(),$index-value)
                        }</search:tuples>
    }</search:options>
};

declare function csu:value-from-json(
    $base-function    as function(map:map, xs:string?, map:map) as item()*,
    $array-from-json  as function(*),
    $atomic-from-json as function(*),
    $attribute-names  as xs:string+,
    $config           as map:map,
    $key              as xs:string,
    $value            as item()
) as item()*
{
    typeswitch($value)
    case map:map    return $base-function($config,$key,$value)
    case json:array return
        for $item in $array-from-json($config,$key,$value)
        return
            if ($item instance of element())
            then $item
            else
                element {QName($csu:search-ns, concat($csu:search-prefix,":",$key))} {
                    $item
                    }
    default         return
        if ($key = $attribute-names)
        then attribute {$key} {
            $atomic-from-json($config,$key,$value)
            }
        else element {QName($csu:search-ns, concat($csu:search-prefix,":",$key))} {
            $atomic-from-json($config,$key,$value)
            }
};
