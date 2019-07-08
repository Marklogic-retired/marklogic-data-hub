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
