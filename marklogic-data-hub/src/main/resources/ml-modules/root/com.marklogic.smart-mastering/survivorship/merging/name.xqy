xquery version "1.0-ml";

module namespace merging = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace merging = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "standard.xqy";

declare function merging:name(
  $property-name as xs:QName,
  $properties as item()*,
  $property-spec as element()?
)
{
  merging:standard(
    $property-name,
    $properties,
    $property-spec
  )
};
