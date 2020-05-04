xquery version "1.0-ml";

import module namespace sec="http://marklogic.com/xdmp/security" at "/MarkLogic/security.xqy";

if (sec:user-exists("data-hub-dynamic-test-user")) then
    xdmp:user("data-hub-dynamic-test-user")
else
   sec:create-user(
        "data-hub-dynamic-test-user",
        "Dyanamic Data Hub Test User",
        sem:uuid-string(),
        "data-hub-dynamic-test-role",
        (),
        ())