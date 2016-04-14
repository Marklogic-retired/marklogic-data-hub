xquery version "1.0-ml";

module namespace config = "http://marklogic.com/data-hub/config";

declare option xdmp:mapping "false";

declare variable $STAGING-DATABASE := "%%STAGING_DATABASE%%";
declare variable $FINAL-DATABASE := "%%FINAL_DATABASE%%";
declare variable $TRACING-DATABASE := "%%TRACING_DATABASE%%";
declare variable $MODULES-DATABASE := "%%MODULES_DATABASE%%";
