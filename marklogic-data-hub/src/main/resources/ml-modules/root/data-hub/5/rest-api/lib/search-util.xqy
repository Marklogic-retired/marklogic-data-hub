xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace sut = "http://marklogic.com/rest-api/lib/search-util";

import module namespace config-query = "http://marklogic.com/rest-api/models/config-query"
   at "../models/config-query-model.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "endpoint-util.xqy";

import module namespace jsonbld = "http://marklogic.com/rest-api/lib/json-build"
    at "json-build.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
     at "/MarkLogic/json/json.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
    at "/MarkLogic/appservices/search/search.xqy";

import module namespace search-impl = "http://marklogic.com/appservices/search-impl"
    at "/MarkLogic/appservices/search/search-impl.xqy";

import module namespace csu = "http://marklogic.com/rest-api/config-query-util"
    at "config-query-util.xqy";

import module namespace dec = "http://marklogic.com/rest-api/lib/href-decorator"
    at "rest-result-decorator.xqy";
import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace json-basic  = "http://marklogic.com/xdmp/json/basic";
declare namespace qry         = "http://marklogic.com/cts/query";
declare namespace rapi        = "http://marklogic.com/rest-api";
declare namespace qbe         = "http://marklogic.com/appservices/querybyexample";
declare namespace qbemod      = "http://marklogic.com/rest-api/models/qbe-model";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $legacy-qbe-function := xdmp:function(xs:QName('qbemod:to-cts-query'), '/MarkLogic/rest-api/models/qbe-model.xqy');
declare variable $new-qbe-function := xdmp:function(xs:QName('qbe:by-example'), '/MarkLogic/appservices/search/qbe.xqy');
declare variable $qbe-function := (
  (: Calling xdmp:function-signature to determine if new function exists. If not, use legacy. :)
  try {
    let $fun-sig := xdmp:function-signature($new-qbe-function)
    return $new-qbe-function
  } catch ($e) {
    $legacy-qbe-function
  }
);


declare private variable $unquoted-datatypes := (
    "xs:boolean", "xs:double", "xs:float", "xs:int", "xs:short", "xs:unsignedInt", "xs:unsignedShort"
    );

declare private variable $sometimes-quoted-datatypes := (
    "xs:decimal", "xs:integer", "xs:long", "xs:unsignedLong"
    );

declare variable $sut:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function sut:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($sut:trace-id, ("restapi.documents", "restapi"))),

    $is-untraced
};

(: Fall back to global default if no stored options can be retrieved.
 : For now, view (metadata, facets, search) is handled by brute
 : force manipulation of options.
 : TODO:  we need to investigate options caching and merge methods for performance.
:)

(: supports both search and key-value endpoints :)
declare function sut:make-options(
    $params         as map:map,
    $combined-query as element(search:search)?
) as element(search:options)
{
    let $options-parameter := map:get($params,"options")
    let $param-options     :=
        if (exists($combined-query) and (empty($options-parameter) or $options-parameter eq ""))
        then sut:selective-options($params, ())
        else sut:selective-options($params)
    let $combined-options := $combined-query/search:options
    return
        if (exists($combined-options))
        then sut:merge-options($param-options, $combined-options)
        else $param-options
};

(: Separate access to stored options from the final fallback
 : to make unit testing easier :)
declare function sut:options(
    $params as map:map
) as element(search:options)
{
    sut:selective-options($params)
};
declare function sut:options(
        $params         as map:map,
        $stored-options as element(search:options)?
) as element(search:options)
{
    sut:selective-options($params,$stored-options)
};

declare function sut:selective-options(
    $params       as map:map
) as element(search:options)
{
    let $options := map:get($params,"options")
    let $stored-options :=
        if (empty($options) or ($options eq ""))
        then config-query:get-options("default")
        else
            let $try := config-query:get-options($options)
            return
                if (empty($try))
                then error((),"REST-INVALIDPARAM",concat("No configured options: ",$options))
                else $try
    return sut:selective-options($params,$stored-options)
};
declare function sut:selective-options(
    $params         as map:map,
    $stored-options as element(search:options)?
) as element(search:options)
{
    let $opts :=
        if (exists($stored-options))
        then $stored-options
        else $config-query:default-options
    let $delta-opts := sut:options-override($params,$opts)
    return sut:merge-options($opts,$delta-opts)
};

