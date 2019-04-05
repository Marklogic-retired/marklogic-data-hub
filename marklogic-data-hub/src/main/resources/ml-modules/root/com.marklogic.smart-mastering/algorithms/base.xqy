xquery version "1.0-ml";

(:~
 : This module has functions for finding, setting up, and running match
 : algorithms. The algorithm map is used to go from an algorithm specification
 : in the match options to an actual function.
 : Note that algorithms are allowed to have a setup function. See the
 : algorithms:setup-algorithms function for more information.
 :)
module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms"
  at  "double-metaphone.xqy",
      "standard-reduction.xqy",
      "thesaurus.xqy";

import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../function-extension/base.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

(:~
 : Wrapper for `fn:QName`, with the namespace assumed.
 :)
declare function algorithms:default-function-lookup(
  $name as xs:string,
  $arity as xs:int)
{
  fn:function-lookup(
    fn:QName(
      "http://marklogic.com/smart-mastering/algorithms",
      $name
    ),
    $arity
  )
};

declare variable $_cached-algorithms-map as map:map := map:map();
(:~
 : Build a map from an algorithm's name (see match options) to its
 : xdmp:function.
 : @param $algorithms-xml the algorithms element from the matcher options
 : @return a map:map of the match algorithm functions
 :)
declare function algorithms:build-algorithms-map($algorithms-xml as element(matcher:algorithms))
  as map:map
{
  if (map:contains($_cached-algorithms-map, fn:generate-id($algorithms-xml))) then
    map:get($_cached-algorithms-map, fn:generate-id($algorithms-xml))
  else
    let $algorithms-map as map:map :=
      map:new((
        for $algorithm-xml in $algorithms-xml/*:algorithm
        return
          map:entry(
            $algorithm-xml/@name,
            fun-ext:function-lookup(
              fn:string($algorithm-xml/@function),
              fn:string($algorithm-xml/@namespace),
              fn:string($algorithm-xml/@at),
              algorithms:default-function-lookup(?, 3)
            )
          )
      ))
    return (
      map:put($_cached-algorithms-map, fn:generate-id($algorithms-xml), $algorithms-map),
      $algorithms-map
    )
};

(:~
 : Each algorithm must provide a function that does the matching, but may also
 : include a setup function. This function is run once, when the match options
 : are loaded.
 : @param $options the match options
 : @return empty sequence
 :)
declare function algorithms:setup-algorithms($options as element(matcher:options))
{
  let $setup-map := algorithms:setup-map-from-xml($options/*:algorithms)
  for $item in $options//*[@algorithm-ref]
  return
    fun-ext:execute-function(
      map:get($setup-map, fn:string($item/@algorithm-ref)),
      map:new((
        map:entry("arg1", $item),
        map:entry("arg2", $options)
      ))
    )
};

(:~
 :
 :)
declare function algorithms:setup-map-from-xml($algorithms-xml as element(matcher:algorithms))
{
  algorithms:setup-map-from-map(
    algorithms:build-algorithms-map($algorithms-xml)
  )
};

(:~
 :
 :)
declare function algorithms:setup-map-from-map($algorithms-map)
{
  map:new(
    for $key in map:keys($algorithms-map)
    let $funct := map:get($algorithms-map, $key)
    return
      let $annotation := fun-ext:get-function-annotation($funct, xs:QName("algorithms:setup"))
      where fn:exists($annotation) and fn:not($annotation instance of null-node())
      return
        let $setup-function-details :=
          if ($annotation instance of xs:string*) then
            map:new(
              for $item in $annotation
              let $parts := fn:tokenize(fn:string($item), "=")
              return
                map:entry($parts[1], $parts[2])
            )
          else if ($annotation instance of object-node()) then
            xdmp:from-json($annotation)
          else
            $annotation
        let $module := (map:get($setup-function-details, "at"), xdmp:function-module($funct))[1]
        let $setup-function :=
          fun-ext:function-lookup(
            fn:string(map:get($setup-function-details, "function")),
            map:get($setup-function-details, "namespace"),
            $module,
            algorithms:default-function-lookup(?, 3)
          )
        where fn:exists($setup-function)
        return
            map:entry(
              $key,
              xdmp:apply(
                $setup-function,
                ?,
                ?,
                $setup-function-details
              )
            )
  )
};

declare function algorithms:execute-algorithm($algorithm, $values, $ref-element, $options)
{
  fun-ext:execute-function(
    $algorithm,
    map:new((
      map:entry("arg1", $values),
      map:entry("arg2", $ref-element),
      map:entry("arg3", $options)
    ))
  )
};
