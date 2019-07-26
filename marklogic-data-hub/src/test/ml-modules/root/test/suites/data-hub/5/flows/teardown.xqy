xquery version "1.0-ml";

xdmp:invoke-function(function() {
  try {
    xdmp:collection-delete("http://marklogic.com/provenance-services/record")
  } catch * {()},
  xdmp:collection-delete("Jobs")
}, map:entry("database", xdmp:database("data-hub-JOBS")));
