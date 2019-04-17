xquery version "1.0-ml";

module namespace tf = "http://example.com/test-flows-lib";

import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";
import module namespace tcfg = "http://example.com/test-config" at "/lib/test-config.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
import module namespace th="http://marklogic.com/test/unit" at "/test/test-helper.xqy";

declare namespace http="xdmp:http";
declare namespace hub = "http://marklogic.com/data-hub";
declare namespace es = "http://marklogic.com/entity-services";

declare variable $FLOW-URL as xs:string :=  "/v1/resources/ml:flow?";
declare variable $RUN-COLLECTOR-URL as xs:string :=  "/v1/internal/hubcollector?";

declare variable $HTTP-OK as xs:integer := 200;

declare variable $HARMONIZE-FLOW-TYPE as xs:string := "harmonize";
declare variable $INPUT-FLOW-TYPE as xs:string := "input";
declare variable $PMC-INPUT-FLOW as xs:string := "PubMedCentralFromFolder";
declare variable $MEDLINE-INPUT-FLOW as xs:string := "MedlineFromFolder";

declare variable $ROOT-PATH-BY-FLOW as map:map := map:map() =>
                                                  map:with($PMC-INPUT-FLOW, "pmc")  =>
                                                  map:with($MEDLINE-INPUT-FLOW, "medline");


(:make sure Accept header is set to control how exceptions are returned to caller:)
declare variable $HTTP-OPTIONS as element(http:options) :=
    <options xmlns="xdmp:http">
        <authentication method="digest">
            <username>{$cfg:DATAHUB-USER}</username>
            <password>{$cfg:DATAHUB-USER-PWD}</password>
        </authentication>
        <headers>
            <Accept>application/xml</Accept>
            <Content-Type>application/xml</Content-Type>
        </headers>
    </options>;

declare function remove-test-content-docs()
{
    let $collection-query := cts:collection-query($tcfg:UNIT-TEST-COLLECTION)
    let $_ :=
        xdmp:invoke-function(
            function() {
                xdmp:log("XXX removing "|| fn:count( cts:uri-match("/content/*", (), $collection-query) )  ||  " unit test content docs from STAGING"   ),

                cts:uri-match("/content/*", (), $collection-query) => xdmp:document-delete()
            },
            <options xmlns="xdmp:eval">
                <isolation>different-transaction</isolation>
                <database>{xdmp:database($cfg:STAGING-DB)}</database>
                <transaction-mode>update-auto-commit</transaction-mode>
            </options>

        )
    return xdmp:invoke-function(
            function() {
                xdmp:log("XXX number of unit test content docs remaining in STAGING = "||fn:count( cts:uri-match("/content/*", (), $collection-query) ) )
            },
            <options xmlns="xdmp:eval">
                <isolation>different-transaction</isolation>
                <database>{xdmp:database($cfg:STAGING-DB)}</database>
            </options>

    )

};


declare function run-input-flow-pmc(
        $host as xs:string,
        $port as xs:string
)
{
    let $flow-name := "PubMedCentralFromFolder"
    let $get-pmc-docs := function() as map:map {
        let $results := map:map()
        let $_ := for $source-uri in xdmp:invoke-function(
                        function() {cts:uri-match( "/test/content/pubmed-central/*")},
                        <options xmlns="xdmp:eval">
                            <database>{xdmp:modules-database()}</database>
                        </options>
                )
                let $doc := th:get-modules-file($source-uri, "xml" )
                let $uri := fn:concat("/content/raw/pmc/", tf:get-root-filename($source-uri), ".xml")
                return  map:put($results, $uri, $doc)
        return $results

    }
    let $entity-name := "Asset"
    return run-input-flow($host,$port,$entity-name,$flow-name, $get-pmc-docs)
};

declare function run-input-flow(
        $host as xs:string,
        $port as xs:string,
        $entity-name as xs:string,
        $flow-name as xs:string,
        $get-docs as function() as map:map
)
{
    let $doc-map as map:map := $get-docs()
    for $uri in map:keys($doc-map)
    let $job-id := "joe-manual-process-test-1"
    let $input-collections := ( $entity-name, $flow-name,  $INPUT-FLOW-TYPE, $tcfg:UNIT-TEST-COLLECTION) => fn:string-join(",")
    let $options := let $map := map:map()
    let $_ := $map  => map:with($cfg:INPUT-COLLECTIONS-KEY, $input-collections)
                        => map:with('entity', $entity-name)
                        => map:with('flow', $flow-name)
                        => map:with('flowType', $INPUT-FLOW-TYPE)
                        return xdmp:to-json-string($map) => xdmp:url-encode()
    let $url := make-input-flow-url($host, $port, $uri, $entity-name, $flow-name, $input-collections, $job-id, $options )
    return tcfg:run-http($tcfg:HTTP-PUT, $url, tcfg:set-PUT-http-options(element payload { map:get($doc-map,$uri) }) )
};

