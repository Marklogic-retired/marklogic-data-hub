xquery version "1.0-ml";

module namespace config = "http://marklogic.com/data-hub/config";

declare option xdmp:mapping "false";

declare variable $STAGING-DATABASE := "data-hub-STAGING";
declare variable $FINAL-DATABASE := "data-hub-FINAL";
declare variable $TRACE-DATABASE := "data-hub-JOBS";
declare variable $JOB-DATABASE := "data-hub-JOBS";
declare variable $MODULES-DATABASE := "data-hub-MODULES";
