xquery version "1.0-ml";

(: Copyright 2011-2018 MarkLogic Corporation.  All Rights Reserved. :)

module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "endpoint-util.xqy";

import module namespace hof = "http://marklogic.com/higher-order"
    at "/MarkLogic/appservices/utils/higher-order.xqy";

declare namespace xsl  = "http://www.w3.org/1999/XSL/Transform";
declare namespace rapi = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $extut:trace-id := "restapi.extensions";

declare private variable $is-untraced := ();

declare private variable $system-transforms-40 := map:map()
    =>map:with("ml:extractContent",       "get-content")
    =>map:with("ml:inputFlow",            "run-flow")
    =>map:with("ml:sjsInputFlow",         "run-sjs-flow")
    =>map:with("ml:jobSearchResults",     "job-search")
    =>map:with("ml:traceSearchResults",   "trace-search")
    =>map:with("ml:traceUISearchResults", "trace-json")
    =>map:with("ml:prettifyXML",          "prettify");

declare private variable $system-transforms-50 := map:map();

declare private variable $system-resource-extensions-40 := map:map()
    =>map:with("ml:dbConfigs",              "db-configs")
    =>map:with("ml:debug",                  "debug")
    =>map:with("ml:deleteJobs",             "delete-jobs")
    =>map:with("ml:entity",                 "entity")
    =>map:with("ml:flow",                   "flow")
    =>map:with("ml:sjsFlow",                "sjsflow")
    =>map:with("ml:hubstats",               "hubstats")
    =>map:with("ml:hubversion",             "hubversion")
    =>map:with("ml:piiGenerator",           "pii-generator")
    =>map:with("ml:scaffoldContent",        "scaffold-content")
    =>map:with("ml:searchOptionsGenerator", "search-options-generator")
    =>map:with("ml:tracing",                "tracing")
    =>map:with("ml:validate",               "validate");

declare private variable $system-resource-extensions-50 := map:map()
=>map:with("ml:jobs",   "jobs")
=>map:with("ml:batches","batches");

declare function extut:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($extut:trace-id, ("restapi"))),

    $is-untraced
};

declare private variable $valid-extension-types := ("transform","resource");

declare private variable $function-cache := map:map();

declare function extut:establish-format(
    $headers as map:map,
    $params  as map:map,
    $allowed as xs:string*
) as xs:string
{
    let $format-param := map:get($params,"format")
    return
        if (exists($format-param)) then
            if (not($format-param = $allowed))
            then error((),"REST-INVALIDPARAM",(
                "only javascript, xquery and xslt allowed.  Received format: "||$format-param
                ))
            else $format-param
        else
            let $content-type := eput:get-inbound-content-type($params, $headers)
            let $format       :=
                if ($allowed = "xquery" and (
                    empty($content-type) or
                    $content-type = ("application/xquery","application/vnd.marklogic-xdmp")
                    ))
                then "xquery"
                else if ($allowed = "xslt" and $content-type = ("application/xslt+xml"))
                then "xslt"
                else if ($allowed = "javascript" and $content-type = ("application/javascript", "application/vnd.marklogic-javascript"))
                then "javascript"
                else error((),"RESTAPI-INVALIDMIMETYPE",(
                    if ($allowed = "xslt")
                    then "mime type must be application/xquery, application/vnd.marklogic-xdmp, or application/xslt+xml"
                    else if ($allowed = "javascript")
                    then "mime type must be application/javascript or application/vnd.marklogic-javascript"
                    else "mime type must be application/xquery or application/vnd.marklogic-xdmp",
                    $content-type,
                    ()
                    ))
            return (
                map:put($params,"format",$format),
                $format
                )
};

declare function extut:get-parse-format(
    $format as xs:string
) as xs:string
{
    if (empty($format) or $format eq "xquery")
    then "text"
    else if ($format eq "javascript")
    then "text" 
    else if ($format eq "xslt")
    then "xml" 
    else error((),"RESTAPI-INTERNALERROR",concat("unknown format: ",$format))
};

declare function extut:get-extension-name(
    $extension-type as xs:string,
    $params         as map:map
) as xs:string
{
    let $name := map:get($params,"name")
    return
        if (exists($name))
        then $name
        else error((),"RESTAPI-INVALIDREQ",concat(
            "cannot get ",$extension-type," extension without name"
            ))
};

