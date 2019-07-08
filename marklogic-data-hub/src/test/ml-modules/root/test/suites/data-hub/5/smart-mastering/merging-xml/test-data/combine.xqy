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
      map:entry(
        "values",
        (: turn ("deep value 1", "deep value 2") into "deep value 12" :)
        <path xmlns="" xmlns:has="has">
          {
            fn:fold-left(
              function($z, $a) {
                $z || fn:replace($a, "[^\d]+", "")
              },
              "deep value ",
              for $v in $values
              order by $v
              return $v
            )
          }
        </path>
      )
    ))
};
