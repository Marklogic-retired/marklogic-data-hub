xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace config-query = "http://marklogic.com/rest-api/models/config-query";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace csu = "http://marklogic.com/rest-api/config-query-util"
    at "../lib/config-query-util.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "../lib/search-util.xqy";

import schema namespace rapi = "http://marklogic.com/rest-api"
    at "restapi.xsd";

declare namespace search = "http://marklogic.com/appservices/search";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

(: Use this to formulate a prefix for the REST API instance :)
declare variable $id := xdmp:server();

declare variable $storage-prefix := "/rest-api/options/";

declare variable $config-query:default-options :=
    <options xmlns="http://marklogic.com/appservices/search">
        <search-option>unfiltered</search-option>
        <quality-weight>0</quality-weight>
	<return-facets>true</return-facets>
	<return-results>true</return-results>
    </options>;

declare variable $config-query:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function config-query:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($config-query:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare function config-query:get-list(
    $headers as map:map,
    $params  as map:map
)
{
    let $accept := eput:get-content-type($params, $headers)
    let $all-options := config-query:options()
    return 
        if ($accept eq "application/json")
        then concat("[",
            string-join(
                for $option in $all-options
                return
                    '{"name":"' || $option || '","uri":"/v1/config/query/' || $option || '"}'
                , ",")
            , "]")
        else
            <rapi:query-options>
            {
              for $option in $all-options 
              return 
                <rapi:options>
                    <rapi:name>{$option}</rapi:name>
                    <rapi:uri>/v1/config/query/{$option}</rapi:uri>
                </rapi:options>
            }
            </rapi:query-options>
};

declare function config-query:get(
    $headers as map:map,
    $params  as map:map
) as item()?
{
    let $named-option := map:get($params, "named-option")
    let $accept := eput:get-content-type($params, $headers)
    let $persisted-opts := config-query:get-options($named-option)
    let $opts :=
        if (empty($persisted-opts) and $named-option eq "default")
        then $config-query:default-options
        else $persisted-opts
    return 
        if (empty($opts))
        then error((), "RESTAPI-NODOCUMENT", ("options", "Options configuration '"||$named-option||"' not found"))
        else csu:negotiate($accept,$opts)
};

declare function config-query:get-child(
    $headers as map:map,
    $params as map:map
) as item()*
{
    let $named-option := map:get($params, "named-option")
    let $child-name := map:get($params, "child-name")
    let $accept := eput:get-content-type($params, $headers)
    let $doc := config-query:get-options($named-option)
    let $child := $doc/*[local-name(.) = $child-name]
    return
            if (exists($child))
            then 
            csu:negotiate($accept, <options xmlns="http://marklogic.com/appservices/search">{$child}</options>)
            else error((), "RESTAPI-NODOCUMENT", ("options", "Child of options node at '"||$named-option||"/"||$child-name||"' not found"))
};

declare function config-query:post(
    $headers as map:map,
    $params  as map:map,
    $input   as node()?,
    $callback as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    let $content-type := eput:get-inbound-content-type($params, $headers)
    let $named-option := map:get($params, "named-option")
    let $existing-options := config-query:get-options($named-option)
    let $body := csu:accept-data($content-type, $input)
    let $child-name := ($body/*/local-name(.))[1]
    let $putative-result := if (exists($existing-options)) then $eput:CONTENT_UPDATED else $eput:CONTENT_CREATED
    let $_ := if (empty($child-name)) then error((), "RESTAPI-INVALIDCONTENT", "Unexpected Payload:  " || $body) else ()
    return 
        (
            if (empty($callback))
            then ()
            else 
            $callback($putative-result, ""),
            config-query:append-child-to-options($named-option, $child-name, $body, ())
        )
    
};

declare function config-query:put(
    $headers as map:map,
    $params  as map:map,
    $input   as node()?,
    $callback as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    let $content-type := eput:get-inbound-content-type($params, $headers)
    let $body := csu:accept-data($content-type, $input)
    let $named-option := map:get($params, "named-option")
    let $existing-options := config-query:get-options($named-option)
    let $putative-result := if (exists($existing-options)) then $eput:CONTENT_UPDATED else $eput:CONTENT_CREATED
    return 
        typeswitch($body)
            case element(search:options) return 
            (
                if (empty($callback))
                then ()
                else 
                $callback($putative-result, ""),
                config-query:set-options($named-option, $body)
            )
            default return error((), "RESTAPI-INVALIDCONTENT", "Unexpected Payload: " || $body )
};

