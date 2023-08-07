xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

declare function plugin:create-headers(
  $id as xs:string,
  $content as item()?,
  $options as map:map) as node()*
{
  (
    <entity>Employee</entity>,
    <source>harmonize-claims</source>,
    <docFormat>xml</docFormat>
  )
};