declare function extut:install-extension(
    $extension-type as xs:string,
    $service-defs   as map:map,
    $extension-name as xs:string,
    $metadata       as element()*,
    $source-format  as xs:string,
    $source-doc     as document-node()
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    extut:check-extension-type($extension-type),

    let $wrapper-doc  :=
        switch($extension-type)
        case "resource"  return
            switch($source-format)
            case "javascript" return extut:javascript-wrapper-module($extension-type, $extension-name)
            default           return ()
        case "transform" return
            switch($source-format)
            case "javascript" return extut:javascript-wrapper-module($extension-type, $extension-name)
            case "xslt"       return extut:make-transform-wrapper($extension-name)
            default           return ()
        default          return ()
    let $base-uri     := extut:make-base-uri($extension-type,$extension-name)
    let $source-uri   := extut:make-source-uri($base-uri,$extension-type,$source-format)
    let $wrapper-uri  :=
        if (empty($wrapper-doc)) then ()
        else 
            (: new case, javascript wrapper :)
            (: and old case, xquery wrapper for xslt :)
            extut:make-source-uri($base-uri,$extension-type,"xquery")
    (: clean up from ML 6 :)
    let $manifest-uri := concat($base-uri,"manifest.xml")
    let $lib-extension :=
        switch($source-format)
        case "javascript" return ".sjs"
        case "xquery"     return ".xqy"
        default           return ()
    let $lib-uri      :=
        if (exists($lib-extension))
        then concat($base-uri,"lib/",$extension-type,$lib-extension)
        else ()
    let $success      := dbut:update-config(
        function() {
            let $uris := ($source-uri, $wrapper-uri)
            let $docs := ($source-doc, $wrapper-doc)
            for $i in 1 to count($uris)
            return extut:do-document-insert(
                subsequence($uris,$i,1),
                subsequence($docs,$i,1),
                (
                    xdmp:permission("rest-admin-internal",  "update"),
                    xdmp:permission("rest-extension-user", "execute"),
                    xdmp:permission("rest-extension-user", "read"),
                    xdmp:permission("rest-reader-internal", "execute"),
                    xdmp:permission("rest-reader-internal", "read"),
                    (: backward compatability for ML 6 and 7.0-2 :)
                    (: for backward compatability with ML 6 :)
                    xdmp:permission("application-plugin-registrar", "update"),
                    xdmp:permission("application-plugin-registrar", "read"),
                    xdmp:permission("application-plugin-registrar", "execute")
                    ),
                (),
                (),
                ()
                ),

            (: clean up from ML 6 :)
            if (not(doc-available($manifest-uri))) then ()
                else extut:do-document-delete($manifest-uri),
            if (empty($lib-uri) or not(doc-available($lib-uri))) then ()
                else extut:do-document-delete($lib-uri),

            true()
            }
        )
    return
        if (not($success)) then false()
        else extut:refresh-extension(
            $extension-type,$service-defs,$extension-name,$metadata,
            $source-format,$base-uri,($wrapper-uri,$source-uri)[1]
            )
};

