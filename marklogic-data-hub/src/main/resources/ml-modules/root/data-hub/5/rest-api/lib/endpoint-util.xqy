xquery version "1.0-ml";

(: Copyright 2011-2018 MarkLogic Corporation.  All Rights Reserved. :)

module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "../models/transform-model.xqy";

import module namespace mout = "http://marklogic.com/manage/lib/model-util"
    at "/MarkLogic/manage/lib/model-util.xqy";

import module namespace cook = "http://parthcomp.com/cookies"
    at "/MarkLogic/cookies.xqy";

import module namespace mlt = "http://marklogic.com/appservices/metrics-log-trace"
    at "/MarkLogic/appservices/utils/metrics-log-trace.xqy";

import schema namespace rapi = "http://marklogic.com/rest-api"
    at "restapi.xsd";

declare namespace app       = "http://marklogic.com/appservices/app";
declare namespace as        = "http://www.w3.org/2005/xpath-functions";
declare namespace error     = "http://marklogic.com/xdmp/error";
declare namespace html      = "http://www.w3.org/1999/xhtml";
declare namespace http      = "xdmp:http";
declare namespace multi     = "xdmp:multipart";
declare namespace mt        = "http://marklogic.com/xdmp/mimetypes";
declare namespace xsl       = "http://www.w3.org/1999/XSL/Transform";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $eput:CONTENT_CREATED      := "CONTENT_CREATED";
declare variable $eput:CONTENT_UPDATED      := "CONTENT_UPDATED";
declare variable $eput:CONTENT_DELETED      := "CONTENT_DELETED";
declare variable $eput:METADATA_RETRIEVED   := "METADATA_RETRIEVED";
declare variable $eput:CONTENT_RETRIEVED    := "CONTENT_RETRIEVED";
declare variable $eput:NOT_FOUND            := "NOT_FOUND";

(: NO LONGER USED BUT STILL FILTERED :)
declare private variable $MOD_DB_TIMESTAMP     := "MODULE_DATABASE_TIMESTAMP";

declare private variable $PROP_DOC_TIMESTAMP   := "PROPERTIES_DOCUMENT_TIMESTAMP";
declare private variable $NEXT_CHECK_TIMESTAMP := "NEXT_CHECK_TIMESTAMP";
declare private variable $LAST_CHECK           := "LAST_CHECK";

declare variable $eput:FIELD_NAME := "rest-api.PROPERTIES";

declare variable $eput:trace-id := "restapi.endpoints";

declare private variable $is-untraced := ();

declare function eput:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($eput:trace-id, ("restapi"))),

    $is-untraced
};

declare private function eput:default-properties(
) as map:map
{
(: When new properties are added, you MUST update the schema;
 : validation of parameters is schema-based :)
    map:map(<map:map xmlns:map="http://marklogic.com/xdmp/map"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema">
       <map:entry key="content-versions">
         <map:value xsi:type="xs:string">none</map:value>
       </map:entry>
       <map:entry key="debug">
         <map:value xsi:type="xs:boolean">false</map:value>
       </map:entry>
       <map:entry key="document-transform-all">
         <map:value xsi:type="xs:boolean">true</map:value>
       </map:entry>
       <map:entry key="document-transform-out">
         <map:value xsi:type="xs:string"/>
       </map:entry>
       <map:entry key="update-policy">
         <map:value xsi:type="xs:string">merge-metadata</map:value>
       </map:entry>
       <map:entry key="validate-options">
         <map:value xsi:type="xs:boolean">true</map:value>
       </map:entry>
       <map:entry key="validate-queries">
         <map:value xsi:type="xs:boolean">false</map:value>
       </map:entry>
     </map:map>)
};

declare private variable $system-properties   := (
    $PROP_DOC_TIMESTAMP,$NEXT_CHECK_TIMESTAMP,$LAST_CHECK,
    $MOD_DB_TIMESTAMP
    );
declare private variable $legacy-properties   := ("can-copy");
declare private variable $filtered-properties := ($system-properties, $legacy-properties);

declare private variable $NAMED_PATHS_FIELD := "com.marklogic.rest-api.REST_NAMED_PATHS";

declare function eput:get-request-headers(
) as map:map
{
    let $map := map:map()
    return (
        for $header-name in xdmp:get-request-header-names()
        let $header := lower-case($header-name)
        return map:put(
            $map,
            $header,
            if ($header eq 'accept')
            then string-join(xdmp:get-request-header($header),",")
            else head(xdmp:get-request-header($header))
            ),

        mlt:set-feature-context(head((map:get($map,"ml-agent-id"), "rest"))),

        $map
        )
};

