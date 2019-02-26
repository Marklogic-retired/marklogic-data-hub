xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model";

import module namespace mout = "http://marklogic.com/manage/lib/model-util"
    at "/MarkLogic/manage/lib/model-util.xqy";

import module namespace dmod="http://marklogic.com/manage/database"
    at "/MarkLogic/manage/models/database-model.xqy";

import module namespace fmod="http://marklogic.com/manage/forest"
    at "/MarkLogic/manage/models/forest-model.xqy";

import module namespace hmod="http://marklogic.com/manage/host"
    at "/MarkLogic/manage/models/host-model.xqy";

import module namespace smod="http://marklogic.com/manage/server"
    at "/MarkLogic/manage/models/server-model.xqy";

import module namespace tmod="http://marklogic.com/manage/transaction"
    at "/MarkLogic/manage/models/transaction-model.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
    at "/MarkLogic/json/json.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace host = "http://marklogic.com/xdmp/status/host";
declare namespace mt   = "http://marklogic.com/xdmp/mimetypes";
declare namespace prop = "http://marklogic.com/xdmp/property";
declare namespace sec  = "http://marklogic.com/xdmp/security";

declare namespace rapi = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $transmod:TRANSACTION_CREATED    := "TRANSACTION_CREATED";
declare variable $transmod:TRANSACTION_RETRIEVED  := "TRANSACTION_RETRIEVED";
declare variable $transmod:TRANSACTION_COMMITTED  := "TRANSACTION_COMMITTED";
declare variable $transmod:TRANSACTION_ROLLEDBACK := "TRANSACTION_ROLLEDBACK";

declare variable $transmod:trace-id := "restapi.transactions";

declare private variable $is-untraced := ();

declare function transmod:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($transmod:trace-id, ("restapi"))),

    $is-untraced
};

declare private variable $rapi-ns := "http://marklogic.com/rest-api";

declare private variable $transmod:transform-list-config :=
    let $config := json:config("custom")
    return (
        map:put($config, "element-namespace",   "http://marklogic.com/rest-api"),
        map:put($config, "element-prefix",      "rapi"),
        (: NO NEED AT PRESENT FOR:  array-element-names :)
        $config
        );

(:
    high-level request functions
 :)
declare function transmod:post-open(
    $headers as map:map,
    $params  as map:map,
    $context as map:map?
) as empty-sequence()
{
    let $hid  := xdmp:host()
    let $txid := transmod:create($hid, map:get($params,"name"), map:get($params,"timeLimit"))
    let $host-cookie-adder := 
        if (empty($context)) then ()
        else map:get($context,"host-cookie-adder")
    let $responder :=
        if (empty($context)) then ()
        else map:get($context,"responder")
    return (
        if (empty($host-cookie-adder)) then ()
        else $host-cookie-adder($hid),

        if (empty($responder)) then ()
        else $responder($transmod:TRANSACTION_CREATED,concat("/v1/transactions/",string($txid)),())
        )
};

declare function transmod:get(
    $headers as map:map,
    $params  as map:map,
    $context as map:map?
) as item()*
{
    let $txid := xs:unsignedLong(map:get($params,"txid"))
    let $responder :=
        if (empty($context)) then ()
        else map:get($context,"responder")
    return
        let $status := transmod:get-status($params,$txid)
        let $format := head((dbut:get-request-format($headers,$params)[. ne ""], "xml"))
        return (
            if (empty($responder)) then ()
            else $responder($transmod:TRANSACTION_RETRIEVED,
                concat("/transactions/",$txid),
                concat("application/",$format)
                ),

            if ($format eq "xml")
            then $status
            else if ($format eq "json")
            then json:transform-to-json-string($status, $transmod:transform-list-config)
            else error((),"RESTAPI-INVALIDMIMETYPE",(
                "mime type for transaction status must be application/json or application/xml",
                $format,
                concat("/v1/transactions/",string($txid))
                ))
            )
};

declare function transmod:post-commit(
    $headers as map:map,
    $params  as map:map,
    $context as map:map?
) as empty-sequence()
{
    let $txid      := xs:unsignedLong(map:get($params,"txid"))
    let $responder :=
        if (empty($context)) then ()
        else map:get($context,"responder")
    return (
        if (empty($responder)) then ()
        else $responder($transmod:TRANSACTION_COMMITTED,concat("/transactions/",$txid),()),
        transmod:commit($txid)
        )
};