declare private function extut:refresh-extension(
    $extension-type as xs:string,
    $service-defs   as map:map,
    $extension-name as xs:string,
    $metadata       as element()*,
    $source-format  as xs:string,
    $base-uri       as xs:string,
    $source-uri     as xs:string
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    let $metadata-uri := extut:make-metadata-uri($base-uri)
    let $source-ns    := extut:get-extension-namespace($extension-type,$extension-name)
    let $error-list   := json:array()
    return (
        if ($source-format eq "javascript") then
            let $services := extut:extract-javascript-services(
                $service-defs,$extension-name,replace($source-uri,".xqy",".sjs"),$error-list
                )
            return (
                if (count($services) gt 0) then ()
                else json:array-push($error-list,concat(
                    $extension-name,
                    " either is not a valid JavaScript module or does not export functions (",
                    string-join(map:keys($service-defs),", "),")")),
                let $success := (
                    extut:write-extension-metadata(
                        $extension-type,$extension-name,$metadata,$source-format,
                        $services,$error-list,$metadata-uri
                        )
                    )
                return $success
                )
        else if ($source-format eq "xquery") then
            let $services := extut:extract-xquery-services(
                $service-defs,$extension-name,$source-ns,$source-uri,$error-list
                )
            return (
                if (count($services) gt 0) then ()
                else json:array-push($error-list,concat(
                    $extension-name,
                    " either is not a valid module or does not provide extension functions (",
                    string-join(map:keys($service-defs),", "),") in the ",
                    $source-ns," namespace"
                    )),
 
                let $success := (
                    extut:write-extension-metadata(
                        $extension-type,$extension-name,$metadata,$source-format,
                        $services,$error-list,$metadata-uri
                        )
                    )
                return $success
                )
        else if ($source-format eq "xslt") then (
            let $success := try {
                extut:do-eval(concat('xquery version "1.0-ml";
import module namespace test = "', $source-ns, '" at "', $source-uri, '";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";
let $context as map:map         := map:map()
let $params  as map:map         := map:map()
let $content as document-node() := document {<input/>}
let $result  as document-node() := test:transform($context,$params,$content)
return $result
'),
                    (),
                    <options xmlns="xdmp:eval">
                        <static-check>true</static-check>
                        <ignore-amps>true</ignore-amps>
                    </options>
                    ),
                true()
            } catch($e) {
                xdmp:log($e),
                json:array-push($error-list,concat(
                    "could not parse XSLT extension ",$extension-name,
                    "; please see the server error log for detail ",
                    $e/error:format-string!string(.)
                    ))
            }
            return
                if (empty($success))
                then false()
                else extut:write-extension-metadata(
                    $extension-type,$extension-name,$metadata,$source-format,
                    "transform",$error-list,$metadata-uri
                    )
            )
        else error((),"RESTAPI-INTERNALERROR",concat(
            "unsupported source type: ",$source-format
            )),

        if (json:array-size($error-list) eq 0) then ()
        else error((),"RESTAPI-INVALIDCONTENT",concat(
            "invalid ",$extension-name," extension: ",
            string-join(json:array-values($error-list,true()), "; ")
            ))
        )
};

declare function extut:uninstall-extension(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $check          as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    let $extension-base := extut:make-base-uri($extension-type,$extension-name)
    let $metadata-uri   :=
        if (not($check = "exists")) then ()
        else extut:make-metadata-uri(
            extut:make-base-uri($extension-type,$extension-name)
            )
    return dbut:update-config(
            function() {
                extut:do-directory-delete(
                    $extension-type,$extension-name,$extension-base,$metadata-uri
                    )
                }
            )
};

declare function extut:extension-exists(
    $extension-type as xs:string,
    $extension-name as xs:string
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $metadata-uri := extut:make-metadata-uri(
        extut:make-base-uri($extension-type,$extension-name)
        )
    return dbut:access-config(
            function() {
                doc-available($metadata-uri)
                }
            )
};

declare function extut:list-extension-metadata(
    $extension-type as xs:string,
    $service-defs   as map:map?,
    $with-refresh   as xs:boolean
) as document-node()*
{
    extut:do-list-extension-metadata($extension-type,$service-defs,$with-refresh)
};

declare function extut:get-extension-metadata(
    $extension-type as xs:string,
    $extension-name as xs:string
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    let $metadata-uri := extut:make-metadata-uri(
        extut:make-base-uri($extension-type,$extension-name)
        )
    return (
        if ($is-untraced or extut:check-untraced()) then ()
        else lid:log(
            $extut:trace-id,"get-extension-metadata",map:entry("metadata-uri",$metadata-uri)
            ),

        dbut:access-config(
            function() {
                doc($metadata-uri)
                }
            )
        )
};

declare function extut:get-extension-source-document(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $source-formats as xs:string+
) as document-node()?
{
    let $found :=
        extut:get-extension-source($extension-type,$extension-name,$source-formats)
    return
        if (count($found) lt 2) 
        then 
           error((), "RESTAPI-NODOCUMENT", ("No extension with name " || $extension-name || " found."))
        else tail($found)
};

declare function extut:get-extension-source(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $source-formats as xs:string+
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    let $base-uri := extut:make-base-uri($extension-type,$extension-name)
    return (
        if ($is-untraced or extut:check-untraced()) then ()
        else lid:log(
            $extut:trace-id,"get-extension-source",
            map:entry("base-uri",$base-uri)
            =>map:with("extension-type",$extension-type)
            =>map:with("source-formats",$source-formats)
            ),

        dbut:access-config(
            function() {
                let $found := subsequence(
                    for $source-format in $source-formats
                    let $source-uri :=
                        extut:make-source-uri($base-uri,$extension-type,$source-format) 
                    return
                        if (not(doc-available($source-uri))) then ()
                        else ($source-format, $source-uri),
                    1,
                    2
                    )
                return
                    if (empty($found)) then ()
                    else (head($found), doc(tail($found)))
                }
            )
        )
};

declare function extut:get-extension-function(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $function-name  as xs:string
) as xdmp:function?
{
    if ($extension-type eq "transform-all") then
        let $source-format := try {
            xdmp:apply(
                extut:get-extension-function(
                    "transform",$extension-name,"source-format","xquery"
                    )
                )
            } catch($e) { }
        return
            if ($source-format eq "javascript")
            then extut:transform-all-js($extension-name, ?, ?)
            else extut:transform-all(
                extut:get-extension-function(
                    "transform",$extension-name,$function-name,"xquery"
                    ),
                ?,
                ?)
    else extut:get-extension-function(
        $extension-type,$extension-name,$function-name,"xquery"
        )
};

declare private function extut:get-extension-function(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $function-name  as xs:string,
    $source-format  as xs:string
) as xdmp:function?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $fkey    := string-join(($extension-type,$extension-name,$function-name),"/")
    let $fcached := map:get($function-cache,$fkey)
    return
        if (exists($fcached))
        then $fcached
        else
            let $system-module :=
                if ($extension-type eq "transform")
                then
                  let $_ := map:get($system-transforms-40,$extension-name)
                  return
                    if (fn:empty($_)) then
                      ("5", map:get($system-transforms-50,$extension-name))
                    else ("4", $_)
                else
                  let $_ := map:get($system-resource-extensions-40,$extension-name)
                  return
                    if (fn:empty($_)) then
                      ("5" , map:get($system-resource-extensions-50,$extension-name))
                    else ("4", $_)
            let $function    :=
                if (empty($system-module))
                then xdmp:function(
                    if ($source-format eq "xquery")
                        then QName(extut:get-extension-namespace($extension-type,$extension-name), $function-name)
                        else xs:QName($function-name),
                    extut:make-source-uri(
                        extut:make-base-uri($extension-type,$extension-name), $extension-type, $source-format
                        )
                    )
                else if ($extension-type eq "transform")
                then xdmp:function(
                    QName(concat("http://marklogic.com/rest-api/transform/",$system-module[2]), $function-name),
                    concat("/data-hub/", $system-module[1] , "/transforms/",$system-module[2],".xqy")
                    )
                else  xdmp:function(
                    QName(concat("http://marklogic.com/rest-api/extensions/",$system-module[2]), $function-name),
                    concat("/data-hub/", $system-module[1]  , "/extensions/",$system-module[2],".xqy")
                    )
            return (
                if (empty($function)) then ()
                else map:put($function-cache,$fkey,$function),

                $function
                )
};