declare function make-input-flow-url(
        $host as xs:string,
        $port as xs:string,
        $uri as xs:string,
        $entity-name as xs:string,
        $flow-name as xs:string,
        $collection-string as xs:string?,
        $job-id as xs:string?,
        $options as xs:string?
)
{
    let $collection-parms := fn:tokenize($collection-string, ",") ! fn:concat("&amp;collection=",functx:trim(.))  => fn:string-join()
    return
        fn:concat("http://",$host,":",$port,"/v1/documents?uri=",
            $uri,
            "&amp;transform=ml:inputFlow",
            "&amp;trans:flow-name=",
            $flow-name,
            "&amp;trans:entity-name=",
            $entity-name,
            $collection-parms,
            if ($job-id) then "&amp;trans:job-id="||$job-id else (),
            if ($options) then "&amp;trans:options="||$options else ()

    )
};
declare function get-root-filename(
        $file-path as xs:string
) as xs:string
{
    fn:substring-before($file-path, ".") => functx:substring-after-last-match("/")
};

(:~

?rs:identifiers=someIdentifier&rs:entity-name=EntityName&rs:flow-name=FlowName&rs:target-database=Documents&rs:options={"some":"json"}&rs:job-id=SomeJobID

 -PentityName=$ENTITY \
  -PflowName=$FLOW \
  -PbatchSize=10 \
  -PthreadCount=4 \
  -PsourceDB=data-hub-STAGING \
  -PdestDB=data-hub-FINAL \
  -PshowOptions=true \
  -PenvironmentName=$ENV \
  -Pdhf.inputCollections=$COLLS
:)
declare function tf:build-flow-url(
    $ids as xs:string*,
    $entity as xs:string,
    $flow-name as xs:string,
    $target-db as xs:string,
    $source-db as xs:string,
    $options as xs:string,
    $job-id as xs:string

) as xs:string
{
  fn:concat(
           if ($job-id) then fn:concat("rs:job-id=",$job-id ) else (),
           if ($flow-name) then fn:concat("&amp;rs:flow-name=",$flow-name ) else (),
           if ($target-db) then fn:concat("&amp;rs:target-database=",$target-db ) else (),
           if ($options) then fn:concat("&amp;rs:options=",$options ) else (),
           if ($entity) then fn:concat("&amp;rs:entity-name=",$entity ) else (),
           if ($source-db) then fn:concat("&amp;database=",$source-db ) else (),
           fn:concat("&amp;rs:identifiers=",fn:string-join($ids,"&amp;rs:identifiers=" ) )

  )
};

declare function tf:exec-http(
        $http-func as function(item(), item()) as item()+,
        $url as xs:string,
        $options as element(http:options)?
) as element(response)
{
    let $response := $http-func($url,if ($options) then $options else $HTTP-OPTIONS)
    let $_ := xdmp:log(" http response[1] " ||xdmp:quote($response[1]) )
    let $_ := xdmp:log(" http response[2] " ||xdmp:quote($response[2]) )
    return <response><part1>{$response[1]}</part1><part2>{if (fn:count($response[2]/(element()|text())) eq 0) then () else $response[2]}</part2></response>
};


(:~


:)
(:~
: get the xml representation of a harmonisation flow.
:
: based on the following http commands extracted from the MarkLogic Access Log
:
: @param url  url of the custom resource flow endpoint
: @param entity  name of the entity
: @param flow-name name of the flow
: @param db the source db e.g. STAGING
: @return  response xml
:)

declare function tf:get-harmonisation-flow(
        $url as xs:string,
        $entity as xs:string,
        $flow-name as xs:string,
        $db as xs:string
) as element(response)
{

    tf:exec-http($tcfg:HTTP-GET,
                    fn:concat(
                            $url,
                        "rs:flow-name=",
                        $flow-name,
                        "&amp;rs:flow-type=",
                        $HARMONIZE-FLOW-TYPE,
                        "&amp;rs:entity-name=",
                        $entity,
                        "&amp;database=",
                        $db

                    ),
                    ()
    )

};

