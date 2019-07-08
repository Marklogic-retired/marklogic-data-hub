xquery version "1.0-ml";

module namespace combine = "http://marklogic.com/smart-mastering/merging";

declare function combine:combine(
  $property-name as xs:QName,
  $properties as map:map*,
  $property-spec as element()?
)
{
  let $values :=
    for $property in $properties
    return map:get($property, "values")
  return
    map:new((
      map:entry("sources", $properties ! map:get(., "sources")),
      map:entry("name", $property-name),
      map:entry("values", "deep value 12")
    ))
};
