xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

(: WARNING: This service is for internal use only and could be removed at any time. :)

xdmp:set-response-code(200,"Okay"),

xdmp:effective-version()