xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace rapiup = "http://marklogic.com/rest-api/upgrade";

import module namespace admin = "http://marklogic.com/xdmp/admin"
    at "/MarkLogic/admin.xqy";

import module namespace bootl = "http://marklogic.com/rest-api/bootstrap-util"
    at "lib/bootstrap-util.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "lib/db-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "lib/extensions-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "lib/endpoint-util.xqy";

import module namespace rsrcmodcom = "http://marklogic.com/rest-api/models/resource-model-common"
    at "models/resource-model-common.xqy";

import module namespace rsrcmodqry = "http://marklogic.com/rest-api/models/resource-model-query"
    at "models/resource-model-query.xqy";

import module namespace rsrcmodupd = "http://marklogic.com/rest-api/models/resource-model-update"
    at "models/resource-model-update.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "models/transform-model.xqy";

import module namespace plugin = "http://marklogic.com/extension/plugin"
    at "/MarkLogic/plugin/plugin.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace xsl  = "http://www.w3.org/1999/XSL/Transform";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function rapiup:upgrade-restapi-70(
) as xs:unsignedLong*
{
    xdmp:log("starting REST 7.0 upgrade","notice"),

    try {
        rapiup:create-roles(),

        plugin:initialize-scope("marklogic.rest.resource")[false()],
        plugin:initialize-scope("marklogic.rest.transform")[false()],

        (: for each REST server :)
        for $serverdef in bootl:get-rest-servers()[exists(rapi:modules-database)]
        let $server-name     := $serverdef/rapi:name/string(.)
        let $group-name      := $serverdef/rapi:group/string(.)
        let $db-name         := $serverdef/rapi:database/string(.)
        let $db-id           := xdmp:database($db-name)
        let $modb-name       := $serverdef/rapi:modules-database/string(.)
        let $modb-id         := xdmp:database($modb-name)
        let $extension-count := (
            xdmp:log("upgrading extensions for "||$server-name,"notice"),

            dbut:update-config(rapiup:upgrade-restserver-70#0, $db-id, $modb-id)
            )
        return
            (: list REST servers with reinstalled extensions :)
            if ($extension-count gt 0)
            then xdmp:server($server-name, xdmp:group($group-name))
            else ()
    } catch($e) {
        xdmp:log("failed to upgrade REST 7.0: "||$e/error:message/string(.), "error"),
        xdmp:log($e, "debug")
    }
};

declare private function rapiup:create-roles(
)
{
    xdmp:eval('
    xquery version "1.0-ml";
    import module namespace sec="http://marklogic.com/xdmp/security"
        at "/MarkLogic/security.xqy";
    declare default function namespace "http://www.w3.org/2005/xpath-functions";
    declare option xdmp:mapping "false";
    if (sec:role-exists("rest-extension-user")) then ()
    else (
        xdmp:log("creating rest-extension-user","notice"),
        sec:create-role("rest-extension-user","MarkLogic REST API extension role",(),(),())
        )
    ',
    (),
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>)
};

declare private function rapiup:upgrade-restserver-70(
) as xs:unsignedLong*
{
count((
    (: for each 6.2 or 6.3 resource service extension :)
    let $resourcedefs := rsrcmodqry:list-sources("xml",())/rapi:resources/rapi:resource
    return
        if (exists($resourcedefs)) then (
            xdmp:log("upgrading resource service extensions in the modules database","notice"),

            for $resourcedef in $resourcedefs
            let $name   := $resourcedef/rapi:name/string(.)
            let $source := rsrcmodqry:get-source($name,())
            return rapiup:upgrade-resource-extension(
                $name, $resourcedef, $source
                )
            )
        else (
            xdmp:log("upgrading resource service extensions in the Extensions database","notice"),

            (: for each 6.1 resource service extension :)
            let $plugins := plugin:plugins(
                "http://marklogic.com/rest-api/capability/resource/meta",
                "marklogic.rest.resource"
                )
            for $name in $plugins
            let $resourcedef :=
                plugin:asset($name,"marklogic.rest.resource","metadata.xml")
            let $source      :=
                plugin:asset($name,"marklogic.rest.resource","resource.xqy")
            return rapiup:upgrade-resource-extension(
                $name, $resourcedef/rapi:resource-metadata, $source
                )
            ),

    let $params        := map:map()
    let $transformdefs := tformod:list("xml",$params,())/rapi:transforms/rapi:transform
    return
        if (exists($transformdefs)) then (
            xdmp:log("upgrading transform extensions in the modules database","notice"),

            (: for each 6.2 or 6.3 transform extension :)
            for $transformdef in $transformdefs
            let $name   := $transformdef/rapi:name/string(.)
            let $source := tformod:get($name,$params,())
            let $format := head((
                ($transformdef//rapi:source-format)[last()]/string(.),
                if (exists($source/(xsl:stylesheet|xsl:transform)))
                    then "xslt"
                    else "xquery"
                ))
            return rapiup:upgrade-transform-extension(
                $name, $transformdef, $format, $source
                )
            )
        else (
            xdmp:log("upgrading transform extensions in the Extensions database","notice"),

            (: for each 6.1 transform extension :)
            let $plugins := plugin:plugins(
                "http://marklogic.com/rest-api/capability/transform/meta",
                "marklogic.rest.transform"
                )
            for $name in $plugins
            let $transformdef :=
                plugin:asset($name,"marklogic.rest.transform","metadata.xml")
            let $xstl-source  :=
                plugin:asset($name,"marklogic.rest.transform","transform.xsl")
            let $format := head((
                ($transformdef//rapi:source-format)[last()]/string(.),
                if (exists($xstl-source))
                    then "xslt"
                    else "xquery"
                ))
            let $source       :=
                if (exists($xstl-source))
                then $xstl-source
                else plugin:asset($name,"marklogic.rest.transform","transform.xqy")
            return rapiup:upgrade-transform-extension(
                $name, $transformdef/rapi:transform-metadata, $format, $source
                )
            )
    ))
};

declare private function rapiup:upgrade-resource-extension(
    $name        as xs:string,
    $resourcedef as element(),
    $source      as document-node()
) as xs:int*
{
    xdmp:log("upgrading "||$name||" resource service extension","notice"),

    (: eliminate recursive nesting from previous upgrade bug :)
    let $resource-metadata := ($resourcedef//rapi:resource-metadata)[last()]
    let $source-format     := head((
        ($resourcedef//rapi:source-format)[last()]/string(.), "xquery"
        ))
    (: reinstall :)
    return extut:install-extension(
        "resource",
        rsrcmodcom:get-service-defs(),
        $name,
        <rapi:resource-metadata>{
            $resource-metadata/@*,
            $resource-metadata/(
                rapi:collections|rapi:permissions|prop:properties|rapi:quality|rapi:metadata-values
                )
            }</rapi:resource-metadata>,
        $source-format,
        $source
        )[false()],

    1
};

declare private function rapiup:upgrade-transform-extension(
    $name         as xs:string,
    $transformdef as element(),
    $format       as xs:string,
    $source       as document-node()
) as xs:int*
{
    xdmp:log("upgrading "||$name||" "||$format||" transform","notice"),

    (: reinstall :)
    extut:install-extension(
        "transform",
        tformod:get-service-defs(),
        $name,
        <rapi:transform-metadata>{$transformdef/*}</rapi:transform-metadata>,
        $format,
        $source
        )[false()],

    1
};

declare function rapiup:upgrade-restapi-80(
) as xs:unsignedLong*
{
    xdmp:log("starting REST 8.0 upgrade","notice"),

    try {
        rapiup:security-80(),

        let $config := admin:get-configuration()
        let $restservers :=
            for $server-id in admin:get-appserver-ids($config)
            let $server-type    := admin:appserver-get-type($config, $server-id)
            let $server-name    := admin:appserver-get-name($config, $server-id)
            let $is-appservices := ($server-name eq "App-Services")
            let $serverdef      := map:map()
            where (($server-type eq "http") and (
                $is-appservices or
                matches(
                    admin:appserver-get-url-rewriter($config,$server-id),
                    "^../(8000-rewriter|rewriter|rewriter-noxdbc)\.(xqy|xml)$"
                    )))
            return (
                map:put($serverdef,"server-id",$server-id),
                map:put($serverdef,"server-name",$server-name),
                map:put($serverdef,"is-appservices",$is-appservices),
                $serverdef
                )
        let $rest-server-config := fold-left(
            rapiup:upgrade-restserver-80#2, $config, $restservers
            )
        let $modified-servers :=
            if (count($rest-server-config) gt 0)
            then admin:save-configuration-without-restart($rest-server-config)
            else ()
        return (
            xdmp:log("finished REST 8.0 upgrade","notice"),
            $modified-servers
            )
    } catch($e) {
        xdmp:log("failed to upgrade REST 8.0: "||$e/error:message/string(.), "error"),
        xdmp:log($e, "debug")
    }
};

declare private function rapiup:upgrade-restserver-80(
    $config    as element(configuration),
    $serverdef as map:map
) as element(configuration)
{
    let $server-id      := map:get($serverdef,"server-id")
    let $server-name    := map:get($serverdef,"server-name")
    let $group-id       := admin:appserver-get-group-id($config,$server-id)
    let $group-name     := xdmp:group-name($group-id)
    let $is-appservices := map:get($serverdef,"is-appservices")
    let $port           := xs:string(admin:appserver-get-port($config,$server-id))
    (: start same strategy as ../lib/bootstrap-util.xqy :)
    let $is-8000        := ($port eq "8000")
    let $modules-id     :=
        if ($is-8000)
        then xdmp:database("Modules")
        else admin:appserver-get-modules-database($config,$server-id)
    (: end strategy :)
    let $prop-file      := eput:make-document-uri("/rest-api/properties",$group-name,$server-name)
    let $error-format   :=
        if ($modules-id eq 0) then ()
        else xdmp:eval(
'xquery version "1.0-ml";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";
declare option xdmp:transaction-mode "update"; 
declare variable $prop-func as function(*) external;
declare variable $prop-file as xs:string?  external;
$prop-func($prop-file),
xdmp:commit()',
            (
                xs:QName("prop-func"), rapiup:restserver-error-format-80#1,
                xs:QName("prop-file"), $prop-file
                ),
            <options xmlns="xdmp:eval">
                <database>{$modules-id}</database>
            </options>
            )
    let $rewrite-config :=
        if (not($is-appservices))
        then $config
        else admin:appserver-set-rewrite-resolves-globally($config,$server-id,true())
    let $handler-config :=
        if (not($is-appservices))
        then $rewrite-config
        else admin:appserver-set-error-handler(
            $rewrite-config,$server-id,"../8000-error-handler.xqy"
            )
    let $format-config  :=
        if (empty($error-format) or not($error-format = ("html","json","xml")))
        then $handler-config
        else admin:appserver-set-default-error-format($handler-config,$server-id,$error-format)
    let $db-config := 
        if(not($is-8000))
        then $format-config
        else admin:appserver-set-database($format-config,$server-id,xdmp:database("Documents"))
    let $modules-config :=
        if(not($is-8000))
        then $db-config
        else admin:appserver-set-modules-database($db-config,$server-id,xdmp:database("Modules"))
    let $root-config :=
        if(not($is-8000))
        then $modules-config
        else admin:appserver-set-root($modules-config,$server-id,"/")
  
    return (
        admin:appserver-set-url-rewriter($root-config,$server-id,
            if ($is-8000)
            then "../8000-rewriter.xml"
            else "../rewriter.xml"
            ),
            xdmp:log(concat("upgraded ",$server-name," REST server to 8.0"), "notice")
        )
};

declare private function rapiup:restserver-error-format-80(
    $prop-file as xs:string?
) as xs:string?
{
    if (empty($prop-file) or not(doc-available($prop-file))) then ()
    else
        let $prop-doc := doc($prop-file)
        let $prop-map := $prop-doc/map:map/map:map(.)
        return
            if (empty($prop-map)) then ()
            else
                let $error-format := map:get($prop-map,"error-format")
                return
                    if (empty($error-format)) then ()
                    else (
                        map:delete($prop-map,"error-format"),
                        xdmp:document-insert(
                            $prop-file,
                            document {$prop-map},
                            xdmp:document-get-permissions($prop-file),
                            xdmp:document-get-collections($prop-file),
                            xdmp:document-get-quality($prop-file)
                            ),
                        $error-format
                        )
};

declare private function rapiup:security-80(
)
{
    xdmp:log("modifying REST role privileges","notice"),

    xdmp:eval('
    xquery version "1.0-ml";
    import module namespace sec="http://marklogic.com/xdmp/security"
        at "/MarkLogic/security.xqy";
    declare default function namespace "http://www.w3.org/2005/xpath-functions";
    declare option xdmp:mapping "false";

    if (not(sec:role-exists("rest-writer-internal"))) then ()
    else sec:privilege-remove-roles(
        "http://marklogic.com/xdmp/privileges/any-uri", "execute", "rest-writer-internal"
        )
    ',
    (),
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>),

    xdmp:eval('
    xquery version "1.0-ml";
    import module namespace sec="http://marklogic.com/xdmp/security"
        at "/MarkLogic/security.xqy";
    declare default function namespace "http://www.w3.org/2005/xpath-functions";
    declare option xdmp:mapping "false";

    if (not(sec:role-exists("rest-admin-internal"))) then ()
    else sec:privilege-add-roles(
        "http://marklogic.com/xdmp/privileges/any-uri", "execute", "rest-admin-internal"
        ),
    if (not(sec:role-exists("rest-writer-internal"))) then ()
    else sec:privilege-add-roles(
        "http://marklogic.com/xdmp/privileges/unprotected-uri", "execute", "rest-writer-internal"
        )
    ',
    (),
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>)
};