declare function extut:make-transform-wrapper(
    $transform-name as xs:string
) as document-node()
{
    let $transform-uri := extut:get-source-uri("transform",$transform-name,"xslt")
    let $transform-ns  := extut:get-extension-namespace("transform",$transform-name)
    return document {text {concat('xquery version "1.0-ml";
module namespace ',$transform-name,' = "',$transform-ns,'";
import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";
declare namespace xsl = "http://www.w3.org/1999/XSL/Transform";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";
declare private variable $transform-uri := "',$transform-uri,'";
declare function ',$transform-name,':transform(
    $context as map:map,
    $params  as map:map,
    $content as document-node()
) as document-node()?
{
    extut:execute-transform($transform-uri,$context,$params,$content)
};
'       )}}
};

declare function extut:execute-transform(
    $transform as item(),
    $context   as map:map,
    $params    as map:map,
    $content   as document-node()  
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"execute-transform",
        map:entry("transform",$transform)=>map:with("context",$context)
        =>map:with("params",$params),
        map:entry("content",$content)
        ),

    let $map := map:entry("context", $context)
        => map:with("params",  $params)
    return
        typeswitch($transform)
        case xs:string return xdmp:xslt-invoke($transform,$content,$map,
            <options xmlns="xdmp:eval">
                <ignore-amps>true</ignore-amps>
            </options>)
        (: backward compatibility where wrapper contains transform :)
        case element() return xdmp:xslt-eval($transform,$content,$map,
            <options xmlns="xdmp:eval">
                <ignore-amps>true</ignore-amps>
            </options>)
        default        return error((),"RESTAPI-INTERNALERROR",concat(
                "unsupported transform type: ",xdmp:describe($transform)
            ))
};

declare function extut:get-extension-namespace(
    $extension-type as xs:string,
    $extension-name as xs:string
) as xs:string
{
    concat("http://marklogic.com/rest-api/",$extension-type,"/",$extension-name)
};

declare function extut:get-source-uri(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $source-format  as xs:string
) as xs:string
{
    extut:make-source-uri(
        extut:make-base-uri($extension-type,$extension-name),
        $extension-type,
        $source-format
        )
};

declare private function extut:check-extension-type(
    $extension-type as xs:string
) as empty-sequence()
{
    if ($extension-type = $valid-extension-types) then ()
    else error((),"RESTAPI-INTERNALERROR",concat(
            "unsupported extension-type: ",$extension-type
            ))
};

declare private function extut:make-extension-type-uri(
    $extension-type as xs:string
) as xs:string
{
    concat("/marklogic.rest.",$extension-type,"/")
};

declare private function extut:make-base-uri(
    $extension-type as xs:string,
    $extension-name as xs:string
) as xs:string
{
    concat("/marklogic.rest.",$extension-type,"/",$extension-name,"/")
};

declare private function extut:make-metadata-uri(
    $base-uri as xs:string
) as xs:string
{
    concat($base-uri,"assets/metadata.xml")
};

declare private function extut:make-source-uri(
    $base-uri       as xs:string,
    $extension-type as xs:string,
    $source-format  as xs:string
) as xs:string
{
    concat($base-uri,"assets/",$extension-type,".",
        switch($source-format)
        case "xquery"     return "xqy"
        case "xslt"       return "xsl"
        case "javascript" return "sjs"
        default           return error((),"RESTAPI-INTERNALERROR",concat(
            "could not specify extension for unknown source type: ",$source-format
            ))
        )
};

declare private function extut:extract-metadata(
    $desc-root as element()
) as element()*
{
    let $filter := (
        xs:QName("rapi:name"),
        xs:QName("rapi:source-format"),
        xs:QName("rapi:method"),
        xs:QName("rapi:errors")
        )
    return $desc-root/*[not(node-name(.) = $filter)]
};

declare private function extut:extract-xquery-services(
    $service-defs   as map:map,
    $extension-name as xs:string,
    $source-ns      as xs:string,
    $xquery-uri     as xs:string,
    $error-list     as json:array
) as xs:string*
{
    (: TODO: rewrite as xdmp:invoke-function() :)
    try {
        extut:do-eval(concat('xquery version "1.0-ml";
import module namespace test = "', $source-ns, '" at "', $xquery-uri, '";
declare namespace rapi = "http://marklogic.com/rest-api";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare variable $service-defs   as map:map    external;
declare variable $extension-name as xs:string  external;
declare variable $source-ns      as xs:string  external;
declare variable $xquery-uri     as xs:string  external;
declare variable $error-list     as json:array external;
declare option xdmp:mapping "false";
for $service-name in map:keys($service-defs)
let $service-def  := map:get($service-defs,$service-name)
let $sreturn-type := head($service-def)
let $sparam-types := tail($service-def)
let $function     := function-lookup(
    QName($source-ns,$service-name), count($sparam-types)
    )
where exists($function)
return
    if (0 lt count((
        (: overloads are not a problem because xdmp:apply() binds on arity :)

        for $sparam-type at $i in $sparam-types
        let $fparam-type  := xdmp:function-parameter-type($function,$i)
        (: match the specified cardinality or any valid narrowing :)
        let $sparam-len   := string-length($sparam-type)
        let $last-char    := substring($sparam-type, $sparam-len, 1)
        let $sparam-match :=
            switch ($last-char)
            case "?" return
                let $root := substring($sparam-type, 1, $sparam-len - 1)
                return ($sparam-type, $root)
            case "+" return
                let $root := substring($sparam-type, 1, $sparam-len - 1)
                return ($root, $sparam-type)
            case "*" return
                let $root := substring($sparam-type, 1, $sparam-len - 1)
                return ($root||"?", $root, $sparam-type, $root||"+")
            default return
                $sparam-type
        return
            if ($fparam-type = $sparam-match) then ()
            else (
                json:array-push($error-list,concat(
                    "in ",$service-name," function of ",$extension-name," extension, ",
                    " parameter ",$i," named ",xdmp:function-parameter-name($function,$i),
                    " has ",$fparam-type," instead of ",$sparam-type," datatype"
                    )),
                1
                ),

        let $freturn-type  := xdmp:function-return-type($function)
        let $sreturn-len   := string-length($sreturn-type)
        let $last-char     := substring($sreturn-type, $sreturn-len, 1)
        let $sreturn-match :=
            (: valid narrowing of cardinality :)
            switch ($last-char)
            case "?" return
                let $root := substring($sreturn-type, 1, $sreturn-len - 1)
                return ($sreturn-type, $root)
            case "+" return
                let $root := substring($sreturn-type, 1, $sreturn-len - 1)
                return ($root, $sreturn-type)
            case "*" return
                let $root := substring($sreturn-type, 1, $sreturn-len - 1)
                return ($root||"?", $root, $sreturn-type, $root||"+")
            default return
                $sreturn-type
        return
            if ($freturn-type = $sreturn-match) then ()
            else (
                json:array-push($error-list,concat(
                    "in ",$service-name," function of ",$extension-name," extension, ",
                    " returns ",$freturn-type," instead of ",$sreturn-type," datatype"
                    )),
                1
                ),

        let $txn-mode := xdmp:annotation($function, xs:QName("rapi:transaction-mode"))
        return
            if (empty($txn-mode) or $txn-mode = ("query","update")) then ()
            else (
                json:array-push($error-list,concat(
                    "in ",$service-name," function of ",$extension-name," extension, ",
                    " annotation declares unknown transaction-mode ",$txn-mode
                    )),
                1
                )
        )))
    then ()
    else $service-name
'),

(: TODO: generate metadata from optional annotations for metadata and parameters (like Roxy) :)
        (
            xs:QName("service-defs"),   $service-defs,
            xs:QName("extension-name"), $extension-name,
            xs:QName("source-ns"),      $source-ns,
            xs:QName("source-uri"),     $xquery-uri,
            xs:QName("error-list"),     $error-list
            ),
        ()
        )
    } catch($e) {
        xdmp:log($e),
        json:array-push($error-list,concat(
            "could not parse XQuery extension ",$extension-name,
            "; please see the server error log for detail ",
            $e/error:format-string!string(.)
            ))
    }
};

declare private function extut:extract-javascript-services(
    $service-defs   as map:map,
    $extension-name as xs:string,
    $source-uri     as xs:string,
    $error-list     as json:array
) as xs:string*
{
    (: first test, list contents of js extension :)
    (: but even before that, allor to go through :)
    try {
        for $key in map:keys(extut:do-js-eval(
            'require("' || $source-uri || '")', (), ()
            ))
        (: javascript uses upper case module names to export functions :)
        return lower-case($key)
    } catch ($e) {
        xdmp:log($e),
        json:array-push($error-list,concat(
            "could not parse JavaScript extension ",$extension-name,
            "; please see the server error log for detail ",
            $e/error:format-string!string(.)
            ))
    }
};

declare private function extut:write-extension-metadata(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $metadata       as element()*,
    $source-format  as xs:string,
    $services       as xs:string*
) as xs:boolean
{
    let $metadata-uri := extut:make-metadata-uri(
        extut:make-base-uri($extension-type,$extension-name)
        )
    return extut:write-extension-metadata(
        $extension-type,$extension-name,$metadata,$source-format,
        $services,(),$metadata-uri
        )
};

declare private function extut:write-extension-metadata(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $metadata       as element()*,
    $source-format  as xs:string,
    $services       as xs:string*,
    $error-list     as json:array?,
    $metadata-uri   as xs:string
) as xs:boolean
{
    dbut:update-config(
        function() {
            let $all-metadata :=
                if (exists($metadata))
                        then $metadata
                        else if (doc-available($metadata-uri))
                        then doc($metadata-uri)!extut:extract-metadata(rapi:*)
                        else ()
            return extut:do-metadata-insert(
                    $metadata-uri,
                    extut:make-metadata-doc(
                        $extension-type,$extension-name,$all-metadata,
                        $source-format,$services,$error-list
                        )
                    ),

                true()
            }
        )
};

declare function extut:invoke-service(
    $extension-name   as xs:string,
    $method           as xs:string,
    $default-txn-mode as xs:string?,
    $service          as xdmp:function,
    $context          as map:map,
    $service-params   as map:map,
    $input            as document-node()*,
    $in-txn           as xs:boolean
) as map:map
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    try {
        let $txn-curr :=
            if ($in-txn) then ()
            else if (empty(xdmp:request-timestamp()))
            then "update"
            else "query"
        let $txn-mode :=
            if ($in-txn) then ()
            else head((
                xdmp:annotation($service, xs:QName("rapi:transaction-mode")),
                $default-txn-mode,
                $txn-curr
                ))
        return (
            if ($is-untraced or extut:check-untraced()) then ()
            else lid:log(
                $extut:trace-id,"invoke-service",
                map:entry("extension-name",$extension-name)=>map:with("method",$method)
                =>map:with("context",$context)=>map:with("service-params",$service-params)
                =>map:with("default-txn-mode",$default-txn-mode)=>map:with("in-txn",$in-txn)
                =>map:with("txn-curr",$txn-curr)=>map:with("txn-mode",$txn-mode),
                map:entry("input",$input)
                ),

            xdmp:invoke-function(
                function() {
                    extut:call-service(
                        $extension-name,$method,$service,$context,$service-params,$input
                        )
                    },
                if ($in-txn or $txn-mode eq $txn-curr) then
                    <options xmlns="xdmp:eval">
                        <isolation>same-statement</isolation>
                        <ignore-amps>true</ignore-amps>
                    </options>
                else
                    <options xmlns="xdmp:eval">
                        <isolation>different-transaction</isolation>
                        <ignore-amps>true</ignore-amps>
                        <commit>auto</commit>
                        <update>{string($txn-mode eq "update")}</update>
                    </options>
                )
            )
        } catch ($e) {
            if ($e/error:code/string() eq "XDMP-MODNOTFOUND")
            then error((), "RESTAPI-INVALIDREQ", concat(
                "Extension ",$extension-name," or a dependency does not exist",
                $e/error:format-string!concat(": ", string(.))
                ))
            else (
                xdmp:log($e, "debug"),
                xdmp:rethrow()
                )
        }
};

declare private function extut:call-service(
    $extension-name as xs:string,
    $method         as xs:string,
    $service        as xdmp:function,
    $context        as map:map,
    $service-params as map:map,
    $input          as document-node()*
) as map:map
{
    extut:make-output(
        $context,
        switch ($method)
        case "TRANSFORM-ALL" return $service($context,$service-params)
        case "TRANSFORM"     return $service($context,$service-params,$input)
        case "DELETE"        return $service($context,$service-params)
        case "GET"           return $service($context,$service-params)
        case "POST"          return $service($context,$service-params,$input)
        case "PUT"           return $service($context,$service-params,$input)
        default              return error((),"RESTAPI-INTERNALERROR",concat(
            "unknown method ",$method," for call on resource ",$extension-name
            ))
        )
};

declare private function extut:transform-all(
    $func    as xdmp:function,
    $context as map:map,
    $params  as map:map
) as map:map
{
    map:entry("response",
        for $request in map:get($context,"requests")
        let $context := map:get($request,"context")
        return extut:make-output(
            $context,
            xdmp:apply($func, $context, $params, map:get($request,"input"))
            )
        )
};

declare private function extut:transform-all-js(
    $extension-name as xs:string,
    $context        as map:map,
    $params         as map:map
) as map:map
{
    xdmp:apply(
        xdmp:function(
            xs:QName("applyList"), "../lib/extensions-util.sjs"
            ),
        $extension-name,
        extut:make-source-uri(
            extut:make-base-uri("transform",$extension-name), "transform", "javascript"
            ),
        "transform",
        map:get($context,"requests"),
        $params
        )
};

declare private function extut:make-output(
    $context as map:map,
    $results as item()*
) as map:map
{
    if (empty($results))
    then map:entry("context", $context)
    (: extension already created the return :)
    else if (count($results) gt 1 or not($results instance of map:map))
    then extut:put-result(map:entry("context", $context), $results)
    else if (map:contains($results,"context"))
    then extut:put-result($results, map:get($results,"result"))
    else if (map:contains($results,"response"))
    then $results
    else extut:put-result(map:entry("context", $context), $results)
};
declare private function extut:put-result(
    $output  as map:map,
    $results as item()*
) as map:map
{
    if (empty($results))
    then $output
    else
        typeswitch(head($results))
        case document-node() return
            map:with($output,"result",$results)
        case json:array return
            map:with($output,"result",
                for $result in $results
                return document { xdmp:to-json($result) }
                )
        case json:object return
            map:with($output,"result",
                for $result in $results
                return document { xdmp:to-json($result) }
                )
        default return
            map:with($output,"result",
                for $result in $results
                return document { $result }
                )
};

declare private function extut:do-eval(
    $xquery  as xs:string,
    $vars    as item()*,
    $options as node()?
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-eval",
        map:entry("xquery",$xquery)=>map:with("vars",$vars)=>map:with("options",$options)
        ),

    if (exists($options))
    then xdmp:eval($xquery,$vars,$options)
    else if (exists($vars))
    then xdmp:eval($xquery,$vars)
    else xdmp:eval($xquery)
};

declare private function extut:do-js-eval(
    $code    as xs:string,
    $vars    as item()*,
    $options as node()?
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-js-eval",
        map:entry("code",$code)=>map:with("vars",$vars)=>map:with("options",$options)
        ),

    if (exists($options))
    then xdmp:javascript-eval($code,$vars,$options)
    else if (exists($vars))
    then xdmp:javascript-eval($code,$vars)
    else xdmp:javascript-eval($code)
};

declare private function extut:make-metadata-doc(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $metadata       as element()*,
    $source-format  as xs:string,
    $services       as xs:string*,
    $error-list     as json:array?
) as document-node()
{
    let $methods-name     := xs:QName("rapi:methods")
    let $methods-metadata := $metadata[node-name(.) eq $methods-name]
    return
        document {
            element {xs:QName(concat("rapi:",$extension-type,"-metadata"))} {
                <rapi:name>{$extension-name}</rapi:name>,
                <rapi:source-format>{$source-format}</rapi:source-format>,

                if (empty($metadata)) then ()
                else if (exists($methods-metadata))
                then ($metadata except $methods-metadata)
                else $metadata,

                if ($extension-type eq "transform") then ()
                else if ($extension-type eq "resource") then
                    <rapi:methods>{
                        for $service in $services
                        let $method := $methods-metadata /
                            rapi:method[string(rapi:method-name) eq $service]
                        return
                            if (exists($method))
                            then $method
                            else
                                <rapi:method>
                                    <rapi:method-name>{$service}</rapi:method-name>
                                </rapi:method>
                    }</rapi:methods>
                else error((),"RESTAPI-INTERNALERROR",concat(
                    "unsupported extension type: ",$extension-type
                    )),

                if (empty($error-list) or json:array-size($error-list) eq 0) then ()
                else
                    <rapi:errors>{
                        for $error in json:array-values($error-list)
                        return <rapi:error>{$error}</rapi:error>
                    }</rapi:errors>
                }
            }
};

declare private function extut:do-metadata-insert(
    $metadata-uri as xs:string,
    $metadata-doc as document-node()
) as empty-sequence()
{
    extut:do-document-insert(
        $metadata-uri,
        $metadata-doc,
        (
            xdmp:permission("rest-extension-user", "update"),
            xdmp:permission("rest-extension-user", "read"),
            (: backward compatability for ML 6 and 7.0-2 :)
            xdmp:permission("rest-reader", "execute"),
            (: for backward compatability with ML 6 :)
            xdmp:permission("application-plugin-registrar", "update"),
            xdmp:permission("application-plugin-registrar", "read")
            ),
        (),
        (),
        ()
        )
};

declare private function extut:do-document-insert(
    $uri         as xs:string,
    $root        as node(),
    $permissions as element(sec:permission)*,
    $collections as xs:string*,
    $quality     as xs:int?,
    $forest-ids  as xs:unsignedLong*
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-document-insert",
        map:entry("uri",$uri)=>map:with("permissions",$permissions)
        =>map:with("collections",$collections)=>map:with("quality",$quality)
        =>map:with("forest-ids",$forest-ids),
        map:entry("root",$root)
        ),

    if (exists($forest-ids))
    then xdmp:document-insert($uri,$root,$permissions,$collections,$quality,$forest-ids)
    else if (exists($quality))
    then xdmp:document-insert($uri,$root,$permissions,$collections,$quality)
    else if (exists($collections))
    then xdmp:document-insert($uri,$root,$permissions,$collections)
    else xdmp:document-insert($uri,$root,$permissions)
};

declare private function extut:do-document-delete(
    $uri as xs:string
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-document-delete",map:entry("uri",$uri)
        ),

    xdmp:document-delete($uri)
};

declare private function extut:do-directory-delete(
    $extension-type as xs:string,
    $extension-name as xs:string,
    $uri            as xs:string,
    $metadata-uri   as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-directory-delete",
        map:entry("uri",$uri)=>map:with("metadata-uri",$metadata-uri)
        ),

    if (empty($metadata-uri) or doc-available($metadata-uri))
    then xdmp:directory-delete($uri)
    else error((),"RESTAPI-NOTFOUND",concat(
        $extension-type," extension does not exist: ",$extension-name
        ))
};

declare private function extut:do-list-extension-metadata(
    $extension-type as xs:string,
    $service-defs   as map:map?,
    $with-refresh   as xs:boolean
) as document-node()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or extut:check-untraced()) then ()
    else lid:log(
        $extut:trace-id,"do-list-extension-metadata",
        map:entry("extension-type",$extension-type)
        ),

    let $meta-docs := dbut:access-config(
        function() {
            cts:search(
                collection(),
                cts:and-query((
                    cts:directory-query(
                        extut:make-extension-type-uri($extension-type),
                        "infinity"
                        ),
                    cts:element-query(
                        xs:QName(concat("rapi:",$extension-type,"-metadata")),
                        cts:and-query(())
                        )
                    )),
                ("unfiltered", "score-zero", "unchecked", "unfaceted"),
                0
                )
            }
        )
    return
        if (empty($meta-docs) or empty($service-defs) or not($with-refresh))
        then $meta-docs
        else
            let $xquery-docs  :=
                $meta-docs[rapi:*/rapi:source-format/string(.) eq "xquery"]
            let $xslt-docs    := $meta-docs except $xquery-docs
            let $error-map    := map:map()
            let $services-map := map:map()
            return (
                for $xquery-doc in $xquery-docs
                let $doc-uri        := document-uri($xquery-doc)
                let $extension-name := $xquery-doc/rapi:*/rapi:name/string(.)
                let $error-list     := json:array()
                let $services       := extut:extract-xquery-services(
                        $service-defs,
                        $extension-name,
                        extut:get-extension-namespace(
                            $extension-type,$extension-name
                            ),
                        extut:make-source-uri(
                            extut:make-base-uri($extension-type,$extension-name),
                            $extension-type,
                            "xquery"
                            ),
                        $error-list
                        )
                return (
                    if (json:array-size($error-list) eq 0) then ()
                    else map:put($error-map,$doc-uri,$error-list),

                    if (empty($services)) then ()
                    else map:put($services-map,$doc-uri,$services)
                    ),

                $xslt-docs,

                extut:do-refresh-extension-metadata(
                    $extension-type,$services-map,$error-map,$xquery-docs
                    )
                )
};

declare private function extut:do-refresh-extension-metadata(
    $extension-type as xs:string,
    $services-map   as map:map,
    $error-map      as map:map,
    $xquery-docs    as document-node()*
) as document-node()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if (empty($xquery-docs)) then ()
    else hof:apply-in(
            xdmp:modules-database(),
            0,
            function() {
                for $xquery-doc in $xquery-docs
                let $doc-uri  := document-uri($xquery-doc)
                let $doc-root := $xquery-doc/rapi:*
                let $refresh  := extut:make-metadata-doc(
                        $extension-type,
                        $doc-root/rapi:name/string(.),
                        extut:extract-metadata($doc-root),
                        $doc-root/rapi:source-format/string(.),
                        map:get($services-map,$doc-uri),
                        map:get($error-map,$doc-uri)
                        )
                return (
                    extut:do-metadata-insert($doc-uri,$refresh),

                    $refresh
                    )
                },
            "update-auto-commit"
            )
};

