xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.    All Rights Reserved. :)

(: This /v1/forestinfo endpoint is not public or documented.    It is used by
 : Data Movement SDK (DMSDK) QueryHostBatcher to know about forests associated
 : with the database.    DMSDK assigns each query to match results from just one
 : forest so batches of matches can be efficiently manipulated direclty from
 : one forest.
 :
 : This endpoint accepts the following parameter:
 :     database (String): the database for which to return forest info. If not
 :                specified, uses the app-server default database.
 :
 : This endpoint returns the following info about each forest attached to the
 : current database:
 :     id (xs:unsignedLong): from xdmp:database-forests() - the MarkLogic Server
 :                numeric id for the forest
 :     name (String): from xdmp:forest-name() - the human-assigned forest name
 :     updatesAllowed (all, delete-only, read-only, or flash-backup):
 :                from xdmp:forest-updates-allowed() - (for future use since for now
 :                only queries are forest-specific) so we won't attempt writes if
 :                updates aren't allowed
 :     database (String): from xdmp:database-name() - since we often don't know
 :                what database is the default for the port
 :     host (String): from xdmp:host-name() - so we can target future requests to
 :                the correct host for the forest
 :     openReplicaHost (String): from xdmp:host-name(xdmp:forest-host(
 :                xdmp:forest-open-replica())) - only included when the open-replica is
 :                different than the normal forest so we can target future requests to
 :                the replica host for the forest
 :     requestHost (String) : from the request header - included if openReplicaHost is not 
 :                present and the request host name of this request is using a different host 
 :                name than the host name configured for this server. 
 :     alternateHost (String): from $hostStatus/*:host-name/text() - included
 :                if openReplicaHost is not and (1) the request host name of this
 :                request is using a different host name than the host name configured
 :                for this server or (2) the forest host doesn't have an app server
 :                port on the same port as used for this request
 :
 : In the event that a host is down or does not have an http server configured
 : on the same port as this request was made, this endpoint assigns an
 : alternate (available) host for that forest.
 :)
module namespace forestinfo="http://marklogic.com/rest-api/forestinfo";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $forestinfo:trace-id := "restapi.config.forests";

declare private variable $is-untraced := ();

declare function forestinfo:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($forestinfo:trace-id, ("restapi.config", "restapi"))),

    $is-untraced
};

declare function forestinfo:get-forest-info(
    $params as map:map
) as json:array
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    let $forests :=
        for $forestId in xdmp:database-forests(xdmp:database())
        return json:object()
            => map:with("id", $forestId)
            => map:with("name", xdmp:forest-name($forestId))
            => map:with("updatesAllowed", xdmp:forest-updates-allowed($forestId))
            => map:with("database", xdmp:database-name(xdmp:database()))
            => map:with("host", xdmp:host-name(xdmp:forest-host($forestId)))
    let $hostStatuses :=
        for $hostId in xdmp:hosts()
        return xdmp:host-status($hostId)
    let $requestPort := xdmp:get-request-port()
    let $availableHosts :=
        for $hostStatus in $hostStatuses
        let $hasPort := $hostStatus/*:http-servers//*:port[.=$requestPort]
        return
            if (empty($hasPort)) then ()
            else $hostStatus/*:host-name/text()
    let $response := json:array()
    return (
        (: before we return the forest config, let's check for any hosts that are unavailable :)
        for $forest in $forests
        let $forestHost := map:get($forest, "host")
        let $forestId := map:get($forest, "id")
        let $forestHostId := xdmp:forest-host($forestId)
        let $currentHostId := xdmp:host()
        (: get the request host without the port information :)
        let $requestHost := fn:replace(xdmp:get-request-header("Host"), ":\d+", "")
        let $hostIsAvailable := ($forestHost = $availableHosts)
        let $openReplica := xdmp:forest-open-replica($forestId)
        let $openReplicaHost :=
            if ($forestId = $openReplica) then ()
            else xdmp:host-name(xdmp:forest-host($openReplica))
        return (
            if ( $openReplicaHost = $availableHosts )
            then
                (: Send the open replica host since the normal host for this forest is down :)
                map:put($forest, "openReplicaHost", $openReplicaHost)
            else if ( $forestHostId = $currentHostId )
            then
                if ( $forestHost != $requestHost )
                then (
                    (: Use the hostname used for this request as it's obviously working,
                     : and sometimes the machine name may not be DNS resolvable.
                     : We are adding the request host name to both alternateHost and requestHost 
                     : in order not to break the existing client API code :)
                    map:put($forest, "requestHost", $requestHost),
                    map:put($forest, "alternateHost", $requestHost)
                    )
                else ()
            else if ( $hostIsAvailable = false() and count($availableHosts) > 0 )
            then
                (: This host doesn't have the required app server (perhaps it's a D-Node),
                 : so use a host that does.  Base the choice on a mod of a hash of the
                 : forest name so the choice is random but consistent. :)
                let $forestNameHash := xdmp:hash32(map:get($forest, "name"))
                let $random := math:fmod($forestNameHash, count($availableHosts)) + 1
                let $randomAvailableHost := $availableHosts[$random]
                return map:put($forest, "alternateHost", $randomAvailableHost)
            else ()
            ,
            json:array-push($response, $forest)
            ),

        $response
        )
};
