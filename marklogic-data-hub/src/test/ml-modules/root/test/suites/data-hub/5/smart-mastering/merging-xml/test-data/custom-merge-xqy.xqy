xquery version "1.0-ml";

module namespace custom-merging = "http://marklogic.com/smart-mastering/merging";

declare function custom-merging:customThing(
  $property-name as xs:QName,
  $properties as map:map*,
  $property-spec as element()?
) {
  let $values :=
    let $max := $property-spec/*:go-high = fn:true()
    for $property in $properties
    let $value := map:get($property, "values")
    order by
      if ($max) then $value else () descending,
      if ($max) then () else $value ascending
    return $property
  return
    fn:subsequence(
      $values,
      1,
      fn:head(($property-spec/@max-values, 99))
    )
};