declare function config-query:put-child(
    $headers as map:map,
    $params  as map:map,
    $input   as node()?,
    $callback as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    let $content-type := eput:get-inbound-content-type($params, $headers)
    let $named-option := map:get($params, "named-option")
    let $child-name := map:get($params, "child-name")
    let $body := csu:accept-data($content-type, $input)
    return 
        config-query:add-child-to-options($named-option, $child-name, $body, $callback)
};

declare function config-query:post-child(
    $headers as map:map,
    $params  as map:map,
    $input   as node()?,
    $callback as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    let $content-type := eput:get-inbound-content-type($params, $headers)
    let $named-option := map:get($params, "named-option")
    let $child-name := map:get($params, "child-name")
    let $body := csu:accept-data($content-type, $input)
    let $_ := if (count(distinct-values($body/*/local-name(.))) gt 1)
              then error( (), "RESTAPI-INVALIDCONTENT", ("All child elements in URL step must match child element in options payload"))
              else ()
    let $_ := if ($child-name = $body/*/local-name(.)) 
              then () 
              else error( (), "RESTAPI-INVALIDCONTENT", ("Child element in URL step must match child element in options payload"))
    return
        config-query:append-child-to-options($named-option, $child-name, $body, $callback)
};


declare private function config-query:append-child-to-options(
    $named-option as xs:string,
    $child-name as xs:string,
    $body as element(),
    $callback as function(*)?
) as empty-sequence()
{
    let $body-child-name := ($body/*/local-name(.))[1]
    return if ($body-child-name eq $child-name)
    then
        if (config-query:options-exists($named-option))
        then
            let $existing-options := config-query:get-options($named-option)
            let $new-options := 
                <options xmlns="http://marklogic.com/appservices/search" >
                {
                    $existing-options/*,
                    $body/*
                }
                </options>
            return 
            (
                if (empty($callback))
                then ()
                else 
                $callback($eput:CONTENT_CREATED, ""),
                config-query:set-options($named-option, $new-options)
            )
        else
            let $new-doc := <options xmlns="http://marklogic.com/appservices/search" >{$body/*}</options>
            return 
            (
                if (empty($callback))
                then ()
                else 
                $callback($eput:CONTENT_CREATED, ""),
                config-query:set-options($named-option, $new-doc)
            )
    else error((), "REST-INVALIDPARAM", ("Options node submitted in request does not match options node in URL pattern"))
};

declare private function config-query:add-child-to-options(
    $named-option as xs:string,
    $child-name as xs:string,
    $body as element(),
    $callback as function(*)?
) as empty-sequence()
{
    let $body-child-name := ($body/*/local-name(.))[1]
    return if ($body-child-name eq $child-name)
    then
        if (config-query:options-exists($named-option))
        then
            let $existing-options := config-query:get-options($named-option)
            let $new-options := 
                <options xmlns="http://marklogic.com/appservices/search" >
                {
                    $existing-options/*[not(local-name(.) eq $child-name)],
                    $body/*
                }
                </options>
            return
            (
                if (empty($callback))
                then ()
                else 
                $callback($eput:CONTENT_UPDATED, ""),
                config-query:set-options($named-option, $new-options)
            )
        else
            let $new-doc := <options xmlns="http://marklogic.com/appservices/search" >{$body/*}</options>
            return 
            (
                if (empty($callback))
                then ()
                else 
                $callback($eput:CONTENT_UPDATED, ""),
                config-query:set-options($named-option, $new-doc)
            )
    else error((), "REST-INVALIDPARAM", ("Options node submitted in request does not match options node in URL pattern"))
};

    
declare function config-query:delete-all(
    $headers as map:map,
    $params  as map:map,
    $callback as function(*)?
) as item()*
{
    if (empty($callback)) then ()
    else $callback($eput:CONTENT_DELETED, ""),

    let $check := map:get($params,"check")
    for $option in config-query:options()
    return config-query:delete-options($option,$check)
};

declare function config-query:delete(
    $headers  as map:map,
    $params   as map:map,
    $callback as function(*)?
) as empty-sequence()
{
    if (empty($callback)) then ()
    else $callback($eput:CONTENT_DELETED, ""),

    config-query:delete-options(map:get($params,"named-option"), map:get($params,"check"))
};

declare function config-query:delete-child(
    $headers as map:map,
    $params  as map:map,
    $callback as function(*)?
) as empty-sequence()
{
    let $content-type := eput:get-inbound-content-type($params, $headers)
    let $named-option := map:get($params, "named-option")
    let $child-name := map:get($params, "child-name")
    let $existing-options := config-query:get-options($named-option)
    let $without-child :=
            <options xmlns="http://marklogic.com/appservices/search" >
            {
                $existing-options/*[not(local-name(.) eq $child-name)]
            }
            </options>
    return 
        if (exists($existing-options/*[local-name(.) eq $child-name]))
        then
            (
                if (empty($callback))
                then ()
                else 
                $callback($eput:CONTENT_DELETED, ""),
                config-query:set-options($named-option, $without-child)
            )
        else
            if (empty($callback))
            then ()
            else 
            $callback($eput:CONTENT_DELETED, "")
};


declare function config-query:options(
) as item()*
{
    let $options := dbut:access-config( function() { 
                        let $sid      := xdmp:server()
                        let $new-path := "/" || xdmp:group-name() || "/" || xdmp:server-name($sid)
                        let $old-path := "/" || $sid
                        for $doc in cts:search(/search:options, cts:or-query((
                            cts:directory-query($new-path || $config-query:storage-prefix),
                            cts:directory-query($old-path || $config-query:storage-prefix)
                            )))
                        let $d := config-query:options-name-from-uri(base-uri($doc)) 
                        order by $d 
                        return $d 
                 } )
    return $options
};

(: Get named options.  Use search endpoint to get effective search options 
 : () for no options of that name in this stub
 :)
declare function config-query:get-options(
    $name as xs:string
) as element(search:options)?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or config-query:check-untraced()) then ()
    else lid:log($config-query:trace-id,"get-options",map:entry("name",$name)),

    dbut:access-config(function() {
        doc(eput:make-document-uri($storage-prefix || $name))/node()
    })
};

(: a function for XQuery admin clients that need to bypass appserver context
 : it ignores options validation.
 :)
declare function config-query:set-options(
    $rest-group  as xs:unsignedLong,
    $rest-server as xs:unsignedLong,
    $modules-database-id as xs:unsignedLong,
    $options-name as xs:string,
    $options as element(search:options)?
) as empty-sequence() {
    sut:check-extract-paths($options),

    if ($is-untraced or config-query:check-untraced()) then ()
    else lid:log($config-query:trace-id,"set-options",
        map:entry("rest-group",$rest-group)=>map:with("rest-server",$rest-server)
        =>map:with("modules-database-id",$modules-database-id)
        =>map:with("options-name",$options-name)=>map:with("options",$options)
        ),

    dbut:update-config(function() {
        xdmp:document-insert(
            eput:make-document-uri(
                $storage-prefix || $options-name,
                xdmp:group-name($rest-group),
                xdmp:server-name($rest-server)
                ),
            $options,
            (xdmp:permission("rest-admin-internal",  "update"),
            xdmp:permission("rest-reader-internal", "read")))
        },
        $modules-database-id
        )
};

declare function config-query:set-options(
    $name as xs:string,
    $options as element(search:options)?
)
as empty-sequence()
{
    let $modules-database-id := xdmp:modules-database()
    let $rest-group  := xdmp:group()
    let $rest-server := xdmp:server()
    let $check-opts := sut:validate-options($options)
    return config-query:set-options($rest-group, $rest-server, $modules-database-id, $name, $check-opts)
};

declare function config-query:delete-options(
    $name  as xs:string,
    $check as xs:string?
) as empty-sequence()
{
    let $doc-name := eput:make-document-uri($storage-prefix || $name)
    let $options  := map:entry(
        "ifNotExists",
        if (not($check = "exists")) then "allow" else "error"
        )
    return (
        if ($is-untraced or config-query:check-untraced()) then ()
        else lid:log($config-query:trace-id,"delete-options",
            map:entry("name",$name)=>map:with("check",$check)
            ),

        dbut:update-config(function() {
            xdmp:document-delete($doc-name,$options)
            },
            xdmp:modules-database()
            )
        )
};



declare function config-query:options-name-from-uri(
    $uri as xs:string
) as xs:string
{
    substring-before(tokenize($uri, "/")[last()], ".xml")
};

declare function config-query:options-exists(
    $name as xs:string
) as xs:boolean
{
    if ($is-untraced or config-query:check-untraced()) then ()
    else lid:log(
        $config-query:trace-id, "options-exists", map:entry("name",$name)
        ),

    dbut:access-config(function() {
        exists(eput:make-document-uri($storage-prefix || $name))
    })
};