declare function eput:get-request-method(
    $headers as map:map
) as xs:string
{
    let $method  := xdmp:get-request-method()
    return
        if ($method eq "POST" and starts-with(
            head(map:get($headers,"content-type")), "application/x-www-form-urlencoded"
            ))
        then "GET"
        else $method
};

declare function eput:call-header(
    $env   as map:map?,
    $name  as xs:string,
    $value as xs:string
) as empty-sequence()
{
    if (empty($env)) then ()
    else
        let $add-header := map:get($env,"add-header")
        return
            if (empty($add-header)) then ()
            else $add-header($name,$value)
};

declare function eput:add-response-header(
    $name  as xs:string,
    $value as xs:string
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    xdmp:add-response-header($name,$value)
};

declare function eput:config-callback(
    $request-result   as xs:string,
    $uri              as xs:string
) as empty-sequence()
{
    switch ($request-result)
    case $eput:CONTENT_CREATED return (
        xdmp:set-response-code(201,"Created"),
        eput:add-response-header("Location",$uri)
        )
    case $eput:CONTENT_UPDATED return (
        xdmp:set-response-code(204,"Updated")
        )
    case $eput:CONTENT_DELETED return (
        xdmp:set-response-code(204,"Deleted")
        )
    default return
        error((),"RESTAPI-INTERNALERROR",concat("unknown result ",$request-result," for ",$uri))
};

(: set server field and also persist property to modules database :)

declare function eput:set-property(
    $property-name  as xs:string,
    $property-value as item()
) as empty-sequence()
{
    eput:set-property($property-name, $property-value, (), (), ())
};

declare function eput:set-property(
    $property-name   as xs:string,
    $property-value  as item(),
    $rest-group-id   as xs:unsignedLong?,
    $rest-server-id  as xs:unsignedLong?,
    $rest-modules-id as xs:unsignedLong?
) as empty-sequence()
{
    let $properties := eput:get-properties-map()
    let $validate :=
        if (map:contains(eput:default-properties(), $property-name)) then ()
        else error((),"RESTAPI-UNSUPPORTEDPROP",$property-name)
    let $update := map:put($properties,$property-name,$property-value)
    return eput:set-properties($properties,$rest-group-id,$rest-server-id,$rest-modules-id)
};

declare function eput:set-properties(
    $properties as map:map
) as empty-sequence()
{
    eput:set-properties($properties, (), (), ())
};

declare function eput:make-document-uri(
    $seed as xs:string
) as xs:string
{
    eput:make-document-uri($seed, (), (), ".xml")
};
declare function eput:make-document-uri(
    $seed        as xs:string,
    $group-name  as xs:string?,
    $server-name as xs:string?
) as xs:string
{
    eput:make-document-uri($seed, $group-name, $server-name, ".xml")
};
declare function eput:make-document-uri(
    $seed        as xs:string,
    $group-name  as xs:string?,
    $server-name as xs:string?,
    $extension   as xs:string?
) as xs:string
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $rest-group      :=
        if (exists($group-name))
        then $group-name
        else xdmp:group-name()
    let $rest-server     :=
        if (exists($server-name))
        then $server-name
        else xdmp:server-name(xdmp:server())
    let $server-id       := xdmp:server($rest-server,xdmp:group($rest-group))
    let $has-named-paths :=
        (: check or set the cache :)
        let $named-paths := eput:get-server-field($NAMED_PATHS_FIELD)
        return
            if (exists($named-paths))
            then $named-paths
            else
                (: has at least one path in 6.0-1 style :)
                let $exists-named := not(xdmp:exists(
                    xdmp:directory(concat("/", string($server-id), "/"), "infinity")
                    ))
                return (
                    eput:set-server-field($NAMED_PATHS_FIELD, $exists-named)[false()],
                    $exists-named
                    )
    return concat(
        if ($has-named-paths)
            then concat("/", $rest-group, "/", $rest-server)
            else concat("/", string($server-id)),
        $seed,
        if (empty($extension)) then ()
        else $extension
        )
};

