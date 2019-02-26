xquery version "1.0"; (: MUST NOT BE "1.0-ml" -- requires strict behaviours :)

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace strict = "http://marklogic.com/rest-api/lib/strict-util";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

declare function strict:is-uri(
    $uri as xs:string
) as xs:boolean
{
    exists(QName($uri,"x"))
};
