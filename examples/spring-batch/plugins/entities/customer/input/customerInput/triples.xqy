xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare option xdmp:mapping "false";

(:~
 : Create Triples Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $headers - the output of your headers plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more triples
 :)
declare function plugin:create-triples(
  $id as xs:string,
  $content as item()?,
  $headers as item()*,
  $options as map:map) as sem:triple*
{
  ()
};
