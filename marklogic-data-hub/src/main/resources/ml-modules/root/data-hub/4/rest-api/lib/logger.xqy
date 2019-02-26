xquery version "1.0-ml";

(: Copyright 2002-2019 MarkLogic Corporation.  All Rights Reserved. :)
module namespace logger="http://marklogic.com/rest-api/logger_DELETE_IF_UNUSED";

import module namespace rest-impl="http://marklogic.com/appservices/rest-impl"
    at "/MarkLogic/appservices/utils/rest-impl.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $logger:LEVEL := "info";
declare variable $logger:server-flag := "debug";

declare function logger:log(
    $message as xs:string*
) 
{
    if (logger:logger-on())
    then
        xdmp:log( ($message), $logger:LEVEL )
    else
       ()
};

declare function logger:dump-request-environment(
) as empty-sequence()
{
   logger:dump-request-environment((),())
};

declare function logger:dump-request-environment(
    $local-function as function(*)*,
    $local-args as item()*
) as empty-sequence()
{
    if (logger:logger-on())
    then
        let $reqenv := rest-impl:request-environment()
        let $uri    := map:get($reqenv, "uri")
        let $path    := map:get($reqenv, "path")
        let $method := map:get($reqenv, "method")
        let $accept := map:get($reqenv, "accept")
        let $params := map:get($reqenv, "params")
        let $local-msg := 
            for $fn in $local-function
            return $fn($local-args)
        return
            (
            logger:log("Request environment:"),
            logger:log(concat($method, " ", $path)),
            logger:log(concat("Rewritten to: ", $uri)),
            logger:log(concat("ACCEPT ", $accept)),
            logger:log("PARAMS:"),
            for $name in map:keys($params)
            return
                logger:log(concat("  ", $name, ": (", string-join(map:get($params, $name), ", "), ")")),
                logger:log(""),
            if (empty($local-msg)) 
            then () 
            else 
                (logger:log("Endpoint Details: "),
                logger:log($local-msg))
            )
    else
        ()
};

(: function to see if logging is on :)
declare function logger:logger-on()
as xs:boolean
{
    let $log-on := map:get(eput:get-properties-map(),$logger:server-flag)
    return if (fn:exists($log-on) and (xs:boolean($log-on) eq true())) then true() else false()
};
