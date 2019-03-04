xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace dbut = "http://marklogic.com/rest-api/lib/db-util";

import module namespace strict = "http://marklogic.com/rest-api/lib/strict-util"
    at "../lib/strict-util.xqy";

import module namespace hof = "http://marklogic.com/higher-order"
    at "/MarkLogic/appservices/utils/higher-order.xqy";

declare namespace db     = "http://marklogic.com/xdmp/database";
declare namespace server = "http://marklogic.com/xdmp/status/server";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function dbut:get-request-format(
    $headers as map:map,
    $params  as map:map
) as xs:string?
{
    let $response-format := map:get($params,"format")
    return
        if (exists($response-format) and $response-format ne "")
        then $response-format
        else
            let $match-types  := dbut:tokenize-header(map:get($headers,"accept"))[
                . = ("application/xml","text/xml","application/json")
                ]
            return
                if (empty($match-types)) then ()
                else substring-after(head($match-types),"/")
};

declare function dbut:tokenize-header(
    $header as xs:string?
) as xs:string*
{
    if (empty($header)) then ()
    else distinct-values(
        for $token in tokenize($header,"\s*,\s*")
        return
            if (starts-with($token,"*/*")) then ()
            else if (not(contains($token,";")))
            then normalize-space($token)
            else normalize-space(substring-before($token,";"))
        )
};

(: use Micah's excellent technique from /MarkLogic/appservices/utils/higher-order.xqy
   no parameters because you construct an inline function for the call
 :)
declare function dbut:apply-with-commit(
    $f as function(*)
) as item()*
{
    dbut:apply-options(
        $f,
        <isolation xmlns="xdmp:eval">different-transaction</isolation>
        )
};

declare function dbut:apply-options(
    $f             as function(*),
    $option-detail as element()*
) as item()*
{
    xdmp:invoke-function(
        $f,
        <options xmlns="xdmp:eval">
            <modules>{xdmp:modules-database()}</modules>
            <root>.</root>
            <update>true</update>
            <commit>auto</commit>
            {$option-detail}
        </options>
        )
};

declare function dbut:access-config(
    $function as function(*)
) as item()*
{
    dbut:access-config($function, xdmp:modules-database(), 0)
};
declare function dbut:access-config(
    $function as function(*),
    $db-id    as xs:unsignedLong
) as item()*
{
    dbut:access-config($function, $db-id, 0)
};
declare function dbut:access-config(
    $function as function(*),
    $db-id    as xs:unsignedLong,
    $mdb-id   as xs:unsignedLong
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    (: this logic to handle testing scenario outside of REST server :)
    if ($db-id eq 0 and $mdb-id eq 0)
    then xdmp:apply($function)
    else hof:apply-in($db-id, $mdb-id, $function, "auto")
};

declare function dbut:update-config(
    $function as function(*)
) as item()*
{
    dbut:update-config($function, xdmp:modules-database(), 0)
};
declare function dbut:update-config(
    $function as function(*),
    $db-id    as xs:unsignedLong
) as item()*
{
    dbut:update-config($function, $db-id, 0)
};
declare function dbut:update-config(
    $function as function(*),
    $db-id    as xs:unsignedLong,
    $mdb-id   as xs:unsignedLong
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
    (: this logic to handle testing scenario outside of REST server :)
    if ($db-id eq 0)
    then xdmp:apply($function)
    else hof:apply-in($db-id, $mdb-id, $function, "update-auto-commit")
};

declare function dbut:rest-modules-database(
    $appserver-name as xs:string
) as xs:unsignedLong?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader","execute"),
    let $server := xdmp:server($appserver-name,xdmp:group())
    return
        if (empty($server)) then ()
        else xdmp:server-modules-database($server)
};

declare function dbut:db-config-map(
    $config as element(db:database)?
) as map:map?
{
    (: TODO: fields and field range indexes :)
    let $elem-indexes :=
        $config/db:range-element-indexes/db:range-element-index
    let $att-indexes  :=
        $config/db:range-element-attribute-indexes/db:range-element-attribute-index
    return
        if (empty($elem-indexes) and empty($att-indexes)) then ()
        else
            let $map := map:map()
            return (
(: TODO: field and field range indexes :)
                for $elem-index in $elem-indexes
                let $ns-uris  := $elem-index/db:namespace-uri/tokenize(string(.),"\s+")
                let $names    := $elem-index/db:localname/tokenize(string(.),"\s+")
                let $datatype := $elem-index/db:scalar-type/string(.)
                for $ns-uri in (if (empty($ns-uris)) then "" else $ns-uris)
                for $name in $names
                let $qname :=
                    if ($ns-uri eq "")
                    then xs:QName($name)
                    else QName($ns-uri,$name)
                return map:put(
                    $map,
                    concat("er:",
                        xdmp:key-from-QName($qname)
                        ),
                    $datatype
                    ),

                for $att-index in $att-indexes
                let $parent-uris  := $att-index/db:parent-namespace-uri/tokenize(string(.),"\s+")
                let $parent-names := $att-index/db:parent-localname/tokenize(string(.),"\s+")
                let $ns-uris      := $att-index/db:namespace-uri/tokenize(string(.),"\s+")
                let $names        := $att-index/db:localname/tokenize(string(.),"\s+")
                let $datatype     := $att-index/db:scalar-type/string(.)
                for $parent-uri  in (if (empty($parent-uris)) then "" else $parent-uris)
                for $parent-name in $parent-names
                let $parent-qname :=
                    if ($parent-uri eq "")
                    then xs:QName($parent-name)
                    else QName($parent-uri,$parent-name)
                for $ns-uri      in (if (empty($ns-uris)) then "" else $ns-uris)
                for $name        in $names
                let $qname :=
                    if ($ns-uri eq "")
                    then xs:QName($name)
                    else QName($ns-uri,$name)
                return map:put(
                    $map,
                    concat("ear:",
                        xdmp:key-from-QName($parent-qname),
                        "@",
                        xdmp:key-from-QName($qname)
                        ),
                    $datatype
                    ),

                $map
                )
};

declare function dbut:set-transaction-time-limit(
    $time-limit as xs:unsignedInt,
    $host-id    as xs:unsignedLong,
    $txn-id     as xs:unsignedLong
)  as   empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer","execute"),
    dbut:do-set-transaction-time-limit($time-limit,$host-id,$txn-id)
};

declare private function dbut:do-set-transaction-time-limit(
    $time-limit as xs:unsignedInt,
    $host-id    as xs:unsignedLong,
    $txn-id     as xs:unsignedLong
)  as   empty-sequence()
{
    xdmp:set-transaction-time-limit($time-limit,$host-id,$txn-id)
};

declare function dbut:is-uri(
    $uri as xs:string?
) as xs:boolean
{
    if (empty($uri) or string-length($uri) eq 0)
    then false()
    else
        try {
            strict:is-uri($uri)
        } catch($e) {
            false()
        }
};
