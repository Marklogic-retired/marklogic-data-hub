xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

declare function plugin:collect(
  $options as map:map) as xs:string*
{
  cts:uris("", (), cts:collection-query(("Employee")))
};

