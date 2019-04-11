xquery version "1.0-ml";

module namespace cfg = "http://example.com/config";

import module namespace sec="http://marklogic.com/xdmp/security" at "/MarkLogic/security.xqy";

declare namespace di="xdmp:document-insert";
declare namespace eval="xdmp:eval";
declare namespace es="http://marklogic.com/entity-services";

declare variable $SECURITY-DB as xs:string := "Security";

declare variable $DATAHUB-USER-ROLE as xs:string := "%%mlHubUserRole%%";
declare variable $DATAHUB-USER as xs:string := "%%mlHubUserName%%";
declare variable $DATAHUB-USER-PWD as xs:string := "%%mlHubUserPassword%%";
declare variable $STAGING-PREFIX as xs:string := "/content/raw/";

declare variable $LANG-CODES-SOURCE-DOC as xs:string := "/data/lang-codes.xml";

declare variable $QUOTE-PRETTY-PRINT := map:map() => map:with("indentUntyped", "yes") => map:with("omitXmlDeclaration", "yes");

(:databases:)
declare variable $STAGING-DB as xs:string := "%%mlStagingDbName%%";
declare variable $FINAL-DB as xs:string := "%%mlFinalDbName%%";
declare variable $JOBS-DB as xs:string := "%%mlJobDbName%%";
declare variable $MODULES-DB as xs:string := "%%mlModulesDbName%%";

declare variable $JOB-ID-KEY as xs:string := "job-id";
declare variable $INPUT-COLLECTIONS-KEY as xs:string := "dhf.inputCollections";


(:http return codes:)
declare variable $HTTP-OK as xs:integer := 200;
declare variable $HTTP-NOT-FOUND as xs:integer := 404;
declare variable $HTTP-BAD-REQUEST as xs:integer := 400;
declare variable $HTTP-UNSUPPORTED-MEDIA-TYPE as xs:integer := 415;

(:media types:)
declare variable $APPLICATION-JSON as xs:string := "application/json";
declare variable $APPLICATION-XML as xs:string := "application/xml";
declare variable $APPLICATION-PDF as xs:string := "application/pdf";

declare variable $DEFAULT-GRAPH-NAME as xs:string := "http://example.com/ontologies/MeSH";
declare variable $MESH-OBSOLETE-PREFIX as xs:string := "[OBSOLETE]";

(:path expressions FINAL:)
declare variable $PMC-ID-PATH-EXPR as xs:string := "//es:instance/Asset/pmc-id";

(:QName Constants:)
declare variable $COLLECTION-QNAME := xs:QName("xdmp:collection");
declare variable $COLLECTION-QNAME-STRING := fn:string($COLLECTION-QNAME);
declare variable $DIRECTORY-QNAME := xs:QName("xdmp:directory");

(:harmonisation error qname:)
declare variable $HARMONISATION-ERROR-QNAME as xs:QName := xs:QName("HARMONISATION-ERROR");

(:media types:)
declare variable $APP-XML-MEDIA-TYPE as xs:string := "application/xml";

(:transaction timeout for harmonisation collector:)
declare variable $TXN-TIMEOUT as xs:integer := 3600 * 2;

(:collations:)
declare variable $CODEPOINT-COLLATION as xs:string := "collation=http://marklogic.com/collation/codepoint";
declare variable $ROOT-COLLATION as xs:string := "collation=http://marklogic.com/collation/";
(:unfiltered:)
declare variable $UNFILTERED as xs:string := "unfiltered";
declare variable $UNFILTERED-AS-OPTIONS as xs:string* := ($UNFILTERED);
(:limit=1 search option:)
declare variable $LIMIT-EQUAL1 as xs:string := "limit=1";

declare variable $DATAHUB-DEFAULT-PERMISSIONS as element(sec:permission)* :=
    (xdmp:permission($DATAHUB-USER-ROLE, "read"),xdmp:permission($DATAHUB-USER-ROLE, "update") );

declare variable $INVOKE-FUNC-DIFFERENT-TXN-OPTIONS as element(eval:options) :=
    <options xmlns="xdmp:eval">
        <database>{xdmp:database($FINAL-DB)}</database>
        <isolation>different-transaction</isolation>
    </options>
;

declare variable $INVOKE-UPDATE-FUNC as function(item()) as item()* :=  function($f as function() as item()*) {
    xdmp:invoke-function(
            $f,
            <options xmlns="xdmp:eval">
                <transaction-mode>update-auto-commit</transaction-mode>
                <isolation>different-transaction</isolation>
            </options>
    )

};

declare variable $INVOKE-QUERY-FUNC as function(item()) as item()* :=  function($f as function() as item()*) {
    xdmp:invoke-function(
            $f,
            <options xmlns="xdmp:eval">
                <transaction-mode>query</transaction-mode>
            </options>
    )

};


declare function get-harmonization-insert-doc-options(
    $options as map:map
) as element(di:options)
{
    <options xmlns="xdmp:document-insert">
        <permissions>{$cfg:DATAHUB-DEFAULT-PERMISSIONS}</permissions>
        <collections>{  (
                        map:get($options, "entity"),
                        map:get($options, "flow"),
                        map:get($options, "job-id") ) ! element collection {.}}</collections>
    </options>
};


declare private function get-options(
        $options-name as xs:string,
        $db as xs:string
) as document-node()?
{
    let $db :=  fn:upper-case($db)
    return
    xdmp:invoke-function(
            function() {
                let $uri := "/Default/pubLab-"|| $db || "/rest-api/options/" || $options-name
                return fn:doc($uri)
            },
            <options xmlns="xdmp:eval">
                <database>{xdmp:database("%%mlModulesDbName%%")}</database>
            </options>
    )
};

declare function get-options-final(
    $options-name as xs:string
) as document-node()?
{
    get-options($options-name, "%%mlFinalDbName%%")
};

declare function get-options-final-test(
        $options-name as xs:string
) as document-node()?
{
    get-options($options-name, "%%mlFinalDbName%%")
};

declare function get-options-staging(
        $options-name as xs:string
) as document-node()?
{
    get-options($options-name, "%%mlStagingDbName%%")
};



