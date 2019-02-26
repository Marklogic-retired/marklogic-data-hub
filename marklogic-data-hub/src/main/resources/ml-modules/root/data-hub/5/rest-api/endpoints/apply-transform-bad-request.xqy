xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

if (xdmp:get-request-method() = "POST")
then error((), "REST-INVALIDMIMETYPE",("text/uri-list",xdmp:get-request-header("Content-Type")))
else error((), "REST-UNSUPPORTEDMETHOD",xdmp:get-request-method())
