xquery version "1.0-ml";

module namespace custom-action = "http://marklogic.com/smart-mastering/action";

declare namespace merging = "http://marklogic.com/smart-mastering/merging";

declare function custom-action:custom-action(
  $uri as xs:string,
  $matched-uris as item()*,
  $merge-options as element(merging:options)
) {
  xdmp:document-insert(
    "/xqy-action-output" || $uri,
    <test uri="{$uri}">{
      $matched-uris ! <uri>{./@uri/fn:string()}</uri>,
      $merge-options
    }</test>)
};
