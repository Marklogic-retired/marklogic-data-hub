xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

(: This /v1/forestinfo endpoint is not public or documented.  It is used by
 : Data Movement SDK (DMSDK) QueryHostBatcher to know about forests associated
 : with the database.  DMSDK assigns each query to match results from just one
 : forest so batches of matches can be efficiently manipulated direclty from
 : one forest.
 :
 : This endpoint returns the following info about each forest attached to the
 : current database:
 :   id (xs:unsignedLong): from xdmp:database-forests() - the MarkLogic Server
 :        numeric id for the forest
 :   name (String): from xdmp:forest-name() - the human-assigned forest name
 :   updatesAllowed (all, delete-only, read-only, or flash-backup):
 :        from xdmp:forest-updates-allowed() - (for future use since for now
 :        only queries are forest-specific) so we won't attempt writes if
 :        updates aren't allowed
 :   database (String): from xdmp:database-name() - since we often don't know
 :        what database is the default for the port
 :   host (String): from xdmp:host-name() - so we can target future requests to
 :        the correct host for the forest
 :   openReplicaHost (String): from xdmp:host-name(xdmp:forest-host(
 :        xdmp:forest-open-replica())) - only included when the open-replica is
 :        different than the normal forest so we can target future requests to
 :        the replica host for the forest
 :   alternateHost (String): from $hostStatus/*:host-name/text() - included
 :        if openReplicaHost is not and (1) the request host name of this
 :        request is using a different host name than the host name configured
 :        for this server or (2) the forest host doesn't have an app server
 :        port on the same port as used for this request
 :
 : In the event that a host is down or does not have an http server configured
 : on the same port as this request was made, this endpoint assigns an
 : alternate (available) host for that forest.
 :)
import module namespace forestinfo="http://marklogic.com/rest-api/forestinfo"
    at "../models/forest-info-model.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

let $params      := map:new()
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    lid:enable(map:get($params,"trace")),

    if (forestinfo:check-untraced()) then ()
    else lid:log($forestinfo:trace-id,"forest-info-endpoint",map:entry("parameters",$params)),

    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat("invalid parameters: ",string-join($extra-names,", "))),

    forestinfo:get-forest-info($params)
    )
