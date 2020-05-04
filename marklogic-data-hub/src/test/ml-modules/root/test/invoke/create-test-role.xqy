xquery version "1.0-ml";

import module namespace sec="http://marklogic.com/xdmp/security" at  "/MarkLogic/security.xqy";

if (sec:role-exists("data-hub-dynamic-test-role")) then
    sec:remove-role("data-hub-dynamic-test-role")
else ();
(: execute this against the security database :)
xquery version "1.0-ml";

import module namespace sec="http://marklogic.com/xdmp/security" at  "/MarkLogic/security.xqy";

declare variable $privileges as xs:string* external;
declare variable $roles as xs:string* external;

let $role-id := sec:create-role(
    "data-hub-dynamic-test-role",
    "Test role for Data Hub",
    $roles, (), ())
return ();
(: execute this against the security database :)
xquery version "1.0-ml";

import module namespace sec="http://marklogic.com/xdmp/security" at  "/MarkLogic/security.xqy";

declare variable $privileges as xs:string* external;

for $privilege in $privileges
return sec:privilege-add-roles(
    $privilege,
    "execute",
    ("data-hub-dynamic-test-role"))
;