xquery version "1.0-ml";
(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace errut = "http://marklogic.com/rest-api/lib/error-util";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $errut:trace-id := "restapi.errors";

declare private variable $is-untraced := ();

declare function errut:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($errut:trace-id, ("restapi"))),

    $is-untraced
};

(: special semi-error case that should perform well :)
declare variable $errut:not-found-handler := 
    <error>
        <code>XDMP-DOCNOTFOUND</code>
        <code>RESTAPI-NODOCUMENT</code>
        <code>RESTAPI-NOTFOUND</code>
        <code>PLUGIN-NOTREGISTERED</code>
        <status>404</status>
        <message>Not Found</message>
        <function>errut:render-404</function> 
    </error>;

(: in alpha order to avoid duplicates :)
declare variable $errut:handlers := 
<errors>
    <error>
        <code>OPTIC-INVALARGS</code>
        <code>PARSE-EXPR</code>
        <code>PLUGIN-BADMANIFEST</code>
        <code>REST-INVALIDPARAM</code>
        <code>REST-INVALIDTYPE</code>
        <code>REST-REQUIREDPARAM</code>
        <code>REST-REPEATEDPARAM</code>
        <code>REST-UNSUPPORTEDPARAM</code>
        <code>RESTAPI-INVALIDCONTENT</code>
        <code>RESTAPI-INVALIDREQ</code>
        <code>RESTAPI-INVALIDRESULT</code>
        <code>RESTAPI-UNSUPPORTEDPROP</code>
        <code>SEARCH-BADORDERBY</code>
        <code>SEARCH-INVALAGGREGATE</code>
        <code>SEARCH-INVALARGS</code>
        <code>SEC-PERMDENIED</code>
        <code>SEC-ROLEDNE</code>
        <code>SEC-TEMPORALDOC</code>
        <code>SEC-URIPRIV</code>
        <code>SEM-SYNTAXERROR</code>
        <code>SEM-INCOMPATIBLE</code>
        <code>SEM-NOTRDF</code>
        <code>TEMPORAL-AXISINUSE</code>
        <code>TEMPORAL-AXISNOTFOUND</code>
        <code>TEMPORAL-BADLSQT</code>
        <code>TEMPORAL-BADTIMEASTAMP</code>
        <code>TEMPORAL-CONFLICTINGOPTIONS</code>
        <code>TEMPORAL-CONFLICTINGURIS</code>
        <code>TEMPORAL-CANNOT-URI</code>
        <code>TEMPORAL-COLLECTIONLATEST</code>
        <code>TEMPORAL-COLLECTIONNOTEMPTY</code>
        <code>TEMPORAL-COLLECTIONNOTFOUND</code>
        <code>TEMPORAL-COLLECTIONURI</code>
        <code>TEMPORAL-COLLECTIONTEMPORAL</code>
        <code>TEMPORAL-DUPAXIS</code>
        <code>TEMPORAL-DUPCOLLECTION</code>
        <code>TEMPORAL-EMPTYCOLLECTIONNAME</code>
        <code>TEMPORAL-GTLSQT</code>
        <code>TEMPORAL-INVALIDDURATION</code>
        <code>TEMPORAL-INVALIDEXPTIME</code>
        <code>TEMPORAL-LSQTAUTOMATIONOFF</code>
        <code>TEMPORAL-LSQT-AUTOMATION-OFF</code>
        <code>TEMPORAL-MANAGED-METADATA</code>
        <code>TEMPORAL-NOLSQT</code>
        <code>TEMPORAL-NONDATETIME</code>
        <code>TEMPORAL-NOTDOCURI</code>
        <code>TEMPORAL-NOTINCOLLECTION</code>
        <code>TEMPORAL-NOTSYSTEMORVALID</code>
        <code>TEMPORAL-NOVALID</code>
        <code>TEMPORAL-OPNOTAFTERLSQT</code>
        <code>TEMPORAL-PERIOD-START-GE-END</code>
        <code>TEMPORAL-PROTECTED</code>
        <code>TEMPORAL-SAMEDOCURI</code>
        <code>TEMPORAL-SAME-AXIS</code>
        <code>TEMPORAL-SYSTEMTIME-BACKWARDS</code>
        <code>TEMPORAL-SYSTIME-MUSTGETAFTERSET</code>
        <code>TEMPORAL-TEMPORALDOCURINOTFOUND</code>
        <code>TEMPORAL-UPDATEBEFOREVERSIONURI</code>
        <code>TEMPORAL-URIALREADYEXISTS</code>
        <code>TEMPORAL-URIEXISTS</code>
        <code>TEMPORAL-UNPROTECTED</code>
        <code>TEMPORAL-VALIDTIME-START-GE-END</code>
        <code>XDMP-ARGTYPE</code>
        <code>XDMP-CHILDNODEKIND</code>
        <code>XDMP-CHILDUNNAMED</code>
        <code>XDMP-CONFLICTINGUPDATES</code>
        <code>XDMP-COLLXCNNOTFOUND</code>
        <code>XDMP-DATABASEDISABLED</code>
        <code>XDMP-DIRURI</code>
        <code>XDMP-DOCNOENDTAG</code>
        <code>XDMP-DOCROOTTEXT</code>
        <code>XDMP-DOCSTARTTAGCHAR</code>
        <code>XDMP-DOCUNENDTAG</code>
        <code>XDMP-DOCUTF8SEQ</code>
        <code>XDMP-DOCUNEOF</code>
        <code>XDMP-DUPATTR</code>
        <code>XDMP-ELEMLXCNNOTFOUND</code>
        <code>XDMP-ELEMATTRLXCNNOTFOUND</code>
        <code>XDMP-ELEMATTRRIDXNOTFOUND</code>
        <code>XDMP-ELEMRIDXNOTFOUND</code>
        <code>XDMP-FIELDLXCNNOTFOUND</code>
        <code>XDMP-FIELDRIDXNOTFOUND</code>
        <code>XDMP-FORESTNID</code>
        <code>XDMP-HTTP-MULTIPART</code>
        <code>XDMP-IMPMODNS</code>
        <code>XDMP-INVALTXDB</code>
        <code>XDMP-RWINVAL</code>
        <code>XDMP-RWINVAL0</code>
        <code>XDMP-JSONCHAR</code>
        <code>XDMP-JSONCP</code>
        <code>XDMP-JSONDOC</code> 
        <code>XDMP-JSONNUM</code> 
        <code>XDMP-JSONCP</code> 
        <code>XDMP-JSONDUPKEY</code> 
        <code>XDMP-JSONHEX</code>
        <code>XDMP-LEXVAL</code>
        <code>XDMP-MODNOTFOUND</code>
        <code>XDMP-MULTIMATCH</code>
        <code>XDMP-MULTIROOT</code>
        <code>XDMP-NOFIELD</code>
        <code>XDMP-NOMATCH</code>
        <code>XDMP-NOSUCHAXIS</code>
        <code>XDMP-NOSUCHDB</code>
        <code>XDMP-NOSUCHFOREST</code>
        <code>XDMP-NOTXN</code>
        <code>XDMP-OPTION</code>
        <code>XDMP-PATHRIDXNOTFOUND</code>
        <code>XDMP-RANGEINDEX</code>
        <code>XDMP-RWRPTPARAM</code>
        <code>XDMP-RWREPVAL</code>
        <code>XDMP-RWEMPTY</code>
        <code>XDMP-RIDXNOTFOUND</code>
        <code>XDMP-RULESNOTFOUND</code>
        <code>XDMP-SPQLBADDATASET</code>
        <code>XDMP-SPQLGRAPHEXIST</code>
        <code>XDMP-SPQLNOSUCHGRAPH</code>
        <code>XDMP-UNDFUN</code>
        <code>XDMP-UNDVAR</code>
        <code>XDMP-UNSUPPORTED-TYPE</code>
        <code>XDMP-UNEXPECTED</code>
        <code>XDMP-URI</code>
        <code>XDMP-URILXCNNOTFOUND</code>
        <code>XDMP-URIRIDXNOTFOUND</code>
        <code>XDMP-VALIDATEBADTYPE</code>
        <code>XDMP-VALIDATEMISSINGELT</code>
        <code>XDMP-VALIDATENODECL</code>
        <code>XDMP-VALIDATEUNEXPECTED</code>
        <status>400</status>
        <message>Bad Request</message>
    </error>
    <error>
        <code>RESTAPI-NORANGEMATCH</code>
        <status>416</status>
        <message>Requested Range Not Satisfiable</message>
    </error>
    <error>
        <code>RESTAPI-INVALIDMIMETYPE</code>
        <code>REST-INVALIDMIMETYPE</code>
        <status>415</status>
        <message>Unsupported Media Type</message>
    </error>
    <error>
        <code>RESTAPI-EMPTYBODY</code>
        <code>RESTAPI-CONTENTWRONGVERSION</code>
        <status>412</status>
        <message>Precondition Failed</message>
    </error>
    <error>
        <code>RESTAPI-OPENTRANSACTIONS</code>
        <code>RESTAPI-DATABASEINUSE</code>
        <code>XDMP-PLACEKEYSLOCKING</code>
        <status>409</status>
        <message>Conflict</message>
    </error>
    <error>
        <code>SEC-PRIV</code>
        <code>SEC-NOADMIN</code>
        <code>REST-FAILEDAUTH</code>
        <code>SEC-GPHPERMDENIED</code>
        <status>403</status>
        <message>Forbidden</message>
        <function>errut:render-auth</function> 
    </error>
    <error>
      <code>RESTAPI-CONTENTNOVERSION</code>
      <status>428</status>
      <message>Precondition Required</message>
    </error>      
    {$errut:not-found-handler}
    <!-- deprecated error -->
    <error>
        <code>RESTAPI-EXTNERR</code>
        <function>errut:render-extension-error</function>
    </error>
    <!-- replacement for deprecated error -->
    <error>
        <code>RESTAPI-SRVEXERR</code>
        <function>errut:render-extension-error</function>
    </error>
    <error>
        <code>REST-UNSUPPORTEDMETHOD</code>
        <status>405</status>
        <message>Method not allowed</message>
    </error>
    <error>
        <code>REST-UNACCEPTABLETYPE</code>
        <status>406</status>
        <message>Unacceptable Type</message>
    </error>
    <error>
        <code>RESTAPI-INTERNALERROR</code>
        <status>500</status>
        <message>Internal Server Error</message>
    </error>
    <error>
        <code>ADMIN-NOSUCHDATABASE</code>
        <code>SVC-SOCCONN</code>
        <code>SVC-SOCRECV</code>
        <code>XDMP-ACCEPT</code>
        <code>XDMP-FORESTNOT</code>
        <code>XDMP-LICKEYEXP</code>
        <code>XDMP-PRERELEXP</code>
        <code>XDMP-XDQPDISC</code>
        <status>503</status>
        <message>Service Unavailable</message>
    </error>
