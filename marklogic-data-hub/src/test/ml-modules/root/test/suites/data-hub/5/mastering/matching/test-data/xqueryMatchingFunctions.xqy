xquery version "1.0-ml";

(:
 : Test the custom XQuery merge functions feature.
 :)
module namespace xqMatching = "http://marklogic.com/smart-mastering/xqueryMatching";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:update "false";

declare function xqMatching:quickStartMatchProperties(
    $expand-values as xs:string*,
    $expand-xml as element(matcher:expand),
    $options-xml as element(matcher:options)
)
{
  cts:word-query('QuickStart Match: ' || $expand-xml/@property-name)
};

declare function xqMatching:hubCentralMatchProperties(
    $expand-values as xs:string*,
    $match-rule as object-node(),
    $options-xml as object-node()
)
{
  cts:word-query('Hub Central Match: ' || $match-rule/entityPropertyPath)
};