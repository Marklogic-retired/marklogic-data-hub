xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";
declare namespace es = "http://marklogic.com/entity-services";
declare option xdmp:mapping "false";

declare function plugin:create-triples(
  $id as xs:string,
  $content as item()?,
  $headers as item()*,
  $options as map:map) as sem:triple*
{
  ()
};
