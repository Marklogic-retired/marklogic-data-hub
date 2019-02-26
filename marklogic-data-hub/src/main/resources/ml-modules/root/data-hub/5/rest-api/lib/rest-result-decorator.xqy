xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace dec = "http://marklogic.com/rest-api/lib/href-decorator";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "endpoint-util.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $dec:DECORATOR-APPLY as xs:string := "href-decorator";
declare variable $dec:DECORATOR-NS as xs:string := "http://marklogic.com/rest-api/lib/href-decorator";
declare variable $dec:DECORATOR-AT as xs:string := "/MarkLogic/rest-api/lib/rest-result-decorator.xqy";

declare variable $dec:result-decorator as element(search:result-decorator) :=
    element search:result-decorator {
        attribute apply { $dec:DECORATOR-APPLY },
        attribute ns { $dec:DECORATOR-NS },
        attribute at { $dec:DECORATOR-AT }
    };

declare function dec:href-decorator(
  $uri    as xs:string,
  $result as node()
) as node()*
{
    let $db-param := xdmp:get-request-field("database")
    let $uri-mimetype := xdmp:uri-content-type($uri)
    let $is-unknown   := ($uri-mimetype eq "application/x-unknown-content-type")
    let $format       :=
        let $mimetype-format :=
            if ($is-unknown) then ()
            else eput:get-outbound-type-format($uri-mimetype)
        let $uri-format      :=
            if ($is-unknown) then ()
            else if (exists($mimetype-format))
            then $mimetype-format
            else xdmp:uri-format($uri)
        return
            if (exists($uri-format))
            then $uri-format
            else eput:get-node-format($result)
    let $mimetype     :=
        if ($is-unknown or empty($uri-mimetype))
        then eput:get-format-type($format)
        else $uri-mimetype
    return (
        if (empty($db-param))
        then
            attribute href { concat("/v1/documents?uri=", encode-for-uri($uri)) }
        else
            attribute href { concat("/v1/documents?uri=", encode-for-uri($uri),
            "&amp;database=", $db-param)},
  
        if (empty($mimetype)) then ()
        else attribute mimetype {$mimetype},
 
        if (empty($format)) then ()
        else attribute format { $format }
        )
};
