xquery version "1.0-ml";

(:
 : Test the custom XQuery merge functions feature.
 :)
module namespace xqMerge = "http://marklogic.com/smart-mastering/xqueryMerging";

declare namespace m = "http://marklogic.com/smart-mastering/merging";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

declare function xqMerge:quickStartMergeTriples(
  $merge-options as element(m:options),
  $docs,
  $sources,
  $property-spec as element(m:triple-merge)
) {
  sem:triple("QuickStart", "with", "XQuery")
};

declare function xqMerge:hubCentralMergeTriples(
  $merge-options as object-node(),
  $docs,
  $sources,
  $property-spec as object-node()
) {
  sem:triple("Hub Central", "with", "XQuery")
};

declare function xqMerge:quickStartMergeProperties(
  $property-name as xs:QName,
  $all-properties as map:map*,
  $property-spec as element(m:merge)
)
{
  map:entry("name", $property-name)
    =>  map:with("values", 'QuickStart XQuery Merge')
};

declare function xqMerge:hubCentralMergeProperties(
  $property-name as xs:QName,
  $all-properties as map:map*,
  $property-spec as object-node()
)
{
  map:entry("name", $property-name)
      =>  map:with("values", 'Hub Central XQuery Merge')
};