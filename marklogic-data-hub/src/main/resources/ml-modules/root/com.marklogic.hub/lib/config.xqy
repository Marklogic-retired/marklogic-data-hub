xquery version "1.0-ml";

module namespace config = "http://marklogic.com/data-hub/config";

declare option xdmp:mapping "false";

declare variable $STAGING-DATABASE := "%%STAGING_DB_NAME%%";
declare variable $FINAL-DATABASE := "%%FINAL_DB_NAME%%";
declare variable $TRACING-DATABASE := "%%TRACE_DB_NAME%%";
declare variable $MODULES-DATABASE := "%%MODULES_DB_NAME%%";