(: for backward compatibility :)
declare function extut:make-javascript-wrapper(
    $func-name   as xs:string,
    $module-path as xs:string
)
{
    if ($func-name = ("GET", "DELETE"))
    then function(
            $context as map:map,
            $params  as map:map
        ) as map:map {
            xdmp:apply(
                xdmp:function(
                    xs:QName("applyOnce"), "../lib/extensions-util.sjs"
                    ),
                (), $module-path, $func-name, $context, $params, ()
            )
        }
    else function(
            $context as map:map,
            $params  as map:map,
            $input   as item()*
        ) as map:map {
            xdmp:apply(
                xdmp:function(
                    xs:QName("applyOnce"), "../lib/extensions-util.sjs"
                    ),
                (), $module-path, $func-name, $context, $params, $input
            )
        }
};

declare private function extut:javascript-wrapper-module(
    $extension-type as xs:string,
    $extension-name as xs:string
) as document-node()
{
    let $base-uri     := extut:make-base-uri($extension-type,$extension-name)
    let $module-uri   := extut:make-source-uri($base-uri,$extension-type,"javascript")
    let $extension-ns := extut:get-extension-namespace($extension-type,$extension-name)
    let $module-body  := string(<case>xquery version "1.0-ml";
module namespace {$extension-name} = "{$extension-ns}";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "{$extension-name}";
declare private variable $modPath := "{$module-uri}";
declare private variable $caller  := xdmp:function(
    xs:QName("applyOnce"), "../lib/extensions-util.sjs"
    );

declare function {$extension-name}:source-format() as xs:string {{
    "javascript"
}};
declare function {$extension-name}:get(
    $context as map:map, $params as map:map
) as map:map {{
    xdmp:apply($caller,$extName,$modPath,"GET",$context,$params)
}};
declare function {$extension-name}:delete(
    $context as map:map, $params as map:map
) as map:map {{
    xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params)
}};
declare function {$extension-name}:post(
    $context as map:map, $params as map:map, $input as document-node()*
) as map:map {{
    xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input)
}};
declare function {
    $extension-name}:put($context as map:map, $params as map:map, $input as document-node()*
) as map:map {{
    xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input)
}};
declare function {$extension-name}:transform(
    $context as map:map, $params as map:map, $input as document-node()?
) as map:map {{
    xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
}};
</case>)
    return document { $module-body }
};