</errors>;

(: supplemental for eval-invoke contexts -- don't duplicate $errut:handler :)
declare variable $errut:code-handlers := 
<errors>
    <error>
        <code>JS-JAVASCRIPT</code>
        <code>XDMP-INVOKEPATH</code>
        <code>XDMP-DIVBYZERO</code>
        <code>XDMP-EXTVAL</code>
        <code>XDMP-MISSINGCONTEXT</code>
        <code>XDMP-UNDVAR</code>
        <status>400</status>
        <message>Bad Request</message>
    </error>
</errors>;

declare function errut:get-status-code(
    $error-code as xs:string?
) as xs:int?
{
    if (empty($error-code)) then ()
    else $errut:handlers/error[code/string(.) = $error-code]/status/xs:int(.)
};

declare function errut:get-status-message(
    $status-code as xs:string?
) as xs:string?
{
    if (empty($status-code)) then ()
    else $errut:handlers/error[status/string(.) eq $status-code]/message/string(.)
};

declare function errut:log-errors(
  $errors as element(error:error)*,
  $code as item()*
) as empty-sequence()
{
    if (empty($errors)) then ()
    else
        let $first-err := head($errors)
        let $msg       := head((
            $first-err/error:format-string/string(),
            $first-err/error:message/string()
            ))
        let $error-code := $first-err/error:code/string(.)
        let $not-found  := ($error-code = $errut:not-found-handler/code/string(.))
        return (
            if ($not-found) then ()
            else xdmp:log("Status " || head($code) || ": " || $msg),

            if ($is-untraced or errut:check-untraced()) then ()
            else lid:log(
                $errut:trace-id,"restapi-error-handler",
                if ($not-found)
                    then map:entry("status", head($code) || ": " || $msg)
                    else map:entry("errors", $errors)
                )
            )
};

declare function errut:preferred-format(
) as xs:string?
{
    let $accept :=
        let $accept-types :=
            let $normalized-map := map:map()
            return (
                for $header-name in xdmp:get-request-header-names()
                let $normalized-name := lower-case($header-name)
                return
                    if (not($normalized-name = ("x-error-accept", "accept"))) then ()
                    else map:put(
                        $normalized-map,$normalized-name,xdmp:get-request-header($header-name,())
                        ),

                let $error-accept-types := map:get($normalized-map,"x-error-accept")
                return
                    if (exists($error-accept-types))
                    then $error-accept-types
                    else map:get($normalized-map,"accept")
                )
        return 
            if (empty($accept-types)) then ()
            else
                head(
                    for $accept-type in $accept-types
                    return
                        if (matches($accept-type,"^(application|text)/([^+]+\+)?json"))
                        then "json"
                        else if (matches($accept-type,"^(text/html|application/xhtml\+xml)$"))
                        then "html"
                        else if (matches($accept-type,"^(application|text)/([^+]+\+)?xml"))
                        then "xml"
                        else ()
                )
    return
        if (exists($accept))
        then $accept
        else xdmp:get-request-error-format()
};

declare function errut:render-error-with-status(
    $status-code as xs:integer,
    $status      as xs:string,
    $errors      as element(error:error)*,
    $format      as xs:string
) as node()
{
    xdmp:set-response-code($status-code,$status),
    errut:render-error($status-code,$status,$errors,$format)
};
declare function errut:render-error-with-status(
    $status-code  as xs:integer,
    $status       as xs:string,
    $message-code as xs:string?,
    $message      as xs:string?,
    $format       as xs:string
) as node()
{
    xdmp:set-response-code($status-code,$status),
    errut:render-error($status-code,$status,$message-code,$message,$format)
};

declare function errut:render-error(
    $status-code as xs:integer,
    $status as xs:string,
    $errors as element(error:error)*,
    $format as xs:string
) as node()
{
    errut:render-error($status-code,$status,
        head($errors)/error:code/string(),
        head($errors)/error:format-string/string(),
        $format
        )
};
declare function errut:render-error(
    $status-code  as xs:integer,
    $status       as xs:string,
    $message-code as xs:string?,
    $message      as xs:string?,
    $format       as xs:string
) as node()
{
    switch($format)
    case "xml" return
        <error-response xmlns="http://marklogic.com/xdmp/error">
            <status-code>{$status-code}</status-code>
            <status>{$status}</status>
            <message-code>{$message-code}</message-code>
            <message>{$message}</message>
        </error-response>
    case "html" return
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>{concat($status-code, " ", $status)}</title>
                <meta name="robots"    content="noindex,nofollow"/>
                <link rel="stylesheet" href="/error.css"/>
            </head>
            <body class="error">
                <h1 class="status">{concat($status-code, " ", $status)}</h1>
                <p class="message">{concat($message-code, " ", $message)}</p>
            </body>
        </html>
    default return
        object-node {"errorResponse": object-node {
                "statusCode":  $status-code,
                "status":      $status,
                "messageCode": head(($message-code, null-node {})),
                "message":     $message}}
};

declare function errut:render-auth(
    $errors as element(error:error),
    $preferred-error-format as xs:string
) as node()
{
    errut:render-error-with-status(
        403,
        "Forbidden",
        head($errors)/error:code/string(),
        "You do not have permission to this method and URL.",
        $preferred-error-format
        )
};

declare function errut:render-extension-error(
    $errors                 as element(error:error),
    $preferred-error-format as xs:string
) as node()
{
    let $error-data  := head($errors)/error:data/error:datum/data()
    let $error-count := count($error-data)
    (: NOTE: 4 datums in the data for the deprecated RESTAPI-EXTNERR error
       $error-data[3] used to specify the format but is now a noop because
           $preferred-error-format takes precedence :)
    return errut:render-error-with-status(
        if ($error-count lt 1) then 400 else xs:int(subsequence($error-data,1,1)),
        if ($error-count lt 2) then "RESTAPI-SRVEXERR" else string(subsequence($error-data,2,1)),
        if ($error-count gt 3) then "RESTAPI-EXTNERR" else "RESTAPI-SRVEXERR",
        subsequence($error-data,$error-count,1),
        $preferred-error-format
        )
};

declare function errut:render-404(
    $errors as element(error:error)*,
    $preferred-error-format as xs:string
) as node()
{
    errut:render-error-with-status(
        404,
        "Not Found",
        head($errors)/error:code/string(),
        if ($errors)
            then head($errors)/error:format-string/string()
            else concat("Not found: ", xdmp:get-request-path()),
        $preferred-error-format
        )
};

declare function errut:error-body(
    $error:errors as element(error:error)*,
    $code as item()*,
    $preferred-error-format as xs:string
) as node()?
{
    errut:error-body($error:errors,$code,$preferred-error-format,xdmp:get-original-url())
};

declare function errut:error-body(
    $error:errors as element(error:error)*,
    $code as item()*,
    $preferred-error-format as xs:string,
    $path as xs:string
) as node()?
{
    if (empty($error:errors)) then ()
    else
        let $error-code := $error:errors[1]/error:code/string()
        let $format-string := ($error:errors)[1]/error:format-string/string()
        return
            let $handlers :=
                if (matches($path,"^/(v1|LATEST)/(eval|invoke)")) then
                    if ($error-code = ("RESTAPI-SRVEXERR", "RESTAPI-EXTNERR"))
                    then $errut:handlers
                    else ()
                else if (empty($error:errors/error:stack/error:frame[
                        string(error:uri) eq "../lib/extensions-util.xqy"
                        ]))
                then $errut:handlers
                else if (not(matches($path,"^/(v1|LATEST)/resources/")))
                then ($errut:handlers|$errut:code-handlers)
                else if ($error-code = ("RESTAPI-SRVEXERR", "RESTAPI-EXTNERR"))
                then $errut:handlers
                else ()
            let $response-handler :=
                if (exists($error-code))
                then head($handlers/error[code/string(.) = $error-code])
                else if (exists($code))
                then head($handlers/error[status/string(.) = string(head($code))])
                else ()
            let $response :=
                if (exists($response-handler)) then
                    let $intercept := $response-handler/function/text()
                    return
                        if (exists($intercept))
                        then xdmp:apply(xdmp:function($intercept), 
                            $error:errors,
                            $preferred-error-format
                            )
                        else errut:render-error-with-status(
                            $response-handler/status/xs:integer(string(.)),
                            $response-handler/message/string(.),
                            $error:errors,
                            $preferred-error-format
                            )
                else if ($error:errors/error:retryable/xs:boolean(string(.)))
                then (
                    xdmp:set-response-code(503, "Service Unavailable"),
                    eput:add-response-header("Retry-After", "1"),
                    let $message :=
                        if ($error:errors)
                        then $format-string
                        else concat(string($code[1])," ",$code[2]," internal error")
                    return errut:render-error(503,"SERVICE UNAVAILABLE (RETRYABLE)",
                               $error-code,$message,$preferred-error-format)
                    )
                else if (head($code) eq 404)
                then (
                    xdmp:set-response-code(404, "Not Found"),
                    errut:render-404($error:errors,$preferred-error-format)
                    )
                else if (head($code) eq 401)
                then errut:render-error-with-status(
                    401, "Unauthorized","","Unauthorized",$preferred-error-format
                    )
                else (
                    xdmp:set-response-code(500, $code[2]),
                    let $message :=
                        if ($error:errors)
                        then $format-string
                        else concat(string($code[1])," ",$code[2]," internal error")
                    return errut:render-error(500,"Internal Server Error","INTERNAL ERROR",
                        concat($message, " . See the MarkLogic server error log for further detail."),
                                $preferred-error-format)
                    )
            return $response
};
