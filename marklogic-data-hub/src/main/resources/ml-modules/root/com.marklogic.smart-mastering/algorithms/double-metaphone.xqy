xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace spell = "http://marklogic.com/xdmp/spell"
  at "/MarkLogic/spell.xqy";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare namespace match = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:~
 : Allow matches that are similar in string distance. This algorithm uses a dictionary generated from current content
 : in the database. For more information, see
 : https://marklogic-community.github.io/smart-mastering-core/docs/match-algorithms/#standard-algorithm
 :
 : @param $expand-values  the value(s) that the original document has for this property
 : @param $expand-xml  the scoring/expand element in the match options that applies this algorithm to a property
 : @param $options-xml  the complete match options
 :
 : @return a sequence of cts:querys based on the property values in the original document
 :)
declare
  %algorithms:setup(
    "namespace=http://marklogic.com/smart-mastering/algorithms",
    "function=setup-double-metaphone"
  )
  %algorithms:input("dictionary=xs:string*", "distance-threshold=xs:integer?")
  function
  algorithms:double-metaphone(
    $expand-values,
    $expand-xml as element(match:expand),
    $options-xml as element(match:options)
  )
{
  let $property-name := $expand-xml/@property-name
  let $dictionary := $expand-xml/*:dictionary
  let $spell-options :=
    element spell:options {
      element spell:distance-threshold {
        (
          $expand-xml/*:distance-threshold[. castable as xs:integer]/fn:string(.),
          100
        )[1]
      }
    }
  where fn:exists($dictionary)
  return
    let $expanded-values :=
      for $value in $expand-values
      return
        spell:suggest($dictionary, $value, $spell-options)[fn:not(fn:lower-case(.) = fn:lower-case($value))]
    where fn:exists($expanded-values)
    return
      helper-impl:property-name-to-query($options-xml, $property-name)($expanded-values, $expand-xml/@weight)
};

declare function algorithms:setup-double-metaphone($expand-xml, $options-xml, $options)
{
  let $property-name := $expand-xml/@property-name
  let $property-def := $options-xml/*:property-defs/*:property[@name = $property-name]
  let $qname := fn:QName($property-def/@namespace, $property-def/@localname)
  for $dictionary in $expand-xml/*:dictionary ! fn:string(.)
  where fn:not(fn:doc-available($dictionary))
  return
    xdmp:spawn-function(
      function() {
        fn:function-lookup(xs:QName("xdmp:document-insert"), 4)(
          $dictionary,
          spell:make-dictionary(
            try {
              let $reference :=
                if (fn:exists($property-def/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference))) then
                  $property-def/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference) ! cts:reference-parse(.)
                else
                  cts:element-reference(
                    $qname,
                    "collation=" ||
                      (
                        map:get($options,"collation"),
                        fn:default-collation()
                      )[fn:normalize-space(.)][1]
                  )
              return
                cts:values($reference)
            } catch ($e) {
              xdmp:log("Caught an error while generating double-metaphone dictionary: " || xdmp:quote($e), "error")
            }
          ),
          xdmp:default-permissions(),
          ($const:OPTIONS-COLL, $const:DICTIONARY-COLL)
        )
      },
      <options xmlns="xdmp:eval">
        <transaction-mode>update-auto-commit</transaction-mode>
      </options>
    )
};