(:~
: run the collector of a given harmonisation flow.
:
: based on the following http commands extracted from the MarkLogic Access Log
:
: @param url  url of the custom resource flow endpoint
: @param job-id  job id
: @param entity-name  name of the entity
: @param flow-name name of the flow
: @param options  will be passed to the xquery code
: @param db the source db e.g. STAGING
: @return  response xml
:)
declare function tf:run-collector(
        $url as xs:string,
        $job-id as xs:string,
        $entity-name as xs:string,
        $flow-name as xs:string,
        $options as xs:string,
        $db as xs:string
) as element(response)
{

    tf:exec-http($tcfg:HTTP-GET,
            fn:concat(
                    $url,
                    "job-id=",
                    $job-id,
                    "&amp;entity-name=",
                    $entity-name,
                    "&amp;flow-name=",
                    $flow-name,
                    "&amp;database=",
                    $db,
                    "&amp;options=",
                    $options
            ),
            ()
    )

};

(:~
: run  the main part of a harmonisation flow i.e. the bit without the collector
:
:
: based on the following http commands extracted from the MarkLogic Access Log
: POST batches of URIs to a flow for processing
:
: @param url  url of the custom resource flow endpoint
: @param ids  urls from staging of the documents to be written
: @param job-id  job id
: @param entity-name  name of the entity
: @param flow-name name of the flow
: @param target-db  the target db where the docs will be writting
: @param options  will be passed to the xquery code
: @param flow  the flow xml as element(hub:flow),
: @param db the source db e.g. STAGING
: @return  response xml
:)
declare function tf:run-flow
(
        $url as xs:string,
        $ids as xs:string*,
        $job-id as xs:string,
        $entity-name as xs:string,
        $flow-name as xs:string,
        $target-db as xs:string,
        $options as xs:string,
        $flow as element(hub:flow),
        $db as xs:string
) as element(response)
{
    xdmp:log("XXX url="||tf:build-flow-url($ids, $entity-name, $flow-name, $target-db , $db, $options, $job-id) ),
    tf:exec-http($tcfg:HTTP-POST,
                    fn:concat(
                            $url,
                            tf:build-flow-url($ids, $entity-name, $flow-name, $target-db , $db, $options, $job-id)
                    ),
                     <options xmlns="xdmp:http">
                        <authentication method="digest">
                            <username>{$cfg:DATAHUB-USER}</username>
                            <password>{$cfg:DATAHUB-USER-PWD}</password>
                        </authentication>
                        <headers>
                            <Accept>application/xml</Accept>
                            <Content-Type>application/xml</Content-Type>
                        </headers>
                        <data>{xdmp:quote($flow)}</data>
                    </options>
    )

};
(:~
: run an entire harmonisation flow (all components)
:
: @param entity-name  name of the entity
: @param flow-name name of the flow
: @param source-db the source db e.g. STAGING
: @param target-db  the target db where the docs will be writting
: @param host  the hostname where the DHF is running
: @param port  the port on which the DHF is listening
: @param input-collections  a comma separated string with collection names to be included in the initial selection of
:                           documents in the collector
: @param input-pub-year the publication year to be used in the collector, must 4 digit e.g. 2017
: @param input-error-reprocessing whether to reprocess error documents from the TRACING db
:
: @return  response xml
:
:)
declare function tf:run-harmonisation-flow(
    $entity as xs:string,
    $flow-name as xs:string,
    $source-db as xs:string,
    $target-db as xs:string,
    $host as xs:string,
    $port as xs:string,
    $input-collections as xs:string?,
    $begin-pub-year as xs:string?,
    $end-pub-year as xs:string?,
    $input-error-reprocessing as xs:boolean?,
    $invoke-termite as xs:boolean?
) as item()?
{
    let $throw-harmonization-error := function($message as xs:string) {
        fn:error(xs:QName("HARMONIZATION-ERROR"), $message)
    }
    let $base-url := "http://" || $host || ":" || $port
    let $flow as element(hub:flow)?  := tf:get-harmonisation-flow($base-url || $FLOW-URL, $entity, $flow-name, $source-db)
    ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
            $throw-harmonization-error(" GET Flow http status was "||./part1/http:response/http:code/fn:string() )
        else ./part2/hub:flow)

    let $job-id := sem:uuid-string()
    let $options := let $map := map:map()
                    let $_ := $map => map:with($cfg:INPUT-COLLECTIONS-KEY, $input-collections)
                                    => map:with('entity', $entity)
                                    => map:with('flow', $flow-name)
                                    => map:with('flowType', $HARMONIZE-FLOW-TYPE)
                    return xdmp:to-json-string($map)  => xdmp:url-encode()
    let $_ := xdmp:log("XX running collector")
    let $uris := tf:run-collector($base-url || $RUN-COLLECTOR-URL, $job-id, $entity, $flow-name, $options, $source-db)
        ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
            $throw-harmonization-error(" Run Collector http status was "||./part1/http:response/http:code/fn:string() )
           else ./part2 => fn:tokenize("\n")  )

    let $_ :=  xdmp:log("URIS = "||fn:count($uris) )

    let $_ := xdmp:log("XX running flow")
    return if ($uris) then tf:run-flow($base-url || $FLOW-URL, $uris, $job-id, $entity, $flow-name, $target-db, $options,  $flow, $source-db)
    ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
        $throw-harmonization-error(" Run Flow http status was "||./part1/http:response/http:code/fn:string() )
       else ./part2)
    else xdmp:log("found no uris to process")
};
(:~
: run an entire harmonisation flow (all components)
:
: @param entity-name  name of the entity
: @param flow-name name of the flow
: @param source-db the source db e.g. STAGING
: @param target-db  the target db where the docs will be writting
: @param host  the hostname where the DHF is running
: @param port  the port on which the DHF is listening
: @param preformatted harmonisation options as xs:string
:
: @return  response xml
:
:)
declare function tf:run-harmonisation-flow-with-options(
    $entity as xs:string,
    $flow-name as xs:string,
    $source-db as xs:string,
    $target-db as xs:string,
    $host as xs:string,
    $port as xs:string,
    $dhf-options as xs:string
) as item()?
{
    let $throw-harmonization-error := function($message as xs:string) {
        fn:error(xs:QName("HARMONIZATION-ERROR"), $message)
    }
    let $base-url := "http://" || $host || ":" || $port
    let $flow as element(hub:flow)?  := tf:get-harmonisation-flow($base-url || $FLOW-URL, $entity, $flow-name, $source-db)
    ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
            $throw-harmonization-error(" GET Flow http status was "||./part1/http:response/http:code/fn:string() )
        else ./part2/hub:flow)

    let $job-id := sem:uuid-string()
    let $options := $dhf-options  => xdmp:url-encode()
    let $_ := xdmp:log("XX running collector")
    let $uris := tf:run-collector($base-url || $RUN-COLLECTOR-URL, $job-id, $entity, $flow-name, $options, $source-db)
        ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
            $throw-harmonization-error(" Run Collector http status was "||./part1/http:response/http:code/fn:string() )
           else ./part2 => fn:tokenize("\n")  )

    let $_ :=  xdmp:log("URIS = "||fn:count($uris) )

    let $_ := xdmp:log("XX running flow")
    return if ($uris) then tf:run-flow($base-url || $FLOW-URL, $uris, $job-id, $entity, $flow-name, $target-db, $options,  $flow, $source-db)
    ! (if ($HTTP-OK ne ./part1/http:response/http:code/fn:data()) then
        $throw-harmonization-error(" Run Flow http status was "||./part1/http:response/http:code/fn:string() )
       else ./part2)
    else xdmp:log("found no uris to process")
};

