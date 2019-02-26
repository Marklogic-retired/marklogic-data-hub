xquery version "1.0-ml";
(: Copyright 2011-2019 MarkLogic Corporation. All Rights Reserved. :)

import module namespace errut = "http://marklogic.com/rest-api/lib/error-util"
    at "lib/error-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $error:errors as element(error:error)* external;
declare variable $code := xdmp:get-response-code();

let $preferred-error-format := errut:preferred-format()
return 
    (
    errut:log-errors($error:errors,$code),
    if ($preferred-error-format eq "xml")
    then xdmp:set-response-content-type("application/xml")
    else xdmp:set-response-content-type("application/json"),
    errut:error-body($error:errors,$code,$preferred-error-format) 
    )

 
