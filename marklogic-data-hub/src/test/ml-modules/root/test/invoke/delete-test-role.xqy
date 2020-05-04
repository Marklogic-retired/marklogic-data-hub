(: execute this against the security database :)
xquery version "1.0-ml";

import module namespace sec="http://marklogic.com/xdmp/security" at  "/MarkLogic/security.xqy";

declare variable $privileges as xs:string* external;

sec:remove-role("data-hub-dynamic-test-role")
