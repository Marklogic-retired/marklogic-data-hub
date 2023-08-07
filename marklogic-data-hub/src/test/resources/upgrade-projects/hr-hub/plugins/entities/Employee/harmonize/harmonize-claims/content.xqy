xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

import module namespace json="http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";

declare namespace es = "http://marklogic.com/entity-services";

declare option xdmp:mapping "false";

declare function plugin:create-content(
  $id as xs:string,
  $options as map:map) as item()?
{
  let $doc := fn:doc($id)
  return $doc
};