declare private function sut:options-override(
    $params       as map:map,
    $opts         as element(search:options)
) as element(search:options)?
{
    let $view := map:get($params,"view")
    let $forest-ids :=
        for $forest-name in map:get($params, "forest-name")
        return xdmp:forest($forest-name)
    return
        if (empty($opts/search:additional-query) and empty($view) and empty($forest-ids))
        then ()
        else
            <search:options>{
                $opts/search:additional-query,
                switch($view)
                case "all" return (
                    <search:return-facets>true</search:return-facets>,
                    <search:return-metrics>true</search:return-metrics>,
                    <search:return-results>true</search:return-results>
                    )
                case "facets" return (
                    <search:return-facets>true</search:return-facets>,
                    <search:return-metrics>false</search:return-metrics>,
                    <search:return-results>false</search:return-results>
                    )
                case "metadata" return (
                    <search:return-facets>false</search:return-facets>,
                    <search:return-metrics>true</search:return-metrics>,
                    <search:return-results>false</search:return-results>
                    )
                case "results" return (
                    <search:return-facets>false</search:return-facets>,
                    <search:return-metrics>false</search:return-metrics>,
                    <search:return-results>true</search:return-results>
                    )
                case "aggregate" return (
                    <search:return-aggregates>true</search:return-aggregates>,
                    <search:return-values>false</search:return-values>
                    )
                case "values" return (
                    <search:return-aggregates>false</search:return-aggregates>,
                    <search:return-values>true</search:return-values>
                    )
                default return (),
                for $forest-id in $forest-ids
                return <search:forest>{ $forest-id }</search:forest>
            }</search:options>
};

(: This merge uses local-name/@name for uniqueness. :)
declare function sut:merge-options(
    $core as element(search:options),
    $delta as element(search:options)?
) as element(search:options)
{
    sut:merge-options(
            $core,
            $delta,
            if (empty($core/search:result-decorator) and empty($delta/search:result-decorator))
            then $dec:result-decorator
            else ())
};

