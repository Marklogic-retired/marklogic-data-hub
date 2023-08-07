xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

declare function plugin:create-content(
  $id as xs:string,
  $raw-content as item()?,
  $options as map:map) as item()?
{
  $raw-content
};