declare function run-harmonisation-medline(
    $host as xs:string,
    $port as xs:string
)
{
    let $flow-name := "Medline"
    let $db := $cfg:STAGING-DB
    let $target-db := $cfg:STAGING-DB
    let $entity-name := "Asset"
    let $options := make-options($entity-name, $flow-name) => xdmp:to-json-string()
    return  tf:run-harmonisation-flow-with-options($entity-name, $flow-name, $db, $target-db, $host, $port, $options)
};

declare private function make-options(
    $entity as xs:string,
    $flow-name as xs:string
) as xs:string
{
    map:map() => map:with('entity', $entity)
              => map:with('flow', $flow-name)
              => map:with('flowType', $HARMONIZE-FLOW-TYPE)
              => map:with($cfg:INPUT-COLLECTIONS-KEY, $tcfg:UNIT-TEST-COLLECTION)
              => xdmp:to-json-string()
};



declare function run-harmonize-employees()
{
    let $host := $tcfg:TEST-HOST
    let $port := $tcfg:TEST-STAGING-PORT
    let $flow-name := "harmonizeEmployees"
    let $db := $cfg:STAGING-DB
    let $target-db := $cfg:FINAL-DB
    let $entity-name := "Employee"
    let $options := make-options($entity-name, $flow-name)
    return  tf:run-harmonisation-flow-with-options($entity-name, $flow-name, $db, $target-db, $host, $port, $options)
};

