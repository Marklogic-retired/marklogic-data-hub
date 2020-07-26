xquery version "1.0-ml";

module namespace config = "http://marklogic.com/data-hub/config";

declare option xdmp:mapping "false";

declare variable $STAGING-DATABASE := "%%mlStagingDbName%%";
declare variable $FINAL-DATABASE := "%%mlFinalDbName%%";
declare variable $TRACE-DATABASE := "%%mlJobDbName%%";
declare variable $JOB-DATABASE := "%%mlJobDbName%%";
declare variable $MODULES-DATABASE := "%%mlModulesDbName%%";
declare variable $HUB-VERSION := "%%mlHubVersion%%";
declare variable $HUB-LOG-LEVEL := "%%mlHubLogLevel%%";
declare variable $FLOW-OPERATOR-ROLE := "%%mlFlowOperatorRole%%";
declare variable $FLOW-DEVELOPER-ROLE := "%%mlFlowDeveloperRole%%";
declare variable $DEFAULT-DATA-HUB-PERMISSIONS := "data-hub-common,read,data-hub-common,update";

(:
This function is intended for usage where Data Hub must insert a document, and there's not yet a way for a user to
specify what the permissions should be, other than by relying on the user's default permissions. This then provides a
default source of permissions so that a non-admin user can insert documents without depending on the user defining
default permissions for the user account.
:)
declare function get-default-data-hub-permissions()
{
  let $perms := xdmp:default-permissions((), "objects")
  return
    if (fn:exists($perms)) then $perms
    else
      let $tokens := fn:tokenize($DEFAULT-DATA-HUB-PERMISSIONS, ",")
      for $token at $index in $tokens
      where ($index mod 2) = 1
      return xdmp:permission($token, $tokens[$index + 1], "object")
};
