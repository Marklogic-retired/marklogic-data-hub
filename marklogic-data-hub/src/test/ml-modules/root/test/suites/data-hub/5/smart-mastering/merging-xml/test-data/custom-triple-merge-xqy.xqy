xquery version "1.0-ml";

(: you can define any namespace you like :)
module namespace custom-merging = "http://marklogic.com/smart-mastering/merging";

declare namespace m = "http://marklogic.com/smart-mastering/merging";

(: A custom triples merging function
 :
 : @param $merge-options specification of how options are to be merged
 : @param $docs  the source documents that provide the values
 : @param $sources  information about the source of the header data
 : @param $property-spec  configuration for how this property should be merged
 : @return zero or more sem:triples
 :)
declare function custom-merging:custom-trips(
  $merge-options as element(m:options),
  $docs,
  $sources,
  $property-spec as element()?
) {
  let $some-param := $property-spec/*:some-param ! xs:int(.)
  return
    sem:triple(sem:iri("some-param"), sem:iri("is"), $some-param)
};