declare function transmod:post-rollback(
    $headers as map:map,
    $params  as map:map,
    $context as map:map?
) as empty-sequence()
{
    let $txid      := xs:unsignedLong(map:get($params,"txid"))
    let $responder :=
        if (empty($context)) then ()
        else map:get($context,"responder")
    return (
        if (empty($responder)) then ()
        else $responder($transmod:TRANSACTION_ROLLEDBACK,concat("/transactions/",$txid),()),
        transmod:rollback($txid)
        )
};

(: low-level functions :)
declare function transmod:create(
    $hid        as xs:unsignedLong,
    $name       as xs:string?,
    $time-limit as xs:string?
) as xs:unsignedLong
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or transmod:check-untraced()) then ()
    else lid:log(
        $transmod:trace-id,"create",
        map:entry("host",$hid)=>map:with("name",$name)=>map:with("limit",$time-limit)
        ),

    let $txid := xdmp:transaction-create(
        <options xmlns="xdmp:eval"><transaction-mode>update</transaction-mode></options>
        )
    return (
        xdmp:set-transaction-name(($name,"client-txn")[1],$hid,$txid),

        if (empty($time-limit)) then ()
        else if (not($time-limit castable as xs:unsignedInt))
        then error((),"REST-INVALIDPARAM",(
            "invalid time limit. timeLimit: "||$time-limit
            ))
        else dbut:set-transaction-time-limit(xs:unsignedInt($time-limit),$hid,$txid),

        $txid
        )
};

declare function transmod:commit(
    $txid as xs:unsignedLong
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or transmod:check-untraced()) then ()
    else lid:log($transmod:trace-id,"commit", map:entry("txid",$txid)),

    (: synchronous equivalent to asynchronous xdmp:transaction-commit($hid,$txid) :)
    xdmp:xa-complete1(xdmp:host(),$txid,true())
};

declare function transmod:rollback(
    $txid as xs:unsignedLong 
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or transmod:check-untraced()) then ()
    else lid:log($transmod:trace-id,"rollback", map:entry("txid",$txid)),

    (: synchronous equivalent to asynchronous xdmp:transaction-rollback($hid,$txid) :)
    xdmp:xa-complete1(xdmp:host(),$txid,false())
};

declare private function transmod:get-status(
    $params as map:map,
    $txid   as xs:unsignedLong
) as element(rapi:transaction-status)?
{
    let $hid    := xdmp:host()
    let $status := tmod:get-transaction-status($params,$rapi-ns,$hid,$txid)
    (: TODO: schema :)
    return (
        if ($is-untraced or transmod:check-untraced()) then ()
        else lid:log(
            $transmod:trace-id,"get-status",
            map:entry("host",$hid)=>map:with("txid",$txid)=>map:with("params",$params)
            =>map:with("status",$status)
            ),

        if (empty($status))
        then error((),"REST-INVALIDPARAM",(
            "non-existent transaction id "||$txid
            ))
        else
        <rapi:transaction-status>{
            <rapi:host>
                <rapi:host-id>{$hid}</rapi:host-id>
                <rapi:host-name>{hmod:get-host-name($hid)}</rapi:host-name>
            </rapi:host>,
            $status/host:server-id/data(.) !
            <rapi:server>
                <rapi:server-id>{.}</rapi:server-id>
                <rapi:server-name>{smod:get-server-name(.)}</rapi:server-name>
            </rapi:server>,
            $status/host:database-id/data(.) !
                <rapi:database>
                    <rapi:database-id>{.}</rapi:database-id>
                    <rapi:database-name>{dmod:get-database-name(.)}</rapi:database-name>
                </rapi:database>,
                distinct-values($status/host:forest-id/data(.)) !
                <rapi:forest>
                    <rapi:forest-id>{.}</rapi:forest-id>
                    <rapi:forest-name>{fmod:get-forest-name(.)}</rapi:forest-name>
                </rapi:forest>,
                mout:change-element-ns-deep($status /
                    (* except (host:database-id|host:forest-id|host:host-id|host:server-id)),
                    $rapi-ns,
                    "rapi"
                    )
        }</rapi:transaction-status>
        )
};
