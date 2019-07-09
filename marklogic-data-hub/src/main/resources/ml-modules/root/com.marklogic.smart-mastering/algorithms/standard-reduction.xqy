xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare option xdmp:mapping "false";

declare function algorithms:standard-reduction-query(
  $document,
  $reduce-xml,
  $options-xml
) as cts:query? {
  cts:and-query((
    for $property-name at $pos in $reduce-xml/*:all-match/*:property
    let $weight :=
      if ($pos eq 1) then
        -fn:abs(fn:number($reduce-xml/@weight))
      else
        0
    return
      let $base-query := helper-impl:property-name-to-query($options-xml, $property-name)
      where fn:exists($base-query)
      return
        let $qname := helper-impl:property-name-to-qname($options-xml, $property-name)
        let $value := $document//*[fn:node-name(.) eq $qname]
        return
            helper-impl:property-name-to-query($options-xml, $property-name)($value, $weight)
  ))
};
