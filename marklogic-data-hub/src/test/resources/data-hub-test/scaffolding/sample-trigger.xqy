xquery version '1.0-ml';

import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $trgr:uri as xs:string external;

xdmp:log("In sample-trigger, URI: " || $trgr:uri)