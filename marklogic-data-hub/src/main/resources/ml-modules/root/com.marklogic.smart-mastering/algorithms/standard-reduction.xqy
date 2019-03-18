xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

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
      let $property-def := $options-xml/*:property-defs/*:property[@name = $property-name]
      where fn:exists($property-def)
      return
        let $qname := fn:QName($property-def/@namespace, $property-def/@localname)
        let $value := $document//*[fn:node-name(.) eq $qname]
        return
            if ($options-xml/*:data-format = $const:FORMAT-JSON) then
              cts:json-property-value-query(
                fn:string($qname),
                $value,
                "case-insensitive",
                $weight
              )
            else if ($options-xml/*:data-format = $const:FORMAT-XML) then
              cts:element-value-query(
                $qname,
                $value,
                "case-insensitive",
                $weight
              )
            else
              fn:error(xs:QName("SM-INVALID-FORMAT"), "invalid format in match options")

  ))
};
