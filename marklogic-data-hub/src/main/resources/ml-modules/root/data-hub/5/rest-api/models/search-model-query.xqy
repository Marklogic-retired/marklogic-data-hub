xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace searchmodq = "http://marklogic.com/rest-api/models/search-model-query";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
    at "/MarkLogic/appservices/search/search.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "/MarkLogic/rest-api/lib/search-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "document-model-common.xqy";

import module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model"
    at "/MarkLogic/rest-api/models/transaction-model.xqy";

import module namespace search-impl = "http://marklogic.com/appservices/search-impl"
    at "/MarkLogic/appservices/search/search-impl.xqy";

(: Warning: this implementation import is for debugging output :)
import module namespace ast = "http://marklogic.com/appservices/search-ast"
    at "/MarkLogic/appservices/search/ast.xqy";

declare namespace http       = "xdmp:http";
declare namespace json-basic = "http://marklogic.com/xdmp/json/basic";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $searchmodq:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function searchmodq:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($searchmodq:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

(: entry point for GET on /search; invokes for transaction if id supplied :)
declare function searchmodq:search-get(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as item()?
{
    eput:response-add-host-cookie($headers, $params, $env),
    let $options          := sut:options($params)
    let $structured-query := searchmodq:make-query($params,$options)
    return
        if (starts-with(head(map:get($headers,"accept")),"multipart/mixed"))
        then searchmodq:get-bulk-results($headers,$params,$env,$structured-query,$options)
        else if (map:get($params,"view") eq "ctsquery")
        then searchmodq:get-query-response(
            search-impl:do-convert-query($options,$structured-query),
            $headers,
            $params,
            $env
            )
        else searchmodq:get-response(
            searchmodq:resolve($structured-query,$options,$params),
            $headers,
            $params,
            $env
            )
};

(: entry point for POST on /search; invokes for transaction if id supplied :)
declare function searchmodq:search-post(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?,
    $doc     as document-node()?
) as item()?
{
    eput:response-add-host-cookie($headers, $params, $env),
    let $input            := $doc/node()
    let $combined-query   := sut:make-combined-query($input)
    let $options          := sut:make-options($params,$combined-query)
    let $structured-query := searchmodq:make-query($params,$input,$combined-query,$options)
    return
        if (starts-with(head(map:get($headers,"accept")),"multipart/mixed"))
        then searchmodq:get-bulk-results($headers,$params,$env,$structured-query,$options)
        else if (map:get($params,"view") eq "ctsquery")
        then searchmodq:get-query-response(
            search-impl:do-convert-query($options,$structured-query),
            $headers,
            $params,
            $env
            )
        else searchmodq:get-response(
            searchmodq:resolve($structured-query,$options,$params),
            $headers,
            $params,
            $env
            )
};

declare function searchmodq:make-query(
    $params  as map:map,
    $options as element(search:options)
) as element()
{
    let $q := head((map:get($params,"q"), ""))
    return searchmodq:make-structured-query($params,$options,$q)
};

declare function searchmodq:make-query(
    $params         as map:map,
    $input          as node()?,
    $combined-query as element(search:search)?,
    $options        as element(search:options)
) as element()
{
    let $q               := head((map:get($params,"q"), ""))
    let $structuredQuery :=
        if (exists($combined-query/(* except (search:qtext|search:options|search:sparql))))
        then $combined-query
        else sut:make-structured-query-node($input)
    return head((
        sut:make-structured-query($structuredQuery, $q, $options, $params),
        <search:query/>
        ))
};


(: Do the search once options and query are resolved :)
declare function searchmodq:resolve(
    $query   as element(),
    $options as element(search:options),
    $params  as map:map
) as element(search:response)
{
    let $start := map:get($params,"start")
    let $page-length := map:get($params,"pageLength")
    return (
        if ($is-untraced or searchmodq:check-untraced()) then ()
        else lid:log(
            $searchmodq:trace-id,"resolve",
            map:entry("query",$query)
            =>map:with("options",$options)
            =>map:with("params",$params)
            ),

        search:resolve($query,$options,$start,$page-length)
        )
};

declare function searchmodq:get-bulk-results(
    $headers  as map:map,
    $params   as map:map,
    $env      as map:map?,
    $query    as element()?,
    $options  as element(search:options)
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or searchmodq:check-untraced()) then ()
    else lid:log($searchmodq:trace-id,"get-bulk-results",
        map:entry("query",$query)=>map:with("options",$options)
        =>map:with("headers",$headers)=>map:with("params",$params)
        ),

    let $boundary        := docmodcom:get-multipart-boundary(map:get($headers,"accept"))
    let $metadata-format := head((map:get($params,"format"), "xml"))
    let $metadata-type   := eput:get-format-type($metadata-format)
    let $categories      := docmodcom:select-category($params)
    let $view            := head((map:get($params,"view"), "none"))
    let $start           := head((map:get($params,"start"), 1))
    let $page-length     := head((map:get($params,"pageLength"), 10))

    (: start unbundled search implementation :)
    let $querydef        := search-impl:prepare-querydef(
        (),$options,$query,$start,$page-length,false(),()
        )
    let $docs            :=
        try {
            search-impl:apply-search($querydef)
        } catch ($e) {
            if ($e/error:code eq "XDMP-EXPNTREECACHEFULL")
            then error((), "RESTAPI-INVALIDREQ",
                "Caused XDMP-EXPNTREECACHEFULL failure -- search with smaller page length"
                )
            else xdmp:rethrow()
        }
    let $results         :=
        if (empty($docs[not(. instance of document-node())]))
        then search-impl:extract-paths($querydef, $docs)
        else error((),"RESTAPI-INVALIDREQ",
            "searchable expression for bulk document read must qualify documents")
    let $uris            :=
        for $doc in $docs
        return document-uri($doc)
    let $estimate        := search-impl:do-result-estimate($querydef,true(),$docs)
    let $timestamp       := ast:get-annotations($querydef)/@timestamp
    let $response        :=
        if ($view = "none") then ()
        else document {
            map:put($querydef,"extract-inline",false()),
            searchmodq:get-response(
                search-impl:do-response($querydef,$docs,$estimate),
                $headers,$params,$env,$metadata-type,false()
                )
            }
    (: end unbundled search implementation :)

    let $response-header :=
        if (empty($response)) then ()
        else
            <http:headers>
                <http:Content-Type>{$metadata-type}</http:Content-Type>
                <http:Content-Disposition>inline</http:Content-Disposition>
            </http:headers>
    let $extracted  := head($options/search:extract-document-data)/@selected/string(.)
    let $trans-name :=
        if (not($categories = "content")) then ()
        else map:get($params,"transform")
    return (
        eput:call-response-type($env, concat("multipart/mixed; boundary=",$boundary)),
        eput:call-header($env, "vnd.marklogic.start",           string($start)),
        eput:call-header($env, "vnd.marklogic.pageLength",      string($page-length)),
        if (empty($estimate)) then ()
        else
            (eput:call-header($env, "vnd.marklogic.result-estimate", string($estimate)),
            if ($estimate eq 0) then ()
            else map:put($env, "has-matches", true())
            ),
        if (empty($timestamp)) then ()
        else eput:call-header($env, "vnd.marklogic.lsqt-query-timestamp", string($timestamp)),
        if (empty($extracted)) then ()
        else eput:call-header($env, "vnd.marklogic.extract-document-data", $extracted),
        if (empty($trans-name)) then ()
        else eput:call-header($env, "vnd.marklogic.document-transform", $trans-name),

        docmodcom:bulk-read-documents(
            $params,$boundary,$categories,$metadata-format,$uris,$results,$response-header,$response
            )
        )
};

(: Create the final response :)
declare function searchmodq:get-response(
    $response as element(),
    $headers  as map:map,
    $params   as map:map,
    $env      as map:map?
) as item()?
{
    searchmodq:get-response(
        $response, $headers, $params, $env, eput:get-content-type($params,$headers), true()
        )
};

declare function searchmodq:get-response(
    $response     as element(),
    $headers      as map:map,
    $params       as map:map,
    $env          as map:map?,
    $content-type as xs:string?,
    $notify-type  as xs:boolean
) as item()?
{
    let $response :=
        if ($content-type = ("application/json", "text/json")) then
            let $root :=
                if ($response instance of document-node())
                then $response/*
                else $response
            return
                if ($root instance of element(search:response))
                then sut:response-to-json-object(
                    $root, head((map:get($params,"view"),"results"))
                    )
                else $response
        else $response
    return
        eput:transform-response($response,$content-type,$headers,$params,$env,(),$notify-type)
};

declare function searchmodq:get-query-response(
    $query   as cts:query,
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as document-node()
{
    let $response-type := eput:get-content-type($params,$headers)
    let $responder  :=
        if (empty($env)) then ()
        else map:get($env,"responder")
    return (
        if (empty($responder)) then ()
        else $responder($response-type),

        if ($response-type = ("application/json", "text/json"))
        then xdmp:to-json($query)
        else document {$query}
        )
};

declare private function searchmodq:make-structured-query(
    $params  as map:map,
    $options as element(search:options),
    $q       as xs:string+
) as element()
{
    let $structuredQuery :=
        sut:make-structured-query-node(map:get($params,"structuredQuery"))
    return head((
        sut:make-structured-query($structuredQuery,$q,$options,$params),
        <search:query/>
        ))
};