declare function sut:merge-options(
    $core as element(search:options),
    $delta as element(search:options)?,
    $result-decorator as element(search:result-decorator)?
) as element(search:options)
{
    <search:options>{ (: element {node-name($core)} loses the prefix :)
        $core/@*,

        if (empty($delta))
        then $core/search:*
        else
            let $subdelta  := $delta/search:*
            let $extended  := $subdelta/node-name(.)
            let $protected-names := (
                xs:QName("search:constraint"), xs:QName("search:values"), xs:QName("search:tuples"),xs:QName("search:additional-query")
                )
            let $extended-named-nodes :=
                $delta/(search:constraint | search:values | search:tuples)/@name/string(.)
            let $deltaopts := $delta/search:search-option/replace(string(.), "=.*$", "")
            let $optgroup  :=
                if (empty($deltaopts)) then ()
                else
                    let $groupmap := map:map()
                    return (
                        for $member in $search-impl:search-options-group/exact-value
                        return map:put($groupmap, $member/string(.), $member/@group/string(.)),
                        $groupmap
                        )
            let $optmap    :=
                if (empty($deltaopts)) then ()
                else
                    let $omap := map:map()
                    return (
                        for $deltaopt in $deltaopts
                        return map:put(
                            $omap,
                            head((map:get($optgroup,$deltaopt), $deltaopt)),
                            true()
                            ),
                        $omap
                        )
            return (
                $subdelta,
                (: filter options based on the option name string :)
                if (empty($optmap)) then ()
                else
                    for $opt in $core/search:search-option
                    let $optname := replace(string($opt), "=.*$", "")
                    return
                        if (map:contains(
                            $optmap,
                            head((map:get($optgroup,$optname), $optname))
                            ))
                        then ()
                        else $opt,
                $core/search:*[
                    not(                                  (: elements to be suppressed from core and replaced by deltas :)
                        node-name(.) = ($extended)        (: suppress all elements with a corresponding name in delta :)
                        and
                        not(                              (: except :)
                            not(node-name(.) = $protected-names and ./@name/string(.) = $extended-named-nodes)  (: DO suppress constraints that are namewise replaced :)
                            and
                            node-name(.) = $protected-names and not(./@name/string(.) = $extended-named-nodes) (: but keep the ones that don't have namewise replacements in delta :)
                    ))]),
        $result-decorator
    }</search:options>
};

declare function sut:build-json-config-relevance-info(
) as map:map
{
    json:config("custom")
    =>map:with("array-element-names",      ("term"))
    =>map:with("element-namespace",        "http://marklogic.com/cts/query")
    =>map:with("element-namespace-prefix", "qry")
    =>map:with("text-value",               "value")
    =>map:with("attribute-names",          ("warning","name"))
};

declare function sut:build-val-results-config(
) as map:map
{
    let $config := json:config("custom")
    return $config
        =>map:with("array-element-names", ("aggregate-result","distinct-value","type","tuple"))
        =>map:with("element-namespace",   "http://marklogic.com/appservices/search")
        =>map:with("element-prefix",      "search")
        =>map:with("element-to-json",
               sut:val-element-to-json(map:get($config,"element-to-json"), ?, ?)
               )
};

declare private function sut:val-element-to-json(
    $base-function as function(map:map, element()) as item()?,
    $config        as map:map,
    $element       as element()
) as item()?
{
    typeswitch($element)
    case element(search:values-response)  return
        sut:val-child-keys($base-function,$config,$element)
    case schema-element(map:map)          return map:map($element)
    case schema-element(json:array)       return json:array($element)
    default                               return $base-function($config,$element)
};
declare private function sut:val-child-keys(
    $base-function  as function(map:map, element()) as item()?,
    $config         as map:map,
    $container-elem as element()
) as json:object
{
    let $container-obj := json:object()
    let $contained-obj := json:object()
    return (
        let $json-name-from-attribute-qname :=
            map:get($config,"json-name-from-attribute-qname")
        for $child-attr in $container-elem/@*
        return map:put(
            $contained-obj,
            $json-name-from-attribute-qname($config, node-name($child-attr)),
            if (xdmp:atomizable($child-attr))
                then data($child-attr)
                else string($child-attr)
            ),

        for $child-elem in $container-elem/*
        let $child-name := local-name($child-elem)
        let $child-val  := map:get(
            sut:val-element-to-json($base-function,$config,$child-elem),
            $child-name
            )
        let $curr-val   := map:get($contained-obj,$child-name)
        return
            if (empty($curr-val))
            then map:put($contained-obj,$child-name,$child-val)
            else
                let $add-val :=
                    if ($child-val instance of json:array)
                    then json:array-values($child-val)
                    else $child-val
                return
                    if ($curr-val instance of json:array) then
                        json:array-push($curr-val,$add-val)
                    else
                        map:put($contained-obj, $child-name, json:to-array($curr-val,$add-val)),

        map:put($container-obj, local-name($container-elem), $contained-obj),

        $container-obj
        )
};

declare function sut:build-val-config(
) as map:map
{
    json:config("custom")
    =>map:with("array-element-names", ("values"))
    =>map:with("element-namespace", "http://marklogic.com/rest-api")
    =>map:with("element-prefix", "rapi")
};

declare function sut:make-structured-query(
    $sq as node()?,
    $qtext as xs:string*,
    $options as element(search:options)
) as element()?
{
    sut:make-structured-query($sq,$qtext,$options,())
};

declare function sut:make-structured-query(
    $sq as node()?,
    $qtext as xs:string*,
    $options as element(search:options),
    $params as map:map?
) as element()?
{
    typeswitch($sq)
    case schema-element(cts:query) return
        sut:handle-cts(
            if (empty($sq/parent::search:search))
                then $sq
                else sut:copy($sq, "http://marklogic.com/appservices/search"),
            $params,
            $qtext,
            $options
            )
    case element(search:query) return
        sut:handle-query($sq,$params,$qtext)
    case element(qbe:query) return
        sut:handle-cts(
            document {xdmp:apply($qbe-function,$sq)}/*, $params, $qtext, $options
            )
    case element(search:search) return
        let $queries := $sq/* except $sq/(search:options|search:qtext|search:sparql)
        return
            if (count($queries) gt 1)
            then error((),"REST-INVALIDPARAM", ("Too many subqueries: "|| xdmp:quote($sq)))
            else sut:make-structured-query(
                $queries, ($qtext, $sq/search:qtext/string(.)), $options, $params
                )
    case object-node("ctsquery") return
        sut:handle-cts(
            document {cts:query($sq)}/*, $params, $qtext, $options
            )
    case object-node("query") return
        sut:handle-query(
            sut:search-from-json($sq/..)/search:query, $params, $qtext
            )
    case object-node("$query") return
        sut:handle-cts(
            document {xdmp:apply($qbe-function,$sq)}/*, $params, $qtext, $options
            )
    case object-node("search") return
        let $queries := $sq/(* except (options|qtext|sparql))
        return
            if (count($queries) gt 1)
            then error((),"REST-INVALIDPARAM", ("Too many subqueries: "|| xdmp:quote($sq)))
            else sut:make-structured-query(
                $queries, ($qtext, $sq/qtext/string(.)), $options, $params
                )
    case object-node()         return
        if (exists($sq/..[not(. instance of document-node())]))
        then error((),"REST-INVALIDPARAM", ("Invalid query nested object structure: "|| xdmp:quote($sq/..)))
        else
            let $queries := $sq/(* except (options|qtext|sparql))
            return
                if (count($queries) gt 1)
                then error((),"REST-INVALIDPARAM", ("Invalid query root object structure: "|| xdmp:quote($sq)))
                else sut:make-structured-query($queries, ($qtext, $sq/qtext/string(.)), $options, $params)
    case document-node() return
        let $queries := $sq/*
        return
            if (count($queries) gt 1)
            then error((),"REST-INVALIDPARAM", ("Invalid query root structure: "|| xdmp:quote($sq)))
            else sut:make-structured-query($queries, $qtext, $options, $params)
    case text() return
        if (empty($sq/..[not(. instance of document-node())]))
        then sut:make-structured-query(xdmp:unquote(string($sq))/*, $qtext, $options, $params)
        else error((),"REST-INVALIDPARAM",("Invalid query text structure: "|| xdmp:quote($sq/..)))
    case xs:string return
        sut:make-structured-query(xdmp:unquote($sq)/*, $qtext, $options, $params)
    case element() return
        error((),"REST-INVALIDPARAM",("Invalid XML query structure (check namespace): "|| xdmp:quote($sq)))
    case node() return
        error((),"REST-INVALIDPARAM",("Invalid query structure: "|| xdmp:quote($sq)))
    default return sut:handle-query((),$params,$qtext)
};

declare private function sut:copy(
        $elem   as element(),
        $except as xs:string*
) as element()
{
    element {node-name($elem)} {
        if (empty($except))
        then $elem/ancestor-or-self::element()/namespace::*
        else $elem/ancestor-or-self::element()/namespace::*[not(string(.) = $except)],
        $elem/@*,
        $elem/node()
    }
};

declare function sut:make-structured-query-node(
    $structuredQuery as item()?
) as node()?
{
    typeswitch($structuredQuery)
        case element()     return $structuredQuery
        case text()        return $structuredQuery
        case object-node() return $structuredQuery
        case xs:string     return
                if ($structuredQuery eq "") then ()
                else
                    try {
                        xdmp:unquote($structuredQuery)/node()
                    }
                    catch($e) {
                        text { $structuredQuery }
                    }
        default return ()
};

declare function sut:wrap-queries(
    $queries as cts:query*
) as cts:query?
{
    if(count($queries) lt 2)
    then $queries
    else cts:and-query($queries)
};

declare private function sut:make-cts-param(
    $params as map:map?
) as cts:query*
{
    if (empty($params)) then ()
    else (
        let $directory := map:get($params, "directory")
        return
            if (empty($directory)) then ()
            else cts:directory-query(
                if (ends-with($directory, "/"))
                then $directory
                else concat($directory, "/"),
                "infinity"
                ),

        let $collections := map:get($params, "collection")
        return
            if (empty($collections)) then ()
            else cts:collection-query($collections)
        )
};

declare function sut:make-search-param(
    $params as map:map?
) as element()*
{
    if (empty($params)) then ()
    else (
        let $collections := map:get($params, "collection")
        return
            if (empty($collections)) then ()
            else
                <search:collection-query>{
                    for $collection in $collections
                    return <search:uri>{$collection}</search:uri>
                }</search:collection-query>,

        let $directories := map:get($params, "directory")
        return
            if (empty($directories)) then ()
            else
                <search:directory-query>{
                    for $directory in $directories
                    let $directory :=
                        if (ends-with($directory, "/"))
                        then $directory
                        else concat($directory, "/")
                    return <search:uri>{$directory}</search:uri>,
                    <search:infinite>true</search:infinite>
                }</search:directory-query>
        )
};

declare private function sut:handle-cts(
    $sq as schema-element(cts:query),
    $params as map:map?,
    $qtext as xs:string*,
    $options as element(search:options)
) as schema-element(cts:query)
{
    sut:validate-query(
        if (empty($qtext) or (count($qtext) eq 1 and $qtext eq ""))
        then $sq
        else
            <cts:and-query>
                {search:parse($qtext,$options)}
                {sut:make-cts-param($params)}
                {$sq}
            </cts:and-query>
        )
};

declare private function sut:handle-query(
    $sq as element(search:query)?,
    $params as map:map?,
    $qtext as xs:string*
) as element(search:query)?
{
    let $qlist := $qtext[. ne ""]
    let $pq    := sut:make-search-param($params)
    return sut:validate-query(
        if (empty($qlist) and empty($pq))
        then $sq
        else
            <search:query>{
                for $qitem in $qlist
                return <search:qtext>{$qitem}</search:qtext>,
                $pq,
                $sq/*
            }</search:query>
        )
};

declare function sut:validate-query(
    $q as element()?
) as element()?
{
    if (empty($q)) then ()
    else
        let $rest-properties  := eput:get-properties-map()
        let $debug            := not($is-untraced or sut:check-untraced())
        let $validate-queries := head((map:get($rest-properties,"validate-queries"),false()))
        let $validate         :=
            if (exists($q) and ($validate-queries or $debug)) then
                try { validate strict {$q}}
                catch ($e) { $e }
            else $q
        return
            typeswitch($validate)
                case empty-sequence() return ()
                case element(search:query) return $validate
                case schema-element(cts:query) return $validate
                default return
                    let $errorString := $validate/error:format-string/string(.)
                    let $msg :=
                        if (empty($errorString))
                        then "Invalid query"
                        else concat("Invalid query: ", $errorString)
                    return (
                         if (not($debug)) then ()
                         else xdmp:log(concat(
                             "WARNING: ",$msg,", query terms may have been dropped."
                             )),

                         if (not($validate-queries)) then ()
                         else error((),"REST-INVALIDPARAM",$msg),

                         $q)
};


(: this function is for handling a json structured query :)
declare function sut:handle-text(
    $sq as node()?,
    $params as map:map?,
    $qtext as xs:string*
) as element(search:query)?
{
    sut:handle-query(
        sut:search-from-json($sq)/search:query,
        $params,
        $qtext
        )
};

(: Existing json serialization drops attributes. Special-case for existing search wrapper, to be replaced when
 : Plex JSON support comes online. :)
declare function sut:json-serialize(
    $response as element(),
    $view as xs:string?
) as xs:string
{
    jsonbld:object(sut:serialize-response($response,$view))
};

declare function sut:response-to-json-object(
    $response as element(),
    $view as xs:string?
) as item()*
{
    xdmp:unquote(sut:json-serialize($response, $view))
};

declare private function sut:serialize-response(
    $response as element(),
    $view as xs:string?
) as item()*
{
    if ($is-untraced or sut:check-untraced()) then ()
    else lid:log(
        $sut:trace-id,"serialize-response",map:entry("response", $response)=>map:with("view",$view)
        ),

    let $results := $response/(search:result|search:distinct-value)
    let $facets  := $response/(search:facet|search:boxes)
    let $query   := $response/search:query
    let $qtext   := $response/search:qtext
    return (
        sut:unwrap-attributes($response/@*),

        if (empty($results) and not($view = ("results","all"))) then ()
            else sut:serialize-results($results),

        if (empty($facets)  and not($view = ("facets","all"))) then ()
            else sut:serialize-facets($facets),

        if (empty($query)) then ()
            else ("query", xdmp:to-json-string(cts:query($query/node()))),

        if (empty($qtext)) then ()
            else ("qtext", jsonbld:string(string($qtext))),

        for $child in $response/(* except ($results|$facets|$query|$qtext))
        return sut:serialize-element($child)
        )
};


declare private function sut:serialize-results(
    $results as element()*
) as item()*
{
    jsonbld:key("results"),
    jsonbld:array(
        for $result in $results
        let $extracted      := $result/search:extracted
        let $extracted-none :=
            if (exists($extracted)) then ()
            else $result/search:extracted-none
        let $metadata       := $result/search:metadata
        let $snippets       := $result/search:snippet
        let $relevance-info := $result/qry:relevance-info
        let $raw-nodes      := $result/(node() except (
            $extracted|$extracted-none|$metadata|$relevance-info|$snippets
            ))
        let $raw-elem  := $raw-nodes[. instance of element()][1]
        let $raw-text  :=
            if (empty($raw-nodes) or exists($raw-elem)) then ()
            else $raw-nodes[. instance of text()][1]
        let $format    := $result/@format/string(.)[string-length(.) gt 0]
        return jsonbld:object((
            sut:unwrap-attributes($result/@*),
            $snippets/sut:translate-snippet(.),
            if (empty($metadata)) then ()
                else sut:translate-metadata($metadata),
            if (exists($extracted))
            then sut:translate-extracted($format,$extracted)
            else if (exists($extracted-none))
            then sut:translate-extracted-none($extracted-none)
            else (),
            $relevance-info/sut:translate-relevance-info(.),
            if (exists($raw-elem)) then (
                jsonbld:key("content"),
                jsonbld:value(xdmp:quote($raw-elem))
                )
            else if (exists($raw-text)) then (
                jsonbld:key("content"),
                let $format :=
                    let $af := $result/@format/string(.)
                    return
                        if (exists($af))
                        then $af
                        else
                            let $uri := $result/@uri/string(.)
                            let $mf  := eput:get-outbound-type-format(
                                xdmp:uri-content-type($uri)
                                )
                            return
                                if (exists($mf))
                                then $mf
                                else xdmp:uri-format($uri)
                return
                    if ($format eq "json")
                    then string($raw-text)
                    else jsonbld:value(string($raw-text))
                )
            (: no JSON representation of binary, comment, or processing instruction :)
            else ()
            ))
        )
};

declare function sut:translate-snippet(
    $snippet as element(search:snippet)
) as item()*
{
    let $custom-snippet-format := $snippet/@format/data()
    let $matches := $snippet/search:match
    return
        if (exists($matches)) then (
            jsonbld:key("matches"),
            jsonbld:array(
                for $match in $matches
                return jsonbld:object((
                    jsonbld:key("path"),
                    jsonbld:value(string($match/@path)),
                    jsonbld:key("match-text"),
                    jsonbld:array((
                        for $subnode in $match/node()
                        return
                            typeswitch($subnode)
                            case element() return
                                sut:translate-subelement($subnode)
                            case text() return
                                jsonbld:string($subnode)
                            default return
                                jsonbld:string(xdmp:quote($subnode))
                        ))
                )) (: end jsonbld:object :)
            ) (: ends jsonbld:array :)
        ) (: ends if exists($matches) then :)
        else
            let $snippet-text := $snippet/text()
            return
                (: empty snippeting case :)
                if (empty($snippet-text))
                then (jsonbld:key("matches"), "null")
                (: custom snippeting case -- function returned a quoted JSON string :)
                else if ($custom-snippet-format eq "json")
                then (jsonbld:key("matches"), string($snippet-text))
                else (jsonbld:key("matches"), jsonbld:value($snippet-text))
};

declare function sut:translate-metadata(
    $meta as element()*
) as item()*
{
    if (empty($meta)) then ()
    else (
        jsonbld:key("metadata"),
        jsonbld:array(
            for $m in $meta/*
            let $local-name := local-name($m)
            let $ns-uri     := namespace-uri($m)[not(. eq "")]
            let $meta-type  :=
                if (empty($ns-uri) or $ns-uri ne "http://marklogic.com/appservices/search")
                then "element"
                else if ($local-name eq "attribute-meta")
                then "attribute"
                else if ($local-name eq "constraint-meta")
                then "constraint"
                else "element"
            let $key        :=
                switch ($meta-type)
                case "attribute" return
                    concat(
                        sut:clarkify($m/@parent-ns/string(.), $m/@parent-name/string(.)),
                        "_",
                        sut:clarkify($m/@ns/string(.), $m/@name/string(.))
                        )
                case "constraint" return
                    $m/@name/string(.)
                default return
                    if (empty($ns-uri))
                    then $local-name
                    else if ($ns-uri ne "http://marklogic.com/xdmp/json/basic")
                    then sut:clarkify($ns-uri,$local-name)
                    else xdmp:decode-from-NCName($local-name)
            return
                if (empty($key)) then ()
                else jsonbld:object((
                    jsonbld:key($key), jsonbld:element-value($m),
                    jsonbld:key("metadata-type"), jsonbld:value($meta-type)
                    ))
            )
        )
};

declare function sut:translate-extracted-none(
    $extracted as element(search:extracted-none)
) as item()*
{
    jsonbld:key("extracted-none"),
    jsonbld:object(sut:unwrap-attributes($extracted/@*))
};

declare function sut:translate-extracted(
    $format    as xs:string?,
    $extracted as element(search:extracted)
) as item()*
{
    jsonbld:key("extracted"),
    jsonbld:object((
        sut:unwrap-attributes($extracted/@*),
        jsonbld:key("content"),
        let $subnodes := $extracted/node()
        let $subcount := count($subnodes)
        return
            switch($format)
            case "json"   return
                if ($extracted/@kind/string(.) eq "array")
                then string($extracted)
                else jsonbld:array(string($extracted))
            case "text"   return jsonbld:array(jsonbld:string(string($extracted)))
            case "binary" return jsonbld:array(()) (: should never have subnodes :)
            default       return jsonbld:array((
                for $subnode in $subnodes
                return
                    typeswitch($subnode)
                    case element() return jsonbld:string(xdmp:quote(
                        (: strip unused namespaces :)
                        element {node-name($subnode)} {
                            $subnode/@*,
                            $subnode/node()
                            }
                        ))
                    case text()    return jsonbld:value($subnode)
                    default        return jsonbld:string(xdmp:quote($subnode))
                ))
        ))
};

declare function sut:translate-subelement(
    $subelem as element()
) as item()*
{
    typeswitch($subelem)
    case element(json:array) return
        xdmp:quote(xdmp:to-json(json:array($subelem)))
    case element(json:object) return
        xdmp:quote(xdmp:to-json(json:object($subelem)))
    case element(json-basic:json) return
        json:transform-to-json-string($subelem,json:config("basic"))
    default return
        jsonbld:object((
            jsonbld:key(local-name($subelem)),
            if (empty($subelem/element()))
            then jsonbld:element-value($subelem)
            else jsonbld:string(xdmp:quote($subelem/node()))
            ))
};

declare private function sut:clarkify(
    $ns-uri     as xs:string?,
    $local-name as xs:string
) as xs:string
{
    if (empty($ns-uri) or $ns-uri eq "")
    then $local-name
    else concat("{",$ns-uri,"}",$local-name)
};

declare function sut:translate-relevance-info(
    $relevance-info as element(qry:relevance-info)
) as item()*
{
    jsonbld:key("relevance-info"),
    map:get(
        json:transform-to-json-object($relevance-info, sut:build-json-config-relevance-info()),
        "relevance-info"
        )
};

declare function sut:serialize-element(
    $element as element()
) as item()*
{
    let $childElem    := $element/*
    let $childAtt     := $element/@*
    let $hasChildElem := exists($childElem)
    let $hasChildAtt  := exists($childAtt)
    let $hasChildText := exists($element/text())
    return
        if ($hasChildElem and not($hasChildText)) then (
            (: this is a bit brain dead, does not do proper arrays :)
            jsonbld:key(local-name($element)),
            jsonbld:object((
                if (not($hasChildAtt)) then ()
                else sut:unwrap-attributes($childAtt),
                (: does not detect arrays :)
                for $child in $childElem
                return sut:serialize-element($child)
                )))
        else if ($hasChildElem and $hasChildText)
        then () (: There should be no mixed content to handle outside of snippets, which are special-cased for now :)
        else if (not($hasChildText) and $hasChildAtt)
        then (jsonbld:key(local-name($element)),jsonbld:object((sut:unwrap-attributes($childAtt))))
        else if ($hasChildText)
        then (jsonbld:key(local-name($element)),jsonbld:value(data($element)))
        (: completely empty :)
        else (jsonbld:key(local-name($element)), "null")
};

declare function sut:serialize-facets(
    $facets as element()*
) as item()*
{
    jsonbld:key("facets"),
    jsonbld:object((
        for $facet in $facets
        return
            typeswitch($facet)
            case element(search:facet) return sut:serialize-facet($facet)
            case element(search:boxes) return sut:serialize-boxes($facet)
            default                    return ()
        ))
};

declare function sut:serialize-facet(
    $facet as element(search:facet)
) as item()*
{
    (jsonbld:key($facet/@name/string()),
    jsonbld:object((
        sut:unwrap-attributes($facet/(@* except @name)),
        jsonbld:key("facetValues"),
        jsonbld:array((
            let $facet-type := $facet/@type/string()
            for $facet-value in $facet/search:facet-value
            return jsonbld:object((
                sut:unwrap-attributes($facet-value/(@* except $facet-value/(@count|@name))),
                jsonbld:key("name"),
                jsonbld:string($facet-value/@name),
                $facet-value/@count/(
                    jsonbld:key("count"),
                    data(.)
                    ),
                jsonbld:key("value"),
                if (empty($facet-type))
                then jsonbld:value(data($facet-value))
                else if ($facet-type = $unquoted-datatypes)
                then string($facet-value)
                else if ($facet-type = $sometimes-quoted-datatypes)
                then jsonbld:value(xs:decimal(data($facet-value)))
                else jsonbld:string(string($facet-value))
                ))
            ))
        )))
};

declare function sut:serialize-boxes(
    $boxes as element(search:boxes)
) as item()*
{
    (jsonbld:key($boxes/@name/string()),
    jsonbld:object((
        sut:unwrap-attributes($boxes/(@* except @name)),
        jsonbld:key("boxes"),
        jsonbld:array((
            for $box in $boxes/search:box
            return jsonbld:object((sut:unwrap-attributes($box/@*)))
            ))
        )))
};

(: TODO: investigate better handling of plan :)
declare function sut:serialize-plan(
    $plan as element(search:plan)
) as item()*
{
     jsonbld:object((
         jsonbld:key("plan"),
         jsonbld:value(xdmp:quote($plan/qry:query-plan))
         ))
};

declare private function sut:unwrap-attributes(
    $attributes as attribute()*
) as item()*
{
    for $attr in $attributes
    return (
        jsonbld:key(local-name($attr)), jsonbld:value(data($attr))
        )
};

declare function sut:log-effective-options(
    $params as map:map
) as xs:string*
{
    concat("PERSISTED OPTIONS (",head((map:get($params,"options")[. ne ""], "DEFAULT")),"): "),
    xdmp:quote(sut:options($params))
};


(: transform search:search payload to json :)
declare function sut:search-to-json(
    $search-criteria as element(search:search)
)
{
    csu:options-to-json-object($search-criteria)
};

declare function sut:search-from-json(
    $json-raw as node()?
) as element(search:search)?
{
    let $json :=
        let $search := $json-raw/search
        let $except := $search/(ctsquery|node("$query"))
        return
            if (empty($except))
            then $json-raw
            else
                let $keep := $search/* except $except
                return
                    if (empty($keep)) then ()
                    else
                        let $json-obj := json:object()
                        return (
                            for $json-node in $keep
                            return map:put($json-obj, name($json-node), $json-node),

                            xdmp:to-json(map:entry("search", $json-obj))
                            )
    return
        if (empty($json)) then ()
        else
            let $xml := csu:options-from-json($json)
            return
                if ($xml instance of element(search:search))
                then $xml
                else if (empty($xml))
                then ()
                else <search:search>{$xml}</search:search>
};

(: returns empty-sequence() if there's no combined query payload :)
declare function sut:make-combined-query(
    $input as node()?
) as element(search:search)?
{
    let $combined-query :=
        typeswitch($input)
        case document-node()        return sut:make-combined-query($input/node())
        case element(search:search) return $input
        case object-node("search")  return sut:search-from-json($input/parent::node())
        case object-node()          return
            if (exists($input/search))
            then sut:search-from-json($input)
            else if (exists($input/(qtext|query)))
            then sut:search-from-json(object-node {"search" : $input})
            else ()
        default                     return ()
    return
        if (empty($combined-query/*)) then ()
        else sut:validate-combined-query($combined-query)
};

declare private function sut:validate-combined-query(
    $input as element(search:search)
) as element(search:search)?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $rest-properties  := eput:get-properties-map()
    let $debug            := not($is-untraced or sut:check-untraced())
    let $validate-queries := head((map:get($rest-properties,"validate-queries"), false()))
    let $validate-options := head((map:get($rest-properties,"validate-options"), false()))
    let $options          := $input/search:options
    let $validate-errors  := json:array()
    return (
        if (($validate-queries or $debug) and exists($input/search:query)) then
            try {
                sut:validate-query($input/search:query)[false()]
            } catch ($e) { json:array-push($validate-errors, $e) }
        else (),

        if (exists($options)) then (
            sut:check-extract-paths($options),

            if ($validate-options or $debug) then
                try {
                    sut:validate-options($options)[false()]
                } catch ($e) { json:array-push($validate-errors, $e) }
            else ()
            )
        else (),

        if (json:array-size($validate-errors) gt 0) then
            let $msg := string-join((
                    "Invalid combined search",
                    json:array-values($validate-errors)//error:format-string/string(.)
                    ),
                "&#10;"
                )
            return (
                if (not($debug)) then ()
                else xdmp:log(concat(
                    "WARNING: ",$msg,", query terms may have been dropped."
                    )),

                if ($validate-queries or $validate-options)
                then error((),"REST-INVALIDPARAM",$msg)
                else ()
                )
        else (),

        $input
        )
};

declare function sut:check-extract-paths(
    $options as element(search:options)
) as empty-sequence()
{
    let $invalid-paths :=
        for $extracter in $options/search:extract-document-data/search:extract-path
        let $bindings := eput:collect-bindings($extracter)
        let $path     := string($extracter)
        return
            if (sut:is-valid-extract-path($bindings,$path)) then ()
            else $path
    return
        if (empty($invalid-paths)) then ()
        else error((), "RESTAPI-INVALIDCONTENT",
            "invalid paths to extract document data: "||string-join($invalid-paths,", ")
            )
};
declare private function sut:is-valid-extract-path(
    $bindings as map:map?,
    $path     as xs:string
) as xs:boolean
{
    if (exists($bindings))
    then cts:valid-extract-path($path,$bindings)
    else cts:valid-extract-path($path)
};

declare function sut:validate-options(
    $options as element(search:options)
) as element(search:options)
{
    if (map:get(eput:get-properties-map(),"validate-options") eq false())
    then $options
    else
        if (empty($options))
        then error((), "RESTAPI-INVALIDCONTENT", "Empty search configuration")
        else
            let $check := try {
                if ($is-untraced or sut:check-untraced()) then ()
                else lid:log($sut:trace-id,"validate-options",map:entry("options", $options)),

                search:check-options($options)
            } catch * {
                error((), "RESTAPI-INVALIDCONTENT", "Operation results in invalid Options: " || $err:description)
            }
            return
                if (empty($check))
                then $options
                else error((),"RESTAPI-INVALIDCONTENT","Operation results in invalid Options: "|| string-join($check, ""))
};

declare private variable $sut:cts-array-element-names := (
    "and-query", "and-not-query", "annotation", "boost-query", "collection-query",
    "directory-query", "document-query", "document-fragment-query",
    "element-query", "element-attribute-range-query", "element-attribute-value-query", "element-attribute-word-query",
    "element-attribute-pair-geospatial-query", "element-child-geospatial-query", "element-geospatial-query",
    "element-pair-geospatial-query", "element-range-query", "element-value-query", "element-word-query",
    "field-range-query", "field-value-query", "field-word-query",
    "json-property-pair-geospatial-query", "json-property-child-geospatial-query", "json-property-geospatial-query",
    "locks-fragment-query", "near-query", "not-in-query", "or-query",
    "path-geospatial-query", "path-range-query", "properties-fragment-query", "query",
    "registered-query", "reverse-query", "similar-query", "term-query", "triple-range-query", "value", "word-query",
    "uri"
    );
declare private variable $sut:cts-attribute-names := ("operator", "weight");