declare function eput:set-properties(
    $properties as map:map,
    $rest-group-id as xs:unsignedLong?,
    $rest-server-id as xs:unsignedLong?,
    $rest-modules-id as xs:unsignedLong?
) as empty-sequence()
{
    eput:save-properties($properties,$rest-group-id,$rest-server-id,$rest-modules-id),
    (: set-server-field returns the content, which we don't want :)
    eput:set-server-field($eput:FIELD_NAME, $properties)[false()]
};

declare function eput:save-initial-properties(
    $rest-group-id   as xs:unsignedLong?,
    $rest-server-id  as xs:unsignedLong?,
    $rest-modules-id as xs:unsignedLong
) as empty-sequence()
{
    eput:save-initial-properties(
        $rest-group-id,$rest-server-id,$rest-modules-id,()
        )
};

declare function eput:save-initial-properties(
    $rest-group-id   as xs:unsignedLong?,
    $rest-server-id  as xs:unsignedLong?,
    $rest-modules-id as xs:unsignedLong,
    $extra-props     as map:map?
) as empty-sequence()
{
    eput:save-properties(
        eput:get-initial-properties($extra-props),
        $rest-group-id,
        $rest-server-id,
        $rest-modules-id
        )
};

declare private function eput:save-properties(
    $properties      as map:map,
    $rest-group-id   as xs:unsignedLong?,
    $rest-server-id  as xs:unsignedLong?,
    $rest-modules-id as xs:unsignedLong?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    let $modules-id    :=
        if ($rest-modules-id gt 0)
        then $rest-modules-id
        else
            let $db-id := xdmp:modules-database()
            return
                if ($db-id gt 0)
                then $db-id
                else xdmp:database()
    let $group-name    :=
        if (empty($rest-group-id)) then ()
        else xdmp:group-name($rest-group-id)
    let $server-name   :=
        if (empty($rest-server-id)) then ()
        else xdmp:server-name($rest-server-id)
    let $prop-doc-uri  := eput:make-document-uri(
        "/rest-api/properties",$group-name,$server-name
        )
    let $persist-props := eput:copy-map($properties)
    return (
        if ($is-untraced or eput:check-untraced()) then ()
        else lid:log(
            $eput:trace-id,"save-properties",
            map:entry("prop-doc-uri",$prop-doc-uri)
            =>map:with("persist-props",$persist-props)
            ),

        dbut:update-config(
            function() {
                xdmp:document-insert(
                    $prop-doc-uri,
                    document {$persist-props},
                    (xdmp:default-permissions(),
                        xdmp:permission("rest-reader-internal", "read"),
                        xdmp:permission("rest-admin-internal",  "update"))
                    )
                },
            $modules-id
            ),

        eput:set-cache-mgmt-properties($properties,(),true())
        )
};

(: use this for XML single property access externally; use the properties map internally :)
declare function eput:get-property(
    $property-name as xs:string
) as element()
{
    let $properties := eput:get-properties-map()
    let $validate :=
        if (($property-name = map:keys($properties))
            and not($property-name = $filtered-properties))
        then ()
        else error((),"RESTAPI-UNSUPPORTEDPROP",$property-name)
    return element {concat("rapi:",$property-name)} {map:get($properties,$property-name)}
};

(: Use this for properties access internally :)
declare function eput:get-properties-map(
) as map:map
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $last-props := eput:get-server-field($eput:FIELD_NAME)

    (: not yet time to check :)
    return
    if (exists($last-props) and
            map:get($last-props,$NEXT_CHECK_TIMESTAMP) gt current-dateTime())
    then $last-props
    else

    let $prop-doc-uri       := eput:make-document-uri("/rest-api/properties")
    let $last-doc-timestamp :=
        if (empty($last-props)) then ()
        else map:get($last-props, $PROP_DOC_TIMESTAMP)
    let $modules-id         :=
        let $db-id := xdmp:modules-database()
        return
            if ($db-id gt 0)
            then $db-id
            else xdmp:database()
    let $property-fields    := dbut:access-config(
        function() as item()* {
            let $doc-timestamp := xdmp:document-timestamp($prop-doc-uri)
            let $doc-map       :=
                (: no properties document or properties document hasn't changed :)
                if (empty($doc-timestamp) or $doc-timestamp eq $last-doc-timestamp)
                then ()
                (: get the changed properties :)
                else (
                    if ($is-untraced or eput:check-untraced()) then ()
                    else lid:log(
                        $eput:trace-id,"get-properties-map",
                        map:entry("properties",$last-props)
                        =>map:with("last-doc-timestamp",$last-doc-timestamp)
                        =>map:with("prop-doc-uri",$prop-doc-uri)
                        =>map:with("doc-timestamp",$doc-timestamp)
                        ),

                    doc($prop-doc-uri)/map:map
                    )
            return
                if (empty($doc-map)) then ()
                else (
                    (: detach the map :)
                    map:map(document{$doc-map}/map:map),
                    $doc-timestamp
                    )
                },
        $modules-id
        )
    return
    if (exists($property-fields))
    then eput:cache-properties(head($property-fields), tail($property-fields))
    else if (empty($last-props))
    then eput:cache-properties(eput:default-properties(), ())
    else (
        (: wait longer before the next check :)
        eput:set-next-check($last-props,false()),
        $last-props
        )
};

(: Call this only to serialize out XML :)
declare function eput:get-properties(
) as element(rapi:properties)
{
    let $properties := eput:get-properties-map()
    return
        element {"rapi:properties"} {
            for $key in map:keys($properties)
            where not($key = $filtered-properties)
            order by $key
            return element {concat("rapi:",$key)} {map:get($properties,$key)}
        }
};

(: Call this only to serialize JSON :)
declare function eput:get-json-properties(
) as json:object
{
    let $input  := eput:get-properties-map()
    let $json := json:object()
    let $_ :=
        for $key in map:keys($input)
        where not($key = $filtered-properties)
        return map:put($json,$key,map:get($input,$key))
     return $json
};

declare function eput:reset-property(
    $declared-property as xs:string
) as empty-sequence()
{
    eput:set-property($declared-property, map:get(eput:default-properties(),$declared-property))
};

declare function eput:reset-properties(
) as empty-sequence()
{
    eput:set-properties(eput:default-properties())
};

declare private function eput:get-initial-properties(
    $extra-props as map:map?
) as map:map
{
    let $props := eput:default-properties()
    return (
        if (empty($extra-props)) then ()
        else
            for $key in map:keys($extra-props)
            return
                if (exists(map:get($props,$key)))
                then map:put($props,$key,map:get($extra-props,$key))
                else if ($key = $legacy-properties) then ()
                else error((),"RESTAPI-INTERNALERROR","invalid property "||$key),
        $props
    )
};

declare private function eput:copy-map(
    $input as map:map
) as map:map
{
    let $output := map:map()
    return (
        for $key in map:keys($input)
        return
            if ($key = $system-properties) then ()
            else map:put($output, $key, map:get($input,$key)),

        $output
        )
};

declare private function eput:cache-properties(
    $properties           as map:map,
    $prop-write-timestamp as xs:unsignedLong?
) as map:map
{
    eput:set-cache-mgmt-properties(
        $properties,$prop-write-timestamp,true()
        ),

    eput:set-server-field($eput:FIELD_NAME,$properties)
};

declare private function eput:set-cache-mgmt-properties(
    $properties           as map:map,
    $prop-write-timestamp as xs:unsignedLong?,
    $min-check-wait       as xs:boolean
) as empty-sequence()
{
    if (empty($prop-write-timestamp)) then ()
    else map:put($properties,$PROP_DOC_TIMESTAMP,$prop-write-timestamp),

    eput:set-next-check($properties,$min-check-wait)
};

declare private function eput:set-next-check(
    $properties     as map:map,
    $min-check-wait as xs:boolean
) as empty-sequence()
{
    map:put($properties, $NEXT_CHECK_TIMESTAMP,
        current-dateTime() + eput:get-check-wait($properties,$min-check-wait)
        )
};

declare private function eput:get-check-wait(
    $properties     as map:map,
    $min-check-wait as xs:boolean
) as xs:dayTimeDuration
{
    let $last-try := head((
        if ($min-check-wait) then () else map:get($properties,$LAST_CHECK),
        0
        ))
    let $next-try :=
        if ($last-try ge 5)
        then 6
        else ($last-try + 1)
    return (
        if ($last-try eq $next-try) then ()
        else map:put($properties,$LAST_CHECK,$next-try),

        xs:dayTimeDuration("PT1S") * eput:next-small-fib($next-try)
        )
};

declare private function eput:next-small-fib(
    $try as xs:int
) as xs:int
{
    switch($try)
    case  1 return 1
    case  2 return 1
    case  3 return 2
    case  4 return 3
    case  5 return 5
    default return 8
};

(: assumes $format support for json and xml only; we could make this more sophisticated if there's a need' :)
declare function eput:get-content-type(
    $params  as map:map,
    $headers as map:map
) as xs:string
{
    let $format := map:get($params, "format")
    return
        if ($format eq "json")
        then "application/json"
        else if ($format eq "xml")
        then "application/xml"
        else
            let $accept      := eput:get-accept-types($headers)
            let $pref-types  :=
                ("application/json","text/json","application/xml","text/xml")
            let $accept-pref := $accept[. = $pref-types]
            return
                if (exists($accept-pref))
                then subsequence($accept-pref,1,1)
                else if (exists($accept))
                then subsequence($accept,1,1)
                else "application/xml"
};

declare function eput:get-accept-types(
    $headers as map:map
) as xs:string*
{
    dbut:tokenize-header(map:get($headers,"accept"))
};

(: assumes $format support for json and xml only; we could make this more sophisticated if there's a need' :)
declare function eput:get-inbound-content-type(
    $params  as map:map,
    $headers as map:map
) as xs:string
{
    let $pref-types   :=
        ("application/json","text/json","application/xml","text/xml")
    let $content-type := dbut:tokenize-header(map:get($headers, "content-type"))
    let $content-pref := $content-type[. = $pref-types]
    return
        if (exists($content-pref))
        then head($content-pref)
        else
            let $format := map:get($params, "format")
            return
                if ($format eq "json")
                then "application/json"
                else if ($format eq "xml")
                then "application/xml"
                else if (exists($content-type))
                then head($content-type)
                else "application/xml"
};

(: used in config-query and config-query-child endpoint when getting request body :)
declare function eput:get-content-format(
    $headers as map:map,
    $params  as map:map
) as xs:string?
{
    let $content-type := eput:get-inbound-content-type($params,$headers)
    return
        if (empty($content-type))
        then "xml"
        else if (matches($content-type,"^(application|text)/(json|[^+]+\+json)$"))
        then "json"
        else if (matches($content-type,"^(application|text)/(xml|[^+]+\+xml)$"))
        then "xml"
        else if (matches($content-type,"^application/(xquery|sparql\-query|n\-triples|n\-quads|x\-turtle|trig)"))
        then "text"
        else if (matches($content-type,"^application/(sparql\-update)"))
        then "text"
        else if (matches($content-type,"^text/")) (: covers all of text/* not handled above :)
        then "text"
        else error((), "RESTAPI-INVALIDMIMETYPE", concat(
            "Unable to determine content type of payload.  Received ",
            map:get($headers, "content-type")))
};

declare function eput:get-outbound-type-format(
    $type as xs:string?
) as xs:string?
{
    if      (empty($type))                                                         then ()
    else if (matches($type,"^(application|text)/(json|[^+]+\+json)$"))             then "json"
    else if (matches($type,"^(application|text|image)/(xml|[^+]+\+xml)$"))         then "xml"
    else if (matches($type,"^text/"))                                              then "text"
    else if (matches($type,"^(audio|image|video)/"))                               then "binary"
    else if (matches($type,"^application/(x-unknown-content-type|octet-stream)$")) then "binary"
    else                                                                                ()
};

declare function eput:get-document-format(
    $document as document-node()?
) as xs:string?
{
    if (empty($document)) then ()
    else if (exists($document/(array-node()|object-node())))
    then "json"
    else if (exists($document/(comment()|element()|processing-instruction())))
    then "xml"
    else eput:get-node-format(head($document/node()))
};

declare function eput:get-node-format(
    $node as node()?
) as xs:string?
{
    if (empty($node)) then ()
    else
        typeswitch($node)
        (: root node cases :)
        case object-node()            return "json"
        case array-node()             return "json"
        case element()                return "xml"
        case text()                   return "text"
        case binary()                 return "binary"
        case document-node()          return eput:get-document-format($node)
        (: nested node cases :)
        case boolean-node()           return "json"
        case null-node()              return "json"
        case number-node()            return "json"
        case attribute()              return "xml"
        case comment()                return "xml"
        case processing-instruction() return "xml"
        default                       return ()
};

declare function eput:uri-content-type(
        $uri as xs:string?
) as xs:string?
{
    if (empty($uri)) then ()
    else
        let $uri-type  := xdmp:uri-content-type($uri)
        return
            if (exists($uri-type[. ne "application/x-unknown-content-type"]))
            then
                if ($uri-type eq "text/xml")
                then "application/xml"
                else $uri-type
            else if (ends-with($uri,".json"))
            then "application/json"
            else if (ends-with($uri,".xml"))
            then "application/xml"
            else if (ends-with($uri,".txt"))
            then "text/plain"
            else $uri-type
};

declare function eput:get-doc-type(
    $uri as xs:string,
    $doc as document-node()
) as xs:string
{
    let $uri-type := eput:uri-content-type($uri)
    return
        if (exists($uri-type) and $uri-type ne "application/x-unknown-content-type")
        then $uri-type
        else eput:get-format-type(eput:get-document-format($doc))
};

declare function eput:get-format-type(
    $format as xs:string?
) as xs:string?
{
    if (empty($format) or $format eq "") then ()
    else if ($format eq "json")   then "application/json"
    else if ($format eq "xml")    then "application/xml"
    else if ($format eq "text")   then "text/plain"
    else if ($format eq "binary") then "application/x-unknown-content-type" (: OR application/octet-stream ? :)
    else error((),"RESTAPI-INTERNALERROR","unknown format "||$format)
};

declare function eput:content-type-format(
    $content-type as xs:string?
) as xs:string?
{
    if (empty($content-type)) then ()
    else if (matches($content-type,"[/+]json$"))
    then "json"
    else if (matches($content-type,"[/+]xml$"))
    then "xml"
    else if (matches($content-type,"^text/"))
    then "text"
    else eput:get-mimetypes()[mt:name/string(.) = $content-type] /
        mt:format/string(.)
};

declare private function eput:get-mimetypes(
) as element(mt:mimetype)*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    xdmp:mimetypes()
};

declare function eput:get-request-body(
    $format as xs:string?
) as document-node()?
{
    xdmp:get-request-body($format)
};

(: $rules-path points at an optionally-existing set of rules for finding an XSLT and docs to feed it :)
declare function eput:default-page-with-transform(
    $index-path as xs:string,
    $rules-path as xs:string,
    $params     as map:map?
) as item()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or eput:check-untraced()) then ()
    else lid:log(
        $eput:trace-id,"default-page-with-transform",
        map:entry("index-path",$index-path)=>map:with("rules-path",$rules-path)
        =>map:with("params",$params)
        ),

    let $intermed := xdmp:invoke-function(function() {
        let $rules       := doc($rules-path)
        let $xslpath     := string($rules/app:rules/app:master-xsl)
        let $contentid   := head((map:get($params, "content"), "default"))
        let $contentpath :=
            $rules/app:rules/app:content[app:uri-step eq $contentid]/app:content-source/string()
        return (
            $xslpath,

            doc(if (string-length($contentpath) gt 0)
                then $contentpath
                else $index-path)
            )
        },
        map:entry("database",xdmp:modules-database())
        )
    let $xslpath := head($intermed)
    let $contentdoc := tail($intermed)
    return
        if ($xslpath eq '')
        then $contentdoc
        else xdmp:xslt-invoke($xslpath, $contentdoc, $params)
};

declare function eput:produce-error-response(
    $errors as element(error:error)*
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if (empty($errors)) then ()
    else
        let $response := eput:invoke-module(
            "/MarkLogic/rest-api/error-handler.xqy",
            (QName("http://marklogic.com/xdmp/error", "errors"), $errors),
            ()
            )
        return
            if (empty($response)) then ()
            else document {$response}
};

(: note: must remain private to avoid security hole :)
declare private function eput:invoke-module(
    $path    as xs:string,
    $params  as item()*,
    $options as node()?
) as item()*
{
    if ($is-untraced or eput:check-untraced()) then ()
    else lid:log(
        $eput:trace-id,"invoke-module",
        map:entry("path",$path)=>map:with("params",$params)
        =>map:with("options",$options)
        ),

    xdmp:invoke($path,$params,$options)
};

declare function eput:set-rest-options(
    $options as map:map
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    eput:set-server-field("com.marklogic.rest-api.REST-OPTIONS",$options)[false()]
};

declare function eput:get-rest-options(
) as map:map?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    eput:get-server-field("com.marklogic.rest-api.REST-OPTIONS")
};

declare function eput:get-db-config(
) as map:map?
{
    let $last-list      := eput:get-db-timestamp-and-config()
    let $last-timestamp :=
        if (count($last-list) ne 2) then 0
        else subsequence($last-list,1,1)
    let $current-list   :=
        mout:read-database-config(xdmp:database(),$last-timestamp)
    return
        if (count($current-list) ne 2)
        then subsequence($last-list,2,1)
        else
            let $current-timestamp := subsequence($current-list,1,1)
            let $current-config    := subsequence($current-list,2,1)
            let $config-map        := dbut:db-config-map($current-config)
            let $current-map       :=
                if (exists($config-map)) then $config-map else map:map()
            return(
                eput:set-db-timestamp-and-config(
                    $current-timestamp, $current-map
                    ),

                $current-map
                )
};

declare function eput:set-db-timestamp-and-config(
    $timestamp as xs:unsignedLong,
    $config    as map:map
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    eput:set-server-field(
        "com.marklogic.rest-api.DB-CONFIG", ($timestamp,$config)
        )[false()]
};

declare function eput:get-db-timestamp-and-config(
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    eput:get-server-field("com.marklogic.rest-api.DB-CONFIG")
};

(: note: must remain private to avoid security hole
   all callers must use xdmp:security-assert() to guard access :)
declare private function eput:set-server-field(
    $name   as xs:string,
    $values as item()*
) as item()*
{
   xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
   xdmp:set-server-field($name, $values),
   xdmp:set-server-field-privilege($name, "http://marklogic.com/xdmp/privileges/rest-reader")
};

declare function eput:call-response-type(
    $env           as map:map?,
    $response-type as xs:string?
) as empty-sequence()
{
    if (empty($env) or empty($response-type)) then ()
    else
        let $responder := map:get($env,"responder")
        return
            if (empty($responder)) then ()
            else $responder($response-type)
};

declare function eput:response-type-callback(
    $response-type as xs:string?
) as empty-sequence()
{
    if (empty($response-type)) then ()
    else if (contains($response-type,";"))
    then xdmp:set-response-content-type($response-type)
    else xdmp:set-response-content-type(concat($response-type,"; charset=utf-8"))
};

declare function eput:response-callback-map(
    $responder-function as function(*)*
) as map:map
{
    let $map := map:map()
    return (
        map:put($map, "responder", $responder-function),
        $map
        )
};


(: note: must remain private to avoid security hole
   all callers must use xdmp:security-assert() to guard access :)
declare private function eput:get-server-field(
    $name as xs:string
) as item()*
{
    xdmp:get-server-field($name)
};

declare function eput:transform-response(
    $response      as item(),
    $response-type as xs:string?,
    $headers       as map:map,
    $params        as map:map,
    $env           as map:map?,
    $context       as map:map?,
    $notify-type   as xs:boolean
) as item()?
{
    let $trans-name := map:get($params,"transform")
    let $responder  :=
        if (empty($env) or not($notify-type)) then ()
        else map:get($env,"responder")
    return
        if (empty($trans-name)) then (
            if (empty($responder)) then ()
            else $responder($response-type),
            $response
            )
        else
            let $trans-output := tformod:apply-transform(
                $trans-name,
                if (exists($context))
                    then $context
                    else eput:make-context(
                        (), $response-type, map:get($headers, "accept")
                        ),
                tformod:extract-transform-params($params),
                document{$response}
                )
            let $trans-ctxt   := map:get($trans-output,"context")
            let $result       := map:get($trans-output,"result")
            return (
                if (empty($responder) or empty($result)) then ()
                else $responder(head((map:get($trans-ctxt,"output-type"), $response-type))),

                $result
                )
};

declare function eput:make-request(
    $uri as xs:string,
    $doc as document-node()
) as map:map
{
    map:entry("uri",       $uri)
    => map:with("context", eput:make-context($uri, eput:get-doc-type($uri,$doc)))
    => map:with("input",   $doc)
};

declare function eput:make-context(
    $uri        as xs:string?,
    $input-type as xs:string
) as map:map
{
    eput:make-context($uri,$input-type,$input-type)
};

declare function eput:make-context(
    $uri          as xs:string?,
    $input-type   as xs:string,
    $accept-types as xs:string*
) as map:map
{
    let $context := map:map()
    return (
        if (empty($uri)) then ()
        else map:put($context, "uri",           $uri),

        map:put($context, "input-type",    $input-type),
        map:put($context, "accept-types",  $accept-types),
        map:put($context, "output-type",   head(($accept-types,$input-type))),

        $context
        )
};

declare function eput:apply-document-transform-all(
    $trans-name as xs:string,
    $params     as map:map,
    $requests   as map:map+
) as map:map+
{
    tformod:apply-transform-all(
        $trans-name,tformod:extract-transform-params($params),$requests
        )
};

declare function eput:xslt-invoke(
  $transform as item(),
  $input     as node()
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or eput:check-untraced()) then ()
    else lid:log(
        $eput:trace-id,"xslt-invoke",
        map:entry("transform",$transform),
        map:entry("input",$input)
        ),

    if ($transform instance of element(xsl:stylesheet))
    then xdmp:xslt-eval($transform, $input)
    else if (starts-with($transform, "/MarkLogic/rest-api/"))
    then xdmp:xslt-invoke($transform, $input)
    else ()
};

declare function eput:parse-byte-range(
    $range as xs:string?,
    $last  as xs:long?,
    $uri   as xs:string?
) as xs:unsignedLong*
{
    if (empty($range) or empty($last)) then ()
    else
        let $ranges :=
            for $raw-spec in tokenize($range,",+")
            let $spec := analyze-string($raw-spec,"^\s*(\d+)?\s*-\s*(\d+)?\s*$")
            let $raw-bounds  := $spec/as:match/as:group
            let $raw-start   := $raw-bounds[@nr eq 1]/text()/xs:long(data(.))
            let $raw-end     := $raw-bounds[@nr eq 2]/text()/xs:long(data(.))
            let $start-bound :=
                if (exists($raw-start))
                then $raw-start
                else if (exists($raw-end))
                then max((0, $last - $raw-end + 1))
                else error((),"REST-INVALIDPARAM",
                    "range without start or end for uri: " || $uri
                    )
            let $end-bound   :=
                if (exists($raw-start) and exists($raw-end)) then
                    if ($raw-start le $raw-end)
                    then min(($raw-end,$last))
                    else error((),"REST-INVALIDPARAM",
                        "range start greater than end for uri: " || $uri
                        )
                else $last
            where $start-bound le $last
            order by $start-bound ascending
            return ($start-bound, $end-bound)
        return
            if (empty($ranges)) then ()
            else eput:consolidate-ranges(
                subsequence($ranges,1,1),
                subsequence($ranges,2,1),
                subsequence($ranges,3)
                )
};

declare function eput:consolidate-ranges(
    $current-start as xs:long,
    $current-end   as xs:long,
    $current-rest  as xs:long*
) as xs:unsignedLong+
{
    if (empty($current-rest))
    then ($current-start,$current-end)
    else
        let $next-start := subsequence($current-rest,1,1)
        let $next-end   := subsequence($current-rest,2,1)
        let $next-rest  := subsequence($current-rest,3)
        return
            if ($next-start le $current-end)
            then eput:consolidate-ranges(
                $current-start,
                max(($current-end,$next-end)),
                $next-rest
                )
            else (
                ($current-start,$current-end),
                eput:consolidate-ranges(
                    $next-start,$next-end,$next-rest
                    )
                )
};

declare function eput:response-add-host-cookie(
    $headers     as map:map,
    $params      as map:map,
    $env         as map:map?
) as empty-sequence()
{
    if (not(map:contains($params,"txid")) or empty($env)) then ()
    else
        let $host-cookie-adder := map:get($env,"host-cookie-adder")
        return
            if (empty($host-cookie-adder)) then ()
            else $host-cookie-adder(xdmp:host())
};

declare function eput:add-host-cookie(
    $hid as xs:unsignedLong
) as empty-sequence()
{
    eput:add-cookie("HostId", string($hid))
};

declare function eput:add-cookie(
    $name  as xs:string,
    $value as xs:string
) as empty-sequence()
{
    eput:add-cookie($name,$value,(),(),(),false())
};

declare function eput:add-cookie(
    $name    as xs:string,
    $value   as xs:string,
    $expires as xs:dateTime?,
    $domain  as xs:string?,
    $path    as xs:string?,
    $secure  as xs:boolean
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    cook:add-cookie($name, $value, $expires, $domain, $path, $secure)
};

declare function eput:delete-cookie(
    $name as xs:string
) as empty-sequence()
{
    eput:delete-cookie($name,(),())
};

declare function eput:delete-cookie(
    $name    as xs:string,
    $domain  as xs:string?,
    $path    as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    cook:delete-cookie($name, $domain, $path)
};

declare function eput:get-cookie(
    $name as xs:string
) as xs:string*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    cook:get-cookie($name)
};

declare function eput:lookup-role-ids(
    $role-names as item() (: an json:array or single item convertible to xs:string :)
) as element(sec:role-id)*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    for $role-name in
        if ($role-names instance of json:array)
        then json:array-values($role-names, true())
        else $role-names
    let $role-id := xdmp:role(string($role-name))
    return
        if ($role-id eq 0)
        then error((), "REST-INVALIDPARAM", concat("Role ",string($role-name)," does not exist"))
        else <sec:role-id>{$role-id}</sec:role-id>
};

(: converts from a sequence of uri strings to text/uri-list :)
declare function eput:to-uri-list($uris as xs:string*) as xs:string
{
   (: I think this string-join will prevent streaming,
    : but it will guarantee that every line ends with CRLF :)
   string-join(for $uri in $uris return ($uri, "&#13;&#10;"))
};

declare function eput:collect-bindings(
    $node as node()
) as map:map?
{
    if (not($node instance of element())) then ()
    else
        let $prefixes := in-scope-prefixes($node)[not(. = ("rapi","xml"))]
        return
            if (empty($prefixes)) then ()
            else
                let $bindings := map:map()
                return (
                    for $prefix in $prefixes
                    return map:put($bindings, $prefix, namespace-uri-for-prefix($prefix, $node)),

                    $bindings
                    )
};

